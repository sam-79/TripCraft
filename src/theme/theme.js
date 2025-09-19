
const sharedConfig = {
  token: {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    borderRadius: 16,
    wireframe: false,
  },
  components: {
    Card: {
      borderRadiusLG: 20,
      colorBgContainer: 'rgba(255, 255, 255, 0.1)', 
    },
    Button: {
      borderRadius: 12,
      controlHeight: 40,
      primaryShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    Input: {
      borderRadius: 12,
      controlHeight: 40,
    }
  },
};

export const lightTheme = {
  ...sharedConfig,
  token: {
    ...sharedConfig.token,
    colorPrimary: "#FF4D4F", 
    colorBgBase: "#F7F2EE", 
    colorTextBase: "#2C2C2C", 
    colorBgLayout: "#EFEAE6", 
    colorTextSecondary: "#595959",
    colorBorder: "#E0D5CC",
  },
  components: {
    ...sharedConfig.components,
    Layout: {
      headerBg: "rgba(247, 242, 238, 0.8)", 
      siderBg: "linear-gradient(180deg, #FF8C42 0%, #FF3C83 100%)", 
    },
    Menu: {
      itemSelectedBg: "rgba(255, 255, 255, 0.25)",
      itemSelectedColor: "#FFFFFF",
      itemHoverBg: "rgba(255, 255, 255, 0.15)",
      itemHoverColor: "#FFFFFF",
      itemActiveBg: "rgba(255, 255, 255, 0.25)",
    },
    Card: {
        ...sharedConfig.components.Card,
        boxShadow: "0 10px 35px rgba(200, 150, 150, 0.15)",
        colorBgContainer: '#FFFFFF'
    },
    Button: {
        ...sharedConfig.components.Button,
        colorPrimaryBg: "linear-gradient(90deg, #FF6B6B 0%, #FF4D4F 100%)",
        colorPrimary: '#FF4D4F'
    }
  },
};


 
export const darkTheme = {
  ...sharedConfig,
  token: {
    ...sharedConfig.token,
    colorPrimary: "#00F5D4",
    colorBgBase: "#101012", 
    colorTextBase: "#E0E0E0", 
    colorBgLayout: "#141416", 
    colorTextSecondary: "#A0A0A0",
    colorBorder: "#303030",
  },
  components: {
    ...sharedConfig.components,
    Layout: {
      headerBg: "rgba(16, 16, 18, 0.8)", 
      siderBg: "linear-gradient(180deg, #0c343d 0%, #1d1a3d 100%)",
    },
    Menu: {
      itemSelectedBg: "linear-gradient(90deg, #00F5D4 0%, #00B2FF 100%)",
      itemSelectedColor: "#FFFFFF",
      itemHoverBg: "rgba(255, 255, 255, 0.1)",
      itemHoverColor: "#FFFFFF",
    },
    Card: {
        ...sharedConfig.components.Card,
        boxShadow: "0 8px 32px 0 rgba(0, 245, 212, 0.1)",
        colorBgContainer: 'rgba(26, 26, 29, 0.85)',
        extraColor: '#E0E0E0'
    },
    Button: {
        ...sharedConfig.components.Button,
        colorPrimary: '#00F5D4',
        colorText: '#000000',
    }
  },
};
