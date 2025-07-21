// 컴포넌트별 렌더러들을 export
export { default as ButtonRenderer } from './ButtonRenderer';
export { default as TextRenderer } from './TextRenderer';
export { default as LinkRenderer } from './LinkRenderer';
export { default as AttendRenderer } from './AttendRenderer';
export { default as ImageRenderer } from './ImageRenderer';
export { default as MapInfoRenderer } from './MapInfoRenderer';
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
export { default as MapView } from './MapView';
export { default as PageRenderer } from './PageRenderer';
export { default as PageButtonRenderer } from './PageButtonRenderer';
export { default as RectangleLayerRenderer } from './RectangleLayerRenderer';

// 컴포넌트 타입과 렌더러 매핑
const renderers = {
  'button': ButtonRenderer,
  'text': TextRenderer,
  'link': LinkRenderer,
  'attend': AttendRenderer,
  'image': ImageRenderer,
  'map-info': MapInfoRenderer,
  'map_info': MapInfoRenderer,
  'mapInfo': MapInfoRenderer,
  'map': MapView,
  'd-day': DdayRenderer,
  'dday': DdayRenderer,
  'wedding-contact': WeddingContactRenderer,
  'weddingContact': WeddingContactRenderer,
  'grid-gallery': GridGalleryRenderer,
  'gridGallery': GridGalleryRenderer,
  'slide-gallery': SlideGalleryRenderer,
  'slideGallery': SlideGalleryRenderer,
  'calendar': CalendarRenderer,
  'bank-account': BankAccountRenderer,
  'bankAccount': BankAccountRenderer,
  'comment': CommentRenderer,
  'slido': SlidoRenderer,
  'wedding-invite': WeddingInviteRenderer,
  'weddingInvite': WeddingInviteRenderer,
  'music': MusicRenderer,
  'music-player': MusicRenderer,
  'musicPlayer': MusicRenderer,
  'kakaotalk-share': KakaoTalkShareRenderer,
  'kakaotalkShare': KakaoTalkShareRenderer,
  'page': PageRenderer,
  'pageButton': PageButtonRenderer,
  'rectangleLayer': RectangleLayerRenderer,
};

export default renderers;
