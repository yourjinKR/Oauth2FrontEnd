import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../auth';

const KakaoCallback = () => {
  const location = useLocation();
  const [hasCallbackParams] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.has('code') && params.has('state');
  });

  useEffect(() => {
    if (hasCallbackParams) {
      window.location.replace(
        `${API_BASE_URL}/login/oauth2/code/kakao${location.search}`,
      );
    }
  }, [hasCallbackParams, location.search]);

  return (
    <div className="login-card">
      {hasCallbackParams ? (
        <>
          <div className="loading-spinner" />
          <h2>OAuth2 콜백 전달 중...</h2>
          <p className="result-message">
            인가 코드를 Spring Security 백엔드로 전달하고 있습니다.
          </p>
        </>
      ) : (
        <>
          <div className="status-badge failed">확인 필요</div>
          <h2>OAuth2 콜백 정보가 없습니다.</h2>
          <p className="result-message">
            이 경로는 카카오가 프론트로 콜백한 경우에만 백엔드로 전달합니다.
          </p>
          <Link className="result-link" to="/">
            로그인 테스트로 돌아가기
          </Link>
        </>
      )}
    </div>
  );
};

export default KakaoCallback;
