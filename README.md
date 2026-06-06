# 소셜 로그인 테스트 페이지

Kakao JavaScript SDK 로그인과 Spring Security OAuth2 로그인을 확인하는 로컬 테스트 페이지입니다.

## 실행

```bash
npm install
npm run dev
```

기본 백엔드 주소는 `http://localhost:8080`입니다. 변경하려면 `.env`에 아래 값을 설정합니다.

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_JS_KEY=카카오_JavaScript_키
```

## OAuth2 리다이렉트 흐름

OAuth2의 `code`와 `state`는 Spring Security가 처리해야 하므로 카카오 콜백 URL은 아래 백엔드 주소를 유지합니다.

```properties
spring.security.oauth2.client.registration.kakao.redirect-uri=http://localhost:8080/login/oauth2/code/kakao
```

백엔드는 콜백 처리 성공/실패 후 이 테스트 페이지로 다시 이동하도록 로컬 설정이 필요합니다.

```properties
app.client-success-url=http://localhost:5173/auth/success
app.client-error-url=http://localhost:5173/login
app.cors-urls=http://localhost:5173
```

정상 흐름은 `카카오 -> localhost:8080/login/oauth2/code/kakao -> localhost:5173/auth/success`입니다.

`/login/oauth2/code/kakao`의 `code`와 `state`는 백엔드 Spring Security가 한 번만 처리해야 합니다. 프론트는 해당 콜백을 백엔드로 재전달하지 않으며, 프론트 콜백 경로로 잘못 도착하면 설정 오류 화면을 표시합니다.

## 브라우저 콘솔 로그

개발자 도구 Console에서 `[소셜 로그인 테스트]`로 필터링하면 로그인 단계별 로그와 토큰 값을 확인할 수 있습니다.

OAuth2는 페이지 전체를 이동하므로 Console의 `Preserve log`를 켜야 리다이렉트 전후 로그가 유지됩니다. OAuth2 서비스 accessToken은 HttpOnly 쿠키로 저장되므로 JavaScript에서 값을 읽을 수 없으며, DevTools의 `Application > Cookies`에서 확인해야 합니다.

토큰 전체 값을 출력하는 로그는 테스트 이해를 위한 용도이며 운영 환경에서는 제거해야 합니다.

개발 모드에서는 React `StrictMode` 때문에 일부 초기화 및 인증 확인 로그가 두 번 보일 수 있습니다.
