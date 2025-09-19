import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber, Row, Col, AutoComplete, Divider, Checkbox, Typography } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { fetchPlaceSuggestions } from '../../utils/utils';
const { RangePicker } = DatePicker;
const { Text } = Typography;
import { useGetEnumsQuery } from "../../api/enumsApi";
import { all_enums } from '../../constants/contants';
import LoadingAnimationOverlay from '../LoadingAnimation';


const TripForm = ({ onSubmit, defaultPreferences, isAddingTrip = { isAddingTrip } }) => {
    const [form] = Form.useForm();
    const [destinationOptions, setDestinationOptions] = useState([]);
    const [baseLocationOptions, setBaseLocationOptions] = useState([]);
    const debouncedSearch = useCallback(debounce(fetchPlaceSuggestions, 300), []);

    const { data: enums, isLoading, isError } = useGetEnumsQuery();

    useEffect(() => {
        if (defaultPreferences) {
            const formValues = {
                budget: defaultPreferences.default_budget,
                num_people: defaultPreferences.num_people,
                base_location: defaultPreferences.base_location,
                activities: defaultPreferences.activities,
                travel_mode: defaultPreferences.travel_mode,
                travelling_with: defaultPreferences.travelling_with,
                property_type: defaultPreferences.property_type,
                hotel_room_price_per_night: defaultPreferences.hotel_room_price_per_night,
                food_preference: defaultPreferences.food_preference,
            };
            const cleanedValues = Object.fromEntries(Object.entries(formValues).filter(([_, v]) => v != null));
            form.setFieldsValue(cleanedValues);
        }
    }, [defaultPreferences, form]);

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
            activities: values.activities,
            travelling_with: values.travelling_with,
            property_type: values.property_type,
            hotel_room_price_per_night: values.hotel_room_price_per_night,
            food_preference: values.food_preference,
        };
        onSubmit(payload);
    };

    if (isLoading) {
        return <LoadingAnimationOverlay text={"Loading Form"} />
    }

    const propertyTypeOptions = enums?.data.property_types || [];
    const foodPreferenceOptions = enums?.data.food_preferences || all_enums.food_preferences;
    const travelModeOptions = enums?.data.travel_mode || all_enums.travel_modes;
    const activityOptions = enums?.data.activities || all_enums.activities;
    const travellingWithOptions = enums?.data.travelling_with || all_enums.travelling_with;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="trip_name" label="Trip Name *" rules={[{ required: true, message: 'Please give your trip a name!' }]}>
                    <Input placeholder="e.g., Goa Beach Getaway" />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="base_location" label="Starting From *" rules={[{ required: true }]}>
                            <AutoComplete options={baseLocationOptions} onSearch={(text) => debouncedSearch(text, setBaseLocationOptions)} placeholder="e.g., Nagpur" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="destination" label="Destination *" rules={[{ required: true }]}>
                            <AutoComplete options={destinationOptions} onSearch={(text) => debouncedSearch(text, setDestinationOptions)} placeholder="e.g., Rishikesh" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    name="dates"
                    label="Travel Dates *"
                    rules={[{ required: true, message: 'Please select your travel dates.' }]}
                >
                    <RangePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().endOf('day')} />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    Note: Please select only the dates you will be at the destination. Do not include travel days to or from the location.
                </Text>
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
                        <Form.Item name="travelling_with" label="Travelling With *" rules={[{ required: true }]}>
                            <Select placeholder="Select group" options={travellingWithOptions.map(o => ({ label: o, value: o }))} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16} >
                    <Col>
                        <Form.Item name="activities" label="Preferred Activities">
                            <Checkbox.Group options={activityOptions} />
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
                    <Button type="primary" htmlType="submit" loading={isAddingTrip} block size="large">
                        Create Trip & Start Planning
                    </Button>
                </Form.Item>
            </Form>
        </motion.div>
    );
};

export default TripForm;

