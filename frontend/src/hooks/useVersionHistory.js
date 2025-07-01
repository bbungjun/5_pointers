import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';

/**
 * 시나리오 3: 버전 히스토리 및 스냅샷 복원
 * 
 * Figma의 버전 히스토리와 같은 스냅샷 관리 기능
 * - 현재 상태를 버전으로 저장
 * - 저장된 버전 목록 관리
 * - 특정 버전으로 복원
 * - 버전 간 차이점 시각화 (선택사항)
 */
export function useVersionHistory(ydoc, provider) {
  const [versions, setVersions] = useState([]);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // 현재 상태를 새 버전으로 저장
  const createSnapshot = useCallback(async (versionName, description = '') => {
    if (!ydoc || isCreatingSnapshot) return;

    setIsCreatingSnapshot(true);
    
    try {
      // Y.js 문서의 현재 상태를 스냅샷으로 캡처
      const snapshot = Y.snapshot(ydoc);
      
      // 스냅샷을 바이너리 형태로 인코딩하여 저장 크기 최적화
      const encodedSnapshot = Y.encodeStateAsUpdate(ydoc);
      
      // 버전 메타데이터 생성
      const version = {
        id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: versionName,
        description,
        createdAt: new Date().toISOString(),
        snapshot: encodedSnapshot, // 실제 스냅샷 데이터
        snapshotInfo: {
          // 스냅샷 추가 정보 (디버깅용)
          clientID: ydoc.clientID,
          clock: ydoc.clock
        }
      };

      // 실제 환경에서는 서버에 저장해야 함
      // 여기서는 로컬 스토리지에 저장하는 예시
      const existingVersions = JSON.parse(
        localStorage.getItem('pageVersions') || '[]'
      );
      
      // 바이너리 데이터는 Base64로 인코딩하여 저장
      const versionToStore = {
        ...version,
        snapshot: Array.from(encodedSnapshot) // Uint8Array를 일반 배열로 변환
      };
      
      existingVersions.push(versionToStore);
      localStorage.setItem('pageVersions', JSON.stringify(existingVersions));

      // 상태 업데이트
      setVersions(prev => [...prev, {
        ...version,
        snapshot: encodedSnapshot // 메모리에는 원래 형태로 저장
      }]);

      return version.id;
    } catch (error) {
      console.error('스냅샷 생성 실패:', error);
      throw error;
    } finally {
      setIsCreatingSnapshot(false);
    }
  }, [ydoc, isCreatingSnapshot]);

  // 특정 버전으로 복원
  const restoreVersion = useCallback(async (versionId) => {
    if (!ydoc || !provider || isRestoring) return;

    setIsRestoring(true);

    try {
      const version = versions.find(v => v.id === versionId);
      if (!version) {
        throw new Error('버전을 찾을 수 없습니다.');
      }

      // 현재 협업 상태를 일시 중단 (다른 사용자와의 충돌 방지)
      provider.disconnect();

      // 현재 문서의 모든 데이터 클리어
      ydoc.transact(() => {
        // 모든 최상위 타입들을 클리어
        const rootTypes = ydoc.share;
        Object.keys(rootTypes).forEach(key => {
          const type = rootTypes[key];
          if (type instanceof Y.Map) {
            type.clear();
          } else if (type instanceof Y.Array) {
            type.delete(0, type.length);
          } else if (type instanceof Y.Text) {
            type.delete(0, type.length);
          }
        });
      });

      // 스냅샷 데이터를 현재 문서에 적용
      Y.applyUpdate(ydoc, version.snapshot);

      // 짧은 딜레이 후 협업 재연결
      setTimeout(() => {
        provider.connect();
        setIsRestoring(false);
      }, 1000);

    } catch (error) {
      console.error('버전 복원 실패:', error);
      // 실패 시 협업 다시 연결
      provider.connect();
      setIsRestoring(false);
      throw error;
    }
  }, [ydoc, provider, versions, isRestoring]);

  // 버전 삭제
  const deleteVersion = useCallback(async (versionId) => {
    try {
      // 로컬 스토리지에서 삭제
      const existingVersions = JSON.parse(
        localStorage.getItem('pageVersions') || '[]'
      );
      const filteredVersions = existingVersions.filter(v => v.id !== versionId);
      localStorage.setItem('pageVersions', JSON.stringify(filteredVersions));

      // 상태에서 삭제
      setVersions(prev => prev.filter(v => v.id !== versionId));
    } catch (error) {
      console.error('버전 삭제 실패:', error);
      throw error;
    }
  }, []);

  // 버전 이름 변경
  const renameVersion = useCallback(async (versionId, newName) => {
    try {
      // 로컬 스토리지 업데이트
      const existingVersions = JSON.parse(
        localStorage.getItem('pageVersions') || '[]'
      );
      const updatedVersions = existingVersions.map(v => 
        v.id === versionId ? { ...v, name: newName } : v
      );
      localStorage.setItem('pageVersions', JSON.stringify(updatedVersions));

      // 상태 업데이트
      setVersions(prev => prev.map(v => 
        v.id === versionId ? { ...v, name: newName } : v
      ));
    } catch (error) {
      console.error('버전 이름 변경 실패:', error);
      throw error;
    }
  }, []);

  // 컴포넌트 마운트 시 저장된 버전들 로드
  useEffect(() => {
    try {
      const savedVersions = JSON.parse(
        localStorage.getItem('pageVersions') || '[]'
      );
      
      // 저장된 스냅샷 데이터를 Uint8Array로 복원
      const restoredVersions = savedVersions.map(version => ({
        ...version,
        snapshot: new Uint8Array(version.snapshot)
      }));
      
      setVersions(restoredVersions);
    } catch (error) {
      console.error('버전 히스토리 로드 실패:', error);
    }
  }, []);

  return {
    versions: versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    isCreatingSnapshot,
    isRestoring,
    createSnapshot,
    restoreVersion,
    deleteVersion,
    renameVersion
  };
} 