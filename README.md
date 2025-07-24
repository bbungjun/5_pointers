
# 뚝딱 DDUKDDAK
### [ 누구나 쉽게 만드는 이벤트 페이지 빌더 ]
실시간으로 팀원들과 협업하여 배포까지 할 수 있는 웹 서비스


## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [핵심 기능](#핵심-기능)
3. [기술 스택](#기술-스택)
4. [시스템 아키텍처](#시스템-아키텍처)
5. [실행 방법](#실행-방법)
6. [팀원 소개](#팀원-소개)

## 프로젝트 개요
- **목적**: 웹 개발 지식이 없는 사용자도 쉽게 웹페이지를 제작하고 실시간으로 협업하면서 배포까지하는 환경 제공
- **진행기간**: '24.06 ~ '24.07
- **주요특징**: 실시간 협업, 드래그 앤 드롭 인터페이스, 즉시 배포 시스템

## 핵심 기능

### 1. 직관적인 웹페이지 제작

#### 드래그 앤 드롭 에디터
- React DnD를 활용한 직관적인 컴포넌트 배치
- 컴포넌트 라이브러리에서 캔버스로 자유로운 드래그 앤 드롭

#### 실시간 속성 편집
- 텍스트, 색상, 크기 등 실시간 수정
- 다양한 스타일 옵션 제공

<img width="800" src="https://github.com/user-attachments/assets/4d1cdbe3-a9d6-4b0b-87f7-e70f10a2094f"/>

### 2. 실시간 협업 시스템
#### CRDT 기반 동시 편집
- Y.js CRDT 알고리즘으로 충돌 없는 자동 병합
- 다중 사용자 동시 작업 지원
  
#### 실시간 커서 및 채팅
- Awareness API 활용 커서 동기화
- 사용자별 컬러 커서 구분
- 커서 위치 기반 실시간 채팅
  
<img width="800" src="https://github.com/user-attachments/assets/dc83e81d-ef13-46cc-acc4-51b352185888"/>

### 3. 간편한 배포 시스템
#### 와일드카드 서브도메인
- 사용자 지정 주소로 즉시 배포
- DNS 설정 없이 자동 도메인 생성
  
#### 접근성
- QR코드 자동 생성
- 모바일 최적화 지원
  
<img width="800" src="https://github.com/user-attachments/assets/8cf659f4-18b4-4df9-bfe9-4efd9c4e537d"/>


### 4. 반응형 웹페이지
#### 자동 스케일링
- 디바이스 크기별 최적화
- 컴포넌트 자동 정렬
- 모든 디바이스에서 동일한 레이아웃
  
<img width="800" src="https://github.com/user-attachments/assets/e0a09bbf-4269-4ef9-bea9-35694b82ef40"/>

### 5. 템플릿 시스템
#### 다양한 템플릿
- 용도별 최적화 템플릿
- 모바일/데스크톱 템플릿

<img width="800" src="https://github.com/user-attachments/assets/183e017d-c830-4f20-86f7-c0b74f126a28"/>

## 기술 스택

#### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Y.js](https://img.shields.io/badge/Y.js-000000?style=for-the-badge&logo=y.js&logoColor=white)

#### Backend
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0902?style=for-the-badge&logo=typeorm&logoColor=white)

#### Infrastructure
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

## 시스템 아키텍처
<img width="800" alt="image" src="https://github.com/user-attachments/assets/fc55f1f2-fba3-4f86-9fc5-446ecbe35626" />

## 실행 방법

bash
# 프로젝트 클론
```
git clone https://github.com/Jungle-5pointers/5_pointers.git
```

# 프론트엔드/서브도메인 서버 실행
```
cd my-web-builder/apps/frontend
pnpm install
pnpm dev
```

# 백엔드 실행
```
cd backend
npm install
npm start:dev
```

# Y.js 서버 실행
```
node yjs-server.js
```


## 팀원 소개
|사진|이름|담당|
|:---:|:---:|:---:|
|<img width="100" alt="byeol" src="https://github.com/user-attachments/assets/051eca14-312a-4c41-99e5-69885c1babe2" />|김별<br> [@isByeolHere](https://github.com/Bell-isHere)|• 팀장<br>• 프로젝트 설계 및 관리<br>• 디바이스 반응형 UI/UX 개발|
|<img width="100" alt="jaemin" src="https://github.com/user-attachments/assets/47bd2977-61fa-465c-a229-d6c3cd83910d" />|석재민<br> [@0525aa36](https://github.com/0525aa36)|• 실시간 협업 시스템 개발<br>• API 서버 개발 및 관리<br>• 데이터베이스 설계 및 최적화|
|<img width="100" alt="junbae" src="https://github.com/user-attachments/assets/74626890-1f13-44e5-97b5-6528b66d5769" />|지준배<br> [@June0727-JUNGLE](https://github.com/June0727-JUNGLE)|• 컴포넌트 라이브러리 개발<br>• 컴포넌트 속성 편집 시스템 개발<br>• AWS S3 파일 업로드/관리|
|<img width="100" alt="youngjun" src="https://github.com/user-attachments/assets/77538d4c-d7c6-4f3b-991f-4b29e981b3ca" />|이영준<br> [@bbungjun](https://github.com/bbungjun)|• AWS 클라우드 인프라 구축<br>• 서브도메인 렌더링 시스템 구현<br>• 모니터링 시스템 구축|
|<img width="100" alt="sechang" src="https://github.com/user-attachments/assets/98381ecc-a14d-4b28-b3c9-43269fc2c563" />|이세창<br> [@SECHANG1412](http://github.com/SECHANG1412)|• 컴포넌트 구현<br>• 컴포넌트 속성 편집 구현|
