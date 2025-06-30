import button from './button.json';
import text from './text.json';
import link from './link.json';
import attend from './attend.json';
import map from './map.json';
import dday from './d-day.json';
import weddingContact from './wedding-contact.json';
import image from './image.json';
import bankAccount from './bank-account.json';
import calendar from './calendar.json';

export const ComponentList = [
  button,
  text,
  link,
  attend,
  map,
  dday,
  weddingContact,
  image,
  bankAccount,
  calendar,
];

// 기존 코드와의 호환성을 위해 ComponentDefinitions도 export
export const ComponentDefinitions = ComponentList;