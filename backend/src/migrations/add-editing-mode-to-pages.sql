-- Add editingMode column to pages table
ALTER TABLE pages 
ADD COLUMN editingMode ENUM('desktop', 'mobile') DEFAULT 'desktop' NOT NULL; 