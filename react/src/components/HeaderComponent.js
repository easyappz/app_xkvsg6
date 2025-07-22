import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const { Header } = Layout;

const HeaderComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = isAuthenticated
    ? [
        { key: '/upload-photo', label: <Link to="/upload-photo">Загрузить фото</Link> },
        { key: '/rate-photos', label: <Link to="/rate-photos">Оценить фото</Link> },
        { key: '/profile', label: <Link to="/profile">Профиль</Link> },
        { key: 'logout', label: 'Выйти', onClick: handleLogout },
      ]
    : [
        { key: '/login', label: <Link to="/login">Вход</Link> },
        { key: '/register', label: <Link to="/register">Регистрация</Link> },
      ];

  return (
    <Header>
      <div className="logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Header>
  );
};

export default HeaderComponent;
