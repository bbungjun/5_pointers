import buttonDef from './button.json';
import linkDef from './link.json';
import textDef from './text.json';
import mapDef from './map.json';
import attendDef from './attend.json';
import ddayDef from './d-day.json';
import weddingContactDef from './wedding-contact.json';

export const ComponentDefinitions = {
  button: buttonDef,
  link: linkDef,
  text: textDef,
  map: mapDef,
  attend: attendDef,
  dday: ddayDef,
  weddingContact: weddingContactDef,
};

export const ComponentList = Object.values(ComponentDefinitions); 