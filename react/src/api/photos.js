import instance from './axios';

export const uploadPhoto = async (data) => {
  return await instance.post('/api/upload-photo', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getPhotosToRate = async (params) => {
  return await instance.get('/api/photos-to-rate', { params });
};

export const ratePhoto = async (photoId, data) => {
  return await instance.post(`/api/rate-photo/${photoId}`, data);
};

export const getMyPhotos = async () => {
  return await instance.get('/api/my-photos');
};

export const togglePhotoActive = async (photoId) => {
  return await instance.patch(`/api/photo/${photoId}/toggle-active`);
};

export const getUserProfile = async () => {
  return await instance.get('/api/user-profile');
};
