import React, { useState, useEffect } from 'react';
import { Button, Card, Select, Typography, Alert, Spin } from 'antd';
import { getPhotosToRate, ratePhoto } from '../api/photos';

const { Title } = Typography;
const { Option } = Select;

const RatePhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [genderFilter, setGenderFilter] = useState('any');
  const [ageFilter, setAgeFilter] = useState('any');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [genderFilter, ageFilter]);

  const fetchPhotos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPhotosToRate({ gender: genderFilter, age: ageFilter });
      setPhotos(response.data.photos);
      setCurrentPhotoIndex(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке фото для оценки');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (score) => {
    if (ratingLoading) return;
    setRatingLoading(true);
    setError('');
    try {
      const photoId = photos[currentPhotoIndex].id;
      await ratePhoto(photoId, { score });
      if (currentPhotoIndex < photos.length - 1) {
        setCurrentPhotoIndex(currentPhotoIndex + 1);
      } else {
        fetchPhotos();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при оценке фото');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === 'gender') setGenderFilter(value);
    if (type === 'age') setAgeFilter(value);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ margin: '0 auto', maxWidth: 500 }} />;
  }

  if (photos.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center' }}>Оценить фото</Title>
        <Alert message="Нет доступных фото для оценки." type="info" showIcon style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Select
            defaultValue="any"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange('gender', value)}
          >
            <Option value="any">Пол: Любой</Option>
            <Option value="male">Пол: Мужской</Option>
            <Option value="female">Пол: Женский</Option>
            <Option value="other">Пол: Другой</Option>
          </Select>
          <Select
            defaultValue="any"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange('age', value)}
          >
            <Option value="any">Возраст: Любой</Option>
            <Option value="18-25">Возраст: 18-25</Option>
            <Option value="26-35">Возраст: 26-35</Option>
            <Option value="36-50">Возраст: 36-50</Option>
            <Option value="50+">Возраст: 50+</Option>
          </Select>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Оценить фото</Title>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Select
          defaultValue="any"
          style={{ width: 200 }}
          onChange={(value) => handleFilterChange('gender', value)}
        >
          <Option value="any">Пол: Любой</Option>
          <Option value="male">Пол: Мужской</Option>
          <Option value="female">Пол: Женский</Option>
          <Option value="other">Пол: Другой</Option>
        </Select>
        <Select
          defaultValue="any"
          style={{ width: 200 }}
          onChange={(value) => handleFilterChange('age', value)}
        >
          <Option value="any">Возраст: Любой</Option>
          <Option value="18-25">Возраст: 18-25</Option>
          <Option value="26-35">Возраст: 26-35</Option>
          <Option value="36-50">Возраст: 36-50</Option>
          <Option value="50+">Возраст: 50+</Option>
        </Select>
      </div>
      <Card>
        <img src={currentPhoto.imageUrl} alt="Photo to rate" className="photo-image" />
        <div className="rate-container">
          {[1, 2, 3, 4, 5].map(score => (
            <Button
              key={score}
              onClick={() => handleRate(score)}
              style={{ margin: '0 5px' }}
              loading={ratingLoading}
            >
              {score}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RatePhotos;
