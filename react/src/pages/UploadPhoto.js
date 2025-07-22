import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Upload, Button, Select, Typography, Alert, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadPhoto } from '../api/photos';

const { Title } = Typography;
const { Option } = Select;

const UploadPhoto = () => {
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      setError('Пожалуйста, загрузите фото');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', fileList[0].originFileObj);
      formData.append('genderFilter', values.genderFilter);
      formData.append('ageFilter', values.ageFilter);
      await uploadPhoto(formData);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке фото');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList(fileList.filter(item => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
    accept: 'image/*',
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Загрузить фото</Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form
        name="uploadPhoto"
        initialValues={{ genderFilter: 'any', ageFilter: 'any' }}
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label="Фото"
          name="photo"
          rules={[{ required: true, message: 'Загрузите фото!' }]}
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Выбрать фото</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Фильтр по полу"
          name="genderFilter"
        >
          <Select>
            <Option value="any">Любой</Option>
            <Option value="male">Мужской</Option>
            <Option value="female">Женский</Option>
            <Option value="other">Другой</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Фильтр по возрасту"
          name="ageFilter"
        >
          <Select>
            <Option value="any">Любой</Option>
            <Option value="18-25">18-25</Option>
            <Option value="26-35">26-35</Option>
            <Option value="36-50">36-50</Option>
            <Option value="50+">50+</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Загрузить
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UploadPhoto;
