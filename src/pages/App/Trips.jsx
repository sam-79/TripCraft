import React from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Skeleton,
  Grid,
  Alert,
} from "antd";
import {
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useGetAllTripsQuery } from "../../api/tripApi";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Helper function to format dates
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const Trips = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: trips, error, isLoading } = useGetAllTripsQuery();

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  const getStatusTag = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now > end) {
      return <Tag icon={<CheckCircleOutlined />} color="success">{t('completed')}</Tag>;
    }
    if (now < start) {
      return <Tag icon={<ClockCircleOutlined />} color="processing">{t('upcoming')}</Tag>;
    }
    return <Tag icon={<PlayCircleOutlined />} color="warning">{t('ongoing')}</Tag>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 18, padding: screens.xs ? 16 : 24, background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", boxShadow: "0 10px 28px rgba(0,0,0,0.12)" }}
      >
        <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>{t('your_trips')}</Title>
        <Text type="secondary">{t('trips_subheading')}</Text>
      </motion.div>

      {/* GRID */}
      {isLoading ? (
        <Row gutter={[18, 18]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} md={8} lg={6}>
              <Card style={{ borderRadius: 16 }}>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : error ? (
        <Alert
          message={t('error_loading_trips')}
          description={t('trips_error_description')}
          type="error"
          showIcon
        />
      ) : trips?.length === 0 ? (
        <Empty
          description={t('no_trips_yet')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/user/newtrip')}>
            {t('create_first_trip')}
          </Button>
        </Empty>
      ) : (
        <Row gutter={[18, 18]}>
          <AnimatePresence>
            {trips?.map((trip, i) => (
              <Col key={trip.trip_id} xs={24} sm={12} md={8} lg={6}>
                <motion.div custom={i} initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={cardVariants}>
                  <Card
                    hoverable
                    style={{ borderRadius: 16, overflow: 'hidden' }}
                    cover={
                      <div style={{ position: "relative", height: 180 }}>
                        <div style={{ position: "relative", height: 180, background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ textAlign: "center" }}>
                            <Title level={4} style={{ margin: 0, color: "#234", textShadow: '0 1px 3px #fff' }}>{trip.trip_name}</Title>
                          </div>
                        </div>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)" }} />
                        <div style={{ position: "absolute", bottom: 12, left: 16, color: "#fff" }}>
                          <Title level={5} style={{ margin: 0, color: "#fff", textShadow: '0 1px 3px #000' }}>{trip.trip_name}</Title>
                          <Text style={{ color: "#fff" }}><EnvironmentOutlined /> {trip.destination}</Text>
                        </div>
                      </div>
                    }
                    actions={[<Button type="link" key="details" onClick={() => navigate(`/user/trips/${trip.trip_id}`)}>{t('view_details')} <ArrowRightOutlined /></Button>]}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {getStatusTag(trip.start_date, trip.end_date)}
                      <Space wrap>
                        <Tag icon={<CalendarOutlined />}>{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</Tag>
                        <Tag icon={<UserOutlined />}>{trip.num_people} {t('people')}</Tag>
                        <Tag color="purple">{trip.activity}</Tag>
                      </Space>
                    </Space>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      )}
    </div>
  );
};

export default Trips;
