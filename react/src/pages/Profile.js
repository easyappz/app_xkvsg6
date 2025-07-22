import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Alert, Spin, Statistic, Row, Col, Switch, Table, Divider } from 'antd';
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

  const genderColumns = [
    {
      title: 'Пол',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Количество оценок',
      dataIndex: 'count',
      key: 'count',
    }
  ];

  const ageColumns = [
    {
      title: 'Возраст',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Количество оценок',
      dataIndex: 'count',
      key: 'count',
    }
  ];

  const getGenderData = (photo) => {
    return [
      { key: 'male', gender: 'Мужской', count: photo.genderStats.male },
      { key: 'female', gender: 'Женский', count: photo.genderStats.female },
      { key: 'other', gender: 'Другой', count: photo.genderStats.other },
    ];
  };

  const getAgeData = (photo) => {
    return [
      { key: '18-25', age: '18-25', count: photo.ageStats['18-25'] },
      { key: '26-35', age: '26-35', count: photo.ageStats['26-35'] },
      { key: '36-50', age: '36-50', count: photo.ageStats['36-50'] },
      { key: '50+', age: '50+', count: photo.ageStats['50+'] },
    ];
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
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Профиль</Title>
      <div className="profile-info" style={{ marginBottom: '24px' }}>
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
            <Col span={24} key={photo.id} className="photo-card">
              <Card
                hoverable
                cover={<img alt="Моя фотография" src={photo.imageUrl} style={{ height: 300, objectFit: 'cover' }} />}
                style={{ marginBottom: '16px' }}
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
                <Divider orientation="left">Статистика по полу</Divider>
                <Table
                  dataSource={getGenderData(photo)}
                  columns={genderColumns}
                  pagination={false}
                  size="small"
                  style={{ marginTop: '16px' }}
                />
                <Divider orientation="left">Статистика по возрасту</Divider>
                <Table
                  dataSource={getAgeData(photo)}
                  columns={ageColumns}
                  pagination={false}
                  size="small"
                  style={{ marginTop: '16px' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Profile;
