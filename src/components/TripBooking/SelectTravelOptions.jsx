import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  Alert,
  Button,
  DatePicker,
  Form,
  Radio,
  Typography,
  Timeline,
  Tag,
  Space,
  message,
  Row,
  Col,
} from "antd";
import {
  ClockCircleOutlined,
  DollarCircleOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  useGetTravelOptionsQuery,
  useGenerateTravelOptionsMutation,
  useSaveSelectedTravelOptionMutation,
} from "../../api/bookingApi";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Helper to get travel mode icon
const getModeIcon = (mode) => {
  const lowerCaseMode = mode?.toLowerCase() || "";
  if (lowerCaseMode.includes("train"))
    return (
      <i
        className="fas fa-train"
        style={{ fontSize: "16px", color: "#1677ff" }}
      ></i>
    );
  if (lowerCaseMode.includes("flight"))
    return (
      <i
        className="fas fa-plane"
        style={{ fontSize: "16px", color: "#1677ff" }}
      ></i>
    );
  if (lowerCaseMode.includes("bus"))
    return (
      <i
        className="fas fa-bus"
        style={{ fontSize: "16px", color: "#1677ff" }}
      ></i>
    );
  return (
    <i
      className="fas fa-car"
      style={{ fontSize: "16px", color: "#1677ff" }}
    ></i>
  ); // Default to car
};

