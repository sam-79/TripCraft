import React, { useState, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Alert,
  Spin,
  Modal,
  Carousel,
} from "antd";
import {
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useGetAllTripsQuery } from "../../api/tripApi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

// --- TripCard Sub-Component ---
// Breaking the card into its own component helps manage state and refs for each card individually.
const TripCard = ({ trip, index }) => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const handleMouseEnter = () => carouselRef.current?.pause();
  const handleMouseLeave = () => carouselRef.current?.play();

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          transition: { delay: i * 0.1, duration: 0.4 },
        }),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        hoverable
        style={{ borderRadius: 16, overflow: "hidden" }}
        cover={
          trip.destination_image_url &&
            trip.destination_image_url.length > 0 ? (
            <Carousel
              arrows
              ref={carouselRef}
              autoplay
              dotPosition="bottom"
              effect="fade"
            >
              {trip.destination_image_url.map((url, i) => (
                <div key={i}>
                  <img
                    alt={`${trip.trip_name} image ${i + 1}`}
                    src={url}
                    style={{ width: "100%", height: 220, objectFit: "cover" }}
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div
              style={{
                height: 220,
                background: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EnvironmentOutlined style={{ fontSize: 48, color: "#ccc" }} />
            </div>
          )
        }
        actions={[
          <Button
            type="link"
            key="details"
            onClick={() => navigate(`/user/trips/${trip.trip_id}`)}
          >
            View Details <ArrowRightOutlined />
          </Button>,
        ]}
      >
        <Title
          level={4}
          style={{
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {trip.trip_name}
        </Title>
        <Text type="secondary">
          <EnvironmentOutlined /> {trip.destination_full_name}
        </Text>

        <Paragraph
          style={{ marginTop: 12, minHeight: 44 }}
          ellipsis={{
            rows: 2,
            expandable: "collapsible",
            // symbol: "more",
            defaultExpanded: false,
            // onExpand: (event) => {
            //   event.stopPropagation(); // Prevent card click navigation
            // },
          }}
        >
          {trip.destination_details}
        </Paragraph>

        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text>
              <CalendarOutlined />{" "}
              {dayjs(trip.start_date).format("MMM D, YYYY")} -{" "}
              {dayjs(trip.end_date).format("MMM D, YYYY")}
            </Text>
            <Text>
              <DollarOutlined /> ₹{trip.budget.toLocaleString("en-IN")} for{" "}
              {trip.num_people} people ({trip.travelling_with})
            </Text>
            <Space wrap>
              {trip.activities.map((activity) => (
                <Tag key={activity} color="blue">
                  {activity}
                </Tag>
              ))}
            </Space>
          </Space>
        </div>
      </Card>
    </motion.div>
  );
};

// --- Main Trips Component ---
const Trips = () => {
  const { data: trips, error, isLoading } = useGetAllTripsQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading your trips..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Could not fetch your trips. Please try again."
        type="error"
        showIcon
      />
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            No trips planned yet! <br /> Let's create your first adventure.
          </span>
        }
      >
        <Button type="primary" onClick={() => navigate("/user/newtrip")}>
          Create New Trip
        </Button>
      </Empty>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>
          Your Planned Trips
        </Title>
      </motion.div>
      <Row gutter={[24, 24]}>
        {trips.map((trip, index) => (
          <Col xs={24} sm={24} md={12} lg={8} key={trip.trip_id}>
            <TripCard
              trip={trip}
              index={index}
            // onExpandDescription={setExpandedTrip}
            />
          </Col>
        ))}
      </Row>

      {/* Modal for showing the full description
      <Modal
        title={expandedTrip?.trip_name}
        open={!!expandedTrip}
        onCancel={() => setExpandedTrip(null)}
        footer={null}
      >
        <Title level={5} type="secondary">
          {expandedTrip?.destination_full_name}
        </Title>
        <Paragraph>{expandedTrip?.destination_details}</Paragraph>
      </Modal> */}
    </>
  );
};

export default Trips;
