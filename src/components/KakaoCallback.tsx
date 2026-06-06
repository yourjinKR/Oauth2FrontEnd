import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logAuthError, logAuthStep } from '../authDebug';

const KakaoCallback = () => {
  const location = useLocation();
  const callbackParams = new URLSearchParams(location.search);
  const states = callbackParams.getAll('state');
  const state = states[0] ?? null;
  const hasDuplicatedCallback = Boolean(
    states.length !== 1 ||
    state?.includes('http://') ||
    state?.includes('https://'),
  );

  useEffect(() => {
    const loggedParams = new URLSearchParams(location.search);
    const loggedStates = loggedParams.getAll('state');
    const loggedState = loggedStates[0] ?? null;
    const loggedHasDuplicatedCallback = Boolean(
      loggedStates.length !== 1 ||
      loggedState?.includes('http://') ||
      loggedState?.includes('https://'),
    );

    logAuthStep('잘못된 프론트 OAuth2 콜백 감지', {
      '현재 URL': window.location.href,
      '인가 code 전체 값': loggedParams.get('code'),
      'state 개수': loggedStates.length,
      'state 전체 값': loggedStates,
      '중복 URL 포함 여부': loggedHasDuplicatedCallback,
      설명:
        'OAuth2 code/state 콜백은 반드시 localhost:8080의 Spring Security가 직접 처리해야 합니다. 프론트는 콜백을 다시 전달하지 않습니다.',
    });
    logAuthError(
      'OAuth2 콜백 대상 오류',
      new Error('Kakao OAuth2 redirect URI 또는 백엔드 성공 리다이렉트 설정을 확인하세요.'),
    );
  }, [location.search]);

  return (
    <div className="login-card">
      <div className="status-badge failed">콜백 대상 오류</div>
      <h2>OAuth2 콜백이 프론트로 잘못 전달되었습니다.</h2>
      <p className="result-message">
        카카오 인가 코드는 백엔드 Spring Security 콜백에서 한 번만 처리해야 합니다.
        로그인 테스트 화면으로 돌아가 새 로그인을 시작해 주세요.
      </p>
      {hasDuplicatedCallback && (
        <p className="error-message">
          state 값에서 중복 콜백 URL 또는 여러 state 파라미터를 감지했습니다.
        </p>
      )}
      <Link className="result-link" to="/">
        로그인 테스트로 돌아가기
      </Link>
    </div>
  );
};

export default KakaoCallback;
