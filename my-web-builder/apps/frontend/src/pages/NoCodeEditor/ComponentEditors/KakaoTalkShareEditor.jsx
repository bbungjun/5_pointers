import React from "react";

export default function KakaoTalkShareEditor({ selectedComp, onUpdate }) {
  const { props } = selectedComp;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({
      ...selectedComp,
      props: {
        ...props,
        [name]: value,
      },
    });
  };

  return (
    <div>
      <div>
        <label>제목</label>
        <input name="title" value={props.title} onChange={handleChange} />
      </div>
      <div>
        <label>설명</label>
        <input name="description" value={props.description} onChange={handleChange} />
      </div>
      <div>
        <label>이미지 URL</label>
        <input name="imageUrl" value={props.imageUrl} onChange={handleChange} />
      </div>
      <div>
        <label>버튼 텍스트</label>
        <input name="buttonTitle" value={props.buttonTitle} onChange={handleChange} />
      </div>
    </div>
  );
}