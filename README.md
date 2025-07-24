
# 뚝딱 DDUKDDAK
### [ 실시간 협업 웹페이지 빌더 ]
드래그 앤 드롭으로 손쉽게 웹페이지를 제작하고, 실시간으로 팀원들과 협업할 수 있는 웹 서비스
</div>

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [핵심 기능](#핵심-기능)
3. [기술 스택](#기술-스택)
4. [시스템 아키텍처](#시스템-아키텍처)
5. [기술적 도전 과제](#기술적-도전-과제)
6. [실행 방법](#실행-방법)
7. [팀원 소개](#팀원-소개)

## 프로젝트 개요
• **목적**: 웹 개발 지식이 없는 사용자도 쉽게 웹페이지를 제작하고 실시간으로 협업할 수 있는 환경 제공

• **진행기간**: '24.06 ~ '24.07

• **주요특징**: 실시간 협업, 드래그 앤 드롭 인터페이스, 즉시 배포 시스템

## 핵심 기능

### 1. 직관적인 웹페이지 제작

#### 드래그 앤 드롭 에디터
• React DnD를 활용한 직관적인 컴포넌트 배치

• 컴포넌트 라이브러리에서 캔버스로 자유로운 드래그 앤 드롭

#### 실시간 속성 편집
• 텍스트, 색상, 크기 등 실시간 수정

• 다양한 스타일 옵션 제공

![looping](https://github.com/user-attachments/assets/4d1cdbe3-a9d6-4b0b-87f7-e70f10a2094f)


### 2. 실시간 협업 시스템
• **CRDT 기반 동시 편집**
  • Y.js CRDT 알고리즘으로 충돌 없는 자동 병합
  
  • 다중 사용자 동시 작업 지원
  
• **실시간 커서 및 채팅**
  • Awareness API 활용 커서 동기화
  
  • 사용자별 컬러 커서 구분
  
  • 커서 위치 기반 실시간 채팅
<img width="700" src="[실시간협업.gif]"/>

### 3. 간편한 배포 시스템
• **와일드카드 서브도메인**
  • 사용자 지정 주소로 즉시 배포
  
  • DNS 설정 없이 자동 도메인 생성
• **접근성**
  • QR코드 자동 생성
  
  • 모바일 최적화 지원
  
  • 실시간 미리보기 제공
<img width="700" src="[배포시스템.gif]"/>

### 4. 반응형 웹페이지
• **자동 스케일링**
  • 디바이스 크기별 최적화
  
  • 컴포넌트 자동 정렬
  
  • 모든 디바이스에서 동일한 레이아웃
  
<img width="700" src="[반응형UI.gif]"/>

### 5. 인터랙티브 컴포넌트
• **실시간 상호작용**
  • 댓글, 슬라이도, 참석 여부 확인
• **데이터 동기화**
  • 참석 여부 데이터 수집
<img width="700" src="[인터랙션.gif]"/>

### 6. 템플릿 시스템
• **다양한 템플릿**
  • 용도별 최적화 템플릿
  • 모바일/데스크톱 템플릿

<img width="700" src="[템플릿.gif]"/>

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

## 기술적 도전 과제

### 1. 실시간 협업 시스템 구현
• Y.js CRDT 알고리즘 적용으로 충돌 해결
• WebSocket을 통한 실시간 상태 동기화
• Awareness API를 활용한 다중 사용자 상태 관리

### 2. 반응형 렌더링 최적화
• 컴포넌트 스케일링 알고리즘 구현
• 디바이스별 최적화된 레이아웃 처리
• 성능 최적화 및 렌더링 효율화

### 3. 배포 자동화
• 와일드카드 서브도메인 시스템 구축
• GitHub Actions를 통한 CI/CD 파이프라인
• CloudFront 캐시 전략 최적화

## 실행 방법

bash
# 프로젝트 클론
```
git clone https://github.com/username/5_pointers.git
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
|이름|담당|
|:---:|:---|
|김별<br> [@isByeolHere](https://github.com/Bell-isHere)|• 팀장<br>• 프로젝트 설계 및 관리<br>• 디바이스 반응형 UI/UX 개발|
|석재민(GitHub 프로필 링크)|• 실시간 협업 시스템 개발<br>• API 서버 개발 및 관리<br>• 데이터베이스 설계 및 최적화|
|지준배(GitHub 프로필 링크)|• 컴포넌트 라이브러리 개발<br>• 컴포넌트 속성 편집 시스템 개발<br>• AWS S3 파일 업로드/관리|
|이영준(GitHub 프로필 링크)|• AWS 클라우드 인프라 구축<br>• 서브도메인 렌더링 시스템 구현<br>• 모니터링 시스템 구축|
|이세창(GitHub 프로필 링크)|• 컴포넌트 구현<br>• 컴포넌트 속성 편집 구현|
