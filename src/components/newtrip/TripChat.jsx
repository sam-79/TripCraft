import React, { useState } from "react";
import { Input, Button, Typography, Space } from "antd";
import { motion } from "framer-motion";
const { Paragraph } = Typography;

const TripChat = ({ messages, setMessages }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");

    // Fake AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Got it 👍 I'll refine your trip with: "${input}"` },
      ]);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: 12,
              background: msg.role === "user" ? "#1677ff" : "#f0f0f0",
              color: msg.role === "user" ? "#fff" : "#000",
              whiteSpace: "pre-wrap",
            }}
          >
            <Paragraph style={{ margin: 0, color: msg.role === "user" ? "#fff" : "#000" }}>
              {msg.content}
            </Paragraph>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, padding: "12px" }}>
        <Input
          placeholder="Refine your trip..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
        />
        <Button type="primary" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default TripChat;
