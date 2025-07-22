import instance from './axios';

export const registerUser = async (data) => {
  return await instance.post('/api/register', data);
};

export const loginUser = async (data) => {
  return await instance.post('/api/login', data);
};

export const forgotPassword = async (data) => {
  return await instance.post('/api/forgot-password', data);
};

export const resetPassword = async (data) => {
  return await instance.post('/api/reset-password', data);
};
