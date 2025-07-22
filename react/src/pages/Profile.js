import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { useAuth } from '../context/AuthContext';
import LogoutButton from '../components/LogoutButton';

const { Title, Text } = Typography;

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({ email: '', points: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch user data. Replace with actual API call if needed.
    // Since we don't have a direct API fetch here, we'll simulate data for now.
    setTimeout(() => {
      setUserData({ email: 'user@example.com', points: 10 });
      setLoading(false);
    }, 500);
  }, [currentUser]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={2}>Профиль пользователя</Title>
        <LogoutButton />
      </Space>
      
      <Card title="Информация о пользователе" loading={loading} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <p>
          <Text strong>Электронная почта: </Text>
          <Text>{userData.email}</Text>
        </p>
        <p>
          <Text strong>Баллы: </Text>
          <Text>{userData.points}</Text>
        </p>
        <Button type="primary" style={{ marginTop: 16 }}>
          Редактировать профиль
        </Button>
      </Card>
    </div>
  );
};

export default Profile;
