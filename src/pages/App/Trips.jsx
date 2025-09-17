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

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Helper function to format dates
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const Trips = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
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
      return <Tag icon={<CheckCircleOutlined />} color="success">Completed</Tag>;
    }
    if (now < start) {
      return <Tag icon={<ClockCircleOutlined />} color="processing">Upcoming</Tag>;
    }
    return <Tag icon={<PlayCircleOutlined />} color="warning">Ongoing</Tag>;
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 18, padding: screens.xs ? 16 : 24, background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", boxShadow: "0 10px 28px rgba(0,0,0,0.12)" }}
      >
        <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>Your Trips ✈️</Title>
        <Text type="secondary">All your planned adventures at a glance.</Text>
      </motion.div>

      {/* GRID */}
      {isLoading ? (
        <Row gutter={[18, 18]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} lg={8}><Card style={{ borderRadius: 16 }}><Skeleton active /></Card></Col>
          ))}
        </Row>
      ) : error ? (
        <Alert message="Error" description="Could not fetch your trips. Please try again later." type="error" showIcon />
      ) : trips?.length === 0 ? (
        <Empty description="No trips yet. Start planning and your journeys will show up here!" />
      ) : (
        <Row gutter={[18, 18]}>
          <AnimatePresence>
            {trips.map((trip, idx) => (
              <Col key={trip.trip_id} xs={24} sm={12} lg={8}>
                <motion.div custom={idx} initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={cardVariants} whileHover={{ y: -6 }}>
                  <Card
                    hoverable
                    style={{ borderRadius: 16, overflow: "hidden" }}
                    cover={
                      <div style={{ position: "relative", height: 180 }}>
                        <img
                          src={`https://placehold.co/600x400/a1c4fd/ffffff?text=${trip.destination}`}
                          alt={trip.trip_name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)" }} />
                        <div style={{ position: "absolute", bottom: 12, left: 16, color: "#fff" }}>
                          <Title level={5} style={{ margin: 0, color: "#fff", textShadow: '0 1px 3px #000' }}>{trip.trip_name}</Title>
                          <Text style={{ color: "#fff" }}><EnvironmentOutlined /> {trip.destination}</Text>
                        </div>
                      </div>
                    }
                    actions={[<Button type="link" key="details" onClick={() => navigate(`/user/trips/${trip.trip_id}`)}>View Details <ArrowRightOutlined /></Button>]}
                  >
                    <Space direction="vertical" style={{width: '100%'}}>
                      {getStatusTag(trip.start_date, trip.end_date)}
                      <Space wrap>
                        <Tag icon={<CalendarOutlined />}>{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</Tag>
                        <Tag icon={<UserOutlined />}>{trip.num_people} people</Tag>
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
