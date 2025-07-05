// import '../styles/globals.css'
// import type { AppProps } from 'next/app'

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />
// }

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* 카카오 SDK - integrity 속성 완전 제거 */}
      <Script 
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  )
}