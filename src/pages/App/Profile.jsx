import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Space,
  Alert,
  Tag,
  Descriptions,
  Tooltip
} from "antd";
import {
  LoadingOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  WifiOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useGetUserInfoQuery } from '../../api/userApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/features/authSlice';
import LoadingAnimationOverlay from "../../components/LoadingAnimation";
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;

const Profile = () => {
  const persistedUser = useSelector(selectCurrentUser);
  const { t } = useTranslation();

  // Fetch user data using the RTK Query hook. It handles loading, caching, and errors.
  const { data: freshUser, error, isLoading } = useGetUserInfoQuery();

  const user = freshUser || persistedUser;


  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Show a full-page spinner ONLY if there is no data to display at all (e.g., first-ever login)
  if (isLoading && !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <LoadingAnimationOverlay text={t("loading_profile")} />
    </div>;
  }

  // Show a full-page error ONLY if there is no persisted data to fall back on.
  if (error && !user) {
    return <Alert message={t("error")} description={t("profile_fetch_error")} type="error" showIcon />;
  }

  // Handle the case where there is no user data at all.
  if (!user) {
    return <Alert message={t("no_user_found")} description={t("please_login")} type="warning" showIcon />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Card
        style={{ borderRadius: 16, width: '100%', maxWidth: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {t("profile_welcome")}
            {/* Show a subtle indicator when fetching new data or if offline */}
            {isLoading && <Tooltip title={t("refreshing")}><LoadingOutlined spin /></Tooltip>}
            {error && <Tooltip title={t("offline_mode")}><WifiOutlined style={{ color: '#ff4d4f' }} /></Tooltip>}
          </div>
        }
      >
        <Space align="center" size={24} style={{ marginBottom: 24 }}>
          <Avatar size={80} src={user.picture} icon={<UserOutlined />} />
          <div>
            <Title level={3} style={{ margin: 0 }}>{user.name}</Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </Space>

        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label={<><UserOutlined /> {t("username")}</>}>{user.username}</Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> {t("email_verification")}</>}>
            {user.email_verified ? <Tag color="success">{t("verified")}</Tag> : <Tag color="warning">{t("not_verified")}</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined /> {t("member_since")}</>}>{formatDate(user.date_created)}</Descriptions.Item>
        </Descriptions>
      </Card>
    </motion.div>
  );
};

export default Profile;

