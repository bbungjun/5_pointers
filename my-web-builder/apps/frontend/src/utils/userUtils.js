// JWT 토큰에서 사용자 정보를 추출하는 함수
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // JWT 토큰 구조 확인
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    // Base64URL을 Base64로 변환
    let base64 = tokenParts[1];
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

    // 패딩 추가
    while (base64.length % 4) {
      base64 += '=';
    }

    // UTF-8로 안전하게 디코딩
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const utf8String = new TextDecoder('utf-8').decode(bytes);
    const payload = JSON.parse(utf8String);

    const currentTime = Date.now() / 1000;
    const isValid = payload.exp > currentTime;

    if (!isValid) {
      return null;
    }

    return {
      id: payload.userId || payload.id || payload.sub,
      nickname: payload.nickname || payload.name || payload.email?.split('@')[0] || '사용자',
      email: payload.email,
      role: payload.role || 'USER',
    };
  } catch (error) {
    console.error('사용자 정보 파싱 오류:', error);
    return null;
  }
}; 