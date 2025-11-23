// src/pages/App/Preferences.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  InputNumber,
  Select,
  Spin,
  Alert,
  AutoComplete,
  Switch,
  Divider,
} from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  CoffeeOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { debounce } from "lodash";


import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} from "../../api/userApi";
import { useGetEnumsQuery } from "../../api/enumsApi";
import { fetchPlaceSuggestions, fetchRailWaySuggestions } from "../../utils/utils";
import LoadingAnimationOverlay from "../../components/LoadingAnimation";


// Mock API Hooks
// const useGetUserPreferencesQuery = () => {
//   // Simulating the response structure from your prompt
//   const [data, setData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     setTimeout(() => {
//       setData({
//         status: true,
//         data: {
//           default_budget: null,
//           food_preference: "Veg",
//           base_location: null,
//           activities: ["Nature", "Heritage"],
//           travel_mode: "Train",
//           travelling_with: "Solo",
//           preferred_train_class: "3A",
//           preferred_from_station: null,
//           flexible_station_option: true,
//           bus_sleeper: true,
//           bus_ac: true,
//           bus_seater: true,
//           bus_ststatus: false,
//           preferred_flight_class: "Economy"
//         },
//         message: "Preferences fetched successfully.",
//         status_code: 200
//       });
//       setIsLoading(false);
//     }, 1000);
//   }, []);

//   return { data, isLoading, isSuccess: true, error: null };
// };

// const useGetEnumsQuery = () => {
//   const [data, setData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     setTimeout(() => {
//       setData({
//         status: true,
//         data: {
//           native_languages: ["English", "Hindi", "Tamil"],
//           activities: ["Adventure", "Heritage", "Nightlife", "Relaxation", "Nature", "Culture"],
//           travelling_with: ["Solo", "Partner", "Friends", "Family"],
//           travel_modes: ["Bike", "Car", "Flight", "Train", "Taxi"],
//           property_types: ["Hotel", "Homestay", "Villa", "Cottage", "Apartment", "Resort"],
//           food_preferences: ["Veg", "Non-Veg", "Vegan", "Anything"],
//           train_classes: ["SL", "3A", "3E", "2A", "1A"],
//           flight_classes: ["Economy", "Business", "First Class"], // Added for demo
//           departure_times: ["Morning", "Afternoon", "Evening", "Night"] // Added for demo
//         },
//         message: "Settings fetched successfully",
//         status_code: 200
//       });
//       setIsLoading(false);
//     }, 1200);
//   }, []);

//   return { data, isLoading, isError: false };
// };

// const useUpdateUserPreferencesMutation = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const updatePrefs = async (data) => {
//     setIsLoading(true);
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         setIsLoading(false);
//         console.log("Updated Prefs:", data);
//         resolve({ data: { status: true, message: "Updated successfully" } });
//       }, 1000);
//     });
//   };
//   return [updatePrefs, { isLoading }];
// };
// ---------------------------------------------

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Fallback options in case API fails or data is missing
const FALLBACK_FLIGHT_CLASSES = ["Economy", "Premium Economy", "Business", "First Class"];
const FALLBACK_DEPARTURE_TIMES = ["Morning", "Afternoon", "Evening", "Night"];

