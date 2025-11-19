import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/user'); // Navigate to the main dashboard
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page in history
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Button type="default" onClick={handleGoBack}>
              Go Back
            </Button>
            <Button type="primary" onClick={handleGoHome}>
              Back Home
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default NotFound;

