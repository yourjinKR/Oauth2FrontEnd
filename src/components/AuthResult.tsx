import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  API_BASE_URL,
  getStoredAccessToken,
  LOGIN_METHOD_STORAGE_KEY,
  type LoginMethod,
} from '../auth';

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
    if (errorCode) {
      return;
    }

    const verifyAuthentication = async () => {
      const accessToken = getStoredAccessToken();
      const headers = new Headers();

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/me/profile/all`, {
          credentials: 'include',
          headers,
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
