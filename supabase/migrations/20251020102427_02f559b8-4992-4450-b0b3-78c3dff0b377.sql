-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can manage flow charts" ON public.flow_charts;

-- Create proper RLS policies for flow_charts table
-- Allow users to view flow charts for their companies
CREATE POLICY "Users can view flow charts for their companies"
ON public.flow_charts
FOR SELECT
USING (
  (EXISTS (
    SELECT 1
    FROM companies
    WHERE companies.id::text = flow_charts.company_id
      AND companies.created_by = auth.uid()
  )) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow users to insert flow charts for their companies
CREATE POLICY "Users can insert flow charts for their companies"
ON public.flow_charts
FOR INSERT
WITH CHECK (
  (EXISTS (
    SELECT 1
    FROM companies
    WHERE companies.id::text = flow_charts.company_id
      AND companies.created_by = auth.uid()
  )) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow users to update flow charts for their companies
CREATE POLICY "Users can update flow charts for their companies"
ON public.flow_charts
FOR UPDATE
USING (
  (EXISTS (
    SELECT 1
    FROM companies
    WHERE companies.id::text = flow_charts.company_id
      AND companies.created_by = auth.uid()
  )) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow users to delete flow charts for their companies
CREATE POLICY "Users can delete flow charts for their companies"
ON public.flow_charts
FOR DELETE
USING (
  (EXISTS (
    SELECT 1
    FROM companies
    WHERE companies.id::text = flow_charts.company_id
      AND companies.created_by = auth.uid()
  )) 
  OR has_role(auth.uid(), 'admin'::app_role)
);