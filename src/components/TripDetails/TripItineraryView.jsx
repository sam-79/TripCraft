import React from 'react';
import { Timeline, Typography, Card, Tag, Space, Divider } from 'antd';
import { CarOutlined, CoffeeOutlined, CameraOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const ItineraryIcon = ({ place }) => {
    // In a real app, you could have different icons based on place type
    return <CameraOutlined />;
};

const TripItineraryView = ({ itinerary }) => {
    return (
        <div style={{ height: '100%', overflowY: 'auto', paddingRight: '16px' }}>
            <Timeline>
                {itinerary.map(day => (
                    <Timeline.Item key={day.day}>
                        <Title level={4}>Day {day.day} - {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Title>

                        <Card size="small" style={{ marginBottom: 16, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                            <Paragraph strong>Travel Tips:</Paragraph>
                            <Text type="secondary">{day.travel_tips}</Text>
                        </Card>

                        <Space wrap style={{ marginBottom: 16 }}>
                            <Text strong>Food:</Text>
                            {day.food.map(item => <Tag key={item} color="volcano" icon={<CoffeeOutlined />}>{item}</Tag>)}
                        </Space>
                        <Space wrap style={{ marginBottom: 16 }}>
                            <Text strong>Culture:</Text>
                            {day.culture.map(item => <Tag key={item} color="geekblue">{item}</Tag>)}
                        </Space>

                        <Divider />
                        <Timeline>
                            {day.places.map(place => (
                                <Timeline.Item key={place.id} dot={<ItineraryIcon place={place} />}>
                                    <strong>{place.best_time_to_visit}:</strong> {place.name}
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Timeline.Item>
                ))}
            </Timeline>
        </div>
    );
};

export default TripItineraryView;

