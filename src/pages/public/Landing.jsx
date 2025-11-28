import React from "react";
import { Button, Row, Col, Card, Typography, Space, Tag, Divider, Avatar, Tooltip } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  CompassOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  GithubOutlined,
  LinkedinOutlined,
  CodeOutlined,
  CloudServerOutlined,
  EnvironmentOutlined,
  ScheduleOutlined,
  StarFilled
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { selectIsAuthenticated, logout } from '../../redux/features/authSlice';

const { Title, Paragraph, Text } = Typography;

// --- Feature Data ---
const features = [
  {
    icon: <CompassOutlined style={{ fontSize: 32, color: "#A855F7" }} />,
    title: "Personalized AI Itineraries",
    desc: "Smart, day-by-day plans tailored to your vibe, budget, and interests using Gemini AI."
  },
  {
    icon: <GlobalOutlined style={{ fontSize: 32, color: "#A855F7" }} />,
    title: "Multi-Language Support",
    desc: "Plan seamlessly in English, Hindi, or Marathi for true regional accessibility."
  },
  {
    icon: <EnvironmentOutlined style={{ fontSize: 32, color: "#A855F7" }} />,
    title: "Smart Locality Recommendations",
    desc: "Find the safest, best-connected localities and curated hotels near your itinerary spots."
  },
  {
    icon: <ScheduleOutlined style={{ fontSize: 32, color: "#A855F7" }} />,
    title: "Weather-Synced Scheduling",
    desc: "Itineraries that automatically adapt outdoor activities based on real-time weather forecasts."
  },
  {
    icon: <DollarOutlined style={{ fontSize: 32, color: "#A855F7" }} />,
    title: "AI Expense Analysis",
    desc: "Detailed cost breakdowns across travel, hotels, and activities to keep you on budget."
  },
  {
    icon: <RocketOutlined style={{ fontSize: 32, color: "#A855F7" }} />,
    title: "Real-Time Route Validation",
    desc: "Ensures every suggested route is bookable and active using live transport data."
  }
];

// --- Tech Stack Data ---
const techStack = [
  "React", "Vite", "Redux Toolkit", "Google Maps API", "Gemini AI", "FastAPI", "Ant Design"
];

// --- Gemini Logo Component with Animation ---
const GeminiLogo = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}
  >
    <img src="/gemini-color.webp" alt="Logo" width={"30"} />
  </motion.div>
);

