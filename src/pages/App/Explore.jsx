import React, { useMemo, useState, useContext, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Tag,
  Input,
  Select,
  Segmented,
  Button,
  Space,
  Skeleton,
  Empty,
  Drawer,
  Typography,
  Grid,
  Alert,
  AutoComplete
} from "antd";
import {
  EnvironmentOutlined,
  AimOutlined,
  ReloadOutlined,
  CloseOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../theme/ThemeContext";
import { useGetTravelRecommendationsQuery } from "../../api/recommendationApi";
import { useTranslation } from "react-i18next";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const Explore = () => {
  const { theme } = useContext(ThemeContext);
  const screens = useBreakpoint();
  const { t } = useTranslation();


  // const [baseLocationOptions, setBaseLocationOptions] = useState([]);
  // // Debounced search handler to prevent excessive API calls
  // const debouncedSearch = useCallback(debounce(fetchPlaceSuggestions, 1000), []);

  // RTK Query hook to fetch recommendation data
  const { data: recommendations, error, isLoading } = useGetTravelRecommendationsQuery();

  // State for filters
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(undefined);
  const [activity, setActivity] = useState("ALL");
  const [bestTime, setBestTime] = useState("ANY");

  // State for the details drawer
  const [open, setOpen] = useState(false);
  const [activePlace, setActivePlace] = useState(null);

  const isLight = theme === "light";
  const heroGradient = isLight
    ? "linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)"
    : "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)";

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.04, duration: 0.35, ease: "easeOut" },
    }),
  };

  // Memoize the flattened and filtered list of places for performance
  const filteredPlaces = useMemo(() => {
    if (!recommendations) return [];

    // Flatten the recommendations object into a single array
    const allPlaces = Object.values(recommendations).flat();

    // Apply filters
    return allPlaces.filter(p => {
      const queryLower = query.toLowerCase();
      const matchesQuery = !query || p.name.toLowerCase().includes(queryLower) || p.description.toLowerCase().includes(queryLower);
      const matchesCity = !city || p.city === city;
      const matchesActivity = activity === "ALL" || p.activitytype === activity;
      const matchesBestTime = bestTime === "ANY" || p.Best_time_to_visit === bestTime;

      return matchesQuery && matchesCity && matchesActivity && matchesBestTime;
    });
  }, [recommendations, query, city, activity, bestTime]);

  // Prepare filter options from the data
  const filterOptions = useMemo(() => {
    if (!recommendations) return { cities: [], activities: [], bestTimeOptions: [] };
    
    // Extract unique cities, activities and best times from recommendations
    const cities = [...new Set(Object.values(recommendations).flat().map(p => p.city))];
    const activities = [...new Set(Object.values(recommendations).flat().map(p => p.activitytype))];
    const times = [...new Set(Object.values(recommendations).flat().map(p => p.Best_time_to_visit))];
    
    return {
      cities: cities.map(c => ({ label: c, value: c })),
      activities: [{ label: t('all_activities'), value: "ALL" }, ...activities.map(a => ({ label: a, value: a }))],
      bestTimeOptions: times.map(t => ({ label: t, value: t })),
    }
  }, [recommendations, t]);

  const clearFilters = () => {
    setQuery("");
    setCity(undefined);
    setActivity("ALL");
    setBestTime("ANY");
  };

  const showPlaceDetails = (place) => {
    setActivePlace(place);
    setOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HERO & FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ borderRadius: 18, padding: screens.xs ? 16 : 24, background: heroGradient, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
      >
        <Title level={screens.xs ? 4 : 3} style={{ margin: 0, color: isLight ? "#1f1f1f" : "#fff" }}>
          {t('explore_heading')}
        </Title>
        <Text style={{ opacity: 0.9, color: isLight ? "#333" : "#fff" }}>
          {t('explore_subheading')}
        </Text>

        <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input 
              size="large" 
              allowClear 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder={t('search_places_placeholder')} 
              prefix={<AimOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder={t('select_city_placeholder')}
              allowClear
              style={{ width: "100%" }}
              size="large"
              options={filterOptions.cities}
              value={city}
              onChange={setCity}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: "100%" }}
              size="large"
              options={filterOptions.activities}
              value={activity}
              onChange={setActivity}
              defaultValue="ALL"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space style={{ width: "100%" }}>
              <Select
                placeholder={t('best_time_placeholder')}
                style={{ width: screens.xs ? "100%" : 170 }}
                size="large"
                options={[
                  { label: t('any_time'), value: "ANY" },
                  ...(filterOptions.bestTimeOptions || [])
                ]}
                value={bestTime}
                onChange={setBestTime}
                defaultValue="ANY"
              />
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={clearFilters}
                aria-label={t('clear_filters')}
              />
            </Space>
          </Col>
        </Row>
      </motion.div>

      {/* ERROR STATE */}
      {error && (
        <Alert
          message={t('error_title')}
          description={t('explore_error_description')}
          type="error"
          showIcon
        />
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <Row gutter={[18, 18]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} md={8} lg={6}>
              <Card style={{ borderRadius: 16 }}>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !error && filteredPlaces.length === 0 && (
        <Empty
          description={t('no_places_found')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* RESULTS GRID */}
      {!isLoading && !error && filteredPlaces.length > 0 && (
        <Row gutter={[18, 18]}>
          <AnimatePresence>
            {filteredPlaces.map((p, idx) => (
              <Col key={`${p.name}-${idx}`} xs={24} sm={12} md={8} lg={6}>
                <motion.div custom={idx} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.96 }} variants={cardVariants} whileHover={{ y: -6 }}>
                  <Card
                    hoverable
                    onClick={() => showPlaceDetails(p)}
                    style={{ borderRadius: 16, overflow: "hidden", height: "100%" }}
                    cover={<img src={p.Image_url} alt={p.name} style={{ height: 180, objectFit: "cover" }} />}
                  >
                    <Title level={5}>{p.name}</Title>
                    <Paragraph ellipsis={{ rows: 2 }}>{p.description}</Paragraph>
                    <Space wrap>
                      <Tag color="blue"><EnvironmentOutlined /> {p.city}</Tag>
                      <Tag color="purple"><FieldTimeOutlined /> {p.Best_time_to_visit}</Tag>
                    </Space>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      )}

      {/* DETAILS DRAWER */}
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        width={screens.xs ? "100%" : 640} 
        closeIcon={<CloseOutlined />} 
        title={activePlace?.name}
      >
        {activePlace && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <img src={activePlace.Image_url} alt={activePlace.name} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12 }} />
            <Title level={4}>{activePlace.name}, {activePlace.city}</Title>
            <Paragraph>{activePlace.description}</Paragraph>
            <Tag color="geekblue" style={{ fontSize: 14, padding: '5px 10px' }}>{activePlace.activitytype}</Tag>
            <Tag color="cyan" style={{ fontSize: 14, padding: '5px 10px' }}>{t('best_time_to_visit')}: {activePlace.Best_time_to_visit}</Tag>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Explore;
