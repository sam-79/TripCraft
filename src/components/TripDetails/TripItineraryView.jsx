import React, { useState, useMemo } from "react";
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
  Segmented,
  Badge,
  Statistic,
} from "antd";
import {
  CoffeeOutlined,
  CameraOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ReadOutlined,
  SunOutlined,
  MoonOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  WarningOutlined,
  StopOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
// -------------------------------------------------------------

const { Title, Text, Paragraph } = Typography;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const DayHeader = ({ day, date, status }) => (
  <div
    style={{
      marginBottom: 16,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
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
    {status && status !== "UNCHANGED" && (
      <Tag color={status === "MODIFIED" ? "orange" : "red"}>{status}</Tag>
    )}
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

const ChangesSummary = ({ summary }) => {
  if (!summary) return null;
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={8}>
        <Card
          size="small"
          bordered={false}
          style={{
            background: "#fff1f0",
            textAlign: "center",
            borderRadius: 8,
          }}
        >
          <Statistic
            title="Status"
            value={summary.overall_status}
            valueStyle={{ color: "#cf1322", fontSize: 14, fontWeight: "bold" }}
            prefix={<SafetyOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card
          size="small"
          bordered={false}
          style={{
            background: "#fff7e6",
            textAlign: "center",
            borderRadius: 8,
          }}
        >
          <Statistic
            title="Removed"
            value={summary.places_removed}
            valueStyle={{ color: "#d46b08", fontSize: 16, fontWeight: "bold" }}
            prefix={<MinusCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card
          size="small"
          bordered={false}
          style={{
            background: "#f6ffed",
            textAlign: "center",
            borderRadius: 8,
          }}
        >
          <Statistic
            title="Added"
            value={summary.places_added}
            valueStyle={{ color: "#389e0d", fontSize: 16, fontWeight: "bold" }}
            prefix={<PlusCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

const WeatherAlertBanner = ({ weatherData }) => {
  if (!weatherData) return null;

  const { weather_intelligence } = weatherData;
  const alerts = weather_intelligence?.weather_alerts || [];
  const placeAlerts = weather_intelligence?.tourist_place_alerts || [];
  const current = weather_intelligence?.current_weather;
  const impactSummary = weather_intelligence?.weather_impact_summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 24 }}
    >
      <Card
        size="small"
        style={{
          background: "#fff2f0",
          borderColor: "#ffccc7",
          borderRadius: 8,
        }}
      >
        <Space align="start" direction="vertical" style={{ width: "100%" }}>
          {/* Header Section */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                padding: 8,
                background: "#fff",
                borderRadius: "50%",
                border: "1px solid #ffccc7",
              }}
            >
              <ThunderboltOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 16 }}>
                Weather Intelligence
              </Text>
              {impactSummary && (
                <Paragraph
                  type="secondary"
                  style={{ marginBottom: 6, fontSize: 13 }}
                >
                  {impactSummary}
                </Paragraph>
              )}
              <Space wrap size={[0, 8]}>
                {current && (
                  <Tag color="blue" icon={<GlobalOutlined />}>
                    {current.temperature_c}°C, {current.condition}
                  </Tag>
                )}
                {weather_intelligence?.overall_travel_status && (
                  <Tag color="red">
                    {weather_intelligence.overall_travel_status}
                  </Tag>
                )}
              </Space>
            </div>
          </div>

          {/* Weather Alerts */}
          {alerts.length > 0 && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <div style={{ width: "100%" }}>
                <Text strong style={{ fontSize: 12, color: "#cf1322" }}>
                  Active Weather Alerts:
                </Text>
                {alerts.map((alert, idx) => (
                  <Alert
                    key={idx}
                    message={<Text strong>{alert.type}</Text>}
                    description={alert.description}
                    type="warning"
                    showIcon
                    style={{ marginTop: 8, borderRadius: 6 }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Tourist Place Restrictions */}
          {placeAlerts.length > 0 && (
            <div
              style={{ width: "100%", marginTop: alerts.length > 0 ? 12 : 0 }}
            >
              <Text strong style={{ fontSize: 12, color: "#cf1322" }}>
                Place Restrictions:
              </Text>
              {placeAlerts.map((alert, idx) => (
                <Alert
                  key={idx}
                  message={
                    <Space>
                      <Text strong>{alert.place_name}</Text>
                      <Tag color="red">{alert.status}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>{alert.reason}</div>
                      {alert.alternative_suggestion && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: "#135200",
                          }}
                        >
                          <strong>Suggestion:</strong>{" "}
                          {alert.alternative_suggestion}
                        </div>
                      )}
                    </div>
                  }
                  type="error"
                  showIcon
                  icon={<StopOutlined />}
                  style={{ marginTop: 8, borderRadius: 6 }}
                />
              ))}
            </div>
          )}
        </Space>
      </Card>
    </motion.div>
  );
};

const TripItineraryView = ({ itinerary, weatherSyncItinerary }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState("original"); // 'original' | 'weather-synced'

  // Check if we have weather data to show
  const hasWeatherData =
    weatherSyncItinerary?.data?.updated_itinerary?.itinerary?.length > 0;

  // Determine which list to show
  const displayItinerary = useMemo(() => {
    if (viewMode === "weather-synced" && hasWeatherData) {
      return weatherSyncItinerary.data.updated_itinerary.itinerary;
    }
    return itinerary;
  }, [viewMode, itinerary, weatherSyncItinerary, hasWeatherData]);

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
      {/* --- View Switcher (Only if Weather Data exists) --- */}
      {hasWeatherData && (
        <div
          style={{
            marginBottom: 24,
            textAlign: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(255,255,255,0.9)",
            padding: "12px 0",
            backdropFilter: "blur(8px)",
          }}
        >
          <Segmented
            options={[
              {
                label: "Original Plan",
                value: "original",
                icon: <ReadOutlined />,
              },
              {
                label: (
                  <Space>
                    Weather Synced
                    {/* <Badge dot color="red" offset={[0, 0]}>
                      <ThunderboltOutlined />
                    </Badge> */}
                  </Space>
                ),
                value: "weather-synced",
              },
            ]}
            value={viewMode}
            onChange={setViewMode}
            size="large"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              paddingRight: 10,
              paddingLeft: 10,
            }}
          />
        </div>
      )}

      {/* --- Weather Intelligence & Stats (Only in Synced View) --- */}
      {viewMode === "weather-synced" && (
        <>
          <ChangesSummary
            summary={weatherSyncItinerary?.data?.changes_summary}
          />
          <WeatherAlertBanner weatherData={weatherSyncItinerary?.data} />
        </>
      )}

      <motion.div
        key={viewMode} // Triggers re-animation on switch
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Timeline mode="left" style={{ marginTop: 10 }}>
          {displayItinerary.map((day) => (
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
                    border:
                      viewMode === "weather-synced" && day.status === "MODIFIED"
                        ? "1px solid #ffd591"
                        : "1px solid #f0f0f0",
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
                    <DayHeader
                      day={day.day}
                      date={day.date}
                      status={day.status}
                    />
                  </div>

                  <div style={{ padding: "24px" }}>
                    {/* Weather Impact Note */}
                    {viewMode === "weather-synced" && day.weather_impact && (
                      <Alert
                        message="Weather Impact"
                        description={day.weather_impact}
                        type="warning"
                        showIcon
                        icon={<WarningOutlined />}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                      />
                    )}

                    {/* Travel Tips */}
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
                          {day.food?.map((item, idx) => (
                            <Tag
                              key={idx}
                              color="orange"
                              style={{
                                padding: "4px 8px",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                maxWidth: "100%",
                                lineHeight: "18px",
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
                          {day.culture?.map((item, idx) => (
                            <Tag
                              key={idx}
                              color="geekblue"
                              style={{
                                padding: "4px 8px",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                whiteSpace: "normal", // <— allows wrapping
                                wordBreak: "break-word", // <— long text won't overflow
                                maxWidth: "100%", // <— keeps tag inside the column
                                lineHeight: "18px",
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
                        {day.places?.map((place, pIdx) => (
                          <Timeline.Item
                            key={place.id}
                            color={
                              place.weather_status === "NOT_RECOMMENDED"
                                ? "red"
                                : "gray"
                            }
                            dot={
                              place.weather_status === "NOT_RECOMMENDED" ? (
                                <WarningOutlined style={{ color: "red" }} />
                              ) : (
                                <PlaceTimeIcon
                                  timeString={place.best_time_to_visit}
                                />
                              )
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
                                <Text
                                  strong
                                  style={{
                                    fontSize: 15,
                                    textDecoration: place.removed
                                      ? "line-through"
                                      : "none",
                                    color: place.removed ? "#999" : "inherit",
                                  }}
                                >
                                  {place.name}
                                </Text>
                                {place.removed && (
                                  <Text type="danger" style={{ fontSize: 12 }}>
                                    <SafetyOutlined />{" "}
                                    {place.removal_reason ||
                                      "Closed due to weather"}
                                  </Text>
                                )}
                                {!place.removed && place.best_time_to_visit && (
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

                    {/* Removed Places Section (Only in Synced View) */}
                    {viewMode === "weather-synced" &&
                      day.removed_places?.length > 0 && (
                        <div
                          style={{
                            marginTop: 16,
                            padding: 12,
                            background: "#fff2f0",
                            borderRadius: 8,
                            border: "1px dashed #ffccc7",
                          }}
                        >
                          <Text
                            strong
                            type="danger"
                            style={{ display: "block", marginBottom: 8 }}
                          >
                            <SafetyOutlined /> Places Removed for Safety:
                          </Text>
                          <ul
                            style={{
                              paddingLeft: 20,
                              margin: 0,
                              color: "#cf1322",
                            }}
                          >
                            {day.removed_places.map((p) => (
                              <li key={p.id}>
                                <strong>{p.name}</strong>: {p.removal_reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
