import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { Row, Col, Button, Typography, Card, Spin, Alert, Divider } from 'antd';
import { GoogleOutlined, ThunderboltOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLoginWithGoogleMutation } from '../../api/authApi';
import { selectIsAuthenticated } from '../../redux/features/authSlice';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";
const { Title, Paragraph } = Typography;

// High-quality travel image for the background
const imageUrl = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1887&auto=format&fit=crop';

const Auth = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [loginWithGoogle, { isLoading, isError, error }] = useLoginWithGoogleMutation();

  // Handle the success callback from the Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("credentialResponse", credentialResponse)
    const token = credentialResponse.credential;
    try {
      await loginWithGoogle({ token }).unwrap();
    } catch (err) {
      console.error('Failed to login:', err);
    }
  };

  // Redirect user if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Card style={{
        width: '950px',
        minHeight: '600px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        borderRadius: '16px',
        padding: 0,
        overflow: 'hidden'
      }}>
        <Row>
          {/* Left Visual Panel */}
          <Col
            xs={0}
            sm={12}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '40px',
              color: 'white'
            }}
          >
            <Title level={2} style={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Your journey begins with a single click.
            </Title>
          </Col>

          {/* Right Action Panel */}
          <Col
            xs={24}
            sm={12}
            style={{
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <Title level={2}>Welcome to TripCraft AI</Title>
            <Paragraph style={{ marginBottom: '40px', color: '#666' }}>
              Sign in to unlock personalized, AI-powered travel itineraries in seconds.
            </Paragraph>

            {/* Custom Google Login Button */}

            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <AnimatePresence mode="wait">
                {!isLoading ? (
                  <motion.div
                    key="google-login"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.log('Login Failed')}
                      shape="rectangular"
                      width="100%"
                    />
                  </motion.div>
                ) :
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 48 }}
                  >
                    <Spin tip="Verifying..." size="large" />
                  </motion.div>
                }
              </AnimatePresence>
            </GoogleOAuthProvider>

            {/* {isLoading && <Spin style={{ marginTop: '20px' }} tip="Verifying..." />} */}
            {isError && <Alert style={{ marginTop: '20px' }} message={error?.data?.detail || "An error occurred"} type="error" />}

            <Divider style={{ margin: '40px 0' }}>Features</Divider>

            <div style={{ textAlign: 'left', color: '#333' }}>
              <Paragraph>
                <ThunderboltOutlined style={{ color: '#A855F7', marginRight: '10px' }} />
                Instantly craft trips with our smart AI.
              </Paragraph>
              <Paragraph>
                <EnvironmentOutlined style={{ color: '#A855F7', marginRight: '10px' }} />
                Discover hidden gems and local favorites.
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#A855F7', marginRight: '10px' }} />
                Organize your plans all in one place.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Auth;

