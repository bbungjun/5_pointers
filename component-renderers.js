// 프론트엔드 ComponentRenderers와 동일한 렌더링 로직을 Node.js 환경에서 사용

/**
 * 컴포넌트에서 HTML 생성 함수 (프론트엔드 렌더링과 동일)
 */
function generateHTMLFromComponents(components, page = null) {
  const componentHTML = components.map(comp => {
    const baseStyle = `position: absolute; left: ${comp.x}px; top: ${comp.y}px;`;
    
    switch (comp.type) {
      case 'button':
        return renderButton(comp, baseStyle);
      case 'text':
        return renderText(comp, baseStyle);
      case 'link':
        return renderLink(comp, baseStyle);
      case 'attend':
        return renderAttend(comp, baseStyle);
      case 'image':
        return renderImage(comp, baseStyle);
      case 'input':
        return renderInput(comp, baseStyle);
      case 'textarea':
        return renderTextarea(comp, baseStyle);
      case 'div':
        return renderDiv(comp, baseStyle);
      default:
        return renderText(comp, baseStyle);
    }
  }).join('');

  const title = page?.title || 'Deployed Site';
  const subdomain = page?.subdomain || 'unknown';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          padding: 20px; 
          font-family: Inter, sans-serif; 
          position: relative; 
          min-height: 100vh; 
          background: #f9fafb;
        }
        .watermark {
          position: fixed;
          bottom: 10px;
          right: 10px;
          font-size: 12px;
          color: #888;
          background: rgba(255,255,255,0.8);
          padding: 5px 10px;
          border-radius: 4px;
        }
        .hover-effect:hover {
          opacity: 0.7;
          transform: scale(1.05);
        }
        .hover-effect:active {
          transform: scale(0.95);
        }
        .hover-effect {
          transition: all 0.2s ease;
        }
      </style>
    </head>
    <body>
      ${componentHTML}
      <div class="watermark">Powered by 5Pointers | ${subdomain}</div>
    </body>
    </html>
  `;
}

/**
 * 버튼 렌더러 (프론트엔드 ButtonRenderer와 동일)
 */
function renderButton(comp, baseStyle) {
  const fontStyle = comp.props?.fontFamily || 'Arial, sans-serif';
  const textAlign = comp.props?.textAlign || 'center';
  const lineHeight = comp.props?.lineHeight || 1.2;
  const letterSpacing = comp.props?.letterSpacing || 0;
  const fontWeight = comp.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = comp.props?.textDecoration ? 'underline' : 'none';
  const isItalic = comp.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';
  const textContent = comp.props?.text || '클릭하세요';

  const containerStyle = `
    ${baseStyle}
    width: ${comp.props?.width || 'auto'};
    height: ${comp.props?.height || 'auto'};
    display: flex;
    align-items: center;
    justify-content: ${textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center'};
    background: ${comp.props?.bg || '#3B4EFF'};
    color: ${comp.props?.color || '#fff'};
    font-size: ${comp.props?.fontSize || 18}px;
    font-family: ${fontStyle};
    font-weight: ${fontWeight};
    text-decoration: ${textDecoration};
    border-radius: 6px;
    cursor: pointer;
    border: none;
    outline: none;
    user-select: none;
    text-transform: none;
    line-height: ${lineHeight};
    letter-spacing: ${letterSpacing}px;
    padding: 8px 12px;
    box-sizing: border-box;
    text-align: ${textAlign};
    overflow: visible;
    position: relative;
  `;

  const textStyle = `
    display: inline-block;
    text-align: ${textAlign};
    letter-spacing: ${letterSpacing}px;
    line-height: ${lineHeight};
    font-weight: ${fontWeight};
    text-decoration: ${textDecoration};
    transform: ${italicTransform};
    overflow: visible;
    white-space: pre-wrap;
    text-indent: ${textAlign === 'center' && letterSpacing !== 0 ? (letterSpacing / 2) + 'px' : '0'};
    margin-right: ${textAlign === 'center' && letterSpacing !== 0 ? (-letterSpacing / 2) + 'px' : '0'};
  `;

  return `<div style="${containerStyle}">
    <div style="${textStyle}">${textContent}</div>
  </div>`;
}

/**
 * 링크 렌더러 (프론트엔드 LinkRenderer와 동일)
 */
function renderLink(comp, baseStyle) {
  const linkStyle = `
    ${baseStyle}
    width: ${comp.props?.width || 'auto'};
    height: ${comp.props?.height || 'auto'};
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: underline;
    cursor: pointer;
    color: ${comp.props?.color || '#0066cc'};
    font-size: ${comp.props?.fontSize || 16}px;
    font-family: ${comp.props?.fontFamily || 'Arial, sans-serif'};
    white-space: pre-wrap;
  `;

  return `<a href="${comp.props?.url || '#'}" style="${linkStyle}" target="${comp.props?.target || '_self'}" class="hover-effect">${comp.props?.text || 'Link'}</a>`;
}

/**
 * 텍스트 렌더러
 */
function renderText(comp, baseStyle) {
  const textStyle = `
    ${baseStyle}
    color: ${comp.props?.color || '#000'};
    font-size: ${comp.props?.fontSize || 16}px;
    font-weight: ${comp.props?.fontWeight || 'normal'};
    font-family: ${comp.props?.fontFamily || 'Inter, sans-serif'};
    width: ${comp.props?.width || 'auto'};
    height: ${comp.props?.height || 'auto'};
    text-align: ${comp.props?.textAlign || 'left'};
    line-height: ${comp.props?.lineHeight || '1.5'};
    white-space: pre-wrap;
  `;

  return `<div style="${textStyle}">${comp.props?.text || ''}</div>`;
}

/**
 * 참석 버튼 렌더러 (버튼과 동일한 스타일)
 */
function renderAttend(comp, baseStyle) {
  return renderButton(comp, baseStyle);
}

/**
 * 이미지 렌더러
 */
function renderImage(comp, baseStyle) {
  const imgStyle = `
    ${baseStyle}
    width: ${comp.props?.width || 'auto'};
    height: ${comp.props?.height || 'auto'};
    object-fit: ${comp.props?.objectFit || 'cover'};
    border-radius: ${comp.props?.borderRadius || '0'};
  `;

  return `<img src="${comp.props?.src || ''}" style="${imgStyle}" alt="${comp.props?.alt || ''}" />`;
}

/**
 * 입력 필드 렌더러
 */
function renderInput(comp, baseStyle) {
  const inputStyle = `
    ${baseStyle}
    padding: ${comp.props?.padding || '8px'};
    border: ${comp.props?.border || '1px solid #ccc'};
    border-radius: ${comp.props?.borderRadius || '4px'};
    width: ${comp.props?.width || '200px'};
    height: ${comp.props?.height || 'auto'};
    font-size: ${comp.props?.fontSize || 16}px;
    font-family: ${comp.props?.fontFamily || 'Inter, sans-serif'};
  `;

  return `<input type="${comp.props?.inputType || 'text'}" placeholder="${comp.props?.placeholder || ''}" style="${inputStyle}" />`;
}

/**
 * 텍스트 영역 렌더러
 */
function renderTextarea(comp, baseStyle) {
  const textareaStyle = `
    ${baseStyle}
    padding: ${comp.props?.padding || '8px'};
    border: ${comp.props?.border || '1px solid #ccc'};
    border-radius: ${comp.props?.borderRadius || '4px'};
    width: ${comp.props?.width || '200px'};
    height: ${comp.props?.height || '100px'};
    resize: ${comp.props?.resize || 'both'};
    font-size: ${comp.props?.fontSize || 16}px;
    font-family: ${comp.props?.fontFamily || 'Inter, sans-serif'};
  `;

  return `<textarea placeholder="${comp.props?.placeholder || ''}" style="${textareaStyle}">${comp.props?.value || ''}</textarea>`;
}

/**
 * div 렌더러
 */
function renderDiv(comp, baseStyle) {
  const divStyle = `
    ${baseStyle}
    background: ${comp.props?.bg || 'transparent'};
    padding: ${comp.props?.padding || '0'};
    border: ${comp.props?.border || 'none'};
    border-radius: ${comp.props?.borderRadius || '0'};
    width: ${comp.props?.width || 'auto'};
    height: ${comp.props?.height || 'auto'};
    color: ${comp.props?.color || '#000'};
    font-size: ${comp.props?.fontSize || 16}px;
    font-family: ${comp.props?.fontFamily || 'Inter, sans-serif'};
  `;

  return `<div style="${divStyle}">${comp.props?.text || ''}</div>`;
}

module.exports = {
  generateHTMLFromComponents
};