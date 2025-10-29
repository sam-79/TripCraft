import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Button, DatePicker, Form, Radio, Typography, Timeline, Tag, Space, message, Row, Col } from 'antd';
import { ClockCircleOutlined, DollarCircleOutlined, ArrowRightOutlined, ReloadOutlined  } from '@ant-design/icons';
import { useGetTravelOptionsQuery, useGenerateTravelOptionsMutation, useSaveSelectedTravelOptionMutation } from '../../api/bookingApi';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Helper to get travel mode icon
const getModeIcon = (mode) => {
    const lowerCaseMode = mode?.toLowerCase() || '';
    if (lowerCaseMode.includes('train')) return <i className="fas fa-train" style={{ fontSize: '16px', color: '#1677ff' }}></i>;
    if (lowerCaseMode.includes('flight')) return <i className="fas fa-plane" style={{ fontSize: '16px', color: '#1677ff' }}></i>;
    if (lowerCaseMode.includes('bus')) return <i className="fas fa-bus" style={{ fontSize: '16px', color: '#1677ff' }}></i>;
    return <i className="fas fa-car" style={{ fontSize: '16px', color: '#1677ff' }}></i>; // Default to car
};

const SelectTravelOptions = ({ tripId, onComplete, setStatus }) => {
    const [form] = Form.useForm();
    const [selectedOptionName, setSelectedOptionName] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();

    // 1. Fetch existing travel options (with polling if generation is in progress)
    const { data: travelData, error: fetchError, isLoading: isLoadingFetch, refetch: refetchTravelOptions } = useGetTravelOptionsQuery(tripId, {
        // pollingInterval: 5000, // Poll every 5 seconds while waiting for generation
        // refetchOnMountOrArgChange: true,
    });

    // 2. Mutation hook to generate options

    const [generateTravelOptions, { data: travellingoptionsData, error: travellingOptionsError, isLoading: isGeneratingTravellingOptions }] = useGenerateTravelOptionsMutation();

    // 3. Mutation hook to save the selected option
    const [saveSelection, { isLoading: isSaving }] = useSaveSelectedTravelOptionMutation();

    // Determine the state based on API response
    const noOptionsFound = travelData?.data === null; // Specific check for the "No options found" case
    const optionsAvailable = travelData?.data.all_travel_options && travelData?.data.all_travel_options.length > 0;
    

    // Pre-select radio button if an option was previously saved
    useEffect(() => {
        if (travelData?.data.selected_travel_options) {
            setSelectedOptionName(travelData.data.selected_travel_options.option_name);
        }
    }, [travelData]);

    // Handler for the initial generation form
    const handleGenerateSubmit = async (values) => {
        const payload = {
            trip_id: parseInt(tripId),
            journey_start_date: values.dates[0].toISOString(),
            return_journey_date: values.dates[1].toISOString(),
        };
        try {
            await generateTravelOptions(payload).unwrap();
            messageApi.loading({ content: 'Generating travel options... Please wait.', key: 'genOpts' });
            // Polling in useGetTravelOptionsQuery will automatically pick up the results
            setStatus('process'); // Keep step status as 'processing'
        } catch (err) {
            messageApi.error(err.data?.message || 'Failed to start generation.');
            setStatus('error');
        }
    };

    // Handler for saving the selected travel option
    const handleSaveSelection = async () => {
        if (!selectedOptionName) {
            messageApi.warning('Please select a travel option.');
            return;
        }
        const selectedOption = travelData?.data.all_travel_options.find(opt => opt.option_name === selectedOptionName);
        if (!selectedOption) {
            messageApi.error('Selected option not found.');
            return;
        }

        const payload = {
            trip_id: parseInt(tripId),
            ...selectedOption,
        };

        try {
            await saveSelection(payload).unwrap();
            messageApi.success('Travel option saved!');
            onComplete(selectedOption); // Pass selected data and move to the next step
        } catch (err) {
            messageApi.error(err.data?.message || 'Failed to save selection.');
            setStatus('error');
        }
    };

    // --- Render Logic ---

    // if (travellingoptionsData?.data === null) {
    //     return (
    //         <div style={{ textAlign: 'center', padding: '50px' }}>
    //             <Spin
    //                 size="large"
    //                 tip={travellingoptionsData?.message || "Checking for travel options..."}
    //             />
    //             <div style={{ marginTop: '20px' }}>
    //                 <Button
    //                     icon={<ReloadOutlined />}
    //                     onClick={() => refetchTravelOptions()}
    //                     type="default"
    //                 >
    //                     Refresh
    //                 </Button>
    //             </div>
    //         </div>
    //     )
    // }

    if (fetchError) {
        // Handle specific "No options found" error vs. other fetch errors
        if (fetchError.status === 404 && fetchError.data?.message?.includes("No travel options found")) {
            // Show the generation form
            messageApi.error(fetchError.data?.message)
            return (
                <Card>
                    {contextHolder}
                    <Title level={5}>Generate Travel Options</Title>
                    <Paragraph type="secondary">Select your desired journey start and return dates to generate personalized travel options for your trip.</Paragraph>
                    <Form form={form} layout="vertical" onFinish={handleGenerateSubmit}>
                        <Form.Item
                            name="dates"
                            label="Select Journey Start & Return Dates"
                            rules={[{ required: true, message: 'Please select journey dates!' }]}
                        >
                            <RangePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={isGeneratingTravellingOptions} block>
                                Generate Options
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            );
        }
        // Handle other fetch errors
        return <Alert message="Error" description="Could not fetch travel options." type="error" showIcon />;
    }

    // Handle the case where generation is triggered but results aren't ready yet (polling)
    // if (!optionsAvailable && !noOptionsFound) {
    //     return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Generating travel options... This might take a moment." /></div>;
    // }

    // Display available options
    if (optionsAvailable) {
        return (
            <div>
                {contextHolder}
                <Title level={5}>Select Your Preferred Travel Option</Title>
                <Radio.Group
                    onChange={(e) => setSelectedOptionName(e.target.value)}
                    value={selectedOptionName}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {travelData?.data.all_travel_options.map((option, index) => (
                            <Card key={`${option.option_name}_${index}`} hoverable style={{ background: selectedOptionName === option.option_name ? '#e6f7ff' : '#fff' }}>
                                <Radio value={option.option_name}>
                                    <Text strong>{option.option_name}</Text>
                                </Radio>
                                <Timeline style={{ marginTop: 16, marginLeft: 24 }}>
                                    {option.legs.map((leg, index) => (
                                        <Timeline.Item key={index} dot={getModeIcon(leg.mode)}>
                                            <Paragraph strong style={{ margin: 0 }}>{leg.from} ({leg.from_code || 'N/A'}) <ArrowRightOutlined /> {leg.to} ({leg.to_code || 'N/A'})</Paragraph>
                                            <Text type="secondary">{new Date(leg.journey_date).toLocaleDateString()}</Text>
                                            <div style={{ marginTop: 4 }}>
                                                <Space wrap size="small">
                                                    <Tag icon={getModeIcon(leg.mode)}>{leg.mode}</Tag>
                                                    <Tag icon={<DollarCircleOutlined />}>{leg.approx_cost}</Tag>
                                                    <Tag icon={<ClockCircleOutlined />}>{leg.approx_time}</Tag>
                                                </Space>
                                            </div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </Card>
                        ))}
                    </Space>
                </Radio.Group>
                <Button
                    type="primary"
                    onClick={handleSaveSelection}
                    loading={isSaving}
                    disabled={!selectedOptionName}
                    style={{ marginTop: 24 }}
                    block
                >
                    Confirm Selection & Proceed
                </Button>
            </div>
        );
    }

    // Fallback if data structure is unexpected
    return <Alert message="Could not display travel options." type="warning" />;
};

export default SelectTravelOptions;
