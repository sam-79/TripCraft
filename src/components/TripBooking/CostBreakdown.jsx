import React, { useEffect, useState, useMemo } from 'react';
import { Spin, Alert, Typography, Card, Row, Col, Statistic, Button, Divider, Table, Tag, Space, Segmented } from 'antd';
import { DollarCircleOutlined, CarOutlined, HomeOutlined, ShoppingOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useGetCostBreakdownQuery } from '../../api/bookingApi';
import { motion } from 'framer-motion'; // For animations

const { Title, Text, Paragraph } = Typography;

// Helper to get an icon based on expense type
const getExpenseIcon = (type) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType?.includes('travel')) return <CarOutlined style={{ color: '#1890ff' }} />;
    if (lowerType?.includes('hotel')) return <HomeOutlined style={{ color: '#52c41a' }} />;
    if (lowerType?.includes('itinerary')) return <ShoppingOutlined style={{ color: '#faad14' }} />;
    return <DollarCircleOutlined />;
};

// Helper to format currency
const formatCurrency = (amount) => `₹ ${amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;

const CostBreakdown = ({ tripId, onComplete, setStatus }) => {
    // --- State for filtering ---
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Fetch the cost breakdown data
    const { data: costData, error, isLoading, isFetching } = useGetCostBreakdownQuery(tripId, {
        pollingInterval: 5000, // Poll if breakdown is generated asynchronously
        refetchOnMountOrArgChange: false,
    });

    useEffect(() => {
        if (error) {
            setStatus('error');
        } else if (costData && costData?.data.expenses) { // Check if expenses data is present
            setStatus('finish'); // Mark step as finished once data arrives
        } else if (costData && !costData.status) { // Check if backend status is false
            setStatus('error'); // If backend explicitly says status is false
        }
        else {
            setStatus('process');
        }
    }, [costData, error, setStatus]);

    // --- Filter logic ---
    const filteredExpenses = useMemo(() => {
        if (!costData?.data.expenses) return [];
        if (selectedCategory === 'All') {
            return costData?.data.expenses;
        }
        return costData?.data.expenses.filter(expense => expense.expense_type === selectedCategory);
    }, [costData, selectedCategory]);

    // Dynamically get unique expense types for filter options
    const expenseTypes = useMemo(() => {
        if (!costData?.data.expenses) return [];
        // Use Set to get unique types, then sort them
        return [...new Set(costData?.data.expenses.map(e => e.expense_type))].sort();
    }, [costData]);


    if (isLoading && !costData) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Calculating your estimated trip cost..." /></div>;
    }

    // Handle API errors or if backend indicates processing isn't done yet/failed
    if (error) {
        return <Alert message="Error" description={error.data?.message || "Could not fetch cost breakdown."} type="error" showIcon />;
    }
    if (costData && !costData.status) {
        return <Alert message="Calculation Failed" description={costData.message || "Could not calculate cost breakdown."} type="warning" showIcon />;
    }

    if (!costData || !costData?.data.expenses) {
        return <Alert message="Cost breakdown data is currently unavailable." type="info" showIcon />;
    }

    const { total_budget, total_expenses, budget_remaining, expenses } = costData.data;
    const isOverBudget = budget_remaining < 0;

    // Define columns for the expenses table
    const columns = [
        {
            title: '',
            dataIndex: 'expense_type',
            key: 'icon',
            width: 50,
            render: (type) => <span style={{ fontSize: '18px' }}>{getExpenseIcon(type)}</span>,
        },
        {
            title: 'Expense',
            dataIndex: 'expense_name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
            responsive: ['md'], // Hide on smaller screens
            render: (text) => <Text type="secondary">{text}</Text>,
        },
        {
            title: 'Cost/Person',
            dataIndex: 'cost_per_person',
            key: 'cost_pp',
            align: 'right',
            render: (amount) => formatCurrency(amount),
        },
        {
            title: 'Total Cost',
            dataIndex: 'estimated_cost',
            key: 'total_cost',
            align: 'right',
            render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
        },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Title level={4}>Estimated Trip Cost Breakdown</Title>
            <Paragraph type="secondary">
                Here's an estimated breakdown based on your selections. Costs are approximate.
            </Paragraph>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                        <Card bordered={false} style={{ borderRadius: '8px', textAlign: 'center' }}>
                            <Statistic title="Your Budget" value={formatCurrency(total_budget)} prefix={<DollarCircleOutlined />} />
                        </Card>
                    </motion.div>
                </Col>
                <Col xs={24} sm={8}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                        <Card bordered={false} style={{ borderRadius: '8px', textAlign: 'center' }}>
                            <Statistic title="Total Estimated Cost" value={formatCurrency(total_expenses)} prefix={<DollarCircleOutlined />} />
                        </Card>
                    </motion.div>
                </Col>
                <Col xs={24} sm={8}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                        <Card bordered={false} style={{ background: isOverBudget ? '#fff1f0' : '#f6ffed', borderRadius: '8px', textAlign: 'center' }}>
                            <Statistic
                                title="Budget Remaining"
                                value={formatCurrency(budget_remaining)}
                                valueStyle={{ color: isOverBudget ? '#cf1322' : '#3f8600' }}
                                prefix={isOverBudget ? <WarningOutlined /> : <CheckCircleOutlined />}
                            />
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            <Divider />

            <Title level={5}>Expense Details</Title>

            {/* --- Filter Buttons --- */}
            <Segmented
                shape='round'
                options={['All', ...expenseTypes]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ background: "transparent", display: "flex", gap: 8, border: "none", marginTop:10, marginBottom:10 }}
                SegmentedItemType={{
                    border: "1px solid #e04848ff",
                    borderRadius: 8,
                    background: "red",
                    
                }}
            />

            {/* --- Expenses Table --- */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Table
                    columns={columns}
                    dataSource={filteredExpenses.map((item, index) => ({ ...item, key: index }))}
                    pagination={false}
                    size="small"
                    summary={pageData => { // Optional: Show filtered total
                        let filteredTotal = 0;
                        pageData.forEach(({ estimated_cost }) => { filteredTotal += estimated_cost; });
                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={4} align="right"><Text strong>Total:</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right"><Text strong>{formatCurrency(filteredTotal)}</Text></Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
            </motion.div>

            <Button
                type="primary"
                onClick={onComplete} // Call the function passed from parent to move to next step
                style={{ marginTop: 24 }}
                block
                size="large"
            >
                Proceed to Finalize Booking
            </Button>
        </motion.div>
    );
};

export default CostBreakdown;

