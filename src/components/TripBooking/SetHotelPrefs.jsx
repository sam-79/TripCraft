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
  Modal
} from "antd";
import {
  HomeOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  StarFilled,
  CompassOutlined,
  WifiOutlined,
  CoffeeOutlined,
  BankOutlined,
  SmileOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from 'lodash';
// import Lottie from 'lottie-react';

import { useSetHotelPreferencesMutation, useGetLocalityRecommendationsQuery } from "../../api/bookingApi";
import { useGetEnumsQuery } from "../../api/enumsApi";
import { fetchPlaceSuggestions } from '../../utils/utils';
import { useTranslation } from 'react-i18next';



// -------------------------------------------------------------

const { Title, Paragraph, Text } = Typography;

// --- Helper: Rating Colorizer ---
const getRatingColor = (ratingStr) => {
  if (!ratingStr) return '#d9d9d9';
  const lower = ratingStr.toLowerCase();
  if (lower.includes('excellent') || lower.includes('good')) return '#52c41a'; // Green
  if (lower.includes('average')) return '#faad14'; // Yellow
  return '#ff4d4f'; // Red
};

// --- Sub-Component: Detailed Locality Card ---
const LocalityCard = ({ locality, onSelect, isSelected }) => {
  const [open, setOpen] = useState(false);

  const suitabilityScore =
    parseInt(
      locality.location_info?.tourist_suitability_score?.split("/")[0] || 0
    ) * 10;

  return (
    <>
      {/* ================= CARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
        style={{ marginBottom: 24 }}
      >
        <Card
          hoverable
          style={{
            borderRadius: 16,
            border: isSelected ? "2px solid #1890ff" : "1px solid #eee",
            background: isSelected ? "#f0f9ff" : "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            overflow: "hidden",
            cursor: "pointer",
            transition: "0.25s",
          }}
          bodyStyle={{ padding: 0 }}
          actions={[
            <Button
              block
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => onSelect(locality.locality_name)}
            >
              {isSelected ? "Selected" : "Choose This Area"}
            </Button>,
            <Button
              block
              type="link"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              View more details →
            </Button>
          ]}
        >
          {/* Header */}
          <div
            style={{
              background: isSelected
                ? "linear-gradient(90deg, #1890ff 0%, #69c0ff 100%)"
                : "#fafafa",
              padding: "12px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space>
              {locality.rank_id === 1 && (
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <StarFilled style={{ color: "#fadb14", fontSize: 18 }} />
                </motion.div>
              )}
              <Text
                strong
                style={{ fontSize: 16, color: isSelected ? "white" : "#333" }}
              >
                {locality.locality_name}
              </Text>
            </Space>

            <Tag color={isSelected ? "lime" : "blue"}>
              {locality.location_info?.hotel_budget_range}
            </Tag>
          </div>

          {/* Basic preview */}
          <div style={{ padding: 20 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* <Lottie animationData={locationAnim} style={{ width: 50 }} /> */}
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ fontSize: 14, color: "#555" }}
              >
                {locality.strategic_positioning}
              </Paragraph>
            </motion.div>

            <Row gutter={12} style={{ marginTop: 12 }}>
              <Col span={12}>
                {/* <Lottie animationData={locationAnim} style={{ width: 35 }} /> */}
                <Text>Connectivity: </Text>
                <Text strong>{locality.connectivity?.overall_connectivity_rating}</Text>
              </Col>

              <Col span={12}>
                {/* <Lottie animationData={safetyAnim} style={{ width: 35 }} /> */}
                <Text>Safety: </Text>
                <Text strong>{locality.safety?.overall_rating}</Text>
              </Col>
            </Row>


          </div>
        </Card>
      </motion.div>

      {/* ================= MODAL ================= */}
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        width={750}
        style={{ top: 20 }}
        bodyStyle={{ padding: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            padding: 28,
          }}
        >
          {/* Modal Header with Lottie */}
          <div style={{ textAlign: "center" }}>
            {/* <Lottie animationData={locationAnim} style={{ width: 150 }} /> */}
            <Title level={3}>{locality.locality_name}</Title>
            <Text type="secondary">{locality.strategic_positioning}</Text>
          </div>

          <Divider />

          {/* Connectivity Section */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Title level={4}>
              <CarOutlined /> Connectivity
            </Title>

            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Overall: </Text>
                {locality.connectivity?.overall_connectivity_rating}
              </Col>
              <Col span={12}>
                <Text strong>Bus Frequency: </Text>
                {locality.connectivity?.bus_connectivity?.frequency}
              </Col>
            </Row>
          </motion.div>

          <Divider />

          {/* Safety Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Title level={4}>
              <SafetyCertificateOutlined /> Safety
            </Title>

            <Paragraph>{locality.safety?.overall_rating}</Paragraph>

            <ul>
              {locality.safety?.safety_concerns?.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </motion.div>

          <Divider />

          {/* Hospitals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Title level={4}>Nearby Hospitals</Title>
            {/* <Lottie animationData={hospitalAnim} style={{ width: 90 }} /> */}

            {locality.safety?.nearby_hospitals?.map((h, i) => (
              <Paragraph key={i}>
                <strong>{h.name}</strong> ({h.rating})
                <br />
                <Text type="secondary">{h.address}</Text>
              </Paragraph>
            ))}
          </motion.div>

          <Divider />

          {/* Restaurants */}
          <Title level={4}>Popular Food Spots</Title>
          {/* <Lottie animationData={foodAnim} style={{ width: 100 }} /> */}

          {locality.location_info?.restaurants_cafes?.map((r, i) => (
            <Tag key={i} style={{ marginBottom: 6 }}>
              {r.name} ({r.rating})
            </Tag>
          ))}

          <Divider />

          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            block
            size="large"
            onClick={() => onSelect(locality.locality_name)}
          >
            {isSelected ? "Selected" : "Choose This Area"}
          </Button>
        </motion.div>
      </Modal>
    </>
  );
};

const SetHotelPrefs = ({ tripId, onComplete, setStatus }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // --- API HOOKS ---
  const { data: enums, isLoading: isEnumLoading } = useGetEnumsQuery();
  const {
    data: recData,
    isLoading: isRecLoading,
    isSuccess: isRecSuccess
  } = useGetLocalityRecommendationsQuery(tripId, { skip: !tripId });

  const [setPreferences, { isLoading: isSubmitting }] = useSetHotelPreferencesMutation();

  // State
  const [hotellocality, setHotelLocality] = useState([]);
  const debouncedSearch = useCallback(debounce(fetchPlaceSuggestions, 300), []);

  // Data Extraction
  const recommendations = recData?.data?.ai_hotel_locality_recommendation?.recommended_localities || [];
  const placesToCover = recData?.data?.ai_hotel_locality_recommendation?.places_to_cover || [];
  const selectedLocality = Form.useWatch('locality', form);

  const applyRecommendation = (localityName) => {
    form.setFieldsValue({ locality: localityName });
    messageApi.info(`Preference set to: ${localityName}`);
    // Smooth scroll back to form
    document.querySelector('.hotel-prefs-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinish = async (values) => {
    const payload = {
      trip_id: parseInt(tripId),
      ...values,
    };
    try {
      const result = await setPreferences(payload); // Use mock return structure
      const response = result.data;
      messageApi.success(response.message || "Hotel preferences saved!");
      setStatus("finish");
      onComplete(response.data);
    } catch (err) {
      messageApi.error(err.data?.message || "Failed to save preferences.");
      setStatus("error");
    }
  };

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
          no_of_rooms: 1,
          no_of_child: 0,
          min_price: 1000,
          max_price: 5000,
          selected_property_types: ["Hotel"],
          locality: ""
        }}
      >
        <Row gutter={24}>
          {/* Locality - Full Width */}
          <Col span={24}>
            <Form.Item
              name="locality"
              label={<Space><EnvironmentOutlined /> <Text strong>Preferred Locality / Area</Text></Space>}
              rules={[{ required: true, message: "Please enter or select a locality" }]}
            >
              <AutoComplete
                options={hotellocality}
                onSearch={(text) => debouncedSearch(text, setHotelLocality)}
                placeholder="e.g. Near City Center"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Col>

          {/* Budget Row */}
          <Col xs={24} md={12}>
            <Form.Item label={<Space><DollarCircleOutlined /> <Text strong>Budget Range (per night)</Text></Space>} style={{ marginBottom: 0 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="min_price" rules={[{ required: true }]}>
                    <InputNumber prefix="₹" placeholder="Min" style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="max_price" rules={[{ required: true }]}>
                    <InputNumber prefix="₹" placeholder="Max" style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>

          {/* Occupancy Row */}
          <Col xs={24} md={12}>
            <Form.Item label={<Space><TeamOutlined /> <Text strong>Occupancy</Text></Space>} style={{ marginBottom: 0 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="no_of_rooms" rules={[{ required: true }]}>
                    <InputNumber prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />} placeholder="Rooms" min={1} style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="no_of_child">
                    <InputNumber prefix={<SmileOutlined style={{ color: '#bfbfbf' }} />} placeholder="Children" min={0} style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>

          {/* Property Types */}
          <Col span={24}>
            {isEnumLoading ? (
              <Spin />
            ) : (
              <Form.Item
                name="selected_property_types"
                label={<Space><BankOutlined /> <Text strong>Accommodation Type</Text></Space>}
                rules={[{ required: true, message: "Select at least one type" }]}
              >
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row gutter={[12, 12]}>
                    {enums?.data?.property_types.map(pt => (
                      <Col xs={12} sm={8} md={6} key={pt}>
                        <Checkbox value={pt}>{pt}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            )}
          </Col>
        </Row>

        <Divider />

        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          block
          size="large"
          style={{ height: 50, fontSize: 18, borderRadius: 12, fontWeight: 600, background: 'linear-gradient(90deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}
        >
          Save Preferences & Search
        </Button>
      </Form>

      {/* --- SUGGESTIONS SECTION (BOTTOM) --- */}

      <div style={{ marginTop: 40 }}>
        <Divider orientation="center" style={{ borderColor: '#d9d9d9' }}>
          <Space align="center">
            <div style={{ padding: 8, background: '#e6f7ff', borderRadius: '50%' }}>
              <RobotOutlined style={{ color: '#1890ff', fontSize: 24 }} />
            </div>
            <Title level={4} style={{ margin: 0 }}>AI Smart Suggestions</Title>
          </Space>
        </Divider>

        <AnimatePresence mode="wait">
          {isRecLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: 40 }}
            >
              <Spin size="large" />
              <Paragraph style={{ marginTop: 16, color: '#8c8c8c' }}>
                Analyzing your itinerary to find the most strategic stay locations...
              </Paragraph>
            </motion.div>
          ) : recommendations.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Context Bar */}
              {placesToCover.length > 0 && (
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Text type="secondary" style={{ marginRight: 12 }}>Optimization Strategy: Minimize travel time to</Text>
                  <Space wrap style={{ justifyContent: 'center' }}>
                    {placesToCover.map(place => (
                      <Tag key={place} icon={<CompassOutlined />} color="geekblue">{place}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* List of Cards in GRID Layout */}
              <Row gutter={[16, 16]}>
                {recommendations.map((rec) => (
                  <Col xs={24} sm={12} md={8} lg={8} key={rec.rank_id}>
                    <LocalityCard
                      locality={rec}
                      onSelect={applyRecommendation}
                      isSelected={selectedLocality === rec.locality_name}
                    />
                  </Col>
                ))}
              </Row>
            </motion.div>
          ) : isRecSuccess ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#fafafa', borderRadius: 16 }}>
              <InfoCircleOutlined style={{ fontSize: 32, color: '#d9d9d9', marginBottom: 16 }} />
              <Paragraph>No specific locality recommendations available for this trip configuration.</Paragraph>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div >
  );
};

export default SetHotelPrefs;