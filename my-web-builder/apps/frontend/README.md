# 뚝딱 - Frontend

React + TypeScript + Vite 기반의 웹 빌더 프론트엔드 애플리케이션입니다.

## 환경변수 설정

프로젝트를 실행하기 전에 `.env` 파일을 생성하고 다음 환경변수들을 설정해야 합니다:

### 1. .env 파일 생성

프론트엔드 디렉토리에 `.env` 파일을 생성하세요:

```bash
cd my-web-builder/apps/frontend
touch .env
```

### 2. 환경변수 설정

`.env` 파일에 다음 내용을 추가하세요:

```env
# API 설정
VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173

# Google OAuth 설정
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Kakao OAuth 설정
VITE_KAKAO_CLIENT_ID=your_kakao_client_id_here
VITE_KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
VITE_KAKAO_REDIRECT_URI=http://localhost:5173/auth/kakao/callback

# 기타 설정
VITE_APP_NAME=뚝딱
VITE_APP_VERSION=1.0.0
```

### 3. 소셜 로그인 설정

#### Google OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택
5. 애플리케이션 유형을 "웹 애플리케이션"으로 설정
6. 승인된 리디렉션 URI에 `http://localhost:5173/auth/google/callback` 추가
7. 생성된 클라이언트 ID와 시크릿을 `.env` 파일에 설정

#### Kakao OAuth 설정
1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 새 애플리케이션 생성
3. "플랫폼" > "웹" 설정에서 사이트 도메인에 `http://localhost:5173` 추가
4. "카카오 로그인" > "활성화" 설정
5. "리디렉션 URI"에 `http://localhost:5173/auth/kakao/callback` 추가
6. 생성된 JavaScript 키를 `.env` 파일의 `VITE_KAKAO_CLIENT_ID`에 설정

## 개발 서버 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
