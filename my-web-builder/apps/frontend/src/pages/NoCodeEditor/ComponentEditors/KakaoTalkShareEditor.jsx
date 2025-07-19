import React, { useRef } from 'react';
import { API_BASE_URL } from '../../../config.js';
import { useToastContext } from '../../../contexts/ToastContext';

export default function KakaoTalkShareEditor({ selectedComp, onUpdate }) {
  const { showError } = useToastContext();

  // selectedComp가 undefined인 경우 방어 코드
  if (!selectedComp || !selectedComp.props) {
    return (
      <div style={{ padding: '16px' }}>
        <p>컴포넌트를 선택해주세요.</p>
      </div>
    );
  }

  const { props } = selectedComp;

  // ref를 사용한 직접 제어 (Y.js 충돌 방지)
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  // Y.js 업데이트 시 textarea 값 동기화
  React.useEffect(() => {
    if (titleRef.current && titleRef.current.value !== (props.title || '')) {
      titleRef.current.value = props.title || '';
    }
    if (
      descriptionRef.current &&
      descriptionRef.current.value !== (props.description || '')
    ) {
      descriptionRef.current.value = props.description || '';
    }
  }, [props.title, props.description]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    onUpdate({
      ...selectedComp,
      props: {
        ...props,
        title: newTitle,
      },
    });
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    onUpdate({
      ...selectedComp,
      props: {
        ...props,
        description: newDescription,
      },
    });
  };

  // 이미지를 서버에 업로드하고 URL을 받아오는 함수
  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log('🚀 이미지 업로드 시작...'); // 디버깅 추가

      const response = await fetch(`${API_BASE_URL}/users/upload/image`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 서버 응답:', response.status); // 디버깅 추가

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 업로드 성공:', data); // 디버깅 추가
        return data.imageUrl;
      } else {
        console.error('❌ 서버 에러:', response.status, response.statusText);
        throw new Error('이미지 업로드 실패');
      }
    } catch (error) {
      console.error('🔥 네트워크 에러:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 제한 (1MB)
      if (file.size > 1 * 1024 * 1024) {
        showError('카카오톡 공유용 이미지는 1MB 이하로 업로드해주세요.');
        return;
      }

      // 로딩 표시
      onUpdate({
        ...selectedComp,
        props: {
          ...props,
          imageUrl: 'loading...',
          previewImageUrl: 'loading...',
        },
      });

      try {
        // ✅ 서버 업로드 (절대 URL 반환)
        const serverImageUrl = await uploadImageToServer(file);

        // ✅ Base64 생성 (미리보기용)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // 크기 조정
          const maxWidth = 800;
          const maxHeight = 400;
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const base64Image = canvas.toDataURL('image/jpeg', 0.7);

          // ✅ 둘 다 저장
          onUpdate({
            ...selectedComp,
            props: {
              ...props,
              imageUrl: serverImageUrl, // 카카오톡용: 절대 URL
              previewImageUrl: base64Image, // 미리보기용: Base64
            },
          });
        };

        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        showError('이미지 업로드에 실패했습니다.');

        onUpdate({
          ...selectedComp,
          props: {
            ...props,
            imageUrl: '',
            previewImageUrl: '',
          },
        });
      }
    }
  };

  // 줄바꿈을 <br> 태그로 변환하는 함수
  const renderTextWithLineBreaks = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // 미리보기용 이미지 URL (로컬 또는 서버)
  const previewImageUrl = props.previewImageUrl || props.imageUrl;

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '8px' }}>
          📱 카카오톡 공유 설정
        </h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          카카오톡으로 공유할 때 보여질 내용을 설정해주세요
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontWeight: 'bold',
            marginBottom: '6px',
            color: '#333',
          }}
        >
          📝 공유 제목
        </label>
        <textarea
          ref={titleRef}
          defaultValue={props.title || ''}
          onChange={handleTitleChange}
          placeholder="예: 유나 결혼식에 초대합니다"
          rows="2"
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontWeight: 'bold',
            marginBottom: '6px',
            color: '#333',
          }}
        >
          💬 공유 설명
        </label>
        <textarea
          ref={descriptionRef}
          defaultValue={props.description || ''}
          onChange={handleDescriptionChange}
          placeholder="예: 12월 25일 토요일 오후 2시&#10;강남구 신사동 웨딩홀에서"
          rows="4"
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            fontWeight: 'bold',
            marginBottom: '6px',
            color: '#333',
          }}
        >
          🖼️ 썸네일 이미지
        </label>

        <div
          style={{
            border: '2px dashed #e1e5e9',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#fafafa',
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
          />

          <label
            htmlFor="image-upload"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            📁 이미지 선택
          </label>

          <p
            style={{
              fontSize: '12px',
              color: '#888',
              marginTop: '8px',
              margin: '8px 0 0 0',
            }}
          >
            JPG, PNG, GIF 파일을 선택해주세요
          </p>
          <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            💡 카카오톡 공유를 위해 이미지가 서버에 업로드됩니다
          </p>
        </div>

        {previewImageUrl && previewImageUrl !== 'loading...' && (
          <div style={{ marginTop: '12px' }}>
            <img
              src={previewImageUrl}
              alt="업로드된 이미지"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            />
            <button
              onClick={() => {
                onUpdate({
                  ...selectedComp,
                  props: {
                    ...props,
                    imageUrl: '',
                    previewImageUrl: '',
                  },
                });
              }}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ❌ 이미지 제거
            </button>
          </div>
        )}

        {(props.imageUrl === 'loading...' ||
          props.previewImageUrl === 'loading...') && (
          <div
            style={{ marginTop: '12px', textAlign: 'center', color: '#666' }}
          >
            <div style={{ fontSize: '14px' }}>📤 이미지 업로드 중...</div>
          </div>
        )}
      </div>

      {(props.title || props.description || previewImageUrl) && (
        <div
          style={{
            border: '2px solid #fee500',
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: '#fffbf0',
            marginTop: '20px',
          }}
        >
          <h4 style={{ color: '#333', marginBottom: '12px', fontSize: '16px' }}>
            👀 카카오톡 미리보기
          </h4>

          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              maxWidth: '300px',
            }}
          >
            {previewImageUrl && previewImageUrl !== 'loading...' && (
              <img
                src={previewImageUrl}
                alt="썸네일"
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}

            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '8px',
              }}
            >
              {renderTextWithLineBreaks(props.title) || '제목을 입력해주세요'}
            </div>

            <div
              style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.4',
              }}
            >
              {renderTextWithLineBreaks(props.description) ||
                '설명을 입력해주세요'}
            </div>

            <div
              style={{
                backgroundColor: '#fee500',
                color: '#333',
                padding: '8px 16px',
                borderRadius: '6px',
                textAlign: 'center',
                marginTop: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              자세히 보기
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
