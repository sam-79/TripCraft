import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber, Row, Col, AutoComplete, Divider } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { fetchPlaceSuggestions } from "../../utils/utils"
const { RangePicker } = DatePicker;


const propertyTypeOptions = ["Hotel", "Homestay", "Villa", "Cottage", "Apartment", "Resort", "Hostel", "Camp", "Guest House", "Tree House", "Palace", "Farm House", "Airbnb"];
const foodPreferenceOptions = ["Veg", "Non-Veg", "Vegan", "Anything"];
const travelModeOptions = ["Train", "Flight", "Car", "Bike", "Train&Road", "Flight&Road", "Custom"];
const activityOptions = ["Adventure", "Heritage", "Nightlife", "Relaxation", "Nature", "Culture"];
const travellingWithOptions = ["Friends", "Family", "Solo", "Partner"];

const TripForm = ({ onSubmit, preferences, isLoading }) => {
    const [form] = Form.useForm();
    const [destinationOptions, setDestinationOptions] = useState([]);
    const [baseLocationOptions, setBaseLocationOptions] = useState([]);

    const debouncedSearch = useCallback(debounce(fetchPlaceSuggestions, 300), []);

    useEffect(() => {
        if (preferences) {
            const formValues = {
                budget: preferences.default_budget,
                num_people: preferences.num_people,
                base_location: preferences.base_location,
                activity: preferences.activities?.[0],
                travel_mode: preferences.travel_mode,
                travelling_with: preferences.travelling_with,
                // Add all other preference fields here
                property_type: preferences.property_type,
                hotel_room_price_per_night: preferences.hotel_room_price_per_night,
                food_preference: preferences.food_preference,
            };
            const cleanedValues = Object.fromEntries(Object.entries(formValues).filter(([_, v]) => v != null));
            form.setFieldsValue(cleanedValues);
        }
    }, [preferences, form]);

    const onFinish = (values) => {
        // Construct the payload with ONLY the fields the /trips/create endpoint expects
        const payload = {
            trip_name: values.trip_name,
            destination: values.destination,
            base_location: values.base_location,
            start_date: values.dates[0].toISOString(),
            end_date: values.dates[1].toISOString(),
            budget: values.budget,
            num_people: values.num_people,
            travel_mode: values.travel_mode,
            activity: values.activity,
            travelling_with: values.travelling_with,
        };
        onSubmit(payload);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="trip_name" label="Trip Name *" rules={[{ required: true, message: 'Please give your trip a name!' }]}>
                    <Input placeholder="e.g., Goa Beach Getaway" />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="destination" label="Destination *" rules={[{ required: true }]}>
                            <AutoComplete options={destinationOptions} onSearch={(text) => debouncedSearch(text, setDestinationOptions)} placeholder="e.g., Rishikesh" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="base_location" label="Starting From *" rules={[{ required: true }]}>
                            <AutoComplete options={baseLocationOptions} onSearch={(text) => debouncedSearch(text, setBaseLocationOptions)} placeholder="e.g., Nagpur" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="dates" label="Start & End Dates *" rules={[{ required: true }]}>
                    <RangePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().endOf('day')} />
                </Form.Item>
                <Divider>Trip Details</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="budget" label="Budget (per person) *" rules={[{ required: true }]}>
                            <InputNumber prefix="₹" style={{ width: '100%' }} min={0} placeholder="e.g., 15000" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="num_people" label="Number of People *" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="travel_mode" label="Travel Mode *" rules={[{ required: true }]}>
                            <Select placeholder="Select mode" options={travelModeOptions.map(o => ({ label: o, value: o }))} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="activity" label="Activity Type *" rules={[{ required: true }]}>
                            <Select placeholder="Select activity" options={activityOptions.map(o => ({ label: o, value: o }))} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="travelling_with" label="Travelling With *" rules={[{ required: true }]}>
                            <Select placeholder="Select group" options={travellingWithOptions.map(o => ({ label: o, value: o }))} />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider>Stay & Food Preferences</Divider>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="property_type" label="Preferred Property">
                            <Select placeholder="Any" options={propertyTypeOptions.map(o => ({ label: o, value: o }))} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="hotel_room_price_per_night" label="Max Hotel Price/Night">
                            <InputNumber prefix="₹" style={{ width: '100%' }} min={0} placeholder="Any" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="food_preference" label="Food Preference">
                            <Select placeholder="Anything" options={foodPreferenceOptions.map(o => ({ label: o, value: o }))} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item style={{ marginTop: '24px' }}>
                    <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
                        Create Trip & Start Planning
                    </Button>
                </Form.Item>
            </Form>
        </motion.div>
    );
};

export default TripForm;

