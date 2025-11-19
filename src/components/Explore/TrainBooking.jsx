import React, { useState, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Input, // Keep Input for DatePicker reference, but we'll add AutoComplete
  AutoComplete,
  DatePicker,
  Space,
  Empty,
  Spin,
  Tooltip,
  Tag,
  message,
  Alert
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ClockCircleOutlined,
  SwapOutlined, // For swapping stations
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

// --- Search Form (Now stateful with AutoComplete) ---
const TrainSearchForm = ({ onSearch, searchParams, setSearchParams, fetchSuggestions, suggestions, isSuggestLoading }) => {

  const { fromStation, toStation, travelDate } = searchParams;
  const { fromOptions, toOptions } = suggestions;

  // Handle text input for AutoComplete
  const handleSearch = (field) => (value) => {
    // This is the raw text input
    setSearchParams(prev => ({
      ...prev,
      [field]: { ...prev[field], name: value } // Update the display name
    }));
    // Don't search for codes, only for names
    if (typeof value === 'string') {
      fetchSuggestions(value, field);
    }
  };

  // Handle selecting an item from the dropdown
  const handleSelect = (field) => (value, option) => {
    // value is station.code, option contains { code, name }
    setSearchParams(prev => ({
      ...prev,
      [field]: { code: option.code, name: option.name }
    }));
  };

  // Swap From and To stations
  const swapStations = () => {
    setSearchParams(prev => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
  };

  // Format options for AutoComplete
  const formatOptions = (options) => {
    if (!options || !options.data) return [];
    return options.data.map(station => ({
      key: station.code,
      value: `${station.name} (${station.code})`, // This is the text that will appear in the input on select
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
    <Row gutter={16} align="bottom">
      <Col flex={1}>
        <Text>From</Text>
        <AutoComplete
          size="large"
          style={{ width: '100%' }}
          value={fromStation.name}
          options={formatOptions(fromOptions)}
          onSearch={handleSearch('fromStation')}
          onSelect={handleSelect('fromStation')}
          placeholder="Enter station name or code"
          notFoundContent={isSuggestLoading ? <Spin size="small" /> : null}
          allowClear
        />
      </Col>

      <Col>
        <Button
          icon={<SwapOutlined />}
          size="small"
          style={{ marginTop: '24px' }}
          onClick={swapStations}
          aria-label="Swap stations"
        />
      </Col>

      <Col flex={1}>
        <Text>To</Text>
        <AutoComplete
          size="large"
          style={{ width: '100%' }}
          value={toStation.name}
          options={formatOptions(toOptions)}
          onSearch={handleSearch('toStation')}
          onSelect={handleSelect('toStation')}
          placeholder="Enter station name or code"
          notFoundContent={isSuggestLoading ? <Spin size="small" /> : null}
          allowClear
        />
      </Col>
      <Col>
        <Text>Date</Text>
        <DatePicker
          value={travelDate}
          onChange={(date) => setSearchParams(prev => ({ ...prev, travelDate: date }))}
          size="large"
          format="DD/MM/YYYY"
          style={{ width: '100%' }}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
        />
      </Col>
      <Col>
        <Button type="primary" icon={<SearchOutlined />} size="large" style={{ marginTop: '24px' }} onClick={onSearch}>
          Search Trains
        </Button>
      </Col>
    </Row>
  );
};

// --- Result Card (No changes needed, uses passed data) ---
const getAvailability = (status) => {
  // ... (utility function from your file, no changes)
  if (!status) return { text: 'N/A', color: 'default' };
  if (status.includes('AVAILABLE')) return { text: status.replace('-', ' '), color: 'success' };
  if (status.includes('RAC')) return { text: status, color: 'warning' };
  if (status.includes('WL') || status.includes('GNWL')) return { text: status, color: 'error' };
  if (status.includes('Tap To Refresh')) return { text: 'Check Availability', color: 'processing' };
  return { text: status, color: 'default' };
};

const TrainResultCard = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
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
            <Text type="secondary">({data.trainNumber})</Text>
          </Title>
          <Text type="secondary">
            {data.fromStnName} → {data.toStnName}
          </Text>
        </Col>

        <Col xs={12} md={4} style={{ textAlign: 'center' }}>
          <Text type="secondary">{data.departuredate}</Text>
          <Title level={4} style={{ margin: 0 }}>
            {data.departureTime}
          </Title>
          <Text>{data.fromStnCode}</Text>
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
            <span style={{ height: 1, background: '#d9d9d9', flex: 1 }}></span>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8c8c8c' }}>train</span>
            <span style={{ height: 1, background: '#d9d9d9', flex: 1 }}></span>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {data.distance} km
          </Text>
        </Col>

        <Col xs={12} md={4} style={{ textAlign: 'center' }}>
          <Text type="secondary">{data.ArrivalDate}</Text>
          <Title level={4} style={{ margin: 0 }}>
            {data.arrivalTime}
          </Title>
          <Text>{data.toStnCode}</Text>
        </Col>
      </Row>

      {/* === Class Fare & Availability Section === */}
      <Card
        size="small"
        style={{ marginTop: 16, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[16, 16]}>
          {data.classes.map((cls) => {
            const availability = getAvailability(cls.availablityStatus);
            const isAvailable =
              availability.color === 'success' || availability.color === 'warning';

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={cls.enqClass}>
                <Card
                  size="small"
                  bordered
                  hoverable
                  style={{ borderRadius: 8, borderColor: '#f0f0f0', height: '100%' }}
                  bodyStyle={{ padding: 12 }}
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>
                        {cls.className} ({cls.enqClass})
                      </Text>
                      <br />
                      <Tag color={availability.color} style={{ marginTop: 4 }}>
                        {availability.text}
                      </Tag>
                    </Col>
                    <Col style={{ textAlign: 'right' }}>
                      <Text strong style={{ fontSize: 16 }}>
                        ₹{cls.totalFare}
                      </Text>
                      <br />
                      <Tooltip
                        title={
                          !isAvailable
                            ? 'Currently unavailable. Try refreshing later.'
                            : 'Proceed to booking'
                        }
                      >
                        <Button
                          type="primary"
                          size="small"
                          style={{ marginTop: 4 }}
                          disabled={!isAvailable && availability.text !== 'Check Availability'}
                        >
                          {availability.text === 'Check Availability'
                            ? 'Check'
                            : 'Book Now'}
                        </Button>
                      </Tooltip>
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

// --- Main TrainBooking Component (Updated with API logic) ---
const TrainBooking = () => {
  // --- State for Search ---
  const [searchParams, setSearchParams] = useState({
    fromStation: { code: '', name: '' },
    toStation: { code: '', name: '' },
    travelDate: dayjs().add(1, 'day'), // Default to tomorrow
  });

  // --- State for Autosuggest ---
  const [suggestions, setSuggestions] = useState({ fromOptions: null, toOptions: null });
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

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
      if (response && response.status) {
        setSuggestions(prev => ({
          ...prev,
          [field === 'fromStation' ? 'fromOptions' : 'toOptions']: response
        }));
      } else {
        setSuggestions(prev => ({ ...prev, [field === 'fromStation' ? 'fromOptions' : 'toOptions']: null }));
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions(prev => ({ ...prev, [field === 'fromStation' ? 'fromOptions' : 'toOptions']: null }));
    }
    setIsSuggestLoading(false);
  };

  // Use useCallback to memoize the debounced function
  const debouncedFetchSuggestions = useCallback(debounce(fetchPlaceSuggestions, 300), []);


  // --- Search Handler ---
  const handleSearch = () => {
    const { fromStation, toStation, travelDate } = searchParams;

    // Validation
    if (!fromStation.code) {
      message.error('Please select a "From" station from the suggestions.');
      return;
    }
    if (!toStation.code) {
      message.error('Please select a "To" station from the suggestions.');
      return;
    }
    if (!travelDate) {
      message.error('Please select a travel date.');
      return;
    }

    const body = {
      from_station: fromStation.code,
      to_station: toStation.code,
      travel_date: travelDate.format('DD/MM/YYYY'),
      coupon_code: ""
    };

    // Trigger the mutation
    triggerGetTrains(body);
  };

  // --- Render Results ---
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
      return <Alert message="Error" description={searchError.data?.message || "Failed to fetch trains. Please try again."} type="error" showIcon style={{ marginTop: 24 }} />;
    }

    if (!trainResults || !trainResults.data || !trainResults.data.trains) {
      return <Empty description="Please search for trains to see results." style={{ marginTop: 40 }} />;
    }

    const { trains } = trainResults.data;
    const { from_station, to_station } = trainResults.user_data;

    if (trains.length === 0) {
      return <Empty description="No trains found for this route and date." style={{ marginTop: 40 }} />;
    }

    return (
      <div style={{ marginTop: 24 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Text strong>
              Showing {trains.length} trains from {from_station} to {to_station}
            </Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<FilterOutlined />}>Filter</Button>
              <Button icon={<SortAscendingOutlined />}>Sort</Button>
            </Space>
          </Col>
        </Row>
        <AnimatePresence>
          {trains.map(item => <TrainResultCard key={item.trainNumber} data={item} />)}
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
    </motion.div>
  );
};

export default TrainBooking;

