// 사용자별 고유 색상 생성 유틸리티

// 미리 정의된 색상 팔레트 (시각적으로 구분되는 색상들)
const USER_COLORS = [
  '#3B82F6', // 파란색
  '#EF4444', // 빨간색
  '#10B981', // 초록색
  '#F59E0B', // 주황색
  '#8B5CF6', // 보라색
  '#EC4899', // 분홍색
  '#06B6D4', // 청록색
  '#84CC16', // 연두색
  '#F97316', // 주황색
  '#6366F1', // 인디고
  '#14B8A6', // 티얼
  '#F43F5E', // 로즈
  '#A855F7', // 바이올렛
  '#22C55E', // 그린
  '#EAB308', // 옐로우
];

/**
 * 사용자 ID나 이름을 기반으로 고유한 색상을 반환합니다.
 * @param {string|number} userId - 사용자 ID 또는 이름
 * @returns {string} HEX 색상 코드
 */
export function getUserColor(userId) {
  if (!userId) return USER_COLORS[0];
  
  // 문자열을 숫자로 변환하여 일관된 색상 할당
  let hash = 0;
  const str = String(userId);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  
  // 절댓값을 사용하여 양수 인덱스 생성
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

/**
 * 사용자 정보에 색상을 추가합니다.
 * @param {Object} user - 사용자 정보 객체
 * @returns {Object} 색상이 추가된 사용자 정보
 */
export function addUserColor(user) {
  if (!user) return { name: '사용자', color: USER_COLORS[0] };
  
  return {
    ...user,
    color: getUserColor(user.id || user.name || user.email)
  };
}

/**
 * 여러 사용자 정보에 색상을 일괄 추가합니다.
 * @param {Array} users - 사용자 정보 배열
 * @returns {Array} 색상이 추가된 사용자 정보 배열
 */
export function addUserColors(users) {
  if (!Array.isArray(users)) return [];
  
  return users.map(user => addUserColor(user));
} 