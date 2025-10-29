import React from 'react';
import {
    Layout,
    Typography,
    Spin,
    Alert,
    Empty,
    Card,
    Table,
    Tag,
    Button,
    Row,
    Col
} from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useShowPaymentHistoryQuery } from '../../api/searchApi'; // Adjust path if needed

const { Title, Text } = Typography;
const { Content } = Layout;

// --- Helper Functions ---
const formatCurrency = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;
const formatDateTime = (dateStr) => dateStr ? dayjs(dateStr).format('DD MMM YYYY, HH:mm') : 'N/A';

const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
        case 'SUCCESS':
        case 'COMPLETED':
        case 'PAID':
            return 'success';
        case 'PENDING':
            return 'processing';
        case 'FAILED':
        case 'CANCELLED':
            return 'error';
        default:
            return 'default';
    }
};

// --- Main Payment History Component ---
const PaymentHistory = () => {
    const { data: paymentData, error, isLoading, refetch } = useShowPaymentHistoryQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const columns = [
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => formatDateTime(text),
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Booking Type',
            dataIndex: 'booking_type',
            key: 'booking_type',
            filters: [ // Auto-generate filters based on data if needed, or define common types
                { text: 'Hotel', value: 'Hotel' },
                { text: 'Train', value: 'Train' },
                { text: 'Bus', value: 'Bus' },
                { text: 'Flight', value: 'Flight' },
            ],
            onFilter: (value, record) => record.booking_type.indexOf(value) === 0,
            render: (type) => <Tag>{type || 'N/A'}</Tag>,
        },
        {
            title: 'Trip ID',
            dataIndex: 'trip_id',
            key: 'trip_id',
            render: (id) => id || '-',
        },
        {
            title: 'Booking ID',
            dataIndex: 'booking_id',
            key: 'booking_id',
            render: (id) => id || '-',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, record) => formatCurrency(text),
            align: 'right',
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Success', value: 'SUCCESS' },
                { text: 'Pending', value: 'PENDING' },
                { text: 'Failed', value: 'FAILED' },
            ],
            onFilter: (value, record) => record.status.toUpperCase() === value.toUpperCase(),
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase() || 'UNKNOWN'}
                </Tag>
            ),
        },
        {
            title: 'Payment ID',
            dataIndex: 'stripe_payment_intent_id',
            key: 'stripe_payment_intent_id',
            ellipsis: true, // Shorten long IDs
            render: (id) => id || '-',
        },
    ];


    const renderContent = () => {
        if (isLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" tip="Loading payment history..." />
                </div>
            );
        }

        if (error) {
            return (
                <Alert
                    message="Error Loading Payments"
                    description={error.data?.message || error.error || "Could not fetch payment history. Please try again."}
                    type="error"
                    showIcon
                    action={<Button size="small" danger onClick={refetch}>Retry</Button>}
                />
            );
        }

        if (!paymentData || !paymentData.data || paymentData.count === 0) {
            return (
                <Card style={{ marginTop: 24 }}>
                    <Empty description="No payment history found." />
                </Card>
            );
        }

        return (
            <Card style={{ marginTop: 24 }}>
                <Table
                    columns={columns}
                    dataSource={paymentData.data.map(item => ({ ...item, key: item.payment_id }))} // Add key for React list rendering
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }} // Enable horizontal scroll on smaller screens
                />
            </Card>
        );
    };


    return (
        <Content style={{ padding: '24px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Payment History</Title>
                    </Col>
                    {/* Add any filters or actions if needed */}
                </Row>
                {renderContent()}
            </motion.div>
        </Content>
    );
};

export default PaymentHistory;
