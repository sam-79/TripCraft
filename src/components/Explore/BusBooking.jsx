import React, { useState, useCallback } from 'react';
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
    Rate,
    Popover,
    Modal,
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    ClockCircleOutlined,
    SwapOutlined,
    StarFilled,
    CheckCircleOutlined,
    EnvironmentOutlined,
    ThunderboltOutlined, // For AC
    CompassOutlined, // For GPS
    MedicineBoxOutlined, // For First Aid
    RightOutlined,
    SafetyCertificateOutlined,
    LinkOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useTranslation } from "react-i18next";

// Import RTK Query hooks
import {
    useSearchBusesMutation,
    useLazyAutosuggestCityNameBusQuery
} from '../../api/searchApi';
import { useCreateBusBookingMutation } from '../../api/bookingApi';
import { useCreateCheckoutSessionMutation } from '../../api/paymentApi';

const { Title, Text, Paragraph } = Typography;

// --- Search Form (Stateful with AutoComplete) ---
const BusSearchForm = ({ onSearch, searchParams, setSearchParams, fetchSuggestions, suggestions, isSuggestLoading }) => {
    const { fromCity, toCity, travelDate } = searchParams;
    const { fromOptions, toOptions } = suggestions;
    const { t } = useTranslation();

    // Handle text input for AutoComplete
    const handleSearch = (field) => (value) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: { ...prev[field], name: value }
        }));
        if (typeof value === 'string') {
            fetchSuggestions(value, field);
        }
    };

    // Handle selecting an item from the dropdown
    const handleSelect = (field) => (value, option) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: { id: option.id, name: option.name }
        }));
    };

    // Swap From and To stations
    const swapCities = () => {
        setSearchParams(prev => ({
            ...prev,
            fromCity: prev.toCity,
            toCity: prev.fromCity
        }));
    };

    // Format options for AutoComplete
    const formatOptions = (options) => {
        if (!options || !options.data) return [];
        return options.data.map(city => ({
            key: city.id,
            value: `${city.name} (${city.state})`, // Text in input on select
            label: (
                <div>
                    <Text strong>{city.name}</Text> {"\n"}
                    <Text>{city.state}</Text>
                </div>
            ),
            id: city.id,
            name: city.name
        }));
    };

    return (
        <Row gutter={16} align="bottom">
            <Col flex={1}>
                <Text>{t('from')}</Text>
                <AutoComplete
                    size="large"
                    style={{ width: '100%' }}
                    value={fromCity.name}
                    options={formatOptions(fromOptions)}
                    onSearch={handleSearch('fromCity')}
                    onSelect={handleSelect('fromCity')}
                    placeholder="Enter city name"
                    notFoundContent={isSuggestLoading ? <Spin size="small" /> : null}
                    allowClear
                />
            </Col>

            <Col>
                <Button
                    icon={<SwapOutlined />}
                    size="small"
                    style={{ marginTop: '24px' }}
                    onClick={swapCities}
                    aria-label="Swap cities"
                />
            </Col>

            <Col flex={1}>
                <Text>{t("to")}</Text>
                <AutoComplete
                    size="large"
                    style={{ width: '100%' }}
                    value={toCity.name}
                    options={formatOptions(toOptions)}
                    onSearch={handleSearch('toCity')}
                    onSelect={handleSelect('toCity')}
                    placeholder="Enter city name"
                    notFoundContent={isSuggestLoading ? <Spin size="small" /> : null}
                    allowClear
                />
            </Col>
            <Col>
                <Text>{t('date')}</Text>
                <DatePicker
                    value={travelDate}
                    onChange={(date) => setSearchParams(prev => ({ ...prev, travelDate: date }))}
                    size="large"
                    format="DD/MM/YYYY" // API expects DD-MM-YYYY, will format on search
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
            </Col>
            <Col>
                <Button type="primary" icon={<SearchOutlined />} size="large" style={{ marginTop: '24px' }} onClick={onSearch}>
                    {t('search_bus')}
                </Button>
            </Col>
        </Row>
    );
};

