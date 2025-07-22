import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { resetPassword } from '../api/auth';

const { Title } = Typography;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      await resetPassword({ resetToken, newPassword: values.newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div style={{ maxWidth: 300, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center' }}>Сброс пароля</Title>
        <Alert message="Токен для сброса пароля отсутствует." type="error" showIcon style={{ marginBottom: 16 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 300, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Новый пароль</Title>
      {success ? (
        <Alert
          message="Пароль успешно изменен. Вы будете перенаправлены на страницу входа."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Form
            name="resetPassword"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Новый пароль"
              name="newPassword"
              rules={[{ required: true, message: 'Введите новый пароль!' }, { min: 6, message: 'Пароль должен быть не менее 6 символов!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Подтвердить пароль"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Подтвердите новый пароль!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Пароли не совпадают!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Сохранить новый пароль
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
