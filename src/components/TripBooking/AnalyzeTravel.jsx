import React, { useEffect, useState } from 'react';
import { App, Spin, Alert, Typography, Tabs, Card, Button, Space, Row, Col, message, Modal, Timeline, Tag } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, InfoCircleOutlined, DollarCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAnalyzeTravelOptionQuery } from '../../api/bookingApi';
import LegAnalysisDetails from './LegAnalysisDetails'; // Import the new component
import { motion } from 'framer-motion';

const { Title, Text, Paragraph, Link } = Typography;

// Helper to get travel mode icon - simplified for Tabs
const getModeIcon = (mode) => {
  const lowerCaseMode = mode?.toLowerCase() || '';
  if (lowerCaseMode.includes('train')) return <span class="material-symbols-outlined">train</span>;
  if (lowerCaseMode.includes('flight')) return <span class="material-symbols-outlined">flight</span>;
  if (lowerCaseMode.includes('bus')) return <span class="material-symbols-outlined">directions_bus</span>
  if (lowerCaseMode.includes('cab')) return <span class="material-symbols-outlined">local_taxi</span>
  return <i className="fas fa-car"></i>;
};


const AnalyzeTravel = ({ tripId, onComplete, setStatus, bookingList, onAddToBooking}) => {
  const [activeTabKey, setActiveTabKey] = useState('0'); // Start with the first leg tab
  const [modal, modalContextHolder] = Modal.useModal();


  //Fetch the analysis data
  const { data: analysisData, error, isLoading, isFetching, refetch } = useAnalyzeTravelOptionQuery(tripId, {
    // Removed polling here, assuming analysis is quick or triggered manually
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (error) {
      setStatus('error');
    } else if (analysisData) {
      setStatus('finish'); // Mark step as finished once data arrives
    } else {
      setStatus('process');
    }
  }, [analysisData, error, setStatus]);


  if (isLoading && !analysisData?.data) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Analyzing your selected travel option..." /></div>;
  }

  if (error) {
    return <Alert message="Error" description={error.data?.message || "Could not analyze travel options."} type="error" showIcon />;
  }

  // Check if the backend analysis itself reported an issue
  if (analysisData && analysisData?.data.travel_options_analysis && analysisData?.data.travel_options_analysis?.status === false) {
    return <Alert message="Analysis Issue" description={analysisData?.data.travel_options_analysis.message || "Could not complete analysis."} type="warning" showIcon />;
  }

  if (!analysisData || !analysisData?.data.travel_options_analysis || !analysisData?.data.travel_options_analysis?.legs) {
    return <Alert message="Analysis data is incomplete or unavailable." type="info" showIcon />;
  }



  const selectedOption = analysisData?.data?.selected_travel_options;
  const analysisResult = analysisData?.data?.travel_options_analysis;

  //-- Modal to display Selected Trip Details
  const showSelectedTripDetailsModal = (selectedOption) => {
    modal.info({
      title: <span>{selectedOption.option_name}</span>,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Timeline style={{ marginTop: 16 }}>
            {selectedOption.legs.map((leg, index) => (
              <Timeline.Item key={index} dot={getModeIcon(leg.mode)}>
                <Paragraph strong style={{ margin: 0 }}>{leg.from} ({leg.from_code || 'N/A'}) <ArrowRightOutlined /> {leg.to} ({leg.to_code || 'N/A'})</Paragraph>
                <Text type="secondary">{new Date(leg.journey_date).toLocaleDateString()}</Text>
                <div style={{ marginTop: 4 }}>
                  <Space align="baseline" wrap >
                    <Tag icon={getModeIcon(leg.mode)}>{leg.mode}</Tag>
                    <Tag icon={<DollarCircleOutlined />}>{leg.approx_cost}</Tag>
                    <Tag icon={<ClockCircleOutlined />}>{leg.approx_time}</Tag>
                  </Space>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Space>
      ),
      icon: <span style={{marginRight:10}} class="material-symbols-outlined">
        route
      </span>,
      width: "50%",
      onOk() { },
    });
  };

  // Prepare items for Ant Design Tabs
  const tabItems = analysisResult.legs.map((leg, index) => ({
    key: String(index),
    label: (
      <Space>
        {getModeIcon(leg.mode)}
        Leg {index + 1}: {leg.mode}
      </Space>
    ),
    children: <LegAnalysisDetails leg={leg} bookingList={bookingList} onAddToBooking={onAddToBooking} />, // Pass the specific leg data
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      <Title level={4}>Travel Option Analysis</Title>
      <Paragraph type="secondary">
        Detailed analysis for your journey from <Text strong>{selectedOption.legs[0]?.from}</Text> to <Text strong>{selectedOption.legs[selectedOption.legs.length - 1]?.to}</Text>.
      </Paragraph>

      <Card style={{ background: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <Text strong>Selected Route: {analysisResult.option_name}</Text>
            </Space>
            {/* <Paragraph type="secondary" style={{ margin: '4px 0 0 26px' }}>
              This is the route you selected, balancing cost and travel time.
            </Paragraph> */}
          </Col>
          <Col>
            <Button type="primary" onClick={() => showSelectedTripDetailsModal(selectedOption)}>View Details</Button>
          </Col>
        </Row>
      </Card>

      {/* Tab View */}
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={tabItems}
        type="card" 
      />

      <Button
        type="primary"
        onClick={onComplete} // Call the function passed from parent to move to next step
        style={{ marginTop: 24 }}
        block
        size="large"
      >
        Confirm Analysis & Proceed to Hotel Preferences
      </Button>
      {modalContextHolder}
    </motion.div>
  );
};

export default AnalyzeTravel;

