import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Checkbox,
  Button,
  Typography,
  Space,
  message,
  Grid,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Alert,
  AutoComplete
} from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  CoffeeOutlined,
  HomeOutlined,
  RocketOutlined,
  CarOutlined,
  EnvironmentOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} from "../../api/userApi";

import { debounce } from 'lodash';
import { fetchPlaceSuggestions } from "../../utils/utils"
import LoadingAnimationOverlay from "../../components/LoadingAnimation";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;


const propertyTypeOptions = ["Hotel", "Homestay", "Villa", "Cottage", "Apartment", "Resort", "Hostel", "Camp", "Guest House", "Tree House", "Palace", "Farm House", "Airbnb"];
const foodPreferenceOptions = ["Veg", "Non-Veg", "Vegan", "Anything"];
const activityOptions = ["Adventure", "Heritage", "Nightlife", "Relaxation", "Nature", "Culture"];
const travelModeOptions = ["Bike", "Car", "Flight", "Train", "Train&Road", "Flight&Road", "Custom"];
const travellingWithOptions = ["Solo", "Partner", "Friends", "Family"];

const Preferences = () => {
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // State to track if the user has existing, non-null preferences
  const [hasExistingPrefs, setHasExistingPrefs] = useState(false);
  const [baseLocationOptions, setBaseLocationOptions] = useState([]);

  // Fetch existing user preferences
  const { data: preferences, isLoading, isSuccess, error } = useGetUserPreferencesQuery();

  // Get the mutation hooks
  const [updatePreferences, { isLoading: isUpdating }] = useUpdateUserPreferencesMutation();

  // Debounced search handler to prevent excessive API calls
  const debouncedSearch = useCallback(debounce(fetchPlaceSuggestions, 500), []);

  // This effect populates the form and determines the save/update logic
  useEffect(() => {
    if (isSuccess && preferences.status) {
      form.setFieldsValue(preferences.data);

      // Check if the returned data is just nulls or actual saved preferences
      // We check a required field like 'default_budget' to make this decision
      if (preferences.data.default_budget) {
        setHasExistingPrefs(true);
        messageApi.success("Your preferences have been loaded!");
      } else {
        setHasExistingPrefs(false);
        messageApi.info("No preferences set yet. Fill out the form to get started!");
      }
    }
    if (preferences && preferences.status === false) {
      messageApi.error(preferences.message);
    }
  }, [preferences, isSuccess, form]);

  const handleSubmit = async (values) => {
    // Filter out any null or undefined values before sending to the backend
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v != null)
    );

    try {
      if (hasExistingPrefs) {
        await updatePreferences(cleanedValues).unwrap();
        messageApi.success("Preferences updated successfully! ✨");
      } else {
        await updatePreferences(cleanedValues).unwrap();
        messageApi.success("Preferences saved successfully! 🎉");
        setHasExistingPrefs(true); // After the first save, subsequent saves should be updates
      }
    } catch (err) {
      messageApi.error(err.data?.message || "An error occurred. Please try again.");
    }
  };

  const cardMotion = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      {/* <Spin tip="Loading your preferences..." size="large" /> */}
      <LoadingAnimationOverlay text={"Loading your preferences..."} />
    </div>;
  }

  if (error) {
    return <Alert message="Error" description="Could not fetch your preferences. Please try again." type="error" showIcon />;
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      {contextHolder}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} >
          <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}> Your Travel Preferences 🛫 </Title>
          <Text type="secondary"> Set your vibe once, and all trips will be planned with your style in mind. </Text>
        </motion.div>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <motion.div custom={0} initial="hidden" animate="visible" variants={cardMotion}>
              <Card title={<Space><DollarOutlined /><Text strong>Budget & Stay</Text></Space>} style={{ borderRadius: 16 }}>
                <Form.Item name="default_budget" label="Default Budget (per trip, per person)">
                  <InputNumber prefix="₹" style={{ width: "100%" }} min={0} placeholder="e.g., 25000" />
                </Form.Item>
                <Form.Item name="property_type" label="Preferred Property Type">
                  <Select placeholder="e.g., Hotel" options={propertyTypeOptions.map(p => ({ label: p, value: p }))} />
                </Form.Item>
                <Form.Item name="hotel_room_price_per_night" label="Hotel Room Price (per night)">
                  <InputNumber prefix="₹" style={{ width: "100%" }} min={0} placeholder="e.g., 3000" />
                </Form.Item>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} md={12}>
            <motion.div custom={1} initial="hidden" animate="visible" variants={cardMotion}>
              <Card title={<Space><TeamOutlined /><Text strong>Travel Style</Text></Space>} style={{ borderRadius: 16 }}>
                <Form.Item name="num_people" label="Default Number of People">
                  <InputNumber style={{ width: "100%" }} min={1} placeholder="e.g., 2" />
                </Form.Item>
                <Form.Item name="travelling_with" label="Usually Travelling With">
                  <Select placeholder="e.g., Friends" options={travellingWithOptions.map(o => ({ label: o, value: o }))} />
                </Form.Item>
                <Form.Item name="base_location" label="Default Starting Location">
                  <AutoComplete
                    prefix={<EnvironmentOutlined />}
                    options={baseLocationOptions}
                    onSearch={(text) => debouncedSearch(text, setBaseLocationOptions)}
                    placeholder="e.g., Nagpur"
                  />
                </Form.Item>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} md={12}>
            <motion.div custom={2} initial="hidden" animate="visible" variants={cardMotion}>
              <Card title={<Space><RocketOutlined /><Text strong>Activities & Transport</Text></Space>} style={{ borderRadius: 16 }}>
                <Form.Item name="activities" label="Preferred Activities">
                  <Checkbox.Group options={activityOptions} />
                </Form.Item>
                <Form.Item name="travel_mode" label="Preferred Travel Mode">
                  <Select prefix={<CarOutlined />} placeholder="e.g., Train" options={travelModeOptions.map(m => ({ label: m, value: m }))} />
                </Form.Item>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} md={12}>
            <motion.div custom={3} initial="hidden" animate="visible" variants={cardMotion}>
              <Card title={<Space><CoffeeOutlined /><Text strong>Food</Text></Space>} style={{ borderRadius: 16 }}>
                <Form.Item name="food_preference" label="Food Preference">
                  <Select placeholder="e.g., Anything" options={foodPreferenceOptions.map(f => ({ label: f, value: f }))} />
                </Form.Item>
              </Card>
            </motion.div>
          </Col>
        </Row>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} >
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block={screens.xs}
            loading={isUpdating}
            icon={<SaveOutlined />}
            style={{ borderRadius: 12 }}
          >
            Save Preferences
          </Button>
        </motion.div>
      </div>
    </Form>
  );
};

export default Preferences;

