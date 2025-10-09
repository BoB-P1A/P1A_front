-- Create storage bucket for flowchart images
INSERT INTO storage.buckets (id, name, public)
VALUES ('flowchart-images', 'flowchart-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for flowchart-images bucket
CREATE POLICY "Users can upload flowchart images for their companies"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'flowchart-images' AND
  (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.created_by = auth.uid()
    AND (storage.foldername(name))[1] = companies.id::text
  ) OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can view flowchart images for their companies"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'flowchart-images' AND
  (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.created_by = auth.uid()
    AND (storage.foldername(name))[1] = companies.id::text
  ) OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can update flowchart images for their companies"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'flowchart-images' AND
  (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.created_by = auth.uid()
    AND (storage.foldername(name))[1] = companies.id::text
  ) OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can delete flowchart images for their companies"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'flowchart-images' AND
  (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.created_by = auth.uid()
    AND (storage.foldername(name))[1] = companies.id::text
  ) OR has_role(auth.uid(), 'admin'))
);

-- Update flow_charts table to store storage path
ALTER TABLE flow_charts 
ADD COLUMN IF NOT EXISTS storage_path text,
ADD COLUMN IF NOT EXISTS task_name text;

COMMENT ON COLUMN flow_charts.image_data IS 'Base64 image data (legacy) or storage URL';
COMMENT ON COLUMN flow_charts.storage_path IS 'Path to image in storage bucket';
COMMENT ON COLUMN flow_charts.task_name IS 'Name of the task/업무';