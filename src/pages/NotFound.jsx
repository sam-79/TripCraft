import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate('/dashboard'); // Navigate to the main dashboard
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page in history
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Result
        status="404"
        title="404"
        subTitle={t('page_not_found_message')}
        extra={
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Button type="default" onClick={handleGoBack}>
              {t('go_back')}
            </Button>
            <Button type="primary" onClick={handleGoHome}>
              {t('back_home')}
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default NotFound;

