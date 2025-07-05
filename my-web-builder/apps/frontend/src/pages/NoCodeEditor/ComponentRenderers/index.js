// ComponentRenderers 모듈들을 한 곳에서 export
export { default as ButtonRenderer } from './ButtonRenderer.jsx';
export { default as TextRenderer } from './TextRenderer.jsx';
export { default as LinkRenderer } from './LinkRenderer.jsx';
export { default as AttendRenderer } from './AttendRenderer.jsx';
export { default as ImageRenderer } from './ImageRenderer.jsx';
export { default as DdayRenderer } from './DdayRenderer.jsx';
export { default as WeddingContactRenderer } from './WeddingContactRenderer.jsx';
export { default as GridGalleryRenderer } from './GridGalleryRenderer.jsx';
export { default as SlideGalleryRenderer } from './SlideGalleryRenderer.jsx';
export { default as MapView } from './MapView.jsx';
export { default as MapInfoRenderer } from './MapInfoRenderer.jsx';
export { default as CalendarRenderer } from './CalendarRenderer.jsx';
export { default as BankAccountRenderer } from './BankAccountRenderer.jsx';
export { default as CommentRenderer } from './CommentRenderer.jsx';
export { default as WeddingInviteRenderer } from './WeddingInviteRenderer.jsx';
export { default as MusicRenderer } from './MusicRenderer.jsx';

// 개별 import (getRendererByType 함수에서 사용)
import ButtonRenderer from './ButtonRenderer.jsx';
import TextRenderer from './TextRenderer.jsx';
import LinkRenderer from './LinkRenderer.jsx';
import AttendRenderer from './AttendRenderer.jsx';
import ImageRenderer from './ImageRenderer.jsx';
import DdayRenderer from './DdayRenderer.jsx';
import WeddingContactRenderer from './WeddingContactRenderer.jsx';
import GridGalleryRenderer from './GridGalleryRenderer.jsx';
import SlideGalleryRenderer from './SlideGalleryRenderer.jsx';
import MapView from './MapView.jsx';
import MapInfoRenderer from './MapInfoRenderer.jsx';
import CalendarRenderer from './CalendarRenderer.jsx';
import BankAccountRenderer from './BankAccountRenderer.jsx';
import CommentRenderer from './CommentRenderer.jsx';
import WeddingInviteRenderer from './WeddingInviteRenderer.jsx';
import MusicRenderer from './MusicRenderer.jsx';
import KakaoTalkShareRenderer from "./KakaoTalkShareRenderer.jsx";

// 컴포넌트 타입별 렌더러 매핑 함수
export function getRendererByType(type) {
  switch (type) {
    case 'button':
      return ButtonRenderer;
    case 'text':
      return TextRenderer;
    case 'link':
      return LinkRenderer;
    case 'attend':
      return AttendRenderer;
    case 'image':
      return ImageRenderer;
    case 'map':
      return MapView;
    case 'dday':
      return DdayRenderer;
    case 'weddingContact':
      return WeddingContactRenderer;
    case 'gridGallery':
      return GridGalleryRenderer;
    case 'slideGallery':
      return SlideGalleryRenderer;
    case 'mapInfo':
      return MapInfoRenderer;
    case 'calendar':
      return CalendarRenderer;
    case 'bankAccount':
      return BankAccountRenderer;
    case 'comment':
      return CommentRenderer;
    case 'weddingInvite':
      return WeddingInviteRenderer;
    case 'musicPlayer':
      return MusicRenderer;
    case 'kakaotalkShare':
      return KakaoTalkShareRenderer;
    default:
      return null;
  }
}
