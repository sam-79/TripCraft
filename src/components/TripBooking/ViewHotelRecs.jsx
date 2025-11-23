import React, { useState } from 'react';
import {
  Spin,
  Alert,
  Typography,
  Card,
  Row,
  Col,
  Button,
  Tag,
  Rate,
  Carousel,
  Empty,
  message,
  Divider,
  Tooltip,
  Drawer
} from 'antd';
import {
  StarFilled,
  EnvironmentOutlined,
  DollarCircleOutlined,
  TrophyOutlined,
  RocketOutlined,
  HeartOutlined,
  SmileOutlined,
  CheckCircleOutlined,
  RightCircleOutlined,
  AimOutlined,
  PlusOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
// import hotelAnimation from '../../assets/lottie/hotel.json';
import { useGetHotelRecommendationsQuery } from '../../api/bookingApi'
const { Title, Text, Paragraph } = Typography;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const sectionFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// -------------------------------------
//  HOTEL CARD COMPONENT
// -------------------------------------
// --- 1. ACCEPT onAddToBooking and bookingList as props ---
const HotelCard = ({ hotel, onMapOpen, onAddToBooking, bookingList }) => {
  // --- 2. CHECK IF THIS HOTEL IS ALREADY IN THE LIST ---
  // We use hotel.name as a unique identifier here.
  const isAdded = bookingList.some(item => item.id === `hotel-${hotel.name}`);

  // --- 3. DEFINE THE BOOKING ITEM ---
  const bookingItem = {
    ...hotel,
    type: 'hotel',
    id: `hotel-${hotel.name}`, // Create a unique ID
    image: hotel.images && hotel.images.length > 0 ? hotel.images[0] : null
  };

  return (
    <motion.div variants={fadeUp}>
      <Card
        hoverable
        bordered
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease',
        }}
        cover={
          hotel.images && hotel.images.length > 0 ? (
            <Carousel arrows autoplay dotPosition="bottom" effect="fade">
              {hotel.images.slice(0, 5).map((img, index) => (
                <div key={index}>
                  <img
                    alt={hotel.name}
                    src={img}
                    loading='lazy'
                    style={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                    onError={(e) => {
                      e.target.src =
                        'https://placehold.co/400x180/EEE/CCC?text=No+Image';
                    }}
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div
              style={{
                height: 180,
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EnvironmentOutlined style={{ fontSize: 48, color: '#bbb' }} />
            </div>
          )
        }
        actions={[
          <Tooltip title={isAdded ? 'Remove from booking list' : 'Add to booking list'}>
            <Button
              type="link"
              icon={isAdded ? <MinusCircleOutlined /> : <PlusOutlined />}
              onClick={() => onAddToBooking(bookingItem)}
              danger={isAdded} // Make it red if it's already added
            >
              {isAdded ? 'Remove' : 'Add to List'}
            </Button>
          </Tooltip>,
          <Tooltip title="View & book on EaseMyTrip">
            <Button
              type="link"
              href={hotel.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0 15px',
                // borderRadius: 6,
                height: 32,
                lineHeight: '32px',
              }}
            >
              View
            </Button>
          </Tooltip>,
          <Tooltip title="Show on Google Maps">
            <Button
              type="link"
              icon={<AimOutlined />}
              onClick={() => onMapOpen(hotel)}
            >
              View on Map
            </Button>
          </Tooltip>,
        ]}
      >
        <Title level={5} ellipsis={{ rows: 1 }}>
          {hotel.name}
        </Title>
        <Paragraph type="secondary" ellipsis={{ rows: 1 }}>
          <EnvironmentOutlined /> {hotel.address}
        </Paragraph>

        <div style={{ marginBottom: 8 }}>
          <Rate
            disabled
            allowHalf
            value={parseFloat(hotel.trip_rating) || parseFloat(hotel.rating) || 0}
            style={{ fontSize: 16, marginRight: 8 }}
          />
          <Tag color="blue">{hotel.category || 'Hotel'}</Tag>
          {hotel.is_couple_friendly && <Tag color="pink">Couple Friendly 💖</Tag>}
        </div>

        <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
          ₹{hotel.price.toLocaleString('en-IN')} / night
        </Text>
        <Divider style={{ margin: '12px 0' }} />
        <div>
          <Tag color="cyan">🕓 Check-in: {hotel.check_in || 'N/A'}</Tag>
          <Tag color="gold">⏰ Check-out: {hotel.check_out || 'N/A'}</Tag>
        </div>
      </Card>
    </motion.div>
  );
}

// -------------------------------------
//  MAIN COMPONENT
// -------------------------------------
const ViewHotelRecs = ({ tripId, onComplete, setStatus, bookingList, onAddToBooking }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch hotel recommendations
  const { data: recommendationsData, error, isLoading, isFetching } = useGetHotelRecommendationsQuery(tripId, {
    // pollingInterval: 5000, // Poll if recommendations are generated asynchronously
    // refetchOnMountOrArgChange: true,
  });

  React.useEffect(() => {
    if (error) setStatus('error');
    else setStatus('finish');
    // else setStatus('process');
  }, [recommendationsData, error, setStatus]);

  if (isLoading)
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" tip="Finding the best hotels for your stay..." />
      </div>
    );

  if (error)
    return (
      <Alert
        message="Error"
        description="Could not fetch hotel recommendations."
        type="error"
        showIcon
      />
    );

  if (!recommendationsData?.recommendations)
    return <Empty description="No hotel recommendations found." />;

  const { recommendations } = recommendationsData;

  const Section = ({ title, icon, color, hotels }) =>
    hotels && hotels.length > 0 ? (
      <motion.div
        variants={sectionFade}
        initial="hidden"
        animate="visible"
        style={{ marginTop: 32 }}
      >
        <Title level={5} style={{ marginBottom: 16 }}>
          {React.cloneElement(icon, { style: { color, marginRight: 8 } })} {title}
        </Title>
        <Row gutter={[16, 16]}>
          {hotels.map((hotel, i) => (
            <Col xs={24} sm={12} lg={8} key={`${title}-${hotel.name}-${i}`}>
              <HotelCard
                hotel={hotel}
                onMapOpen={(hotel) => {
                  setSelectedHotel(hotel);
                  setDrawerOpen(true);
                }}
                // --- 6. PASS THE PROPS DOWN TO HotelCard ---
                bookingList={bookingList}
                onAddToBooking={onAddToBooking}
              />
            </Col>
          ))}
        </Row>
      </motion.div>
    ) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      {contextHolder}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {/* <Lottie animationData={hotelAnimation} style={{ width: 80, marginRight: 16 }} /> */}
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Hotel Recommendations
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Curated hotels selected based on your preferences and trip destination.
          </Paragraph>
        </div>
      </div>

      {recommendations?.top_rated_hotels.length > 0 &&
        < Section
          title="Top Rated Hotels"
          icon={<TrophyOutlined />}
          color="#faad14"
          hotels={recommendations.top_rated_hotels}
        />}

      {recommendations?.best_value_for_money.length > 0 &&
        <Section
          title="Best Value for Money"
          icon={<DollarCircleOutlined />}
          color="#52c41a"
          hotels={recommendations.best_value_for_money}
        />}

      {recommendations?.budget_friendly.length > 0 &&
        <Section
          title="Budget Friendly"
          icon={<SmileOutlined />}
          color="#1677ff"
          hotels={recommendations.budget_friendly}
        />}

      {recommendations?.luxury_stays.length > 0 &&
        <Section
          title="Luxury Stays"
          icon={<HeartOutlined />}
          color="#eb2f96"
          hotels={recommendations.luxury_stays}
        />}

      {recommendationsData?.hotels?.length > 0 && (
        <Section
          title="Additional Options"
          icon={<RocketOutlined />}
          color="#722ed1"
          hotels={recommendationsData.hotels}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ textAlign: 'center', marginTop: 40 }}
      >
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={onComplete}
          block
        >
          Proceed to Cost Summary
        </Button>
      </motion.div>

      {/* GOOGLE MAP DRAWER */}
      <Drawer
        title={
          selectedHotel ? (
            <span>
              <EnvironmentOutlined style={{ color: '#1677ff' }} /> {selectedHotel.name}
            </span>
          ) : (
            'Hotel Location'
          )
        }
        placement="right"
        width={"40%"}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedHotel ? (
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div style={{ height: '100%', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
              <Map
                defaultCenter={{
                  lat: parseFloat(selectedHotel.latitude),
                  lng: parseFloat(selectedHotel.longitude),
                }}
                defaultZoom={14}
                mapId="hotel-map"
              >
                <Marker
                  position={{
                    lat: parseFloat(selectedHotel.latitude),
                    lng: parseFloat(selectedHotel.longitude),
                  }}
                  title={selectedHotel.name}
                />
              </Map>
            </div>
          </APIProvider>
        ) : (
          <Empty description="No hotel selected" />
        )}
      </Drawer>
    </motion.div>
  );
};

export default ViewHotelRecs;
