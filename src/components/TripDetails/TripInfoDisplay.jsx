import React, { useState, useEffect } from 'react';
import { Typography, Descriptions, Tag, Space, Button, Form, InputNumber, DatePicker, Select, Checkbox, message, Row, Col } from 'antd';
import { EnvironmentOutlined, FlagOutlined, CalendarOutlined, DollarOutlined, CarOutlined, UserOutlined, SmileOutlined, TagsOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useUpdateTripMutation } from '../../api/tripApi';
import dayjs from 'dayjs';
import "../../styles/TripInfo.css";
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const activityOptions = ["Adventure", "Heritage", "Nightlife", "Relaxation", "Nature", "Culture"];
const travelModeOptions = ["Bike", "Car", "Flight", "Train", "Train&Road", "Flight&Road", "Custom"];
const travellingWithOptions = ["Solo", "Partner", "Friends", "Family"];

const TripInfoDisplay = ({ trip }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();
    const { t } = useTranslation();

    // Format date for display
    const formatDate = (date) => {
        if (!date) return '';
        return dayjs(date).format('MMM D, YYYY');
    };

    // Initialize form with trip data when editing
    useEffect(() => {
        if (isEditing && trip) {
            form.setFieldsValue({
                ...trip,
                dates: [dayjs(trip.start_date), dayjs(trip.end_date)],
            });
        }
    }, [isEditing, trip, form]);

    const handleFormSubmit = async (values) => {
        try {
            const updatedTrip = {
                trip_id: trip.trip_id,
                ...values,
                start_date: values.dates[0].toISOString(),
                end_date: values.dates[1].toISOString(),
            };
            delete updatedTrip.dates;

            await updateTrip(updatedTrip).unwrap();
            message.success(t('trip_update_success'));
            setIsEditing(false);
        } catch (error) {
            message.error(t('trip_update_error'));
        }
    };

    if (isEditing) {
        return (
            <div style={{ height: '100%', overflowY: 'auto', paddingRight: '16px' }}>
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item name="trip_name" label={t('trip_name')}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="destination" label={t('destination')}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="base_location" label={t('base_location')}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="dates" label={t('dates')}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="budget" label={t('budget')}>
                                <InputNumber prefix="₹" style={{ width: '100%' }} min={1000} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="num_people" label={t('number_of_people')}>
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="travel_mode" label={t('travel_mode')}>
                                <Select options={travelModeOptions.map(o => ({ label: o, value: o }))} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="travelling_with" label={t('travelling_with')}>
                                <Select options={travellingWithOptions.map(o => ({ label: o, value: o }))} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="activities" label={t('activities')}>
                        <Checkbox.Group options={activityOptions} />
                    </Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={isUpdating} icon={<SaveOutlined />}>{t('save')}</Button>
                        <Button onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
                    </Space>
                </Form>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', paddingRight: '16px' }}>
            <Descriptions bordered column={1} layout="horizontal" size="small">
                <Descriptions.Item label={<><FlagOutlined /> {t('destination')}</>}><Text strong>{trip.destination}</Text></Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> {t('base_location')}</>}><Text>{trip.base_location}</Text></Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> {t('dates')}</>}><Tag color="blue">{formatDate(trip.start_date)}</Tag> to <Tag color="blue">{formatDate(trip.end_date)}</Tag></Descriptions.Item>
                <Descriptions.Item label={<><DollarOutlined /> {t('budget')}</>}><Text>₹{trip.budget.toLocaleString('en-IN')}</Text></Descriptions.Item>
                <Descriptions.Item label={<><CarOutlined /> {t('travel_mode')}</>}><Tag>{trip.travel_mode}</Tag></Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined /> {t('people')}</>}><Text>{trip.num_people}</Text></Descriptions.Item>
                <Descriptions.Item label={<><SmileOutlined /> {t('travelling_with')}</>}><Tag color="gold">{trip.travelling_with}</Tag></Descriptions.Item>
                <Descriptions.Item label={<><TagsOutlined /> {t('activities')}</>}><Space wrap>{trip.activities.map(act => <Tag key={act} color="purple">{act}</Tag>)}</Space></Descriptions.Item>
            </Descriptions>
            <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                style={{ marginTop: 16 }}
            >
                {t('edit_trip_details')}
            </Button>
        </div>
    );
};

export default TripInfoDisplay;

