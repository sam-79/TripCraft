import React from "react";
import {
  Typography,
  Descriptions,
  Tag,
  Space,
  List,
  Alert,
  Card,
  Divider,
  Button, 
  Tooltip
} from "antd";
import {
  ThunderboltOutlined,
  CarOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const getRoadStatusTag = (status) => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("open")) {
    return <Tag color="success">{status}</Tag>;
  }
  if (lowerStatus.includes("caution")) {
    return <Tag color="warning">{status}</Tag>;
  }
  return <Tag color="error">{status}</Tag>;
};

const TripWeatherView = ({ weatherData }) => {
  const { travel_update } = weatherData;

  if (!travel_update) {
    return (
      <Alert message="No travel update data available." type="info" showIcon />
    );
  }

  const {
    Destination,
    Date,
    Weather = {},
    ["Roadblocks and Road Status"]: roadStatus = [],
    ["Travel Advisory"]: travelAdvisory = [],
  } = travel_update;

  return (
    <div style={{ height: "100%", overflowY: "auto", paddingRight: 16 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={4}>Weather & Travel Updates for {Destination}</Title>

        {/* Destination Info */}
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item
            label={
              <>
                <EnvironmentOutlined /> Destination
              </>
            }
          >
            {Destination}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <CalendarOutlined /> Date
              </>
            }
          >
            {Date}
          </Descriptions.Item>
        </Descriptions>

        {/* IMD Alert if present */}
        {Weather["IMD Alert"] && (
          <Alert
            message="⚠️ IMD Alert"
            description={Weather["IMD Alert"]}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
          />
        )}

        {/* Weather Forecast */}
        <Card
          title={
            <Space>
              <ThunderboltOutlined />
              Weather Forecast
            </Space>
          }
          bordered={false}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Current Temp">
              {Weather["Current Temperature"] || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Min Temp">
              {Weather["Min Temperature"] || "N/A"}
            </Descriptions.Item>
          </Descriptions>
          {Weather["Next 5 Days Forecast"] && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <Text strong>Next 5 Days Forecast:</Text>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {Weather["Next 5 Days Forecast"]}
              </Paragraph>
            </>
          )}
        </Card>

        {/* Road Status */}
        <Card
          title={
            <Space>
              <CarOutlined />
              Road Status & Blockages
            </Space>
          }
          bordered={false}
        >
          {roadStatus.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={roadStatus}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    title={
                      <Text strong>
                        {item.Source} <ArrowRightOutlined /> {item.Destination}
                      </Text>
                    }
                    description={item.Advisory}
                  />
                  {getRoadStatusTag(item["Road Status"])}
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">No road status updates available.</Text>
          )}
        </Card>

        {/* Travel Advisory */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              Travel Advisory
            </Space>
          }
          bordered={false}
        >
          {travelAdvisory.length > 0 ? (
            <List
              dataSource={travelAdvisory}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <Text type="secondary">• {item}</Text>
                </List.Item>
              )}
              size="small"
            />
          ) : (
            <Text type="secondary">No travel advisories.</Text>
          )}
        </Card>
      </Space>

      <Button
        type="primary"
        block
        style={{ marginTop: 16 }}
      // onClick={handleGenerateItinerary}
      // loading={isGeneratingItinerary}
      >
        <Tooltip title={'Update iternerary with weather data'}>
          Update Itinerary
        </Tooltip>
      </Button>
    </div>
  );
};

export default TripWeatherView;
