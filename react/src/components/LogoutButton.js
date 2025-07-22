import React from 'react';
import { Button } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Button 
      type="primary" 
      danger 
      onClick={handleLogout} 
      style={{ marginLeft: 'auto' }}
    >
      Выйти
    </Button>
  );
};

export default LogoutButton;
