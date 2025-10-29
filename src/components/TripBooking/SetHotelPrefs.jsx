import React from "react";
import {
  Form,
  InputNumber,
  Checkbox,
  Button,
  Typography,
  Space,
  message,
  Row,
  Col,
} from "antd";
import {
  HomeOutlined,
  DollarCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useSetHotelPreferencesMutation } from "../../api/bookingApi"; // Make sure this hook exists in bookingApi.js

import { useGetEnumsQuery } from "../../api/enumsApi";


const { Title, Paragraph } = Typography;

// Property type options provided in the prompt
const propertyTypeOptions = [
  "Hotel",
  "Homestay",
  "Villa",
  "Cottage",
  "Apartment",
  "Resort",
  "Hostel",
  "Camp",
  "Guest House",
  "Tree House",
  "Palace",
  "Farm House",
  "Airbnb",
];

const SetHotelPrefs = ({ tripId, onComplete, setStatus }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: enums, isLoading: isEnumLoading, isError } = useGetEnumsQuery();

  // const propertyTypeOptions = enums?.property_types || []

  // Mutation hook to set/update hotel preferences
  const [setPreferences, { isLoading }] = useSetHotelPreferencesMutation();

  // Handler for form submission
  const handleFinish = async (values) => {
    const payload = {
      trip_id: parseInt(tripId),
      ...values,
    };
    try {
      const result = await setPreferences(payload).unwrap();
      messageApi.success(result.message || "Hotel preferences saved!");
      setStatus("finish"); // Mark step as finished
      onComplete(result.data); // Pass data (optional) and proceed to next step
    } catch (err) {
      messageApi.error(
        err.data?.message || "Failed to save hotel preferences."
      );
      setStatus("error"); // Mark step as error
    }
  };

  return (
    <div>
      {contextHolder}
      <Title level={4}>Set Your Hotel Preferences</Title>
      <Paragraph type="secondary">
        Tell us your preferences for accommodation so we can find the best
        options for your stay.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          // Sensible defaults
          no_of_rooms: 1,
          no_of_child: 0,
          min_price: 500,
          max_price: 5000,
          selected_property_types: ["Hotel"], // Default to Hotel
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="no_of_rooms"
              label={
                <Space>
                  <HomeOutlined />
                  Number of Rooms
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter the number of rooms!",
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="no_of_child"
              label={
                <Space>
                  <TeamOutlined />
                  Number of Children
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter the number of children (0 if none)!",
                },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="min_price"
              label={
                <Space>
                  <DollarCircleOutlined />
                  Min Price per Night (INR)
                </Space>
              }
              rules={[
                { required: true, message: "Please enter a minimum price!" },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="max_price"
              label={
                <Space>
                  <DollarCircleOutlined />
                  Max Price per Night (INR)
                </Space>
              }
              rules={[
                { required: true, message: "Please enter a maximum price!" },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {
          isEnumLoading ? <Spin
            size="large"
            tip={"Loading property types ..."}
          /> :
            <Form.Item
              name="selected_property_types"
              label="Preferred Property Types"
              rules={[
                {
                  required: true,
                  message: "Please select at least one property type!",
                },
              ]}
            >
              <Checkbox.Group options={propertyTypeOptions} />
            </Form.Item>}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Save Preferences & Find Hotels
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SetHotelPrefs;
