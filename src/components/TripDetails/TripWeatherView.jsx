import React from "react";
import {
  Typography,
  Descriptions,
  Tag,
  Space,
  List,
  Alert,
  Card,
  Divider
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  if (!travel_update) {
    return (
      <Alert message={t('no_travel_update')} type="info" showIcon />
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
        <Title level={4}>{t('weather_travel_updates')} {Destination}</Title>

        {/* Destination Info */}
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item
            label={
              <>
                <EnvironmentOutlined /> {t('destination')}
              </>
            }
          >
            {Destination}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <CalendarOutlined /> {t("date")}
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
              {t('weather')} {t('forecast')}
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
              <Text strong>{t('next_5_days_forecast')}:</Text>
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
              {t('road_status')}
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
            <Text type="secondary">{t('no_info')}.</Text>
          )}
        </Card>

        {/* Travel Advisory */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              {t('travel_advisory')}
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
            <Text type="secondary">{t('no_travel_advisories')}.</Text>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default TripWeatherView;
