import React from 'react';
import { Typography, Descriptions, Tag, Space, Timeline } from 'antd';
import { CarOutlined, DollarCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, FlagOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;

const getModeIcon = (mode) => {
    if (mode?.toLowerCase().includes('train')) return <i className="fas fa-train"></i>;
    if (mode?.toLowerCase().includes('flight')) return <i className="fas fa-plane"></i>;
    return <CarOutlined />;
}

const TripTravelOptions = ({ travelOptions }) => {
    const { t } = useTranslation();
    return (
        <div style={{ height: '100%', overflowY: 'auto', paddingRight: '16px' }}>
            <Title level={4}>{t('travel_plan')}</Title>
            <Paragraph type="secondary">
                {t('recommended_travel_route')} <Text strong>{travelOptions.from}</Text> {t('to')} <Text strong>{travelOptions.to}</Text>.
            </Paragraph>
            
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                <Descriptions.Item label={<><DollarCircleOutlined /> {t('total_est_cost')}</>}>
                    <Text strong style={{color: '#1677ff'}}>{travelOptions.total_cost}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<><ClockCircleOutlined /> {t('total_est_time')}</>}>
                     <Text strong>{travelOptions.total_time}</Text>
                </Descriptions.Item>
            </Descriptions>
            
            <Title level={5}>{t('legs')}</Title>
            <Timeline>
                {travelOptions.legs.map((leg, index) => (
                    <Timeline.Item key={index} dot={getModeIcon(leg.mode)}>
                        <Paragraph strong style={{ margin: 0 }}>{leg.from} <ArrowRightOutlined /> {leg.to}</Paragraph>
                        <Text type="secondary">{leg.Note}</Text>
                        <div style={{marginTop: 8}}>
                             <Space wrap>
                                <Tag icon={<CarOutlined />}>{leg.mode}</Tag>
                                <Tag icon={<DollarCircleOutlined />}>{leg.approx_cost}</Tag>
                                <Tag icon={<ClockCircleOutlined />}>{leg.approx_time}</Tag>
                            </Space>
                        </div>
                    </Timeline.Item>
                ))}
            </Timeline>
        </div>
    );
};

export default TripTravelOptions;