const Preferences = () => {
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [hasExistingPrefs, setHasExistingPrefs] = useState(false);
  const [baseLocationOptions, setBaseLocationOptions] = useState([]);
  const [baseLocationRailwayStation, setBaseLocationRailwayStation] = useState([]);

  // 1. Fetch User Preferences
  const {
    data: preferencesResponse,
    isLoading: isPrefsLoading,
    isSuccess: isPrefsSuccess,
    error: prefsError,
  } = useGetUserPreferencesQuery();

  // 2. Fetch Enums (Dynamic Options)
  const {
    data: enumsResponse,
    isLoading: isEnumsLoading,
    isError: isEnumsError,
  } = useGetEnumsQuery();

  // 3. Update Mutation
  const [updatePreferences, { isLoading: isUpdating }] = useUpdateUserPreferencesMutation();

  const debouncedFetchPlaces = useCallback(debounce(fetchPlaceSuggestions, 500), []);
  const debouncedFetchRailwayStation = useCallback(debounce(fetchRailWaySuggestions, 500), []);

  // --- Derive Options from Enums API ---
  const options = useMemo(() => {
    const data = enumsResponse?.data || {};
    
    // Helper to map array of strings to { label, value }
    const toOptions = (arr) => (arr || []).map((item) => ({ label: item, value: item }));

    return {
      propertyTypes: toOptions(data.property_types),
      foodPreferences: toOptions(data.food_preferences),
      activities: data.activities || [], // Checkbox group expects simple array of strings/values
      travelModes: toOptions(data.travel_modes),
      travellingWith: toOptions(data.travelling_with),
      trainClasses: toOptions(data.train_classes),
      flightClasses: toOptions(data.flight_classes || FALLBACK_FLIGHT_CLASSES), 
      departureTimes: toOptions(data.departure_times || FALLBACK_DEPARTURE_TIMES),
    };
  }, [enumsResponse]);

  // --- Handle Loading User Data ---
  useEffect(() => {
    if (isPrefsSuccess && preferencesResponse) {
      // Robust handling: Check if status is true, otherwise show error
      if (preferencesResponse.status === false) {
        messageApi.error(preferencesResponse.message || "Failed to load specific preference details.");
        return;
      }

      const prefsData = preferencesResponse.data || {};

      // Set form values, filtering out nulls to let placeholders show
      const cleanData = Object.fromEntries(
        Object.entries(prefsData).filter(([_, v]) => v !== null && v !== undefined)
      );

      form.setFieldsValue(cleanData);

      if (preferencesResponse.status && preferencesResponse.status_code == 200) {
        setHasExistingPrefs(true);
        messageApi.success("Your preferences have been loaded!");
      } else {
        setHasExistingPrefs(false);
        messageApi.info("No preferences set yet. Fill out the form to get started!");
      }
    }
  }, [preferencesResponse, isPrefsSuccess, form, messageApi]);

  const handleSubmit = async (values) => {
    // Clean values: remove nulls/undefined to avoid sending junk to API
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v != null)
    );

    try {
      const result = await updatePreferences(cleanedValues);
      // Note: .unwrap() logic depends on actual RTK Query, simplified here for mock
      const response = result.data || result; 

      if (response?.status === false) {
         throw new Error(response.message || "Update failed");
      }
      
      messageApi.success(
        hasExistingPrefs
          ? "Preferences updated successfully! ✨"
          : "Preferences saved successfully! 🎉"
      );
      if (!hasExistingPrefs) setHasExistingPrefs(true);
    } catch (err) {
      console.error("Update Error:", err);
      messageApi.error(err.data?.message || err.message || "An error occurred. Please try again.");
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

  // Combined Loading State
  if (isPrefsLoading || isEnumsLoading) {
    return <LoadingAnimationOverlay text={"Loading your travel profile..."} />;
  }

  // Critical Error State (Only if user prefs fail hard)
  if (prefsError) {
    return (
      <Alert
        message="Error Loading Preferences"
        description="Could not fetch your preferences. Please check your internet connection or try again later."
        type="error"
        showIcon
      />
    );
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      {contextHolder}
      
      {/* Non-critical warning if Enums fail */}
      {isEnumsError && (
        <Alert 
          message="Partial System Info Missing" 
          description="Some dropdown options might be missing, but you can still save your preferences." 
          type="warning" 
          closable 
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>
            Your Travel Preferences 🛫
          </Title>
          <Text type="secondary">
            Set your vibe once, and all trips will be planned with your style in mind.
          </Text>
        </motion.div>

        <Row gutter={[20, 20]}>
          {/* --- COLUMN 1 --- */}
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              
              {/* Card 0: Budget & Stay */}
              <motion.div custom={0} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><DollarOutlined /><Text strong>Budget & Stay</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="default_budget" label="Default Budget (per trip, per person)">
                    <InputNumber prefix="₹" style={{ width: "100%" }} min={0} placeholder="e.g., 25000" />
                  </Form.Item>
                  <Form.Item name="property_type" label="Preferred Property Type">
                    <Select 
                      placeholder="e.g., Hotel" 
                      options={options.propertyTypes} 
                      loading={isEnumsLoading}
                    />
                  </Form.Item>
                  <Form.Item name="hotel_room_price_per_night" label="Hotel Room Price (per night)">
                    <InputNumber prefix="₹" style={{ width: "100%" }} min={0} placeholder="e.g., 3000" />
                  </Form.Item>
                </Card>
              </motion.div>

              {/* Card 2: Activities & Transport */}
              <motion.div custom={2} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><RocketOutlined /><Text strong>Activities & General Transport</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="activities" label="Preferred Activities">
                    <Checkbox.Group options={options.activities} />
                  </Form.Item>
                  <Form.Item name="travel_mode" label="Primary Travel Mode">
                    <Select 
                      placeholder="e.g., Train" 
                      options={options.travelModes}
                      loading={isEnumsLoading} 
                    />
                  </Form.Item>
                </Card>
              </motion.div>

              {/* Card 4: Food */}
              <motion.div custom={4} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><CoffeeOutlined /><Text strong>Food</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="food_preference" label="Food Preference">
                    <Select 
                      placeholder="e.g., Anything" 
                      options={options.foodPreferences}
                      loading={isEnumsLoading}
                    />
                  </Form.Item>
                </Card>
              </motion.div>
            </Space>
          </Col>

          {/* --- COLUMN 2 --- */}
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              
              {/* Card 1: Travel Style */}
              <motion.div custom={1} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><TeamOutlined /><Text strong>Travel Style</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="num_people" label="Default Number of People">
                    <InputNumber style={{ width: "100%" }} min={1} placeholder="e.g., 2" />
                  </Form.Item>
                  <Form.Item name="travelling_with" label="Usually Travelling With">
                    <Select 
                      placeholder="e.g., Friends" 
                      options={options.travellingWith} 
                      loading={isEnumsLoading}
                    />
                  </Form.Item>
                  <Form.Item name="base_location" label="Default Starting Location">
                    <AutoComplete
                      prefix={<EnvironmentOutlined />}
                      options={baseLocationOptions}
                      onSearch={(text) => debouncedFetchPlaces(text, setBaseLocationOptions)}
                      placeholder="e.g., Nagpur"
                    />
                  </Form.Item>
                </Card>
              </motion.div>

              {/* Card 3: Train Preferences */}
              <motion.div custom={3} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><i className="fas fa-train" /> <Text strong>Train Travel Preferences</Text></Space>} style={{ borderRadius: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="preferred_train_class" label="Preferred Class">
                        <Select 
                          placeholder="e.g., 3A" 
                          options={options.trainClasses} 
                          loading={isEnumsLoading}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="preferred_departure_time" label="Departure Time">
                        <Select 
                          placeholder="e.g., Evening" 
                          options={options.departureTimes}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="preferred_from_station" label="Preferred From Station Code">
                    <AutoComplete
                      options={baseLocationRailwayStation}
                      onSearch={(text) => debouncedFetchRailwayStation(text, setBaseLocationRailwayStation)}
                      placeholder="e.g., NGP"
                    />
                  </Form.Item>
                  <Form.Item name="flexible_station_option" valuePropName="checked" noStyle>
                    <Space>
                        <Switch size="small" /> 
                        <Text>Allow nearby stations?</Text>
                    </Space>
                  </Form.Item>
                </Card>
              </motion.div>

              {/* Card 5: Flight & Bus Preferences (NEW) */}
              <motion.div custom={5} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><CarOutlined /><Text strong>Flight & Bus Preferences</Text></Space>} style={{ borderRadius: 16 }}>
                  
                  {/* Flight Section */}
                  <Form.Item name="preferred_flight_class" label="Preferred Flight Class">
                    <Select 
                        placeholder="Select Class" 
                        options={options.flightClasses}
                    />
                  </Form.Item>

                  <Divider dashed style={{ margin: '12px 0' }} />

                  {/* Bus Section */}
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>Bus Configuration</Text>
                  <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form.Item name="bus_ac" valuePropName="checked" noStyle>
                            <Checkbox>AC Bus</Checkbox>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="bus_sleeper" valuePropName="checked" noStyle>
                            <Checkbox>Sleeper</Checkbox>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="bus_seater" valuePropName="checked" noStyle>
                            <Checkbox>Seater</Checkbox>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="bus_ststatus" valuePropName="checked" noStyle>
                            <Checkbox>ST Bus (Govt)</Checkbox>
                        </Form.Item>
                      </Col>
                  </Row>
                </Card>
              </motion.div>

              {/* Submit Button */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block={screens.xs}
                  loading={isUpdating}
                  icon={<SaveOutlined />}
                  style={{ borderRadius: 12, height: 48, paddingInline: 40 }}
                >
                  Save Preferences
                </Button>
              </motion.div>

            </Space>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default Preferences;