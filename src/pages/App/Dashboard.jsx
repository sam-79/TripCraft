import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Card, Typography, Tag, Skeleton, Empty } from "antd";
import { EnvironmentOutlined, StarFilled } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../theme/ThemeContext";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

// TEMP nearby places mock
async function fetchNearbyPlaces(lat, lng) {
    // TODO: Replace with Google Places API / TripAdvisor
    await new Promise((r) => setTimeout(r, 800));
    return [
        {
            name: "Shaniwar Wada",
            city: "Pune",
            rating: 4.4,
            image: "https://www.incredibleindia.gov.in/en/maharashtra/pune/shaniwar-wada",
        },
        {
            name: "Sinhagad Fort",
            city: "Pune",
            rating: 4.6,
            image: "https://commons.wikimedia.org/wiki/File:Sinhagad_Fort_-_Pune_-_Maharashtra_-_004.jpg",
        },
        {
            name: "Bhaja Caves",
            city: "Pune (near the expressway)",
            rating: 4.3,
            image: "https://en.wikipedia.org/wiki/Bhaja_Caves",
        },
        {
            name: "Tikona Fort",
            city: "Maval (near Pune)",
            rating: 4.2,
            image: "https://en.wikipedia.org/wiki/Tikona",
        },
        {
            name: "Madhe Ghat Waterfall",
            city: "Near Pune",
            rating: 4.1,
            image: "https://en.wikipedia.org/wiki/Madhe_Ghat",
        },
        {
            name: "Taljai Hills",
            city: "Pune",
            rating: 4.0,
            image: "https://en.wikipedia.org/wiki/Taljai_Hills",
        }
    ];

}

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [places, setPlaces] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        const getNearby = async () => {
            try {
                // First try browser geolocation
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        const data = await fetchNearbyPlaces(latitude, longitude);
                        setPlaces(data);
                        setLoading(false);
                    },
                    async () => {
                        // fallback (random coords or IP based later)
                        const data = await fetchNearbyPlaces(19.076, 72.8777);
                        setPlaces(data);
                        setLoading(false);
                    }
                );
            } catch (err) {
                console.error("Error fetching location", err);
                setLoading(false);
            }
        };
        getNearby();
    }, []);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
        }),
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* HERO */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    borderRadius: 18,
                    padding: 24,
                    // background: isLight
                    //     ? "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)"
                    //     : "linear-gradient(135deg, #434343 0%, #000000 100%)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    {t('hey_traveler')} 👋
                </Title>
                <Text type="secondary">
                    {t('famous_spots')} 🌍
                </Text>
            </motion.div>

            {/* Nearby Places */}
            {loading ? (
                <Row gutter={[16, 16]}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Col key={i} xs={24} sm={12} md={8}>
                            <Card style={{ borderRadius: 16 }} cover={<div style={{ height: 150 }} />}>
                                <Skeleton active paragraph={{ rows: 2 }} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : places.length === 0 ? (
                <Empty description="No nearby places found." />
            ) : (
                <Row gutter={[16, 16]}>
                    <AnimatePresence>
                        {places.map((place, idx) => (
                            <Col key={idx} xs={24} sm={12} md={8}>
                                <motion.div
                                    custom={idx}
                                    initial="hidden"
                                    animate="visible"
                                    variants={cardVariants}
                                    whileHover={{ y: -6 }}
                                >
                                    <Card
                                        hoverable
                                        style={{ borderRadius: 16, overflow: "hidden" }}
                                        cover={
                                            <div style={{ height: 180, overflow: "hidden" }}>
                                                <img
                                                    src={place.image}
                                                    alt={place.name}
                                                    loading="lazy"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            </div>
                                        }
                                    >
                                        <Title level={5}>{place.name}</Title>
                                        <Text>
                                            <EnvironmentOutlined /> {place.city}
                                        </Text>
                                        <br />
                                        <Tag color="gold">
                                            <StarFilled /> {place.rating}
                                        </Tag>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </AnimatePresence>
                </Row>
            )}
        </div>
    );
};

export default Dashboard;
