import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  type AuthResponse,
  type CommonResponse,
  LOGIN_METHOD_STORAGE_KEY,
} from '../auth';

interface LoginProps {
  onSdkLoginSuccess: () => void;
}

const Login = ({ onSdkLoginSuccess }: LoginProps) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const springOAuth2Url = `${API_BASE_URL}/oauth2/authorization/kakao`;

  const handleSdkLogin = () => {
    if (!window.Kakao) {
      setErrorMessage('Kakao SDK가 로드되지 않았습니다.');
      return;
    }

    window.Kakao.Auth.login({
      success: async (authObj: KakaoAuthObj) => {
        setErrorMessage('');
        setIsSubmitting(true);

        try {
          const response = await fetch(
            `${API_BASE_URL}/sdk/oauth2/authorization/kakao`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ authObj }),
            },
          );
          const result = (await response.json()) as CommonResponse<AuthResponse>;

          if (!response.ok || !result.data?.accessToken) {
            throw new Error(
              result.error?.message ?? `SDK 백엔드 인증 실패: HTTP ${response.status}`,
            );
          }

          sessionStorage.setItem(
            ACCESS_TOKEN_STORAGE_KEY,
            result.data.accessToken,
          );
          sessionStorage.setItem(LOGIN_METHOD_STORAGE_KEY, 'sdk');
          onSdkLoginSuccess();
          navigate('/auth/success?method=sdk');
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'SDK 백엔드 인증에 실패했습니다.',
          );
        } finally {
          setIsSubmitting(false);
        }
      },
      fail: (error: unknown) => {
        console.error('SDK Login Failed:', error);
        setErrorMessage('카카오 SDK 로그인에 실패했습니다.');
      },
    });
  };

  const handleSpringLogin = () => {
    sessionStorage.setItem(LOGIN_METHOD_STORAGE_KEY, 'oauth2');
    window.location.assign(springOAuth2Url);
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <h2 className="brand-logo">MyService</h2>
        <p>로그인 방식을 선택해 주세요.</p>
      </div>

      <div className="social-login-group">
        <div className="login-option">
          <span>방법 1: JS SDK + 백엔드 토큰 인증</span>
          <button
            className="kakao-login-button-styled"
            disabled={isSubmitting}
            onClick={handleSdkLogin}
          >
            <img
              src="https://developers.kakao.com/tool/resource/static/img/button/login/full/ko/kakao_login_medium_narrow.png"
              alt="카카오 SDK 로그인"
            />
          </button>
        </div>

        <div className="divider-small" />

        <div className="login-option">
          <span>방법 2: Spring Boot OAuth2 리다이렉트</span>
          <button
            className="kakao-login-button-styled spring-button"
            onClick={handleSpringLogin}
          >
            <div className="custom-kakao-button">
              <img
                src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
                alt=""
                width="20"
              />
              <span>카카오로 시작하기 (Backend)</span>
            </div>
          </button>
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Login;
