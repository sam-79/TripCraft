import React, { useState, useCallback } from "react";
import {
  Form,
  InputNumber,
  Checkbox,
  Button,
  Typography,
  Space,
  message,
  Row,
  Col,
  AutoComplete,
  Card,
  Tag,
  Spin,
  Divider,
  Tooltip
} from "antd";
import {
  HomeOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  RobotOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useSetHotelPreferencesMutation, useGetLocalityRecommendationsQuery } from "../../api/bookingApi"; // Make sure this hook exists in bookingApi.js

import { useGetEnumsQuery } from "../../api/enumsApi";
import { fetchPlaceSuggestions } from '../../utils/utils';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';


const { Title, Paragraph } = Typography;

const SetHotelPrefs = ({ tripId, onComplete, setStatus }) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // 1. Enums API
  const { data: enums, isLoading: isEnumLoading } = useGetEnumsQuery();

  // 2. Recommendation API
  const { 
    data: recData, 
    isLoading: isRecLoading 
  } = useGetLocalityRecommendationsQuery(tripId);

  // 3. Set Preferences Mutation
  const [setPreferences, { isLoading }] = useSetHotelPreferencesMutation();

  // State for AutoComplete
  const [hotellocality, setHotelLocality] = useState([]);
  const debouncedSearch = useCallback(debounce(fetchPlaceSuggestions, 300), []);

  // Helper to set locality from recommendation card
  const applyRecommendation = (localityName) => {
    form.setFieldsValue({ locality: localityName });
    messageApi.info(`Selected: ${localityName}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for form submission
  const handleFinish = async (values) => {
    const payload = {
      trip_id: parseInt(tripId),
      ...values,
    };
    try {
      const result = await setPreferences(payload); // Mock doesn't have .unwrap()
      const response = result.data || result;
      
      // In mock scenario, check success manually if needed
      messageApi.success(response.message || "Hotel preferences saved!");
      setStatus("finish");
      onComplete(response.data);
    } catch (err) {
      messageApi.error(
        err.data?.message || "Failed to save hotel preferences."
      );
      setStatus("error");
    }
  };

  const recommendations = recData?.data?.ai_hotel_locality_recommendation?.recommended_localities || [];

  return (
    <div>
      {contextHolder}
      <Title level={4}>Set Your Hotel Preferences</Title>
      <Paragraph type="secondary">
        Tell us your preferences so we can find the best options for your stay.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          // Sensible defaults
          no_of_rooms: 1,
          no_of_child: 0,
          min_price: 500,
          max_price: 5000,
          selected_property_types: ["Hotel"], // Default to Hotel
          locality:"..."
        }}
      >
        {/* --- LOCALITY INPUT --- */}
        <Form.Item 
          name="locality" 
          label={t('hotel_locality')} 
          rules={[{ required: true, message: "Please select a locality" }]}
        >
          <AutoComplete 
            options={hotellocality} 
            onSearch={(text) => debouncedSearch(text, setHotelLocality)} 
            placeholder={t('base_location_placeholder')}
            style={{ height: 40 }}
          />
        </Form.Item>

        {/* --- AI RECOMMENDATIONS SECTION --- */}
        {isRecLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', background: '#f0f2f5', borderRadius: 8, marginBottom: 24 }}>
            <Spin size="small" /> <Text type="secondary" style={{ marginLeft: 8 }}>Analyzing best localities for you...</Text>
          </div>
        ) : recommendations.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Space style={{ marginBottom: 12 }}>
              <RobotOutlined style={{ color: '#1890ff', fontSize: 18 }} />
              <Text strong>AI Recommended Localities</Text>
            </Space>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.map((rec) => (
                <Card 
                  key={rec.rank_id}
                  size="small"
                  hoverable
                  onClick={() => applyRecommendation(rec.locality_name)}
                  style={{ 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: form.getFieldValue('locality') === rec.locality_name ? '#e6f7ff' : '#fff',
                    borderColor: form.getFieldValue('locality') === rec.locality_name ? '#1890ff' : '#d9d9d9'
                  }}
                >
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={18}>
                      <Space>
                        <Text strong style={{ fontSize: 15 }}>{rec.locality_name}</Text>
                        {rec.rank_id === 1 && <Tag color="gold">Top Choice</Tag>}
                      </Space>
                      <Paragraph 
                        type="secondary" 
                        ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} 
                        style={{ fontSize: 13, marginTop: 6, marginBottom: 8 }}
                      >
                        {rec.strategic_positioning}
                      </Paragraph>
                      <Space size={[0, 8]} wrap>
                        <Tag icon={<SafetyCertificateOutlined />} color={rec.safety?.overall_rating === "Good" ? "success" : "default"}>
                          Safety: {rec.safety?.overall_rating}
                        </Tag>
                        <Tag icon={<CarOutlined />}>
                          Connectivity: {rec.connectivity?.overall_connectivity_rating}
                        </Tag>
                        <Tag color="blue">{rec.location_info?.hotel_budget_range}</Tag>
                      </Space>
                    </Col>
                    <Col xs={24} sm={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Button 
                        type="link" 
                        icon={<CheckCircleOutlined />} 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click bubbling
                          applyRecommendation(rec.locality_name);
                        }}
                      >
                        Select
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* --- ROOMS & GUESTS --- */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="no_of_rooms"
              label={<Space><HomeOutlined /> Number of Rooms</Space>}
              rules={[{ required: true, message: "Please enter the number of rooms!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="no_of_child"
              label={<Space><TeamOutlined /> Number of Children</Space>}
              rules={[{ required: true, message: "Please enter number of children!" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* --- PRICE RANGE --- */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="min_price"
              label={<Space><DollarCircleOutlined /> Min Price (INR)</Space>}
              rules={[{ required: true, message: "Enter min price!" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="max_price"
              label={<Space><DollarCircleOutlined /> Max Price (INR)</Space>}
              rules={[{ required: true, message: "Enter max price!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* --- PROPERTY TYPES --- */}
        {isEnumLoading ? (
          <Spin size="large" tip={"Loading property types ..."} style={{ display: 'block', margin: '20px auto' }} />
        ) : (
          <Form.Item
            name="selected_property_types"
            label="Preferred Property Types"
            rules={[{ required: true, message: "Select at least one property type!" }]}
          >
            <Checkbox.Group options={enums.propertyTypeOptions} />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block size="large" style={{ marginTop: 10 }}>
            Save Preferences & Find Hotels
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SetHotelPrefs;
