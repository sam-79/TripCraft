import React from "react";
import {
  Timeline,
  Typography,
  Card,
  Tag,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  Empty,
} from "antd";
import {
  CoffeeOutlined,
  CameraOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FireOutlined,
  ReadOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

// --- MOCK TRANSLATION (To ensure standalone functionality) ---
const useTranslation = () => ({
  t: (key) => {
    const map = {
      day: "Day",
      travel_tips: "Pro Tips for the Day",
      food_tag: "Culinary Delights",
      culture_tag: "Cultural Vibes",
      places_to_visit: "Places to Explore",
    };
    return map[key] || key;
  },
});
// -------------------------------------------------------------

const { Title, Text } = Typography;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

const iconPulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

// --- Helper Components ---

const DayHeader = ({ day, date }) => (
  <div style={{ marginBottom: 16 }}>
    <Space align="baseline">
      <Tag
        color="blue"
        style={{ fontSize: 14, padding: "4px 10px", borderRadius: 4 }}
      >
        {`Day ${day}`}
      </Tag>
      <Text strong style={{ fontSize: 18, color: "#1f1f1f" }}>
        {new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </Text>
    </Space>
  </div>
);

const PlaceTimeIcon = ({ timeString }) => {
  // Simple logic to pick an icon based on hint words in "best_time_to_visit"
  const lower = (timeString || "").toLowerCase();
  if (lower.includes("morning"))
    return <SunOutlined style={{ color: "#faad14" }} />;
  if (lower.includes("night") || lower.includes("evening"))
    return <MoonOutlined style={{ color: "#722ed1" }} />;
  return <ClockCircleOutlined style={{ color: "#1890ff" }} />;
};

const TripItineraryView = ({ itinerary }) => {
  const { t } = useTranslation();

  if (!itinerary || itinerary.length === 0) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Empty description="No itinerary details available yet." />
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        padding: "4px 16px 16px 4px",
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <Timeline mode="left" style={{ marginTop: 20 }}>
          {itinerary.map((day, index) => (
            <Timeline.Item
              key={day.day}
              dot={
                <motion.div
                  variants={iconPulse}
                  initial="initial"
                  animate="animate"
                >
                  <EnvironmentOutlined
                    style={{
                      fontSize: 18,
                      color: "#1890ff",
                    //   background: "#fff",
                    }}
                  />
                </motion.div>
              }
            >
              <motion.div variants={itemVariants}>
                {/* Day Content Card */}
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    marginBottom: 32,
                    overflow: "hidden",
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Header Strip */}
                  <div
                    style={{
                      padding: "16px 24px",
                      background: "#fafafa",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <DayHeader day={day.day} date={day.date} />
                  </div>

                  <div style={{ padding: "24px" }}>
                    {/* Travel Tips Section */}
                    {day.travel_tips && (
                      <Alert
                        message={
                          <Space>
                            <InfoCircleOutlined />
                            <Text strong>{t("travel_tips")}</Text>
                          </Space>
                        }
                        description={day.travel_tips}
                        type="info"
                        showIcon={false}
                        style={{
                          borderRadius: 8,
                          marginBottom: 24,
                          background: "#e6f7ff",
                          border: "1px solid #91caff",
                        }}
                      />
                    )}

                    {/* Highlights: Food & Culture */}
                    <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
                      <Col xs={24} md={12}>
                        <div style={{ marginBottom: 8 }}>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}
                          >
                            {t("food_tag")}
                          </Text>
                        </div>
                        <Space wrap>
                          {day.food.map((item, idx) => (
                            <Tag
                              key={idx}
                              color="orange"
                              style={{
                                padding: "4px 8px",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <CoffeeOutlined /> {item}
                            </Tag>
                          ))}
                        </Space>
                      </Col>
                      <Col xs={24} md={12}>
                        <div style={{ marginBottom: 8 }}>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}
                          >
                            {t("culture_tag")}
                          </Text>
                        </div>
                        <Space wrap>
                          {day.culture.map((item, idx) => (
                            <Tag
                              key={idx}
                              color="geekblue"
                              style={{
                                padding: "4px 8px",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <ReadOutlined /> {item}
                            </Tag>
                          ))}
                        </Space>
                      </Col>
                    </Row>

                    <Divider
                      orientation="left"
                      style={{
                        margin: "12px 0 24px 0",
                        fontSize: 14,
                        color: "#8c8c8c",
                      }}
                    >
                      <Space>
                        <CameraOutlined /> {t("places_to_visit")}
                      </Space>
                    </Divider>

                    {/* Places Nested Timeline */}
                    <div style={{ paddingLeft: 8 }}>
                      <Timeline>
                        {day.places.map((place, pIdx) => (
                          <Timeline.Item
                            key={place.id}
                            color="gray"
                            dot={
                              <PlaceTimeIcon
                                timeString={place.best_time_to_visit}
                              />
                            }
                          >
                            <motion.div
                              whileHover={{ x: 6 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Text strong style={{ fontSize: 15 }}>
                                  {place.name}
                                </Text>
                                {place.best_time_to_visit && (
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    <ClockCircleOutlined
                                      style={{ marginRight: 4 }}
                                    />
                                    Best time: {place.best_time_to_visit}
                                  </Text>
                                )}
                              </div>
                            </motion.div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Timeline.Item>
          ))}
        </Timeline>
      </motion.div>
    </div>
  );
};

export default TripItineraryView;
