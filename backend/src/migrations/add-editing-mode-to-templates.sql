-- Add editingMode column to templates table
ALTER TABLE templates 
ADD COLUMN editingMode ENUM('desktop', 'mobile') DEFAULT 'desktop' AFTER tags;

-- Update existing templates to have default desktop mode
UPDATE templates SET editingMode = 'desktop' WHERE editingMode IS NULL;
