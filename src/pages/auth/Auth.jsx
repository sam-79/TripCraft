import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Button,
  Typography,
  Card,
  Spin,
  Alert,
  Divider,
  Tabs,
  Form,
  Input,
  message,
} from "antd";
import {
  GoogleOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  useLoginWithGoogleMutation,
  useCreateUserMutation,
  useLoginUserMutation,
} from "../../api/authApi";
import { selectIsAuthenticated } from "../../redux/features/authSlice";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Paragraph } = Typography;

const imageUrl =
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1887&auto=format&fit=crop";

const Auth = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [messageApi, messageApiContextHolder] = message.useMessage();

  const [
    loginWithGoogle,
    { isLoading: googleLoading, isError: googleError, error: googleErr },
  ] = useLoginWithGoogleMutation();
  const [createUser, { isLoading: registering }] = useCreateUserMutation();
  const [loginUser, { isLoading: loggingIn }] = useLoginUserMutation();

  const [activeTab, setActiveTab] = useState("login");
  const [form] = Form.useForm();

  // --- Google Login Handler ---
  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      await loginWithGoogle({ token }).unwrap();
    } catch (err) {
      console.error("Failed to login with Google:", err);
    }
  };

  // --- Register Handler ---
  const handleRegister = async (values) => {
    try {
      const res = await createUser(values).unwrap();
      if (res.status) {
        messageApi.success(res.message || "User registered successfully");
        form.resetFields();
        setActiveTab("login");
      } else {
        messageApi.error(res.message || "Registration failed");
      }
    } catch (err) {
      messageApi.error(
        err?.data?.message || "Something went wrong during registration"
      );
    }
  };

  // --- Login Handler ---
  const handleLogin = async (values) => {
    try {
      const res = await loginUser(values).unwrap();
      if (res.status && res.data?.access_token) {
        messageApi.success(res.message || "Login successful!");
      } else {
        messageApi.error(res.message || "Invalid credentials");
      }
    } catch (err) {
      messageApi.error(err?.data?.message || "Login failed");
    }
  };

  // --- Redirect if already authenticated ---
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/user");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {messageApiContextHolder}
      <Card
        style={{
          width: "950px",
          minHeight: "600px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Row>
          {/* Left Visual Panel */}
          <Col
            xs={0}
            sm={12}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "40px",
              color: "white",
            }}
          >
            <Title
              level={2}
              style={{
                color: "white",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              Your journey begins with a single click.
            </Title>
          </Col>

          {/* Right Action Panel */}
          <Col
            xs={24}
            sm={12}
            style={{
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Title level={2}>Welcome to TripCraft AI</Title>
            <Paragraph style={{ marginBottom: "40px", color: "#666" }}>
              Sign in to unlock personalized, AI-powered travel itineraries.
            </Paragraph>

            {/* --- Tabs for Login/Register --- */}
            <Tabs
              centered
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key);
                form.resetFields();
              }}
              items={[
                { key: "login", label: "Login" },
                { key: "register", label: "Register" },
              ]}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={activeTab === "login" ? handleLogin : handleRegister}
              style={{ marginTop: 20 }}
            >
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please enter your username",
                  },
                  {
                    type: "email",
                    message: "The input is not a valid E-mail!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Username"
                  type=""
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={activeTab === "login" ? loggingIn : registering}
              >
                {activeTab === "login" ? "Login" : "Register"}
              </Button>
            </Form>

            <Divider>or</Divider>

            {/* --- Google Login --- */}
            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            >
              <AnimatePresence mode="wait">
                {!googleLoading ? (
                  <motion.div
                    key="google-login"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.log("Login Failed")}
                      shape="rectangular"
                      width="100%"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 48,
                    }}
                  >
                    <Spin tip="Verifying..." size="large" />
                  </motion.div>
                )}
              </AnimatePresence>
            </GoogleOAuthProvider>

            {googleError && (
              <Alert
                style={{ marginTop: "20px" }}
                message={googleErr?.data?.detail || "Google login failed"}
                type="error"
              />
            )}

            <Divider style={{ margin: "40px 0" }}>Features</Divider>

            <div style={{ textAlign: "left", color: "#333" }}>
              <Paragraph>
                <ThunderboltOutlined
                  style={{ color: "#A855F7", marginRight: "10px" }}
                />
                Instantly craft trips with our smart AI.
              </Paragraph>
              <Paragraph>
                <EnvironmentOutlined
                  style={{ color: "#A855F7", marginRight: "10px" }}
                />
                Discover hidden gems and local favorites.
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined
                  style={{ color: "#A855F7", marginRight: "10px" }}
                />
                Organize your plans all in one place.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Auth;