const FeatureCard = ({ icon, title, desc, index }) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.1, duration: 0.5, ease: "easeOut" },
      },
    }}
    whileHover={{ y: -8 }}
    style={{ height: '100%' }}
  >
    <Card 
      hoverable 
      style={{ 
        borderRadius: 16, 
        textAlign: "center", 
        padding: 24, 
        height: '100%',
        border: '1px solid #f0f0f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ marginBottom: 16 }}>{icon}</div>
      <Title level={4} style={{ marginBottom: 12 }}>{title}</Title>
      <Paragraph type="secondary">{desc}</Paragraph>
    </Card>
  </motion.div>
);

const Landing = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();

  const handleCTAClick = () => {
    if (isAuthenticated) {
      navigate('/user');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      
      {/* --- HERO SECTION --- */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            padding: "100px 24px",
            textAlign: "center",
            borderRadius: 32,
            background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
            color: 'white',
            boxShadow: '0 20px 40px rgba(124, 58, 237, 0.3)',
            marginBottom: 60,
            position: 'relative', // For absolute positioning of decorative elements if needed
            overflow: 'hidden'
          }}
        >
          {/* Decorative Circle */}
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Title style={{ fontSize: "3.5rem", margin: 0, color: 'white', fontWeight: 800, lineHeight: 1.2 }}>
              TripCraft AI
            </Title>
            <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400, marginTop: 16 }}>
              Your End-to-End AI Travel Partner 🌍
            </Title>
            
            {/* Enhanced Powered By Badge */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    background: 'rgba(255, 255, 255, 0.15)', 
                    padding: '8px 16px', 
                    borderRadius: 50, 
                    marginTop: 24,
                    marginBottom: 24,
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
            >
                <GeminiLogo />
                <Text strong style={{ color: 'white', fontSize: 14, letterSpacing: 1 }}>
                    POWERED BY GOOGLE GEMINI
                </Text>
            </motion.div>

            <Paragraph style={{ fontSize: "1.2rem", opacity: 0.9, maxWidth: 700, margin: '0 auto 32px', color: 'white' }}>
              Plan, visualize, and book your perfect trip in minutes. Real-time inventory meets next-gen AI reasoning.
            </Paragraph>
            <Space size="middle" wrap>
              <Button
                size="large"
                onClick={handleCTAClick}
                style={{
                  height: '56px',
                  padding: '0 40px',
                  fontSize: '18px',
                  background: 'white',
                  color: '#7C3AED',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: 28,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Planning Free"}
              </Button>
              <Button
                size="large"
                href="https://github.com/sam-79/TripCraft"
                target="_blank"
                icon={<GithubOutlined />}
                style={{
                  height: '56px',
                  padding: '0 30px',
                  fontSize: '18px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: 28,
                  backdropFilter: 'blur(4px)'
                }}
              >
                View Code
              </Button>
            </Space>
          </div>
        </motion.div>

        {/* --- ABOUT SECTION --- */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 80px' }}>
          <Title level={2}>Not Just Another Planner</Title>
          <Paragraph style={{ fontSize: 18, color: '#555' }}>
            TripCraft solves the "tab fatigue" of travel planning. We combine the reasoning power of <b>Gemini</b> with real-time inventory from <b>EaseMyTrip</b> to create actionable, personalized itineraries. From discovering hidden gems to booking the exact train, we handle it all.
          </Paragraph>
        </div>

        {/* --- FEATURES GRID --- */}
        <div style={{ marginBottom: 100 }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: '56px' }}>Core Capabilities</Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <FeatureCard {...feature} index={index} />
              </Col>
            ))}
          </Row>
        </div>

        {/* --- TECH STACK --- */}
        <div style={{ textAlign: 'center', marginBottom: 100, background: '#FAFAFA', padding: '60px 24px', borderRadius: 24 }}>
          <Title level={3} style={{ marginBottom: 32 }}>Built With Modern Tech</Title>
          <Space size={[16, 16]} wrap justify="center">
            {techStack.map((tech) => (
              <Tag key={tech} color="blue" style={{ fontSize: 16, padding: '8px 16px', borderRadius: 8 }}>
                {tech}
              </Tag>
            ))}
          </Space>
        </div>

        {/* --- DEVELOPER & REPO INFO --- */}
        <div style={{ marginBottom: 80 }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: '48px' }}>Project & Team</Title>
          <Row gutter={[48, 48]} justify="center">
            
            {/* Frontend Card */}
            <Col xs={24} md={10}>
              <Card 
                title={<Space><CodeOutlined style={{ color: '#E11D48' }} /> Frontend Architecture</Space>}
                bordered={false}
                style={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: 16 }}
              >
                <Paragraph>
                  Built with <b>React + Vite</b>. Features a responsive UI, Redux state management, and interactive Google Maps integration.
                </Paragraph>
                <div style={{ marginBottom: 24 }}>
                  <Text strong>Developed by: </Text>
                  <a href="https://www.linkedin.com/in/sameer-borkar" target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: '#7C3AED' }}>Sameer Borkar</a>
                </div>
                <Button 
                  type="primary" 
                  ghost 
                  icon={<GithubOutlined />} 
                  href="https://github.com/sam-79/TripCraft/tree/v3"
                  target="_blank"
                  block
                >
                  Frontend Repository
                </Button>
              </Card>
            </Col>

            {/* Backend Card */}
            <Col xs={24} md={10}>
              <Card 
                title={<Space><CloudServerOutlined style={{ color: '#2563EB' }} /> Backend Architecture</Space>}
                bordered={false}
                style={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: 16 }}
              >
                <Paragraph>
                  Powered by <b>FastAPI & Python</b>. Handles AI orchestration with Gemini, authentication, and API aggregation.
                </Paragraph>
                <div style={{ marginBottom: 24 }}>
                  <Text strong>Developed by: </Text>
                  <a href="https://github.com/shantanu1905" target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: '#7C3AED' }}>Shantanu Nimkar</a>
                </div>
                <Button 
                  type="primary" 
                  ghost 
                  icon={<GithubOutlined />} 
                  href="https://github.com/shantanu1905/trip-planner/tree/develop-v1"
                  target="_blank"
                  block
                >
                  Backend Repository
                </Button>
              </Card>
            </Col>
          </Row>
        </div>

        {/* --- FOOTER CTA --- */}
        <div style={{ textAlign: "center", padding: "60px 20px", borderTop: '1px solid #eee' }}>
          <Title level={3} style={{ marginBottom: 24 }}>Ready to modernize travel?</Title>
          <Space size="large">
            <Button size="large" onClick={handleCTAClick} type="primary" shape="round">
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
            </Button>
            {isAuthenticated && (
              <Button size="large" danger shape="round" onClick={() => dispatch(logout())}>
                Logout
              </Button>
            )}
          </Space>
          <div style={{ marginTop: 40, color: '#888' }}>
            {/* <Space size="large">
              <a href="#" style={{ color: '#888' }}><GithubOutlined /></a>
              <a href="#" style={{ color: '#888' }}><LinkedinOutlined /></a>
              <a href="#" style={{ color: '#888' }}><GlobalOutlined /></a>
            </Space> */}
            <Paragraph style={{ marginTop: 16, fontSize: 12 }}>
              © 2025 TripCraft AI. Created for the Gen AI Exchange Hackathon 25.
            </Paragraph>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;