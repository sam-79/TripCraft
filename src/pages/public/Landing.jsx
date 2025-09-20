import React from "react";
import { Button, Row, Col, Card, Typography, Space } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  CompassOutlined,
  SmileOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { selectIsAuthenticated } from '../../redux/features/authSlice';
import { logout } from "../../redux/features/authSlice";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

// --- Component for individual feature cards ---
const FeatureCard = ({ icon, title, desc, index }) => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.1, duration: 0.5, ease: "easeOut" },
        },
      }}
      whileHover={{ y: -8 }}
    >
      <Card hoverable style={{ borderRadius: 16, textAlign: "center", padding: 16, height: '100%' }}>
        {icon}
        <Title level={4} style={{ marginTop: 12 }}>{title}</Title>
        <Paragraph>{desc}</Paragraph>
      </Card>
    </motion.div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  // Determine the correct text and action for the CTA buttons
  const handleCTAClick = () => {
    if (isAuthenticated) {
      navigate('/user'); // Navigate to the dashboard if logged in
    } else {
      navigate('/auth'); // Navigate to the login page if logged out
    }
  };

  const ctaText = isAuthenticated ? t('go_to_dashboard') : t('get_started');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* --- HERO SECTION --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: "80px 24px",
          textAlign: "center",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          background: 'linear-gradient(135deg, #A855F7, #7E22CE)',
          color: 'white',
        }}
      >
        <Title style={{ fontSize: "3rem", margin: 0, color: 'white', fontWeight: 'bold' }}>
          {t('hero_title')}
        </Title>
        <Paragraph style={{ fontSize: "1.2rem", opacity: 0.9, marginTop: '16px', color: 'white' }}>
          {t('hero_subtitle')}
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={handleCTAClick}
          style={{
            marginTop: '24px',
            height: '50px',
            padding: '0 30px',
            background: 'white',
            color: '#A855F7',
            fontWeight: 'bold',
            border: 'none'
          }}
        >
          {ctaText}
        </Button>
      </motion.div>

      {/* --- FEATURES SECTION --- */}
      <div style={{ padding: "64px 0" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: '48px' }}>{t('why_tripcraft')}</Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <FeatureCard
              icon={<CompassOutlined style={{ fontSize: 28, color: "#A855F7" }} />}
              title={t('feature_planning_title')}
              desc={t('feature_planning_desc')}
              index={0}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FeatureCard
              icon={<ThunderboltOutlined style={{ fontSize: 28, color: "#A855F7" }} />}
              title={t('feature_fast_title')}
              desc={t('feature_fast_desc')}
              index={1}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FeatureCard
              icon={<SmileOutlined style={{ fontSize: 28, color: "#A855F7" }} />}
              title={t('feature_interface_title')}
              desc={t('feature_interface_desc')}
              index={2}
            />
          </Col>
        </Row>
      </div>

      {/* --- FINAL CTA SECTION --- */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        style={{
          textAlign: "center",
          padding: "60px 24px",
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 24,
        }}
      >
        <Title level={2} style={{ marginBottom: 8 }}>
          {t('cta_heading')}
        </Title>
        <Button
          type="primary"
          size="large"
          onClick={handleCTAClick}
          style={{
            marginTop: '16px',
            height: '50px',
            padding: '0 30px',
            fontWeight: 'bold',
          }}
        >
          {isAuthenticated ? t('go_to_dashboard') : t('sign_up_now')}
        </Button>

        {isAuthenticated && <Button
          type="default"
          size="large"
          onClick={() => dispatch(logout())}
          style={{
            marginTop: '16px',
            marginLeft: '16px',
            height: '50px',
            padding: '0 30px',
            fontWeight: 'bold',
          }}
        >
          {t('logout')}
        </Button>}
      </motion.div>
    </div>
  );
};

export default Landing;
