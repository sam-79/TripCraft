import React, { useState, useEffect } from 'react';
import { Typography, Descriptions, Tag, Space, Button, Form, InputNumber, DatePicker, Select, Checkbox, message, Row, Col } from 'antd';
import { EnvironmentOutlined, FlagOutlined, CalendarOutlined, DollarOutlined, CarOutlined, UserOutlined, SmileOutlined, TagsOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useUpdateTripMutation } from '../../api/tripApi';
import dayjs from 'dayjs';
import "../../styles/TripInfo.css"
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const activityOptions = ["Adventure", "Heritage", "Nightlife", "Relaxation", "Nature", "Culture"];
const travelModeOptions = ["Bike", "Car", "Flight", "Train", "Train&Road", "Flight&Road", "Custom"];
const travellingWithOptions = ["Solo", "Partner", "Friends", "Family"];

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const TripInfoDisplay = ({ trip }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();

    // When edit mode is activated, populate the form with the current trip data
    useEffect(() => {
        if (isEditing) {
            form.setFieldsValue({
                ...trip,
                dates: [dayjs(trip.start_date), dayjs(trip.end_date)],
            });
        }
    }, [isEditing, trip, form]);

    const handleSave = async (values) => {
        const payload = {
            ...values,
            start_date: values.dates[0].toISOString(),
            end_date: values.dates[1].toISOString(),
        };
        delete payload.dates;

        try {
            await updateTrip({ tripId: trip.trip_id, ...payload }).unwrap();
            message.success("Trip updated successfully!");
            setIsEditing(false);
        } catch (err) {
            message.error("Failed to update trip.");
        }
    };

    if (isEditing) {
        return (
            <div style={{ padding: '0 16px' }}>
                <Row align="middle" justify="center" style={{ marginBottom: 16 }}>
                    <Col>
                        <div className="location-text">
                            <strong>{trip.base_location}</strong>
                        </div>
                    </Col>
                    <Col>
                        <div className="arrow-animation">→</div>
                    </Col>
                    <Col>
                        <div className="location-text">
                            <strong>{trip.destination}</strong>
                        </div>
                    </Col>
                </Row>

                <Title level={5}>Edit Trip Details</Title>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="dates" label="Start & End Dates">
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="budget" label="Budget (INR)">
                                <InputNumber prefix="₹" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="num_people" label="Number of People">
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="travel_mode" label="Travel Mode">
                                <Select options={travelModeOptions.map(o => ({ label: o, value: o }))} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="travelling_with" label="Travelling With">
                                <Select options={travellingWithOptions.map(o => ({ label: o, value: o }))} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="activities" label="Activities">
                        <Checkbox.Group options={activityOptions} />
                    </Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={isUpdating} icon={<SaveOutlined />}>Save</Button>
                        <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                    </Space>
                </Form>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', paddingRight: '16px' }}>
            <Descriptions bordered column={1} layout="horizontal" size="small">
                <Descriptions.Item label={<><FlagOutlined /> Destination</>}><Text strong>{trip.destination}</Text></Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Base Location</>}><Text>{trip.base_location}</Text></Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Dates</>}><Tag color="blue">{formatDate(trip.start_date)}</Tag> to <Tag color="blue">{formatDate(trip.end_date)}</Tag></Descriptions.Item>
                <Descriptions.Item label={<><DollarOutlined /> Budget</>}><Text>₹{trip.budget.toLocaleString('en-IN')}</Text></Descriptions.Item>
                <Descriptions.Item label={<><CarOutlined /> Travel Mode</>}><Tag>{trip.travel_mode}</Tag></Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined /> People</>}><Text>{trip.num_people}</Text></Descriptions.Item>
                <Descriptions.Item label={<><SmileOutlined /> Travelling With</>}><Tag color="gold">{trip.travelling_with}</Tag></Descriptions.Item>
                <Descriptions.Item label={<><TagsOutlined /> Activities</>}><Space wrap>{trip.activities.map(act => <Tag key={act} color="purple">{act}</Tag>)}</Space></Descriptions.Item>
            </Descriptions>
            <Button
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                style={{ float: 'right', zIndex: 10 }}
            >
                Edit
            </Button>
        </div>
    );
};

export default TripInfoDisplay;

