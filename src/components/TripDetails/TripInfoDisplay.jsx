import React, { useState, useEffect } from "react";
import {
    Typography,
    Descriptions,
    Tag,
    Space,
    Button,
    Form,
    InputNumber,
    DatePicker,
    Select,
    Checkbox,
    message,
    Row,
    Col,
    Card,
    Statistic,
    Divider,
    Carousel,
    Image,
    Skeleton,
} from "antd";
import {
    EnvironmentOutlined,
    CalendarOutlined,
    DollarOutlined,
    UserOutlined,
    SmileOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    CompassOutlined,
    CameraOutlined,
    ReadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "../../styles/TripInfo.css";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateTripMutation } from "../../api/tripApi";
import { useGetEnumsQuery } from "../../api/enumsApi";
import { all_enums } from "../../constants/contants";

const { Text, Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

// --- Styled Components / Motion Wrappers ---
const MotionCard = motion.create(Card);

const StatCard = ({ icon, label, value, color }) => (
    <MotionCard
        bordered={false}
        bodyStyle={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}
        style={{ borderRadius: 12, height: "100%" }}
    >
        <div
            style={{
                background: color,
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 18,
            }}
        >
            {icon}
        </div>
        <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
                {label}
            </Text>
            <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>
                {value}
            </div>
        </div>
    </MotionCard>
);

const TripInfoDisplay = ({ trip }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();
    const { t } = useTranslation();
    const { data: enums } = useGetEnumsQuery();
    const allenums = enums?.data || all_enums


    // Derived Data for Summaries
    const itineraryCount = trip?.itineraries?.length || 0;
    const placesCount = trip?.tourist_places_list?.length || 0;
    const hasRichData = itineraryCount > 0 || placesCount > 0;

    // Image handling
    const heroImages =
        trip?.destination_image_url && trip.destination_image_url.length > 0
            ? trip.destination_image_url
            : [];

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
            message.success(t("trip_update_success"));
            setIsEditing(false);
        } catch (err) {
            message.error(t("trip_update_error"));
        }
    };

    // --- EDIT MODE VIEW ---
    if (isEditing) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: 16,
                    // background: "#fff",
                    borderRadius: 16,
                    border: "1px solid #eee",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 24,
                    }}
                >
                    <Title level={4} style={{ margin: 0 }}>
                        {t("edit_trip_details")}
                    </Title>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => setIsEditing(false)}
                    />
                </div>

                <Title level={5}>{t('edit_trip_details')}</Title>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="dates"
                        label={t("dates")}
                        rules={[{ required: true }]}
                    >
                        <RangePicker style={{ width: "100%" }} size="large" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="budget"
                                label={t("budget")}
                                rules={[{ required: true }]}
                            >
                                <InputNumber
                                    prefix="₹"
                                    style={{ width: "100%" }}
                                    size="large"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="num_people"
                                label={t("number_of_people")}
                                rules={[{ required: true }]}
                            >
                                <InputNumber style={{ width: "100%" }} min={1} size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="travelling_with" label={t("travelling_with")}>
                        <Select
                            size="large"
                            options={allenums.travelling_with.map((o) => ({
                                label: o,
                                value: o,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item name="activities" label={t("activities")}>
                        <Checkbox.Group
                            style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                            {allenums.activities.map((opt) => (
                                <Col key={opt} span={11}>
                                    <Checkbox value={opt}>{opt}</Checkbox>
                                </Col>
                            ))}
                        </Checkbox.Group>
                    </Form.Item>

                    <Divider />

                    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button size="large" onClick={() => setIsEditing(false)}>
                            {t("cancel")}
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={isUpdating}
                            icon={<SaveOutlined />}
                        >
                            {t("save")}
                        </Button>
                    </Space>
                </Form>
            </motion.div>
        );
    }

    // --- VIEW MODE ---
    return (
        <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>

            {/* 1. Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
            >
                {heroImages.length > 0 ? (
                    <Carousel arrows
                        pauseOnFocus
                        lazyLoad
                        autoplay
                        dotPosition="bottom"
                        effect="fade">
                        {heroImages.map((src, idx) => (
                            <div key={idx} style={{ height: 200 }}>
                                <div
                                    style={{
                                        height: 200,
                                        backgroundImage: `url(${src})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        position: "relative",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background:
                                                "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </Carousel>
                ) : (
                    <div
                        style={{
                            height: 120,
                            background: "linear-gradient(135deg, #1890ff 0%, #001529 100%)",
                        }}
                    />
                )}

                {/* Floating Edit Button */}
                <Button
                    shape="circle"
                    icon={<EditOutlined />}
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 10,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                    onClick={() => setIsEditing(true)}
                />

                {/* Destination Title Overlay */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 16,
                        left: 16,
                        right: 16,
                        color: "white",
                    }}
                >
                    <Tag
                        color="gold"
                        style={{ border: "none", color: "#333", fontWeight: 600 }}
                    >
                        {trip.trip_name || `${t('upcoming')} ${'trip'}`}
                    </Tag>
                    <Title level={3} style={{ color: "white", margin: "4px 0 0" }}>
                        {trip.destination_full_name || trip.destination}
                    </Title>
                    <Space size={4} style={{ opacity: 0.9, fontSize: 13 }}>
                        <CalendarOutlined /> {formatDate(trip.start_date)} -{" "}
                        {formatDate(trip.end_date)}
                    </Space>
                </div>
            </motion.div>

            {/* 2. Key Stats Grid */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                <Col span={12}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <StatCard
                            icon={<DollarOutlined />}
                            color="#52c41a"
                            label={t("budget")}
                            value={`₹${trip.budget?.toLocaleString("en-IN")}`}
                        />
                    </motion.div>
                </Col>
                <Col span={12}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <StatCard
                            icon={<UserOutlined />}
                            color="#1890ff"
                            label="Travelers"
                            value={`${trip.num_people} (${trip.travelling_with})`}
                        />
                    </motion.div>
                </Col>
                <Col span={24}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <StatCard
                            icon={<EnvironmentOutlined />}
                            color="#faad14"
                            label="Starting From"
                            value={trip.base_location}
                        />
                    </motion.div>
                </Col>
            </Row>

            {/* 3. Vibe / Activities */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ marginBottom: 20 }}
            >
                <Text
                    strong
                    style={{
                        display: "block",
                        marginBottom: 8,
                        color: "#8c8c8c",
                        textTransform: "uppercase",
                        fontSize: 12,
                    }}
                >
                    {t("activities")}
                </Text>
                <Space wrap size={[8, 8]}>
                    {trip.activities.map((act, i) => (
                        <Tag
                            key={act}
                            color="geekblue"
                            style={{
                                padding: "4px 10px",
                                borderRadius: 20,
                                fontSize: 13,
                                margin: 0,
                                border: "none",
                                // background: "#f0f5ff",
                                color: "#1d39c4",
                            }}
                        >
                            #{act}
                        </Tag>
                    ))}
                </Space>
            </motion.div>

            {/* 4. Rich Data Summary (Conditional) */}
            <AnimatePresence>
                {hasRichData && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Divider style={{ margin: "12px 0" }} />
                        <Text
                            strong
                            style={{
                                display: "block",
                                marginBottom: 12,
                                color: "#8c8c8c",
                                textTransform: "uppercase",
                                fontSize: 12,
                            }}
                        >
                            {t('trip')} {t('highlights')}
                        </Text>

                        <Row gutter={[12, 12]}>
                            {/* Itinerary Summary */}
                            {itineraryCount > 0 && (
                                <Col span={12}>
                                    <MotionCard
                                        size="small"
                                        style={{
                                            borderRadius: 12,
                                            textAlign: "center",
                                            borderColor: "#d9d9d9",
                                        }}
                                    >
                                        <Statistic
                                            title="Itinerary"
                                            value={itineraryCount}
                                            suffix="Days"
                                            valueStyle={{
                                                fontSize: 20,
                                                fontWeight: 700,
                                                color: "#722ed1",
                                            }}
                                            prefix={<ReadOutlined style={{ marginRight: 4 }} />}
                                        />
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {t('fully_planned')}
                                        </Text>
                                    </MotionCard>
                                </Col>
                            )}

                            {/* Places Summary */}
                            {placesCount > 0 && (
                                <Col span={12}>
                                    <Card
                                        size="small"
                                        style={{
                                            borderRadius: 12,
                                            textAlign: "center",
                                            borderColor: "#d9d9d9",
                                        }}
                                    >
                                        <Statistic
                                            title="Exploration"
                                            value={placesCount}
                                            suffix="Spots"
                                            valueStyle={{
                                                fontSize: 20,
                                                fontWeight: 700,
                                                color: "#eb2f96",
                                            }}
                                            prefix={<CameraOutlined style={{ marginRight: 4 }} />}
                                        />
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {t('to_visit')}
                                        </Text>
                                    </Card>
                                </Col>
                            )}
                        </Row>

                        {/* Description Snippet (If available) */}
                        {trip.destination_details && (
                            <div
                                style={{
                                    marginTop: 16,
                                    // background: "#fafafa",
                                    padding: 12,
                                    borderRadius: 8,
                                }}
                            >
                                <Paragraph
                                    style={{ marginTop: 12, minHeight: 44, fontSize: 13, fontStyle: "italic" }}
                                    ellipsis={{
                                        rows: 2,
                                        expandable: "collapsible",
                                    }}
                                >
                                    {trip.destination_details}
                                </Paragraph>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!hasRichData && (
                <div style={{ marginTop: 24, textAlign: "center", opacity: 0.6 }}>
                    <CompassOutlined
                        style={{ fontSize: 24, marginBottom: 8, color: "#d9d9d9" }}
                    />
                    <p style={{ fontSize: 12, color: "#999" }}>
                        {t('detailed_itinerary_generating')}...
                    </p>
                </div>
            )}
        </div>
    );
};

export default TripInfoDisplay;
