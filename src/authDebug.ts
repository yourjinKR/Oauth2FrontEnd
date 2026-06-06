const LOG_PREFIX = '[소셜 로그인 테스트]';

export const logAuthStep = (
  title: string,
  details: Record<string, unknown> = {},
) => {
  console.log(`${LOG_PREFIX} ${title}`);
  console.groupCollapsed(`${LOG_PREFIX} ${title}`);
  Object.entries(details).forEach(([label, value]) => {
    console.log(label, value);
  });
  console.groupEnd();
};

export const logAuthToken = (label: string, token: string | null | undefined) => {
  console.log(`${LOG_PREFIX} ${label} 전체 값:`, token ?? '(토큰 없음)');
  console.groupCollapsed(`${LOG_PREFIX} 토큰 확인: ${label}`);
  console.warn('테스트 전용 로그입니다. 운영 환경에서는 토큰 전체 값을 출력하면 안 됩니다.');
  console.log('전체 토큰 값:', token ?? '(토큰 없음)');
  console.groupEnd();
};

export const logAuthError = (title: string, error: unknown) => {
  console.group(`${LOG_PREFIX} 오류: ${title}`);
  console.error(error);
  console.groupEnd();
};
