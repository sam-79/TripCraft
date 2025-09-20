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
  Alert,
  AutoComplete,
  Switch,
} from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  CoffeeOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} from "../../api/userApi";
import { debounce } from 'lodash';
import { fetchPlaceSuggestions, fetchRailWaySuggestions } from "../../utils/utils";
import LoadingAnimationOverlay from "../../components/LoadingAnimation";
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Options derived from enums/backend data
const propertyTypeOptions = ["Hotel", "Homestay", "Villa", "Cottage", "Apartment", "Resort", "Hostel", "Camp", "Guest House", "Tree House", "Palace", "Farm House", "Airbnb"];
const foodPreferenceOptions = ["Veg", "Non-Veg", "Vegan", "Anything"];
const activityOptions = ["Adventure", "Heritage", "Nightlife", "Relaxation", "Nature", "Culture"];
const travelModeOptions = ["Bike", "Car", "Flight", "Train", "Train&Road", "Flight&Road", "Custom"];
const travellingWithOptions = ["Solo", "Partner", "Friends", "Family"];
const trainClassOptions = ["SL", "3A", "3E", "2A", "1A"];
const departureTimeOptions = ["Morning", "Afternoon", "Evening", "Night"];


const Preferences = () => {
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [hasExistingPrefs, setHasExistingPrefs] = useState(false);
  const [baseLocationOptions, setBaseLocationOptions] = useState([]);
  const [baseLocationRailwayStation, setBaseLocationRailwayStation] = useState([]);

  const { data: preferences, isLoading, isSuccess, error } = useGetUserPreferencesQuery();
  const [updatePreferences, { isLoading: isUpdating }] = useUpdateUserPreferencesMutation();
  const debouncedFetchPlaces = useCallback(debounce(fetchPlaceSuggestions, 500), []);
  const debouncedFetchRailwayStation = useCallback(debounce(fetchRailWaySuggestions, 500), []);

  useEffect(() => {
    if (isSuccess && preferences.status) {
      form.setFieldsValue(preferences.data);
      if (preferences.data.default_budget) {
        setHasExistingPrefs(true);
        messageApi.success(t('preferences_loaded'));
      } else {
        setHasExistingPrefs(false);
        messageApi.info(t('no_preferences_set'));
      }
    }
    if (preferences && preferences.status === false) {
      messageApi.error(preferences.message);
    }
  }, [preferences, isSuccess, form, messageApi, t]);

  const handleSubmit = async (values) => {
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v != null)
    );
    try {
      await updatePreferences(cleanedValues).unwrap();
      messageApi.success(hasExistingPrefs ? t('preferences_updated') : t('preferences_saved'));
      if (!hasExistingPrefs) setHasExistingPrefs(true);
    } catch (err) {
      messageApi.error(err.data?.message || t('preferences_error'));
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
    return <LoadingAnimationOverlay text={t('loading_preferences')} />;
  }
  if (error) {
    return <Alert message={t('error')} description={t('preferences_fetch_error')} type="error" showIcon />;
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      {contextHolder}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} >
          <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>{t('your_travel_preferences')}</Title>
          <Text type="secondary">{t('preferences_subtitle')}</Text>
        </motion.div>

        <Row gutter={[20, 20]}>
          {/* --- COLUMN 1 --- */}
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <motion.div custom={0} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><DollarOutlined /><Text strong>{t('budget_stay')}</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="default_budget" label={t('default_budget')}>
                    <InputNumber prefix="₹" style={{ width: "100%" }} min={0} placeholder={t('budget_placeholder')} />
                  </Form.Item>
                  <Form.Item name="property_type" label={t('preferred_property_type')}>
                    <Select placeholder={t('property_type_placeholder')} options={propertyTypeOptions.map(p => ({ label: p, value: p }))} />
                  </Form.Item>
                  <Form.Item name="hotel_room_price_per_night" label={t('hotel_room_price')}>
                    <InputNumber prefix="₹" style={{ width: "100%" }} min={0} placeholder={t('hotel_price_placeholder')} />
                  </Form.Item>
                </Card>
              </motion.div>
              <motion.div custom={2} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><RocketOutlined /><Text strong>{t('activities_transport')}</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="activities" label={t('preferred_activities')}>
                    <Checkbox.Group options={activityOptions} />
                  </Form.Item>
                  <Form.Item name="travel_mode" label={t('preferred_travel_mode')}>
                    <Select placeholder={t('travel_mode_placeholder')} options={travelModeOptions.map(m => ({ label: m, value: m }))} />
                  </Form.Item>
                </Card>
              </motion.div>
              <motion.div custom={4} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><CoffeeOutlined /><Text strong>{t('food')}</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="food_preference" label={t('food_preference')}>
                    <Select placeholder={t('food_preference_placeholder')} options={foodPreferenceOptions.map(f => ({ label: f, value: f }))} />
                  </Form.Item>
                </Card>
              </motion.div>
            </Space>
          </Col>

          {/* --- COLUMN 2 --- */}
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <motion.div custom={1} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><TeamOutlined /><Text strong>{t('travel_style')}</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="num_people" label={t('default_number_people')}>
                    <InputNumber style={{ width: "100%" }} min={1} placeholder={t('people_placeholder')} />
                  </Form.Item>
                  <Form.Item name="travelling_with" label={t('usually_travelling_with')}>
                    <Select placeholder={t('travelling_with_placeholder')} options={travellingWithOptions.map(t => ({ label: t, value: t }))} />
                  </Form.Item>
                </Card>
              </motion.div>
              <motion.div custom={3} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><EnvironmentOutlined /><Text strong>{t('location')}</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="base_location" label={t('home_location')}>
                    <AutoComplete
                      options={baseLocationOptions}
                      onSearch={(text) => debouncedFetchPlaces(text, setBaseLocationOptions)}
                      placeholder={t('home_location_placeholder')}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item name="base_railway_station" label={t('closest_railway_station')}>
                    <AutoComplete
                      options={baseLocationRailwayStation}
                      onSearch={(text) => debouncedFetchRailwayStation(text, setBaseLocationRailwayStation)}
                      placeholder={t('railway_station_placeholder')}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Card>
              </motion.div>
              <motion.div custom={5} initial="hidden" animate="visible" variants={cardMotion}>
                <Card title={<Space><RocketOutlined /><Text strong>{t('train_preferences')}</Text></Space>} style={{ borderRadius: 16 }}>
                  <Form.Item name="preferred_train_class" label={t('preferred_train_class')}>
                    <Select mode="multiple" placeholder={t('train_class_placeholder')} options={trainClassOptions.map(c => ({ label: c, value: c }))} />
                  </Form.Item>
                  <Form.Item name="preferred_departure_time" label={t('preferred_departure_time')}>
                    <Select mode="multiple" placeholder={t('departure_time_placeholder')} options={departureTimeOptions.map(t => ({ label: t, value: t }))} />
                  </Form.Item>
                </Card>
              </motion.div>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: "flex", justifyContent: "center" }}>
                <Button type="primary" htmlType="submit" size="large" block={screens.xs} loading={isUpdating} icon={<SaveOutlined />} style={{ borderRadius: 12, marginTop: '20px' }}>
                  {t('save_preferences')}
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

