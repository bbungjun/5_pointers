// 컴포넌트별 렌더러들을 import
import ButtonRenderer from './ButtonRenderer';
import TextRenderer from './TextRenderer';
import LinkRenderer from './LinkRenderer';
import AttendRenderer from './AttendRenderer';
import ImageRenderer from './ImageRenderer';
import MapInfoRenderer from './MapInfoRenderer';
import MapView from './MapView';
import DdayRenderer from './DdayRenderer';
import WeddingContactRenderer from './WeddingContactRenderer';
import GridGalleryRenderer from './GridGalleryRenderer';
import SlideGalleryRenderer from './SlideGalleryRenderer';
import CalendarRenderer from './CalendarRenderer';
import BankAccountRenderer from './BankAccountRenderer';
import CommentRenderer from './CommentRenderer';
import SlidoRenderer from './SlidoRenderer';
import WeddingInviteRenderer from './WeddingInviteRenderer';
import MusicRenderer from './MusicRenderer';
import KakaoTalkShareRenderer from './KakaoTalkShareRenderer';
import PageRenderer from './PageRenderer';
import PageButtonRenderer from './PageButtonRenderer';
import WeddingContentRenderer from './WeddingContentRenderer';

// 컴포넌트 렌더러 객체 생성
export const ComponentRenderers = {
  // 기본 컴포넌트들
  button: ButtonRenderer,
  text: TextRenderer,
  link: LinkRenderer,
  attend: AttendRenderer,
  image: ImageRenderer,
  calendar: CalendarRenderer,
  comment: CommentRenderer,
  slido: SlidoRenderer,
  music: MusicRenderer,
  page: PageRenderer,
  pageButton: PageButtonRenderer,
  
  // 지도 관련
  'map-info': MapInfoRenderer,
  'map_info': MapInfoRenderer,
  mapInfo: MapInfoRenderer,
  map: MapView,
  
  // D-day
  'd-day': DdayRenderer,
  dday: DdayRenderer,
  
  // 웨딩 관련
  'wedding-contact': WeddingContactRenderer,
  weddingContact: WeddingContactRenderer,
  'wedding-invite': WeddingInviteRenderer,
  weddingInvite: WeddingInviteRenderer,
  'wedding-content': WeddingContentRenderer,
  weddingContent: WeddingContentRenderer,
  
  // 갤러리
  'grid-gallery': GridGalleryRenderer,
  gridGallery: GridGalleryRenderer,
  'slide-gallery': SlideGalleryRenderer,
  slideGallery: SlideGalleryRenderer,
  
  // 계좌
  'bank-account': BankAccountRenderer,
  bankAccount: BankAccountRenderer,
  
  // 카카오톡
  'kakaotalk-share': KakaoTalkShareRenderer,
  kakaotalkShare: KakaoTalkShareRenderer,
  
  // 음악 플레이어
  'music-player': MusicRenderer,
  musicPlayer: MusicRenderer,
};

// 개별 export도 유지
export { default as ButtonRenderer } from './ButtonRenderer';
export { default as TextRenderer } from './TextRenderer';
export { default as LinkRenderer } from './LinkRenderer';
export { default as AttendRenderer } from './AttendRenderer';
export { default as ImageRenderer } from './ImageRenderer';
export { default as MapInfoRenderer } from './MapInfoRenderer';
export { default as MapView } from './MapView';
export { default as DdayRenderer } from './DdayRenderer';
export { default as WeddingContactRenderer } from './WeddingContactRenderer';
export { default as GridGalleryRenderer } from './GridGalleryRenderer';
export { default as SlideGalleryRenderer } from './SlideGalleryRenderer';
export { default as CalendarRenderer } from './CalendarRenderer';
export { default as BankAccountRenderer } from './BankAccountRenderer';
export { default as CommentRenderer } from './CommentRenderer';
export { default as SlidoRenderer } from './SlidoRenderer';
export { default as WeddingInviteRenderer } from './WeddingInviteRenderer';
export { default as MusicRenderer } from './MusicRenderer';
export { default as KakaoTalkShareRenderer } from './KakaoTalkShareRenderer';
export { default as PageRenderer } from './PageRenderer';
export { default as PageButtonRenderer } from './PageButtonRenderer';
export { default as WeddingContentRenderer } from './WeddingContentRenderer';