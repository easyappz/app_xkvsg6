import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UploadPhoto from './pages/UploadPhoto';
import RatePhotos from './pages/RatePhotos';
import Profile from './pages/Profile';
import HeaderComponent from './components/HeaderComponent';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const { Content, Footer } = Layout;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout className="layout">
          <HeaderComponent />
          <Content style={{ padding: '0 50px', marginTop: 64 }}>
            <div className="site-layout-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route 
                  path="/upload-photo" 
                  element={
                    <ProtectedRoute>
                      <UploadPhoto />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/rate-photos" 
                  element={
                    <ProtectedRoute>
                      <RatePhotos />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Photo Rating App ©2023
          </Footer>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
