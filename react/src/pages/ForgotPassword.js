import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { forgotPassword } from '../api/auth';

const { Title } = Typography;

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      await forgotPassword(values);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при запросе сброса пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Сброс пароля</Title>
      {success ? (
        <Alert
          message="Инструкции по сбросу пароля отправлены на ваш email."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Form
            name="forgotPassword"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Введите ваш email!' }, { type: 'email', message: 'Введите корректный email!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Отправить инструкции
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
