import buttonDef from "./button.json";
import textDef from "./text.json";
import linkDef from "./link.json";
import mapDef from "./map.json";
import attendDef from "./attend.json";
import imageDef from "./image.json";
import ddayDef from "./d-day.json";
import weddingContactDef from "./wedding-contact.json";
import gridGalleryDef from "./grid-gallery.json";
import slideGalleryDef from "./slide-gallery.json";
import mapInfoDef from './map_info.json';
import calendarDef from './calendar.json';
export const ComponentList = [
  buttonDef,
  textDef,
  linkDef,
  mapDef,
  attendDef,
  imageDef,
  ddayDef,
  weddingContactDef,
  gridGalleryDef,
  slideGalleryDef
  mapInfoDef,
  calendarDef
];

// 기존 코드와의 호환성을 위해 ComponentDefinitions도 export
export const ComponentDefinitions = ComponentList;
