import React from 'react';
import { Button, Text, Link } from '@5pointers/shared-components';

// 기존 ButtonRenderer와 호환되는 래퍼
export const ButtonRenderer = ({ comp, mode = 'editor', onUpdate }) => {
  return (
    <Button
      x={comp.x}
      y={comp.y}
      text={comp.props.text}
      bg={comp.props.bg}
      color={comp.props.color}
      fontSize={comp.props.fontSize}
      fontFamily={comp.props.fontFamily}
      onUpdate={onUpdate}
    />
  );
};

// 기존 TextRenderer와 호환되는 래퍼
export const TextRenderer = ({ comp, mode = 'editor', onUpdate }) => {
  return (
    <Text
      x={comp.x}
      y={comp.y}
      text={comp.props.text}
      color={comp.props.color}
      fontSize={comp.props.fontSize}
      fontFamily={comp.props.fontFamily}
      onUpdate={onUpdate}
    />
  );
};

// 기존 LinkRenderer와 호환되는 래퍼
export const LinkRenderer = ({ comp, mode = 'editor', onUpdate }) => {
  return (
    <Link
      x={comp.x}
      y={comp.y}
      text={comp.props.text}
      url={comp.props.url || comp.props.href}
      color={comp.props.color}
      fontSize={comp.props.fontSize}
      fontFamily={comp.props.fontFamily}
      onUpdate={onUpdate}
    />
  );
};

// AttendRenderer도 Button 컴포넌트 사용
export const AttendRenderer = ({ comp, mode = 'editor', onUpdate }) => {
  return (
    <Button
      x={comp.x}
      y={comp.y}
      text={comp.props.text}
      bg={comp.props.bg}
      color={comp.props.color}
      fontSize={comp.props.fontSize}
      fontFamily={comp.props.fontFamily}
      onUpdate={onUpdate}
    />
  );
};
