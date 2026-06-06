import React, { useEffect, useState } from 'react';
import { logAuthError, logAuthStep, logAuthToken } from '../authDebug';

interface ProfileProps {
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [user, setUser] = useState<KakaoUser | null>(null);

  useEffect(() => {
    const kakaoAccessToken = window.Kakao?.Auth.getAccessToken();
    logAuthToken('프로필 조회에 사용할 Kakao SDK accessToken', kakaoAccessToken);

    if (window.Kakao && kakaoAccessToken) {
      logAuthStep('Kakao 사용자 프로필 조회 요청', {
        endpoint: '/v2/user/me',
        설명: 'Kakao SDK가 현재 accessToken을 사용해 카카오 사용자 정보를 요청합니다.',
      });
      window.Kakao.API.request({
        url: '/v2/user/me',
        success: (res: KakaoUser) => {
          logAuthStep('Kakao 사용자 프로필 조회 성공', {
            '응답 body': res,
          });
          setUser(res);
        },
        fail: (error: unknown) => {
          logAuthError('Kakao 사용자 프로필 조회 실패', error);
        },
      });
    }
  }, []);

  const handleLogout = () => {
    if (!window.Kakao.Auth.getAccessToken()) {
      logAuthStep('Kakao SDK 로그아웃 생략', {
        이유: 'Kakao SDK accessToken이 없습니다.',
      });
      return;
    }
    logAuthStep('Kakao SDK 로그아웃 요청');
    window.Kakao.Auth.logout(() => {
      logAuthStep('Kakao SDK 로그아웃 성공');
      onLogout();
    });
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <h2>Welcome, {user.kakao_account.profile.nickname}!</h2>
      <img 
        src={user.kakao_account.profile.thumbnail_image_url} 
        alt="Profile" 
        className="profile-image"
      />
      <div className="user-details">
        <p>Email: {user.kakao_account.email || 'N/A'}</p>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
