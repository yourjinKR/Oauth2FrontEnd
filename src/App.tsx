import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import KakaoCallback from './components/KakaoCallback';
import AuthResult from './components/AuthResult';
import { clearStoredAuth } from './auth';
import { logAuthStep, logAuthToken } from './authDebug';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;

    logAuthStep('페이지 시작 및 Kakao SDK 초기화 대기', {
      '현재 URL': window.location.href,
      '백엔드 기본 주소': import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
      'Kakao SDK 스크립트 로드 여부': Boolean(window.Kakao),
    });
    
    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey);
        logAuthStep('Kakao SDK 초기화 완료', {
          '초기화 상태': window.Kakao.isInitialized(),
          설명: '이제 JavaScript SDK 팝업 로그인을 실행할 수 있습니다.',
        });
        setIsSdkReady(true);

        const existingAccessToken = window.Kakao.Auth.getAccessToken();
        logAuthToken('페이지 로드 시 Kakao SDK accessToken', existingAccessToken);

        if (existingAccessToken) {
          setIsLoggedIn(true);
        }
      } else if (window.Kakao && window.Kakao.isInitialized()) {
        logAuthStep('이미 초기화된 Kakao SDK 확인', {
          '초기화 상태': true,
        });
        logAuthToken(
          '이미 초기화된 Kakao SDK accessToken',
          window.Kakao.Auth.getAccessToken(),
        );
        setIsSdkReady(true);
      }
    };

    const interval = setInterval(() => {
      if (window.Kakao) {
        initKakao();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSdkLoginSuccess = () => {
    logAuthStep('SDK 로그인 상태를 프론트에 반영', {
      isLoggedIn: true,
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logAuthStep('로그아웃 시작', {
      'sessionStorage 토큰 제거': true,
      'Kakao SDK 토큰 존재 여부': Boolean(window.Kakao?.Auth.getAccessToken()),
    });
    clearStoredAuth();

    // SDK logout
    if (window.Kakao && window.Kakao.Auth.getAccessToken()) {
      window.Kakao.Auth.logout(() => {
        logAuthStep('Kakao SDK 로그아웃 완료');
        setIsLoggedIn(false);
      });
    } else {
      logAuthStep('저장된 Kakao SDK 토큰 없음, 프론트 상태만 로그아웃 처리');
      setIsLoggedIn(false);
    }
  };

  if (!isSdkReady) {
    return (
      <div className="app-container">
        <div className="login-card">
          <div className="loading-spinner"></div>
          <p>카카오 SDK 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={isLoggedIn ? <Profile onLogout={handleLogout} /> : <Login onSdkLoginSuccess={handleSdkLoginSuccess} />} 
          />
          <Route path="/login/oauth2/code/kakao" element={<KakaoCallback />} />
          <Route path="/auth/success" element={<AuthResult />} />
          <Route path="/login" element={<AuthResult />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
