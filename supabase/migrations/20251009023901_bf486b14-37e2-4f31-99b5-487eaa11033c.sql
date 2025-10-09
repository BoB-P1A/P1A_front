-- Add unique constraint for upsert operations
ALTER TABLE flow_charts
ADD CONSTRAINT flow_charts_company_task_phase_key 
UNIQUE (company_id, task_name, phase);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_flow_charts_company_task 
ON flow_charts(company_id, task_name, phase);