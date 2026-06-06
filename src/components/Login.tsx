import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  type AuthResponse,
  type CommonResponse,
  LOGIN_METHOD_STORAGE_KEY,
} from '../auth';
import { logAuthError, logAuthStep, logAuthToken } from '../authDebug';

interface LoginProps {
  onSdkLoginSuccess: () => void;
}

const Login = ({ onSdkLoginSuccess }: LoginProps) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const springOAuth2Url = `${API_BASE_URL}/oauth2/authorization/kakao`;

  const handleSdkLogin = () => {
    logAuthStep('SDK 로그인 버튼 클릭', {
      설명: 'Kakao JavaScript SDK가 팝업을 열고 카카오 accessToken을 발급합니다.',
      'SDK 초기화 여부': window.Kakao?.isInitialized() ?? false,
      'SDK 인증 후 호출할 백엔드 API': `${API_BASE_URL}/sdk/oauth2/authorization/kakao`,
    });

    if (!window.Kakao) {
      logAuthError('Kakao SDK를 찾을 수 없음', new Error('window.Kakao가 없습니다.'));
      setErrorMessage('Kakao SDK가 로드되지 않았습니다.');
      return;
    }

    window.Kakao.Auth.login({
      success: async (authObj: KakaoAuthObj) => {
        setErrorMessage('');
        setIsSubmitting(true);

        logAuthStep('Kakao SDK 로그인 성공 응답', {
          설명: '카카오가 브라우저에 발급한 인증 객체입니다.',
          authObj,
          'accessToken 만료 시간(초)': authObj.expires_in,
          'refreshToken 만료 시간(초)': authObj.refresh_token_expires_in,
          scope: authObj.scope,
        });
        logAuthToken('Kakao SDK accessToken', authObj.access_token);
        logAuthToken('Kakao SDK refreshToken', authObj.refresh_token);

        try {
          const sdkBackendUrl = `${API_BASE_URL}/sdk/oauth2/authorization/kakao`;
          logAuthStep('SDK accessToken을 백엔드로 전달', {
            method: 'POST',
            url: sdkBackendUrl,
            credentials: 'include',
            '요청 body': { authObj },
            설명: '백엔드는 Kakao 사용자 정보를 조회한 뒤 서비스 accessToken을 발급합니다.',
          });

          const response = await fetch(
            sdkBackendUrl,
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

          logAuthStep('SDK 백엔드 인증 응답 수신', {
            'HTTP status': response.status,
            ok: response.ok,
            '응답 body': result,
          });
          logAuthToken('백엔드 서비스 accessToken', result.data?.accessToken);

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
          logAuthStep('SDK 백엔드 토큰을 sessionStorage에 저장', {
            '저장 key': ACCESS_TOKEN_STORAGE_KEY,
            '로그인 방식 저장 key': LOGIN_METHOD_STORAGE_KEY,
            '다음 화면': '/auth/success?method=sdk',
          });
          onSdkLoginSuccess();
          navigate('/auth/success?method=sdk');
        } catch (error) {
          logAuthError('SDK 백엔드 인증 실패', error);
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
        logAuthError('Kakao SDK 로그인 실패', error);
        setErrorMessage('카카오 SDK 로그인에 실패했습니다.');
      },
    });
  };

  const handleSpringLogin = () => {
    sessionStorage.setItem(LOGIN_METHOD_STORAGE_KEY, 'oauth2');
    logAuthStep('Spring OAuth2 로그인 시작', {
      설명: '브라우저 전체 페이지를 Spring Security 인증 시작 URL로 이동합니다.',
      '인증 시작 URL': springOAuth2Url,
      '카카오 처리 후 백엔드 콜백 URL':
        `${API_BASE_URL}/login/oauth2/code/kakao?code=...&state=...`,
      '백엔드 처리 성공 후 프론트 도착 URL': `${window.location.origin}/auth/success`,
    });
    console.warn(
      '[소셜 로그인 테스트] 전체 페이지 이동 후 로그를 계속 보려면 개발자 도구 Console의 Preserve log를 켜세요.',
    );
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