const SelectTravelOptions = ({ tripId, onComplete, setStatus }) => {
  const [form] = Form.useForm();
  const [selectedOptionName, setSelectedOptionName] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // State to control polling interval (0 = disabled, 5000 = every 5 seconds)
  const [pollingInterval, setPollingInterval] = useState(0);

  // 1. Fetch existing travel options
  // refetchOnMountOrArgChange: true ensures it fetches once on mount.
  // pollingInterval is dynamic based on our state.
  const {
    data: travelData,
    error: fetchError,
    isLoading: isLoadingFetch,
    refetch: refetchTravelOptions,
  } = useGetTravelOptionsQuery(tripId, {
    pollingInterval: pollingInterval,
    refetchOnMountOrArgChange: true,
    skip: false, // Always try to fetch on mount
  });

  // 2. Mutation hook to generate options
  const [generateTravelOptions, { isLoading: isGeneratingTravellingOptions }] =
    useGenerateTravelOptionsMutation();

  // 3. Mutation hook to save the selected option
  const [saveSelection, { isLoading: isSaving }] =
    useSaveSelectedTravelOptionMutation();

  // Determine the state based on API response
  const optionsAvailable =
    travelData?.data?.all_travel_options &&
    travelData?.data?.all_travel_options.length > 0;

  // Effect: Stop polling once data is available
  useEffect(() => {
    if (optionsAvailable) {
      if (pollingInterval > 0) {
        setPollingInterval(0); // Stop polling
        messageApi.success({
          content: "Travel options generated!",
          key: "genOpts",
        });
      }
    }
  }, [optionsAvailable, pollingInterval, messageApi]);

  // Pre-select radio button if an option was previously saved
  useEffect(() => {
    if (travelData?.data?.selected_travel_options) {
      setSelectedOptionName(
        travelData.data.selected_travel_options.option_name
      );
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

      // Start polling: The API is processing, so we check every 5 seconds
      setPollingInterval(5000);

      messageApi.loading({
        content: "Generating travel options... This may take a moment.",
        key: "genOpts",
        duration: 0,
      });
      // Polling in useGetTravelOptionsQuery will automatically pick up the results
      setStatus("process"); // Keep step status as 'processing'
    } catch (err) {
      messageApi.error(err.data?.message || "Failed to start generation.");
      setStatus("error");
      setPollingInterval(0); // Ensure polling is off on error
    }
  };

  // Handler for saving the selected travel option
  const handleSaveSelection = async () => {
    if (!selectedOptionName) {
      messageApi.warning("Please select a travel option.");
      return;
    }
    const selectedOption = travelData?.data.all_travel_options.find(
      (opt) => opt.option_name === selectedOptionName
    );
    if (!selectedOption) {
      messageApi.error("Selected option not found.");
      return;
    }

    const payload = {
      trip_id: parseInt(tripId),
      ...selectedOption,
    };

    try {
      await saveSelection(payload).unwrap();
      messageApi.success("Travel option saved!");
      onComplete(selectedOption); // Pass selected data and move to the next step
    } catch (err) {
      messageApi.error(err.data?.message || "Failed to save selection.");
      setStatus("error");
    }
  };

  // --- Render Logic ---

  // 1. If we are currently polling, show a loading spinner regardless of errors (usually 404s while waiting)
  if (pollingInterval > 0) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        {contextHolder}
        <Spin
          size="large"
          tip="AI is calculating best routes... Please wait."
        />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            Finding best routes for you
          </Text>
        </div>
      </div>
    );
  }

  // 2. Handle Errors (Only if not polling)
  if (fetchError) {
    // Handle specific "No options found" error vs. other fetch errors
    if (
      fetchError.status === 404 &&
      fetchError.data?.message?.includes("No travel options found")
    ) {
      // Show the generation form
      return (
        <Card>
          {contextHolder}
          <Title level={5}>Generate Travel Options</Title>
          <Paragraph type="secondary">
            Select your desired journey start and return dates to generate
            personalized travel options for your trip.
          </Paragraph>
          <Form form={form} layout="vertical" onFinish={handleGenerateSubmit}>
            <Form.Item
              name="dates"
              label="Select Journey Start & Return Dates"
              rules={[
                { required: true, message: "Please select journey dates!" },
              ]}
            >
              <RangePicker
                style={{ width: "100%" }}
                disabled={isGeneratingTravellingOptions}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isGeneratingTravellingOptions}
                block
              >
                Generate Options
              </Button>
            </Form.Item>
          </Form>
        </Card>
      );
    }
    // Handle other fetch errors
    return (
      <div>
        {contextHolder}
        <Alert
          message="Error"
          description="Could not fetch travel options."
          type="error"
          showIcon
          action={
            <Button
              icon={<ReloadOutlined />}
              size="small"
              type="text"
              onClick={refetchTravelOptions}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // Display available options
  if (optionsAvailable) {
    return (
      <div>
        {contextHolder}
        <Title level={5}>Select Your Preferred Travel Option</Title>
        <Radio.Group
          onChange={(e) => setSelectedOptionName(e.target.value)}
          value={selectedOptionName}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {travelData?.data.all_travel_options.map((option, index) => (
              <Card
                key={`${option.option_name}_${index}`}
                hoverable
                style={{
                  background:
                    selectedOptionName === option.option_name
                      ? "#e6f7ff"
                      : "#fff",
                }}
              >
                <Radio value={option.option_name}>
                  <Text strong>{option.option_name}</Text>
                </Radio>
                <Timeline style={{ marginTop: 16, marginLeft: 24 }}>
                  {option.legs.map((leg, index) => (
                    <Timeline.Item key={index} dot={getModeIcon(leg.mode)}>
                      <Paragraph strong style={{ margin: 0 }}>
                        {leg.from} ({leg.from_code || "N/A"}){" "}
                        <ArrowRightOutlined /> {leg.to} ({leg.to_code || "N/A"})
                      </Paragraph>
                      <Text type="secondary">
                        {new Date(leg.journey_date).toLocaleDateString()}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Space wrap size="small">
                          <Tag icon={getModeIcon(leg.mode)}>{leg.mode}</Tag>
                          <Tag icon={<DollarCircleOutlined />}>
                            {leg.approx_cost}
                          </Tag>
                          <Tag icon={<ClockCircleOutlined />}>
                            {leg.approx_time}
                          </Tag>
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

  // 4. Loading State (Initial Fetch)
  if (isLoadingFetch) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Fallback
  return <Alert message="Could not display travel options." type="warning" />;
};

export default SelectTravelOptions;