// --- Amenity Helper ---
const AmenityIcon = ({ name }) => {
    const iconStyle = { color: '#595959', marginRight: 8 };
    const textStyle = { color: '#595959', fontSize: 12 };

    let icon = null;
    let text = name;

    if (name.toLowerCase().includes('ac')) {
        icon = <ThunderboltOutlined style={iconStyle} />;
        text = 'AC';
    } else if (name.toLowerCase().includes('gps')) {
        icon = <CompassOutlined style={iconStyle} />;
        text = 'GPS';
    } else if (name.toLowerCase().includes('water bottle')) {
        icon = <span className="material-symbols-outlined" style={{ ...iconStyle, fontSize: 16, verticalAlign: 'middle' }}>water_drop</span>;
        text = 'Water Bottle';
    } else if (name.toLowerCase().includes('first aid')) {
        icon = <MedicineBoxOutlined style={iconStyle} />;
        text = 'First Aid';
    } else {
        return null; // Don't render unknown amenities
    }

    return (
        <Tooltip title={name}>
            <span style={{ marginRight: 12, display: 'inline-flex', alignItems: 'center' }}>
                {icon}
                <Text style={textStyle}>{text}</Text>
            </span>
        </Tooltip>
    );
};

// --- Result Card (Updated for Bus Data) ---
const BusResultCard = ({ data, showModal, selectedTripId, userData }) => {
    const { t } = useTranslation();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [createBusBooking, { isLoading: isBusBooking }] = useCreateBusBookingMutation();
    const [createCheckoutSession, { isLoading: isPaying }] = useCreateCheckoutSessionMutation();


    const [messageApi, messageApiContextHolder] = message.useMessage();

    // --- Booking Handler ---
    const handleBusBooking = async () => {
        if (!selectedTripId) {
            messageApi.error(t('trip_not_selected'));
            showModal();
            return
        }
        try {
            const res = await createBusBooking({
                ...{ trip_id: selectedTripId, booking_type: "Bus", ...userData, }
            }).unwrap();
            if (res.status) {
                setBookingData(res.data);
                setIsModalVisible(true);
                messageApi.success(res.message);
            }
        } catch (err) {
            console.error(err);
            messageApi.error(`${t('booking_failed')}, ${t('try_again')}`);
        }
    };

    // --- Pay Now Handler ---
    const handlePayNow = async () => {
        try {
            const res = await createCheckoutSession({
                booking_id: bookingData?.booking_id,
                amount: data?.amount,
                booking_type: "Bus",
                trip_id: selectedTripId
            }).unwrap();

            if (res.checkout_url) {
                window.location.href = res.checkout_url; // Redirect to Stripe
            } else {
                messageApi.error(`${t('failed_generate_payment_session')}, ${t('try_again')}`);
            }
        } catch (err) {
            console.error(err);
            messageApi.error(`${t('failed_generate_payment_session')}, ${t('try_again')}`);
        }
    };


    // Check for discounts
    const getDiscountTag = () => {
        if (data.Discount > 0) {
            // Check for flat discount from cpMsg
            if (data.cpMsg && data.cpMsg.toLowerCase().includes('flat')) {
                return <Tag color="red">FLAT {data.Discount.toFixed(0)} OFF</Tag>;
            }
            if (data.cpMsg && data.cpMsg.toLowerCase().includes('super deal')) {
                return <Tag color="red">SUPERDEAL</Tag>;
            }
            return <Tag color="green">{t('save')} ₹{data.Discount.toFixed(0)}</Tag>;
        }
        return null;
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {messageApiContextHolder}
                <Card
                    style={{
                        marginBottom: 16,
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                    bodyStyle={{ padding: 16 }}
                >
                    <Row gutter={[16, 16]}>
                        {/* Col 1: Details */}
                        <Col xs={24} md={18}>
                            <Title level={5} style={{ margin: 0 }}>{data.Travels}</Title>
                            <Paragraph type="secondary" style={{ margin: '0 0 8px 0' }}>{data.busType}</Paragraph>

                            <Row align="middle" gutter={16}>
                                <Col xs={8} sm={6}>
                                    <Title level={4} style={{ margin: 0 }}>{data.departureTime}</Title>
                                    <Text>{data.bdPoints[0]?.bdPoint.split(' ')[0]}</Text>
                                </Col>
                                <Col xs={8} sm={6} style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                                        <Text type="secondary">{data.duration}</Text>
                                    </div>
                                </Col>
                                <Col xs={8} sm={6}>
                                    <Title level={4} style={{ margin: 0 }}>{data.ArrivalTime}</Title>
                                    <Text>{data.dpPoints[0]?.dpName}</Text>
                                </Col>
                            </Row>

                            <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                                {data.lstamenities.slice(0, 4).map(amenity => (
                                    <AmenityIcon key={amenity.name} name={amenity.name} />
                                ))}
                            </div>
                        </Col>

                        {/* Col 2: Pricing & CTA */}
                        <Col xs={24} md={6} style={{ textAlign: 'right', borderLeft: '1px solid #f0f0f0' }}>
                            <div style={{ paddingLeft: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    {data.rt && <Rate disabled defaultValue={parseFloat(data.rt)} allowHalf style={{ fontSize: 14 }} />}
                                    <Paragraph type="secondary" style={{ margin: 0 }}>{t('starting_from_label')}</Paragraph>
                                    <Title level={3} style={{ margin: 0 }}>
                                        ₹{data.amount}
                                    </Title>
                                    {data.priceWithOutDiscount && data.Discount > 0 && (
                                        <Text delete type="secondary">
                                            ₹{data.priceWithOutDiscount}
                                        </Text>
                                    )}
                                    <div style={{ margin: '8px 0' }}>
                                        {getDiscountTag()}
                                    </div>
                                </div>
                                <div>
                                    <Text strong style={{ color: '#28a745' }}>{data.AvailableSeats} {t('seat')} {t('available')}</Text>
                                    <Button type="primary" block style={{ marginTop: 8 }} onClick={handleBusBooking}>
                                        {t('book_now')}
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </motion.div>

            {/* --- Booking Modal --- */}
            <Modal
                open={isModalVisible}
                title="Booking Summary"
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        {t('close')}
                    </Button>,
                    <Button
                        key="pay"
                        type="primary"
                        loading={isPaying}
                        onClick={handlePayNow}
                    >
                        {t('pay_now')}
                    </Button>,
                ]}
            >
                {bookingData ? (
                    <>
                        {console.log(data)}
                        <Paragraph><strong>{t('from')} : {userData?.from_city}</strong></Paragraph>
                        <Paragraph><strong>{t('to')} : {userData?.to_city}</strong></Paragraph>
                        <Paragraph><strong>{t('journey')} {t('date')} : {bookingData?.journey_date}</strong></Paragraph>
                        <Paragraph><strong>{t('travels')} : {data?.Travels}</strong></Paragraph>
                        <Paragraph><strong>{t('bus')} {t('type')} : {data?.bus_type}</strong></Paragraph>
                        <Paragraph><strong>{t('amount')} : {data?.amount}</strong></Paragraph>
                    </>
                ) : (
                    <Paragraph>{t('loading')}</Paragraph>
                )}
            </Modal>
        </>
    );
};


// --- Main BusBooking Component (Updated with API logic) ---
const BusBooking = ({ showModal, selectedTripId }) => {
    const { t } = useTranslation();
    // --- State for Search ---
    const [searchParams, setSearchParams] = useState({
        fromCity: { id: '', name: '' },
        toCity: { id: '', name: '' },
        travelDate: dayjs().add(1, 'day'),
    });

    // --- State for Autosuggest ---
    const [suggestions, setSuggestions] = useState({ fromOptions: null, toOptions: null });
    const [isSuggestLoading, setIsSuggestLoading] = useState(false);

    // --- RTK Query Hooks ---
    const [
        triggerSearchBuses,
        { data: busResults, isLoading: isSearchLoading, error: searchError }
    ] = useSearchBusesMutation();

    const [triggerGetSuggestions] = useLazyAutosuggestCityNameBusQuery();

    // --- Debounced Suggestion Fetcher ---
    const fetchCitySuggestions = async (value, field) => {
        if (!value) {
            setSuggestions(prev => ({ ...prev, [field === 'fromCity' ? 'fromOptions' : 'toOptions']: null }));
            return;
        }
        setIsSuggestLoading(true);
        try {
            const response = await triggerGetSuggestions(value).unwrap();
            if (response && response.status) {
                setSuggestions(prev => ({
                    ...prev,
                    [field === 'fromCity' ? 'fromOptions' : 'toOptions']: response
                }));
            } else {
                setSuggestions(prev => ({ ...prev, [field === 'fromCity' ? 'fromOptions' : 'toOptions']: null }));
            }
        } catch (err) {
            console.error("Failed to fetch suggestions:", err);
            setSuggestions(prev => ({ ...prev, [field === 'fromCity' ? 'fromOptions' : 'toOptions']: null }));
        }
        setIsSuggestLoading(false);
    };

    const debouncedFetchSuggestions = useCallback(debounce(fetchCitySuggestions, 300), []);

    // --- Search Handler ---
    const handleSearch = () => {
        const { fromCity, toCity, travelDate } = searchParams;

        // if (!fromCity.id) {
        //     message.error('Please select a "From" city from the suggestions.');
        //     return;
        // }
        // if (!toCity.id) {
        //     message.error('Please select a "To" city from the suggestions.');
        //     return;
        // }
        // if (!travelDate) {
        //     message.error('Please select a travel date.');
        //     return;
        // }
        if (!fromCity.id || !toCity.id || !travelDate) {
            message.error(t('please_fill_all_required_fields'));
            return;
        }

        const body = {
            from_city: fromCity.name,
            to_city: toCity.name,
            journey_date: travelDate.format('DD-MM-YYYY'), // API format
            from_city_id: fromCity.id,
            to_city_id: toCity.id
        };

        triggerSearchBuses(body);
    };

    // --- Render Results ---
    const renderResults = () => {
        if (isSearchLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <Title level={5} style={{ marginTop: 16 }}>{t('searching_buses')}...</Title>
                </div>
            );
        }

        if (searchError) {
            return <Alert message="Error" description={searchError.data?.message || `${t('failed_fetch_buses')}. ${t('try_again')}.`} type="error" showIcon style={{ marginTop: 24 }} />;
        }

        if (!busResults || !busResults?.data || !busResults?.data.Response.AvailableTrips) {
            return <Empty description={t('please_search_buses_results')} style={{ marginTop: 40 }} />;
        }

        const { AvailableTrips } = busResults.data.Response;
        const { from_city, to_city } = busResults.user_data;

        if (AvailableTrips.length === 0) {
            return <Empty description={t('no_buses_found')} style={{ marginTop: 40 }} />;
        }

        return (
            <div style={{ marginTop: 24 }}>
                {/* Booking Banner */}
                {(searchParams?.fromCity && searchParams?.toCity && searchParams.travelDate) && (
                    <Alert
                        message={
                            <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                                <Col>
                                    <Space>
                                        <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                                        <Text strong>{t('ready_to_book')}</Text>
                                        <Text type="secondary">{t('complete_reservation')}</Text>
                                    </Space>
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        icon={<LinkOutlined />}
                                        onClick={() => window.open(`https://bus.easemytrip.com/home/list?org=${searchParams.fromCity.name}&des=${searchParams.toCity.name}&date=${searchParams.travelDate.format('DD-MM-YYYY')}&searchid=${searchParams.fromCity.id}_${searchParams.toCity.id}&CCode=IN&AppCode=Emt`, '_blank')}
                                        style={{ borderColor: '#1890ff' }}
                                    >
                                        {t('Book_EMT')}
                                    </Button>
                                </Col>
                            </Row>
                        }
                        type="info"
                        style={{ marginBottom: 24, padding: '12px 24px', borderRadius: 8, border: '1px solid #91caff' }}
                    />
                )}
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Text strong>
                            {t('showing')} {AvailableTrips.length} buses {t('from')} {from_city} {t('to')} {to_city}
                        </Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<FilterOutlined />}>{t('filter')}</Button>
                            <Button icon={<SortAscendingOutlined />}>{t('sort')}</Button>
                        </Space>
                    </Col>
                </Row>
                <AnimatePresence>
                    {AvailableTrips.map((item, index) => <BusResultCard key={`${item.id}_${index}`} data={item} showModal={showModal} selectedTripId={selectedTripId} userData={busResults.user_data} />)}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '8px' }}>
            <BusSearchForm
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

export default BusBooking;
