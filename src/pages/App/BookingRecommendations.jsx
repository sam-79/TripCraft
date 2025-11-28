import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Steps, Button, Card, Spin, Alert, message, Result, Popover, List, Tag, Avatar } from 'antd';
import { ArrowLeftOutlined, LoadingOutlined, ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

// Import child components
import SelectTravelOptions from '../../components/TripBooking/SelectTravelOptions';
import AnalyzeTravel from '../../components/TripBooking/AnalyzeTravel';
import SetHotelPrefs from '../../components/TripBooking/SetHotelPrefs';
import ViewHotelRecs from '../../components/TripBooking/ViewHotelRecs';
import CostBreakdown from '../../components/TripBooking/CostBreakdown';
import FinalBookingStep from '../../components/TripBooking/FinalBookingStep';
import { useTranslation } from 'react-i18next';

const { Step } = Steps;

const TripBooking = () => {
    const { t } = useTranslation();
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [stepStatus, setStepStatus] = useState('process'); //error, process, finish
    const [bookingData, setBookingData] = useState({});

    // --------------------------------------------------------
    // --- 1. STATE FOR THE GLOBAL BOOKING LIST ---
    // --------------------------------------------------------
    const [bookingList, setBookingList] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

    const next = () => {
        setStepStatus('process'); // Reset status for the next step
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setStepStatus('process'); // Reset status when going back
        setCurrentStep(currentStep - 1);
    };

    // Function to update shared data between steps
    const updateBookingData = (newData) => {
        setBookingData(prev => ({ ...prev, ...newData }));
    };

    // --------------------------------------------------------
    // --- 2. HANDLER TO ADD/REMOVE ITEMS FROM THE LIST ---
    // --------------------------------------------------------
    const handleAddToBookingList = (item) => {
        // Check if the item is already in the list
        const existingIndex = bookingList.findIndex(i => i.id === item.id);

        if (existingIndex > -1) {
            // Item exists, so remove it
            setBookingList(currentList => currentList.filter(i => i.id !== item.id));
            messageApi.warning(`${item.name || item.operator} ${t('removed_from_booking_list')}.`);
        } else {
            // Item does not exist, so add it
            setBookingList(currentList => [...currentList, item]);
            messageApi.success(`${item.name || item.operator} ${t('removed_from_booking_list')}`);
        }
    };

    // --- Helper to render the popover content ---
    const BookingListContent = (
        <div style={{ width: 350 }}>
            {bookingList.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={bookingList}
                    renderItem={item => (
                        <List.Item
                            actions={[<Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleAddToBookingList(item)} />]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={item.image || `https://ui-avatars.com/api/?name=${item.name || item.operator}&background=random`} />}
                                title={item.name || item.operator}
                                description={<Tag>{item.type?.toUpperCase()}</Tag>}
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <p>{t('empty_booking_list')}.</p>
            )}
        </div>
    );


    const steps = [
        {
            title: t('select_route'),
            content: <SelectTravelOptions tripId={tripId} onComplete={(data) => { updateBookingData(data); next(); }} setStatus={setStepStatus} />,
            // 'onComplete' prop receives data and calls next()
        },
        {
            title: t('analyze'),
            // --- 3. PASS PROPS TO CHILD COMPONENT ---
            content: <AnalyzeTravel tripId={tripId} onComplete={next} setStatus={setStepStatus} bookingList={bookingList} onAddToBooking={handleAddToBookingList} />,
        },
        {
            title: t('hotels_preferences'),
            content: <SetHotelPrefs tripId={tripId} onComplete={(data) => { updateBookingData(data); next(); }} setStatus={setStepStatus} />,
        },
        {
            title: t('hotels_recommendations'),
            // --- 3. PASS PROPS TO CHILD COMPONENT ---
            content: <ViewHotelRecs tripId={tripId} onComplete={next} setStatus={setStepStatus} bookingList={bookingList} onAddToBooking={handleAddToBookingList} />,
        },
        {
            title: t('cost_summary'),
            content: <CostBreakdown tripId={tripId} onComplete={next} setStatus={setStepStatus} />,
        },
        {
            title: t('finalize'),
            // --- 4. PASS FINAL LIST TO THE LAST STEP ---
            content: <FinalBookingStep tripId={tripId} bookingData={bookingData} bookingList={bookingList} setStatus={setStepStatus} />,
        },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/user/trips/${tripId}`)} // Navigate back to details
                    style={{ marginBottom: 24 }}
                >
                    {t('back_to_trip_details')}
                </Button>
                {/* --- 5. FLOATING POPOVER TO VIEW THE LIST --- */}
                <Popover
                    content={BookingListContent}
                    title="My Booking List"
                    trigger="click"
                    placement="bottomRight"
                >
                    <Button type="primary" icon={<ShoppingCartOutlined />}>
                        {t('view_list')} ({bookingList.length})
                    </Button>
                </Popover>
            </div>

            <Card style={{ borderRadius: 16 }}>
                <Steps current={currentStep} status={stepStatus} size="small" style={{ marginBottom: 32 }}>
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={prev} disabled={(currentStep === 0)}>
                        {t('previous')}
                    </Button>
                    <Button onClick={next} disabled={(currentStep === (steps.length - 1)) || (stepStatus == "process")}>
                        {t('Next')}
                    </Button>
                    {/* "Next" button might be conditionally rendered or handled within child components */}
                    {/* Example: Child component calls 'onComplete' which calls 'next' */}
                </div>
                <div style={{ padding: '24px 0', minHeight: '400px' }}>
                    {/* Render the content of the current step */}
                    {steps[currentStep] ? steps[currentStep].content : <Result status="404" title={t('not_found')} />}
                </div>
            </Card>
        </motion.div>
    );
};

export default TripBooking;