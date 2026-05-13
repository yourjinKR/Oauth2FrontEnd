import React, { useEffect, useState } from 'react';

interface ProfileProps {
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (window.Kakao && window.Kakao.Auth.getAccessToken()) {
      window.Kakao.API.request({
        url: '/v2/user/me',
        success: (res: any) => {
          console.log('User Profile:', res);
          setUser(res);
        },
        fail: (error: any) => {
          console.error('Failed to get user profile:', error);
        },
      });
    }
  }, []);

  const handleLogout = () => {
    if (!window.Kakao.Auth.getAccessToken()) {
      console.log('Not logged in.');
      return;
    }
    window.Kakao.Auth.logout(() => {
      console.log('Logged out');
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
