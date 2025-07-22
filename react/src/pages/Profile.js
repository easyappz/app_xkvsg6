import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Alert, Spin, Statistic, Row, Col, Switch } from 'antd';
import { getUserProfile, getMyPhotos, togglePhotoActive } from '../api/photos';

const { Title } = Typography;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const userResponse = await getUserProfile();
      const photosResponse = await getMyPhotos();
      setUser(userResponse.data.user);
      setPhotos(photosResponse.data.photos);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке данных профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (photoId, currentStatus) => {
    try {
      await togglePhotoActive(photoId);
      setPhotos(photos.map(photo => 
        photo.id === photoId ? { ...photo, isActive: !currentStatus } : photo
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при изменении статуса фото');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ margin: '0 auto', maxWidth: 500 }} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Профиль</Title>
      <div className="profile-info">
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Email" value={user.email} />
          </Col>
          <Col span={12}>
            <Statistic title="Баллы" value={user.points} />
          </Col>
        </Row>
      </div>
      <Title level={3}>Мои фотографии</Title>
      {photos.length === 0 ? (
        <Alert message="У вас пока нет загруженных фотографий." type="info" showIcon />
      ) : (
        <Row gutter={[16, 16]}>
          {photos.map(photo => (
            <Col span={8} key={photo.id} className="photo-card">
              <Card
                hoverable
                cover={<img alt="My photo" src={photo.imageUrl} className="photo-image" />}
              >
                <Card.Meta
                  title={`Средняя оценка: ${photo.averageScore.toFixed(1)}`}
                  description={`Всего оценок: ${photo.totalRatings}`}
                />
                <div style={{ marginTop: 10 }}>
                  <Switch
                    checked={photo.isActive}
                    onChange={() => handleToggleActive(photo.id, photo.isActive)}
                    checkedChildren="Активно"
                    unCheckedChildren="Неактивно"
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Profile;
