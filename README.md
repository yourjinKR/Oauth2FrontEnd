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
app.client-error-url=http://localhost:5173/login?error=
app.cors-urls=http://localhost:5173
```

정상 흐름은 `카카오 -> localhost:8080/login/oauth2/code/kakao -> localhost:5173/auth/success`입니다.
