-- page_members 테이블에서 viewport와 fromTemplate 컬럼 제거
ALTER TABLE page_members 
DROP COLUMN IF EXISTS viewport,
DROP COLUMN IF EXISTS fromTemplate; 