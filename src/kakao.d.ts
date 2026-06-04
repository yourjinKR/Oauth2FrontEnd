interface KakaoAuthObj {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  scope?: string;
}

interface KakaoUser {
  id: number;
  kakao_account: {
    email?: string;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
    };
  };
}

interface KakaoSdk {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Auth: {
    login: (options: {
      success: (authObj: KakaoAuthObj) => void;
      fail: (error: unknown) => void;
    }) => void;
    getAccessToken: () => string | null;
    logout: (callback: () => void) => void;
  };
  API: {
    request: (options: {
      url: string;
      success: (response: KakaoUser) => void;
      fail: (error: unknown) => void;
    }) => void;
  };
}

interface Window {
  Kakao: KakaoSdk;
}
