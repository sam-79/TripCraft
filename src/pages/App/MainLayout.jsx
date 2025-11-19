import React, { useState, useContext, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  Layout,
  Menu,
  Button,
  Switch,
  Typography,
  Modal,
} from "antd";
import {
  DashboardOutlined,
  PlusCircleOutlined,
  CompassOutlined,
  GlobalOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  LogoutOutlined,
  BookOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../theme/ThemeContext";
import { APP_TITLE, APP_TITLE_SHORT } from "../../constants/contants";
import { logout } from "../../redux/features/authSlice";
import { useDispatch } from "react-redux";
import "../../styles/MainLayout.css";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const [logoutModal, logoutContext] = Modal.useModal();
  const { t } = useTranslation();

  // --- Define Sidebar Menu ---
  const menuItems = useMemo(
    () => [
      // {
      //   key: "/user",
      //   icon: <DashboardOutlined style={{ fontSize: "22px" }} />,
      //   label: t("dashboard"),
      // },
      {
        key: "/user",
        icon: <CompassOutlined style={{ fontSize: "22px" }} />,
        label: t("explore"),
      },
      {
        key: "/user/newtrip",
        icon: <PlusCircleOutlined style={{ fontSize: "22px" }} />,
        label: t("new_trip"),
      },
      {
        key: "/user/trips",
        icon: <GlobalOutlined style={{ fontSize: "22px" }} />,
        label: t("my_trip"),
      },
      {
        key: "/user/bookings",
        icon: <BookOutlined style={{ fontSize: "22px" }} />,
        label: "Booking",
        children: [
          {
            key: "/user/bookings/search",
            icon: <SearchOutlined />,
            label: "Search",
          },
          {
            key: "/user/bookings/my-bookings",
            icon: <ProfileOutlined />,
            label: "My Bookings",
          },
        ],
      },
      {
        key: "/user/bookings/payments",
        icon: <ProfileOutlined />,
        label: "Payments",
      },
      {
        key: "/user/preferences",
        icon: <SettingOutlined style={{ fontSize: "22px" }} />,
        label: t("preferences"),
      },
      {
        key: "/user/profile",
        icon: <ProfileOutlined style={{ fontSize: "22px" }} />,
        label: t("profile"),
      },
    ],
    [t]
  );

  // --- Detect active route ---
  const selectedKey = useMemo(() => {
    return menuItems.reduce((bestMatch, item) => {
      if (
        location.pathname === item.key ||
        location.pathname.startsWith(item.key + "/") ||
        location.pathname.startsWith(item.key + "?")
      ) {
        if (!bestMatch || item.key.length > bestMatch.length) {
          return item.key;
        }
      }
      return bestMatch;
    }, "");
  }, [location.pathname, menuItems]);

  // --- Logout confirmation ---
  const showLogoutConfirm = async () => {
    await logoutModal.confirm({
      title: "Log Out",
      content: <>Are you sure you want to log out?</>,
      onOk: () => dispatch(logout()),
    });
  };

  return (
    <Layout
      data-theme={theme}
      style={{ minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}
    >
      {logoutContext}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* App Title */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            height: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <Title
            level={4}
            style={{
              color: "white",
              margin: 0,
              whiteSpace: "nowrap",
              letterSpacing: "1px",
            }}
          >
            {!collapsed ? APP_TITLE : APP_TITLE_SHORT}
          </Title>
        </motion.div>

        {/* Main Navigation Menu */}
        <Menu
          className="sidebar-menu"
          theme={theme === "light" ? "light" : "dark"}
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />

        {/* Logout Option */}
        <Menu
          className="sidebar-menu"
          theme={theme === "light" ? "light" : "dark"}
          mode="inline"
          selectable={false}
        >
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined style={{ fontSize: "20px" }} />}
            onClick={showLogoutConfirm}
            className="ant-menu-item"
          >
            {t("logout")}
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: "all 0.3s ease",
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: theme === "light" ? "#f0f0f0" : "#303030",
            background: theme === "light" ? "#fffafc" : "#141414",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "18px", width: 48, height: 48 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSelector />
            <Switch
              checkedChildren={<SunOutlined />}
              unCheckedChildren={<MoonOutlined />}
              checked={theme === "light"}
              onChange={toggleTheme}
            />
          </div>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            minHeight: 400,
            padding: "16px 24px",
            fontSize: "17px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
