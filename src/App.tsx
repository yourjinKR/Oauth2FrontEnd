import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import KakaoCallback from './components/KakaoCallback';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
    
    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey);
        console.log('Kakao SDK Initialized');
        setIsSdkReady(true);
        
        if (window.Kakao.Auth.getAccessToken()) {
          setIsLoggedIn(true);
        }
      } else if (window.Kakao && window.Kakao.isInitialized()) {
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
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // SDK logout
    if (window.Kakao && window.Kakao.Auth.getAccessToken()) {
      window.Kakao.Auth.logout(() => {
        setIsLoggedIn(false);
      });
    } else {
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
