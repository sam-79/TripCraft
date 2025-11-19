import { Card, Row, Col, Table, Statistic, Typography, Space, Tag, Empty, List, Divider, Tooltip, Button  } from "antd";
import { motion } from "framer-motion";
import { StarFilled, ThunderboltOutlined, DollarCircleOutlined, BarChartOutlined, RiseOutlined, PlusOutlined, MinusCircleOutlined, } from "@ant-design/icons";
const { Text, Title } = Typography;

const formatCurrency = (num) => (num ? `₹${parseFloat(num).toLocaleString()}` : "N/A");

const BusAnalysisSection = ({ analysis, bookingList, onAddToBooking }) => {
    if (!analysis || !analysis.summary) {
        return <Empty description="Detailed bus analysis not available for this leg." />;
    }

    const { route_info, summary, fare_analysis, cheapest_buses, fastest_buses, highest_rated, best_discounts, operators } = analysis;

    const actionColumn = {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => {
            // Create a unique ID for the bus record
            const id = `bus-${record.operator}-${record.departure}-${record.fare}`;
            const isAdded = bookingList.some(item => item.id === id);

            const bookingItem = {
                ...record,
                id, // Add the unique ID
                type: 'bus', // Add the type for easier identification
                name: record.operator, // Standardize the 'name' field
            };

            return (
                <Tooltip title={isAdded ? 'Remove from list' : 'Add to list'}>
                    <Button 
                        type={isAdded ? 'default' : 'primary'}
                        ghost={!isAdded}
                        danger={isAdded}
                        size="small"
                        icon={isAdded ? <MinusCircleOutlined /> : <PlusOutlined />}
                        onClick={() => onAddToBooking(bookingItem)}
                    >
                        {isAdded ? 'Remove' : 'Add'}
                    </Button>
                </Tooltip>
            );
        },
    };

    // --- Common Bus Table Columns ---
    const columns = [
        {
            title: "Operator",
            dataIndex: "operator",
            key: "operator",
            render: (text) => <Text strong>{text}</Text>,
        },
        { title: "Type", dataIndex: "type", key: "type" },
        { title: "Departure", dataIndex: "departure", key: "departure", align: "center" },
        { title: "Duration", dataIndex: "duration", key: "duration", align: "center" },
        {
            title: "Fare",
            dataIndex: "fare",
            key: "fare",
            align: "right",
            render: (fare) => <Text strong>{formatCurrency(fare)}</Text>,
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            align: "center",
            render: (rating) =>
                rating ? <Tag icon={<StarFilled />} color="gold">{rating}</Tag> : <Text type="secondary">N/A</Text>,
        },
        // {
        //     title: "Seats",
        //     dataIndex: "seats",
        //     key: "seats",
        //     align: "center",
        //     render: (seats) => <Tag color="blue">{seats || "N/A"}</Tag>,
        // },
        actionColumn,
    ];

    // --- Operator Stats Table ---
    const operatorData = Object.entries(operators || {}).map(([name, data]) => ({
        key: name,
        operator: name,
        ...data,
    }));

    const operatorColumns = [
        { title: "Operator", dataIndex: "operator", key: "operator" },
        { title: "Total Buses", dataIndex: "count", key: "count", align: "center" },
        { title: "Avg Fare", dataIndex: "avg_fare", key: "avg_fare", align: "right", render: formatCurrency },
        { title: "Total Fare", dataIndex: "total_fare", key: "total_fare", align: "right", render: formatCurrency },
    ];

    // --- Best Discounts Table ---
    const discountColumns = [
        { title: "Operator", dataIndex: "operator", key: "operator" },
        { title: "Type", dataIndex: "type", key: "type" },
        { title: "Original Price", dataIndex: "original_price", key: "original_price", render: formatCurrency },
        { title: "Final Fare", dataIndex: "final_fare", key: "final_fare", render: formatCurrency },
        { title: "Savings", dataIndex: "savings", key: "savings", render: (val) => <Tag color="green">Saved ₹{val}</Tag> },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* --- Route Info --- */}
            {route_info && (
                <Card style={{ marginBottom: 24 }}>
                    <Title level={4}>🧭 Route Information</Title>
                    <Text strong>From:</Text> {route_info.source} <br />
                    <Text strong>To:</Text> {route_info.destination} <br />
                    <Text strong>Date:</Text> {route_info.journey_date}
                </Card>
            )}

            {/* --- Summary Stats --- */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false}>
                        <Statistic title="Total Buses" value={summary.total_buses} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false}>
                        <Statistic title="AC / Non-AC" value={`${summary.ac_buses} / ${summary.non_ac_buses}`} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false}>
                        <Statistic title="Avg. Fare" value={formatCurrency(fare_analysis?.average_fare_overall)} prefix={<DollarCircleOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false}>
                        <Statistic title="Fare Range" value={fare_analysis?.price_range} />
                    </Card>
                </Col>
            </Row>

            {/* --- Cheapest Buses --- */}
            <Divider />
            <Title level={4}><DollarCircleOutlined /> Cheapest Buses</Title>
            <Table columns={columns} dataSource={cheapest_buses?.map((b, i) => ({ ...b, key: `cheap-${i}` }))} pagination={false} size="small" />

            {/* --- Fastest Buses --- */}
            <Divider />
            <Title level={4}><ThunderboltOutlined /> Fastest Buses</Title>
            <Table columns={columns} dataSource={fastest_buses?.map((b, i) => ({ ...b, key: `fast-${i}` }))} pagination={false} size="small" />

            {/* --- Highest Rated Buses --- */}
            <Divider />
            <Title level={4}><StarFilled style={{ color: "gold" }} /> Highest Rated Buses</Title>
            <Table columns={columns} dataSource={highest_rated?.map((b, i) => ({ ...b, key: `rated-${i}` }))} pagination={false} size="small" />

            {/* --- Best Discounts --- */}
            <Divider />
            <Title level={4}><RiseOutlined /> Best Discounts</Title>
            <Table columns={discountColumns} dataSource={best_discounts?.map((b, i) => ({ ...b, key: `disc-${i}` }))} pagination={false} size="small" />

            {/* --- Operator Statistics --- */}
            <Divider />
            <Title level={4}><BarChartOutlined /> Operator Statistics</Title>
            <Table columns={operatorColumns} dataSource={operatorData} pagination={false} size="small" />
        </motion.div>
    );
};

export default BusAnalysisSection;
