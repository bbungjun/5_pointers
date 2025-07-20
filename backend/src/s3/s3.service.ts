import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '5pointers-imagebucket';
    console.log('🔧 S3Service 초기화:', {
      region: 'ap-northeast-2',
      bucket: this.bucketName,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    });
  }

  // 이미지를 500KB 이하로 압축하는 유틸리티 함수
  private async compressImageToMaxSize(buffer: Buffer, maxSizeKB: number = 500): Promise<Buffer> {
    let quality = 80; // 시작 품질
    let width = 800;  // 시작 너비
    
    let compressedBuffer = await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
    
    // 500KB = 512000 bytes
    while (compressedBuffer.length > maxSizeKB * 1024 && quality > 10) {
      quality -= 10; // 품질 단계적 감소
      
      if (quality < 30 && width > 400) {
        width -= 100; // 품질이 낮아지면 크기도 줄임
      }
      
      compressedBuffer = await sharp(buffer)
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();
    }
    
    console.log(`이미지 압축 완료: ${buffer.length} -> ${compressedBuffer.length} bytes (품질: ${quality}%, 너비: ${width}px)`);
    return compressedBuffer;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      const key = 'images/' + year + '/' + month + '/' + day + '/' + uniqueSuffix + '.' + ext;

      console.log('📤 S3 업로드 시작:', {
        bucket: this.bucketName,
        key: key,
        size: file.size,
        type: file.mimetype
      });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      
      const region = 'ap-northeast-2';
      const imageUrl = 'https://' + this.bucketName + '.s3.' + region + '.amazonaws.com/' + key;
      console.log('✅ S3 업로드 완료:', imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('❌ S3 업로드 실패:', error);
      throw error;
    }
  }

  // 이미지 업로드 시 원본과 썸네일 모두 업로드
  async uploadImageWithThumbnail(file: Express.Multer.File): Promise<{ originalUrl: string; thumbUrl: string }> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      const key = `images/${year}/${month}/${day}/${uniqueSuffix}.${ext}`;
      const thumbKey = `images/${year}/${month}/${day}/${uniqueSuffix}_thumb.${ext}`;

      console.log('📤 S3 이미지 업로드 시작 (원본 + 썸네일)');

      // 썸네일 생성 (500KB 이하)
      const compressedBuffer = await this.compressImageToMaxSize(file.buffer);

      // 원본 및 썸네일 업로드
      await Promise.all([
        this.s3Client.send(new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })),
        this.s3Client.send(new PutObjectCommand({
          Bucket: this.bucketName,
          Key: thumbKey,
          Body: compressedBuffer,
          ContentType: 'image/jpeg',
        }))
      ]);
      
      const region = 'ap-northeast-2';
      const baseUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/`;
      
      const originalUrl = baseUrl + key;
      const thumbUrl = baseUrl + thumbKey;
      
      console.log('✅ S3 업로드 완료 (원본 + 썸네일):', { originalUrl, thumbUrl });
      
      return { originalUrl, thumbUrl };
    } catch (error) {
      console.error('❌ S3 썸네일 업로드 실패:', error);
      throw error;
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      console.log('🗑️ S3 이미지 삭제 완료:', key);
    } catch (error) {
      console.error('❌ S3 이미지 삭제 실패:', error);
      throw error;
    }
  }

  // S3 연결 테스트
  async testConnection(): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const testKey = 'test/connection-test-' + timestamp + '.txt';
      const testContent = 'S3 connection test';
      
      const putCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
      });

      await this.s3Client.send(putCommand);
      
      // 테스트 파일 삭제
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: testKey,
      });
      await this.s3Client.send(deleteCommand);
      
      console.log('✅ S3 연결 테스트 성공');
      return true;
    } catch (error) {
      console.error('❌ S3 연결 테스트 실패:', error);
      return false;
    }
  }
}
