-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'evaluator');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create evaluation_requests table
CREATE TABLE public.evaluation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  request_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create processing_tasks table (개인정보 처리 업무)
CREATE TABLE public.processing_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  department TEXT,
  responsible_person TEXT,
  purpose TEXT,
  personal_info_items TEXT,
  retention_period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create flow_tables table (흐름 테이블)
CREATE TABLE public.flow_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  phase TEXT NOT NULL, -- 'collection', 'storage', 'provision', 'disposal'
  task_id UUID REFERENCES public.processing_tasks(id) ON DELETE CASCADE,
  step_number INTEGER,
  activity TEXT,
  data_items TEXT,
  location TEXT,
  responsible_person TEXT,
  security_measures TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create technical_evaluations table (기술적 평가)
CREATE TABLE public.technical_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  system_name TEXT NOT NULL,
  category TEXT NOT NULL,
  code TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT, -- '이행', '부분이행', '미이행', '해당없음'
  evidence TEXT,
  files JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create protection_lifecycle table (보호조치 라이프사이클)
CREATE TABLE public.protection_lifecycle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.processing_tasks(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  item_code TEXT NOT NULL,
  evaluation_item TEXT NOT NULL,
  status TEXT, -- '적정', '부적정', '미흡', '해당없음'
  evidence TEXT,
  files JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create improvements table (개선 계획)
CREATE TABLE public.improvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'technical', 'protection'
  source_id UUID NOT NULL, -- ID of technical_evaluation or protection_lifecycle
  related_law TEXT,
  risk_factor TEXT,
  improvement_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create flow_charts table (흐름도 저장)
CREATE TABLE public.flow_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  image_data TEXT, -- base64 encoded image
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protection_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_charts ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evaluation_requests_updated_at BEFORE UPDATE ON public.evaluation_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_processing_tasks_updated_at BEFORE UPDATE ON public.processing_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flow_tables_updated_at BEFORE UPDATE ON public.flow_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_technical_evaluations_updated_at BEFORE UPDATE ON public.technical_evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_protection_lifecycle_updated_at BEFORE UPDATE ON public.protection_lifecycle FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_improvements_updated_at BEFORE UPDATE ON public.improvements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flow_charts_updated_at BEFORE UPDATE ON public.flow_charts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for companies
CREATE POLICY "Users can view companies they created" ON public.companies FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their companies" ON public.companies FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can view all companies" ON public.companies FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all companies" ON public.companies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for evaluation_requests
CREATE POLICY "Users can view their evaluation requests" ON public.evaluation_requests FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = assignee_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can create evaluation requests" ON public.evaluation_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Assignees can update their requests" ON public.evaluation_requests FOR UPDATE USING (
  auth.uid() = assignee_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can manage all requests" ON public.evaluation_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for processing_tasks
CREATE POLICY "Users can view tasks for their companies" ON public.processing_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can manage tasks for their companies" ON public.processing_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for flow_tables
CREATE POLICY "Users can view flow tables for their companies" ON public.flow_tables FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can manage flow tables for their companies" ON public.flow_tables FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for technical_evaluations
CREATE POLICY "Users can view evaluations for their companies" ON public.technical_evaluations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can manage evaluations for their companies" ON public.technical_evaluations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for protection_lifecycle
CREATE POLICY "Users can view lifecycle for their companies" ON public.protection_lifecycle FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can manage lifecycle for their companies" ON public.protection_lifecycle FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for improvements
CREATE POLICY "Users can view improvements for their companies" ON public.improvements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can manage improvements for their companies" ON public.improvements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for flow_charts
CREATE POLICY "Users can view flow charts for their companies" ON public.flow_charts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can manage flow charts for their companies" ON public.flow_charts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);