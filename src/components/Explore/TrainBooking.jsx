import React, { useState, useCallback, useMemo} from 'react';
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  AutoComplete,
  DatePicker,
  Space,
  Empty,
  Spin,
  Tooltip,
  Tag,
  message,
  Alert,
  Dropdown,
  Menu,
  Drawer,
  Checkbox,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  DownOutlined,
  LinkOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

// Import RTK Query hooks
import {
  useGetAvailableTrainsMutation,
  useLazyAutosuggestStationNameQuery
} from '../../api/searchApi';

const { Title, Text } = Typography;

// --- Helpers ---
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const getMinFare = (train) => {
  if (!train.classes || train.classes.length === 0) return Infinity;
  return Math.min(...train.classes.map(c => parseFloat(c.totalFare) || Infinity));
};

// --- Search Form ---
const TrainSearchForm = ({ onSearch, searchParams, setSearchParams, fetchSuggestions, suggestions, isSuggestLoading }) => {

  const { fromStation, toStation, travelDate } = searchParams;
  const { fromOptions, toOptions } = suggestions;

  const handleSearch = (field) => (value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: { ...prev[field], name: value }
    }));
    if (typeof value === 'string') {
      fetchSuggestions(value, field);
    }
  };

  const handleSelect = (field) => (value, option) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: { code: option.code, name: option.name }
    }));
  };

  const swapStations = () => {
    setSearchParams(prev => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
  };

  const formatOptions = (options) => {
    if (!options || !options.data) return [];
    return options.data.map(station => ({
      key: station.code,
      value: `${station.name} (${station.code})`,
      label: (
        <div>
          <Text strong>{station.name}</Text> ({station.code})
        </div>
      ),
      code: station.code,
      name: station.name
    }));
  };

  return (
    <Card style={{ borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={7}>
          <Text type="secondary">From</Text>
          <AutoComplete
            size="large"
            style={{ width: '100%' }}
            value={fromStation.name}
            options={formatOptions(fromOptions)}
            onSearch={handleSearch('fromStation')}
            onSelect={handleSelect('fromStation')}
            placeholder="Source Station"
            notFoundContent={isSuggestLoading ? <Spin size="small" /> : null}
            allowClear
          />
        </Col>

        <Col xs={24} md={2} style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            icon={<SwapOutlined />}
            shape="circle"
            onClick={swapStations}
            aria-label="Swap stations"
          />
        </Col>

        <Col xs={24} md={7}>
          <Text type="secondary">To</Text>
          <AutoComplete
            size="large"
            style={{ width: '100%' }}
            value={toStation.name}
            options={formatOptions(toOptions)}
            onSearch={handleSearch('toStation')}
            onSelect={handleSelect('toStation')}
            placeholder="Destination Station"
            notFoundContent={isSuggestLoading ? <Spin size="small" /> : null}
            allowClear
          />
        </Col>
        <Col xs={24} md={5}>
          <Text type="secondary">Date</Text>
          <DatePicker
            value={travelDate}
            onChange={(date) => setSearchParams(prev => ({ ...prev, travelDate: date }))}
            size="large"
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            disabledDate={(current) => {
              const today = dayjs().startOf('day');
              const maxDate = today.add(60, "day").endOf("day");
              return current && (current < today || current > maxDate);
            }}
          />
        </Col>
        <Col xs={24} md={3}>
          <Button type="primary" icon={<SearchOutlined />} size="large" block onClick={onSearch}>
            Search
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// --- Result Card ---
const getAvailability = (status) => {
  if (!status) return { text: 'N/A', color: 'default' };
  if (status.includes('AVAILABLE')) return { text: status.replace('-', ' '), color: 'success' };
  if (status.includes('RAC')) return { text: status, color: 'warning' };
  if (status.includes('WL') || status.includes('GNWL') || status.includes('RLWL')) return { text: status, color: 'error' };
  if (status.includes('Tap To Refresh')) return { text: 'Check Availability', color: 'processing' };
  return { text: status, color: 'default' };
};

const TrainResultCard = ({ data }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
  >
    <Card
      style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      bodyStyle={{ padding: 16 }}
    >
      {/* === Header Section === */}
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Title level={5} style={{ margin: 0 }}>
            {data.trainName}{' '}
            <Text type="secondary" style={{ fontWeight: 'normal' }}>({data.trainNumber})</Text>
          </Title>
          <Text type="secondary">
            {data.fromStnName} → {data.toStnName}
          </Text>
        </Col>

        <Col xs={12} md={4} style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>{data.departuredate}</Text>
          <Title level={4} style={{ margin: 0 }}>
            {data.departureTime}
          </Title>
          <Text strong>{data.fromStnCode}</Text>
        </Col>

        <Col xs={12} md={4} style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary">{data.duration}</Text>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              marginTop: 4,
              color: '#8c8c8c',
            }}
          >
            <span style={{ height: 1, flex: 1 }}></span>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8c8c8c' }}>train</span>
            <span style={{ height: 1, flex: 1 }}></span>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {data.distance} km
          </Text>
        </Col>

        <Col xs={12} md={4} style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>{data.ArrivalDate}</Text>
          <Title level={4} style={{ margin: 0 }}>
            {data.arrivalTime}
          </Title>
          <Text strong>{data.toStnCode}</Text>
        </Col>
      </Row>

      {/* === Class Fare & Availability Section === */}
      <Card
        size="small"
        style={{ marginTop: 16, borderRadius: 8, border: 'none' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[12, 12]}>
          {data.classes.map((cls) => {
            const availability = getAvailability(cls.availablityStatus);
            const isAvailable =
              availability.color === 'success' || availability.color === 'warning';

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={cls.enqClass}>
                <Card
                  size="small"
                  bordered={false}
                  hoverable
                  style={{ 
                    borderRadius: 8, 
                    height: '100%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  bodyStyle={{ padding: 12 }}
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>
                        {cls.enqClass}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>{cls.className}</Text>
                      <Tag color={availability.color} style={{ marginTop: 4, marginRight: 0, fontSize: 10 }}>
                        {availability.text}
                      </Tag>
                    </Col>
                    <Col style={{ textAlign: 'right' }}>
                      <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                        ₹{cls.totalFare}
                      </Text>
                      <br />
                      <Button
                        type={isAvailable ? "primary" : "default"}
                        size="small"
                        style={{ marginTop: 4, fontSize: 10 }}
                        ghost={!isAvailable}
                        disabled={!isAvailable && availability.text !== 'Check Availability'}
                      >
                        Book
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>
    </Card>
  </motion.div>
);

// --- Main TrainBooking Component ---
const TrainBooking = () => {
  // --- State for Search ---
  const [searchParams, setSearchParams] = useState({
    fromStation: { code: '', name: '' },
    toStation: { code: '', name: '' },
    travelDate: dayjs().add(1, 'day'),
  });

  // --- State for Autosuggest ---
  const [suggestions, setSuggestions] = useState({ fromOptions: null, toOptions: null });
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  // --- Local Filter & Sort State ---
  const [sortOption, setSortOption] = useState('departure'); // 'price', 'duration', 'departure', 'arrival'
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    classes: [],
    timeSlots: [] // 'morning', 'afternoon', 'evening', 'night'
  });

  // --- RTK Query Hooks ---
  const [
    triggerGetTrains,
    { data: trainResults, isLoading: isSearchLoading, error: searchError }
  ] = useGetAvailableTrainsMutation();

  const [triggerGetSuggestions] = useLazyAutosuggestStationNameQuery();

  // --- Debounced Suggestion Fetcher ---
  const fetchPlaceSuggestions = async (value, field) => {
    if (!value) {
      setSuggestions(prev => ({ ...prev, [field === 'fromStation' ? 'fromOptions' : 'toOptions']: null }));
      return;
    }
    setIsSuggestLoading(true);
    try {
      const response = await triggerGetSuggestions(value).unwrap();
      setSuggestions(prev => ({
        ...prev,
        [field === 'fromStation' ? 'fromOptions' : 'toOptions']: response?.status ? response : null
      }));
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions(prev => ({ ...prev, [field === 'fromStation' ? 'fromOptions' : 'toOptions']: null }));
    }
    setIsSuggestLoading(false);
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchPlaceSuggestions, 300), []);

  const handleSearch = () => {
    const { fromStation, toStation, travelDate } = searchParams;
    if (!fromStation.code || !toStation.code || !travelDate) {
      message.error('Please fill in all fields correctly.');
      return;
    }

    triggerGetTrains({
      from_station: fromStation.code,
      to_station: toStation.code,
      travel_date: travelDate.format('DD/MM/YYYY'),
      coupon_code: ""
    });
    
    // Reset filters on new search
    setFilters({ classes: [], timeSlots: [] });
    setSortOption('departure');
  };

  // --- Filter & Sort Logic ---
  const processedTrains = useMemo(() => {
    if (!trainResults?.data?.trains) return [];
    
    let data = [...trainResults.data.trains];

    // 1. Filter by Class
    if (filters.classes.length > 0) {
      data = data.filter(train => 
        train.classes.some(cls => filters.classes.includes(cls.enqClass))
      );
    }

    // 2. Filter by Time Slot
    if (filters.timeSlots.length > 0) {
      data = data.filter(train => {
        const hour = parseInt(train.departureTime.split(':')[0], 10);
        const slots = [];
        if (hour >= 0 && hour < 6) slots.push('night');
        if (hour >= 6 && hour < 12) slots.push('morning');
        if (hour >= 12 && hour < 18) slots.push('afternoon');
        if (hour >= 18 && hour <= 23) slots.push('evening');
        return filters.timeSlots.some(slot => slots.includes(slot));
      });
    }

    // 3. Sorting
    data.sort((a, b) => {
      switch (sortOption) {
        case 'price':
          return getMinFare(a) - getMinFare(b);
        case 'duration':
          return parseTime(a.duration) - parseTime(b.duration);
        case 'arrival':
          return parseTime(a.arrivalTime) - parseTime(b.arrivalTime);
        case 'departure':
        default:
          return parseTime(a.departureTime) - parseTime(b.departureTime);
      }
    });

    return data;
  }, [trainResults, filters, sortOption]);

  // --- Render Helpers ---
  const sortMenu = (
    <Menu
      onClick={(e) => setSortOption(e.key)}
      selectedKeys={[sortOption]}
      items={[
        { label: 'Departure (Earliest)', key: 'departure' },
        { label: 'Arrival (Earliest)', key: 'arrival' },
        { label: 'Duration (Shortest)', key: 'duration' },
        { label: 'Price (Low to High)', key: 'price' },
      ]}
    />
  );

  const renderFilters = () => {
    // Extract all unique class codes from current results for filter options
    const availableClasses = Array.from(new Set(
      trainResults?.data?.trains?.flatMap(t => t.classes.map(c => c.enqClass)) || []
    )).sort();

    return (
      <Drawer
        title="Filter Trains"
        placement="right"
        onClose={() => setIsFilterVisible(false)}
        open={isFilterVisible}
      >
        <Title level={5}>Departure Time</Title>
        <Checkbox.Group 
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          value={filters.timeSlots}
          onChange={(vals) => setFilters(prev => ({ ...prev, timeSlots: vals }))}
        >
          <Checkbox value="morning">Morning (06:00 - 12:00)</Checkbox>
          <Checkbox value="afternoon">Afternoon (12:00 - 18:00)</Checkbox>
          <Checkbox value="evening">Evening (18:00 - 00:00)</Checkbox>
          <Checkbox value="night">Night (00:00 - 06:00)</Checkbox>
        </Checkbox.Group>
        
        <Divider />
        
        <Title level={5}>Train Class</Title>
        <Checkbox.Group 
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          value={filters.classes}
          onChange={(vals) => setFilters(prev => ({ ...prev, classes: vals }))}
        >
          {availableClasses.map(cls => (
            <Checkbox key={cls} value={cls}>{cls}</Checkbox>
          ))}
        </Checkbox.Group>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
           <Button onClick={() => setFilters({ classes: [], timeSlots: [] })}>Reset</Button>
           <Button type="primary" style={{ marginLeft: 8 }} onClick={() => setIsFilterVisible(false)}>Done</Button>
        </div>
      </Drawer>
    );
  };

  const renderResults = () => {
    if (isSearchLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <Title level={5} style={{ marginTop: 16 }}>Searching for trains...</Title>
        </div>
      );
    }

    if (searchError) {
      return <Alert message="Error" description={searchError.data?.message || "Failed to fetch trains."} type="error" showIcon style={{ marginTop: 24 }} />;
    }

    if (!trainResults?.data?.trains) {
      return <Empty description="Start searching to see trains." style={{ marginTop: 40 }} />;
    }

    const bookingUrl = trainResults.data.booking_url;

    if (processedTrains.length === 0) {
      return <Empty description="No trains match your filters." style={{ marginTop: 40 }} />;
    }

    return (
      <div style={{ marginTop: 24 }}>
        {/* Booking Banner */}
        {bookingUrl && (
          <Alert
            message={
              <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                <Col>
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Ready to book?</Text>
                    <Text type="secondary">Complete your reservation securely on EaseMyTrip.</Text>
                  </Space>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    icon={<LinkOutlined />} 
                    onClick={() => window.open(bookingUrl, '_blank')}
                    style={{ background: '#1890ff', borderColor: '#1890ff' }}
                  >
                    Book on EaseMyTrip
                  </Button>
                </Col>
              </Row>
            }
            type="info"
            style={{ marginBottom: 24, padding: '12px 24px', borderRadius: 8, border: '1px solid #91caff' }}
          />
        )}

        {/* Filter & Sort Bar */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Text strong style={{ fontSize: 16 }}>
              {processedTrains.length} Trains Found
            </Text>
            <Text type="secondary"> (Nagpur → Pune)</Text>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<FilterOutlined />} 
                onClick={() => setIsFilterVisible(true)}
                type={filters.classes.length > 0 || filters.timeSlots.length > 0 ? 'primary' : 'default'}
                ghost={filters.classes.length > 0 || filters.timeSlots.length > 0}
              >
                Filter
              </Button>
              <Dropdown overlay={sortMenu} trigger={['click']}>
                <Button icon={<SortAscendingOutlined />}>
                  Sort: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)} <DownOutlined />
                </Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>

        <AnimatePresence>
          {processedTrains.map(item => <TrainResultCard key={item.trainNumber} data={item} />)}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '8px' }}>
      <TrainSearchForm
        onSearch={handleSearch}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        fetchSuggestions={debouncedFetchSuggestions}
        suggestions={suggestions}
        isSuggestLoading={isSuggestLoading}
      />
      {renderResults()}
      {renderFilters()}
    </motion.div>
  );
};

export default TrainBooking;