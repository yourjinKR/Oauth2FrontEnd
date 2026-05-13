import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Spring Boot OAuth2 Login process:
    // 1. User is redirected back to Frontend (this component) with a JSESSIONID or Token in cookies/headers
    // 2. Or the backend redirects directly to '/' after successful login.
    // Here we assume the backend handles the exchange and we just need to check the result.
    
    console.log('OAuth2 Callback handled by Spring Boot backend');
    
    // In a real scenario, you might check for a success flag in URL or a cookie
    // For this demo, we assume success if we reached here
    setTimeout(() => {
      navigate('/');
    }, 1500);
  }, [navigate]);

  return (
    <div className="app-container">
      <div className="login-card">
        <h2>로그인 처리 중...</h2>
        <p>잠시만 기다려 주세요.</p>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export default KakaoCallback;
