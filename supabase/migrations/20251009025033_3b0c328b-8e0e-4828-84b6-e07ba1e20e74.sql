-- Step 1: Drop all existing policies on flow_charts
DROP POLICY IF EXISTS "Users can manage flow charts for their companies" ON public.flow_charts;
DROP POLICY IF EXISTS "Users can view flow charts for their companies" ON public.flow_charts;
DROP POLICY IF EXISTS "Users can manage their flow charts" ON public.flow_charts;

-- Step 2: Drop foreign key constraint
ALTER TABLE public.flow_charts 
DROP CONSTRAINT IF EXISTS flow_charts_company_id_fkey;

-- Step 3: Change company_id from UUID to TEXT
ALTER TABLE public.flow_charts 
ALTER COLUMN company_id TYPE TEXT USING company_id::TEXT;

-- Step 4: Create new RLS policies for TEXT company_id
CREATE POLICY "Anyone can manage flow charts"
ON public.flow_charts
FOR ALL
USING (true)
WITH CHECK (true);

-- Step 5: Add index for better performance
DROP INDEX IF EXISTS idx_flow_charts_company_text;
CREATE INDEX idx_flow_charts_company_text 
ON public.flow_charts(company_id, phase);