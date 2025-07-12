-- 페이지 멤버 테이블에 viewport와 fromTemplate 컬럼 추가
ALTER TABLE page_members 
ADD COLUMN viewport VARCHAR(255) NULL,
ADD COLUMN fromTemplate VARCHAR(255) NULL; 