import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  API_BASE_URL,
  getStoredAccessToken,
  LOGIN_METHOD_STORAGE_KEY,
  type LoginMethod,
} from '../auth';
import { logAuthError, logAuthStep, logAuthToken } from '../authDebug';

type VerificationStatus = 'checking' | 'success' | 'failed';

const AuthResult = () => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');
  const [status, setStatus] = useState<VerificationStatus>('checking');
  const [message, setMessage] = useState('백엔드 인증 상태를 확인하고 있습니다.');
  const storedLoginMethod =
    searchParams.get('method') ??
    sessionStorage.getItem(LOGIN_METHOD_STORAGE_KEY);
  const loginMethod: LoginMethod =
    storedLoginMethod === 'sdk' ? 'sdk' : 'oauth2';
  const displayStatus = errorCode ? 'failed' : status;
  const displayMessage = errorCode ? `OAuth2 로그인 실패: ${errorCode}` : message;

  useEffect(() => {
    logAuthStep('로그인 결과 페이지 진입', {
      '현재 URL': window.location.href,
      '로그인 방식': loginMethod,
      'OAuth2 error code': errorCode,
      'document.cookie': document.cookie || '(JavaScript에서 읽을 수 있는 쿠키 없음)',
      설명:
        loginMethod === 'oauth2'
          ? 'OAuth2 서비스 accessToken은 HttpOnly 쿠키이므로 JavaScript console.log로 값을 읽을 수 없습니다. DevTools Application > Cookies에서 확인하세요.'
          : 'SDK 로그인은 백엔드 accessToken을 sessionStorage에서 읽어 Authorization 헤더로 사용합니다.',
    });

    if (errorCode) {
      logAuthError('OAuth2 로그인 실패 리다이렉트', errorCode);
      return;
    }

    const verifyAuthentication = async () => {
      const accessToken = getStoredAccessToken();
      const headers = new Headers();

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      logAuthToken('인증 확인에 사용할 백엔드 서비스 accessToken', accessToken);
      logAuthStep('백엔드 인증 확인 API 요청', {
        method: 'GET',
        url: `${API_BASE_URL}/users/me/profile/all`,
        credentials: 'include',
        'Authorization 헤더 포함 여부': headers.has('Authorization'),
        설명:
          loginMethod === 'oauth2'
            ? 'OAuth2 방식은 브라우저가 HttpOnly accessToken 쿠키를 자동 전송합니다.'
            : 'SDK 방식은 sessionStorage의 accessToken을 Bearer 헤더로 전송합니다.',
      });

      try {
        const response = await fetch(`${API_BASE_URL}/users/me/profile/all`, {
          credentials: 'include',
          headers,
        });
        const responseBody = await response
          .clone()
          .json()
          .catch(() => '(JSON 응답 없음)');

        logAuthStep('백엔드 인증 확인 API 응답', {
          'HTTP status': response.status,
          ok: response.ok,
          '응답 body': responseBody,
        });

        if (!response.ok) {
          throw new Error(`인증 확인 API 응답: HTTP ${response.status}`);
        }

        setStatus('success');
        setMessage(
          loginMethod === 'sdk'
            ? 'SDK 로그인과 백엔드 토큰 인증이 정상적으로 완료되었습니다.'
            : 'OAuth2 로그인과 백엔드 쿠키 인증이 정상적으로 완료되었습니다.',
        );
      } catch (error) {
        logAuthError('백엔드 인증 확인 실패', error);
        setStatus('failed');
        setMessage(
          error instanceof TypeError
            ? '백엔드 연결 또는 CORS 설정을 확인해 주세요.'
            : error instanceof Error
              ? error.message
              : '인증 상태를 확인하지 못했습니다.',
        );
      }
    };

    void verifyAuthentication();
  }, [errorCode, loginMethod]);

  return (
    <div className="login-card result-card">
      {displayStatus === 'checking' && <div className="loading-spinner" />}
      <div className={`status-badge ${displayStatus}`}>
        {displayStatus === 'checking'
          ? '확인 중'
          : displayStatus === 'success'
            ? '성공'
            : '실패'}
      </div>
      <h2>소셜 로그인 테스트 결과</h2>
      <p className="result-message">{displayMessage}</p>
      <dl className="result-details">
        <div>
          <dt>로그인 방식</dt>
          <dd>{loginMethod === 'sdk' ? 'Kakao JavaScript SDK' : 'Spring OAuth2'}</dd>
        </div>
        <div>
          <dt>백엔드 주소</dt>
          <dd>{API_BASE_URL}</dd>
        </div>
      </dl>
      <Link className="result-link" to="/">
        로그인 테스트로 돌아가기
      </Link>
    </div>
  );
};

export default AuthResult;
