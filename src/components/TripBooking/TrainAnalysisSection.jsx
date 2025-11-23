import React, { useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Statistic,
  Typography,
  Space,
  Tag,
  Empty,
  List,
  Divider,
  Button,
  Tooltip,
  Alert,
} from "antd";
import { motion } from "framer-motion";
import {
  ClockCircleOutlined,
  ThunderboltOutlined,
  DollarCircleOutlined,
  StarOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Enable custom parsing for DD/MM/YYYY format
dayjs.extend(customParseFormat);

const { Text, Title } = Typography;

// Helper functions
const formatCurrency = (num) =>
  num ? `₹${parseFloat(num).toLocaleString()}` : "N/A";

const getTrainAvailabilityTag = (status) => {
  if (!status) return <Tag>Unknown</Tag>;
  if (status.startsWith("AVAILABLE")) return <Tag color="green">{status}</Tag>;
  if (status.includes("WL") || status.includes("RLWL"))
    return <Tag color="orange">{status}</Tag>;
  return <Tag color="red">{status}</Tag>;
};

const TrainAnalysisSection = ({
  analysis,
  bookingList = [],
  onAddToBooking,
}) => {
  // 1. Safe Access: Access leg data safely
  const legAnalysis = analysis?.leg_wise_analysis?.[0];
  const overallStats = analysis?.overall_statistics;

  // 2. Date Check: Determine if the journey is in the past
  const journeyDateStr = legAnalysis?.journey_date; // Expected format "DD/MM/YYYY" or "YYYY-MM-DD"
  const isHistorical = useMemo(() => {
  if (!journeyDateStr) return false;

  const parsedDate = dayjs(journeyDateStr, ["DD/MM/YYYY", "YYYY-MM-DD"], true);

  return parsedDate.isValid()
    ? parsedDate.isBefore(dayjs(), "day")
    : false;
}, [journeyDateStr]);


  // 3. Crash Prevention: Handle case where analysis prop is null/undefined
  if (!analysis) {
    return <Empty description="No analysis data provided." />;
  }

  // 4. Error Handling: Handle specific API errors (e.g., 'NoneType' error in JSON)
  if (legAnalysis?.status === false || legAnalysis?.error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Alert
          message="Train Data Unavailable"
          description={
            legAnalysis.message ||
            legAnalysis.error ||
            "An error occurred while fetching train details for this route."
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      </motion.div>
    );
  }

  // 5. Empty Data Handling: Success status but no trains
  if (overallStats?.total_trains_found === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {isHistorical && (
          <Alert
            message="Historical Date Selected"
            description={`This search was for a past date (${journeyDateStr}). Real-time availability cannot be fetched.`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No direct trains found for this specific route and date."
        />
      </motion.div>
    );
  }

  // --- Action Column ---
  const actionColumn = {
    title: "Action",
    key: "action",
    align: "center",
    width: 100,
    render: (_, record) => {
      // Create a unique ID for the specific train class record
      const id = `train-${record.train_number}-${record.class_code}`;
      const isAdded = bookingList.some((item) => item.id === id);

      const bookingItem = {
        id,
        type: "train",
        name: `${record.train_name} (${record.class_code})`,
        train_number: record.train_number,
        class_code: record.class_code,
        fare: record.fare,
        departure: record.departure,
        arrival: record.arrival,
        duration: record.duration,
      };

      return (
        <Tooltip title={isAdded ? "Remove from list" : "Add to list"}>
          <Button
            type={isAdded ? "default" : "primary"}
            ghost={!isAdded}
            danger={isAdded}
            size="small"
            icon={isAdded ? <MinusCircleOutlined /> : <PlusOutlined />}
            onClick={() => onAddToBooking && onAddToBooking(bookingItem)}
          >
            {isAdded ? "Remove" : "Add"}
          </Button>
        </Tooltip>
      );
    },
  };

  // --- Restructured Available Train Table Columns ---
  const columns = [
    {
      title: "Train Name & No.",
      key: "name",
      render: (_, record) => (
        <div>
          <Text strong>{record.train_name}</Text>
          <br />
          <Text type="secondary">{record.train_number}</Text>
        </div>
      ),
    },
    {
      title: "Departure",
      dataIndex: "departure",
      key: "departure",
      align: "center",
    },
    { title: "Arrival", dataIndex: "arrival", key: "arrival", align: "center" },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      align: "center",
    },
    {
      title: "Class",
      key: "class",
      align: "center",
      render: (_, record) => (
        <Space direction="vertical">
          <Tag color="blue">{record.class_code}</Tag>
          <Text type="secondary">{record.class_name}</Text>
        </Space>
      ),
    },
    {
      title: "Fare",
      dataIndex: "fare",
      key: "fare",
      align: "right",
      render: (fare) => <Text strong>{formatCurrency(fare)}</Text>,
    },
    {
      title: "Availability",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => getTrainAvailabilityTag(status),
    },
    actionColumn, // Added the action column
  ];

  // --- Data Transformation: Flatten trains and their classes for the table ---
  const flattenedTrainsData =
    legAnalysis?.available_trains?.flatMap((train) =>
      (train.classes || []).map((cls) => ({
        ...train, // Copy all parent train info (name, number, times, etc.)
        ...cls, // Copy all class-specific info (code, name, fare, status)
        key: `${train.train_number}-${cls.class_code}`, // Create a unique key for React
      }))
    ) || [];

  // --- Fare Analysis Table ---
  const fareByClass = Object.entries(
    legAnalysis?.fare_analysis?.by_class || {}
  ).map(([cls, stats]) => ({
    key: cls,
    class: cls,
    ...stats,
  }));

  const fareColumns = [
    { title: "Class", dataIndex: "class", key: "class" },
    {
      title: "Avg Fare",
      dataIndex: "average",
      key: "average",
      render: formatCurrency,
    },
    { title: "Min Fare", dataIndex: "min", key: "min", render: formatCurrency },
    { title: "Max Fare", dataIndex: "max", key: "max", render: formatCurrency },
    {
      title: "Median",
      dataIndex: "median",
      key: "median",
      render: formatCurrency,
    },
    { title: "Count", dataIndex: "count", key: "count" },
  ];

  // --- Other Data Extractions ---
  const fastestTrains = legAnalysis?.fastest_trains || [];
  const cheapestOptions = legAnalysis?.fare_analysis?.cheapest_options || {};
  const recommendations = legAnalysis?.recommendations || {};
  const totalAvailableSeats =
    legAnalysis?.summary?.total_available_seats ?? "N/A";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Historical Date Warning */}
      {isHistorical && (
        <Alert
          message="Historical Journey Date"
          description={
            <span>
              You are viewing data for <b>{journeyDateStr}</b>, which is in the
              past. Availability statuses shown may not be accurate or may
              reflect the state at that time.
            </span>
          }
          type="warning"
          showIcon
          icon={<CalendarOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* --- Overview Cards --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Trains Found"
              value={overallStats?.total_trains_found ?? 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Available Tickets (Est.)"
              value={totalAvailableSeats}
              suffix="Seats"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Fastest Train"
              value={fastestTrains?.[0]?.duration || "N/A"}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Avg Fare (Sleeper)"
              value={formatCurrency(
                legAnalysis?.fare_analysis?.by_class?.Sleeper?.average
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* --- Available Trains Table (Now with flattened data) --- */}
      <Title level={4}>Available Trains & Classes</Title>
      <Table
        columns={columns}
        dataSource={flattenedTrainsData}
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
        size="small"
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No specific class data available" }}
      />

      <Divider />

      {/* --- Fare Analysis Section --- */}
      {fareByClass.length > 0 && (
        <>
          <Title level={4}>
            <DollarCircleOutlined /> Fare Analysis by Class
          </Title>
          <Table
            columns={fareColumns}
            dataSource={fareByClass}
            pagination={false}
            size="small"
            scroll={{ x: true }}
          />
          <Divider />
        </>
      )}

      {/* --- Fastest Trains Section --- */}
      {fastestTrains.length > 0 && (
        <>
          <Title level={4}>
            <ThunderboltOutlined /> Fastest Trains
          </Title>
          <List
            bordered
            dataSource={fastestTrains}
            renderItem={(train) => (
              <List.Item>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row justify="space-between">
                    <Col>
                      <Text strong>
                        {train.train_name} ({train.train_number})
                      </Text>
                    </Col>
                    <Col>
                      <Tag color="blue">{train.duration}</Tag>
                    </Col>
                  </Row>
                  <Text type="secondary">
                    {train.departure_time} → {train.arrival_time}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
          <Divider />
        </>
      )}

      {/* --- Cheapest Options --- */}
      {Object.keys(cheapestOptions).length > 0 && (
        <>
          <Title level={4}>
            <DollarCircleOutlined /> Cheapest Options
          </Title>
          {Object.entries(cheapestOptions).map(([classType, trains]) => (
            <Card
              key={classType}
              title={classType.replace(/_/g, " ").toUpperCase()}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <List
                size="small"
                dataSource={trains}
                renderItem={(t) => (
                  <List.Item>
                    <Space wrap>
                      <Text strong>
                        {t.train_name} ({t.train_number})
                      </Text>
                      <Tag>{t.class}</Tag>
                      <Text strong type="success">
                        {formatCurrency(t.fare)}
                      </Text>
                      {getTrainAvailabilityTag(t.availability)}
                      <Text type="secondary">
                        ({t.departure_time}, {t.duration})
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          ))}
          <Divider />
        </>
      )}

      {/* --- Recommendations --- */}
      {Object.keys(recommendations).length > 0 && (
        <>
          <Title level={4}>
            <StarOutlined /> AI Recommendations
          </Title>
          <Row gutter={[16, 16]}>
            {Object.entries(recommendations).map(([key, rec]) => (
              <Col xs={24} sm={12} md={8} key={key}>
                <Card
                  title={key.replace(/_/g, " ").toUpperCase()}
                  size="small"
                  headStyle={{ backgroundColor: "#fafafa" }}
                >
                  {rec ? (
                    <Space direction="vertical">
                      <Text strong>
                        {rec.train_name} ({rec.train_number})
                      </Text>
                      <Space>
                        {rec.class && <Tag>{rec.class}</Tag>}
                        {rec.fare && <Text>{formatCurrency(rec.fare)}</Text>}
                      </Space>
                      <Text type="secondary">Duration: {rec.duration}</Text>
                      {rec.total_available_seats !== undefined && (
                        <Tag
                          color={
                            rec.total_available_seats > 0 ? "green" : "red"
                          }
                        >
                          {rec.total_available_seats} Seats Left
                        </Tag>
                      )}
                    </Space>
                  ) : (
                    <Text type="secondary">
                      No specific recommendation available.
                    </Text>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </motion.div>
  );
};

export default TrainAnalysisSection;
