// theme.js

const sharedConfig = {
  token: {
    fontFamily:
      "'Poppins', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    borderRadius: 12,
    wireframe: false,
  },
  components: {
    Card: {
      borderRadiusLG: 16,
      colorBgContainer: '#FFFFFF',
    },
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      primaryShadow: '0 4px 10px rgba(0, 91, 155, 0.25)',
    },
    Input: {
      borderRadius: 10,
      controlHeight: 40,
    },
  },
};

/* ==============================
   🌞 LIGHT THEME CONFIG
   ============================== */
export const lightTheme = {
  ...sharedConfig,
  token: {
    ...sharedConfig.token,
    colorPrimary: '#005B9B', // Deep Blue
    colorPrimaryHover: '#4E88CC',
    colorPrimaryActive: '#00326C',
    colorInfo: '#00A4D5', // Caribbean Blue
    colorBgBase: '#FFFFFF',
    colorBgLayout: '#F5F7FA',
    colorTextBase: '#252220', // Ship Grey
    colorTextSecondary: '#4E88CC',
    colorBorder: '#E0E0E0',
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSize: 16,
  },
  components: {
    ...sharedConfig.components,

    Layout: {
      headerBg: '#FFFFFF',
      siderBg: 'linear-gradient(180deg, #005B9B 0%, #00A4D5 100%)',
    },

    Menu: {
      itemSelectedBg: 'rgba(0, 164, 213, 0.15)',
      itemSelectedColor: '#005B9B',
      itemHoverBg: 'rgba(0, 91, 155, 0.08)',
      itemHoverColor: '#005B9B',
    },

    Card: {
      ...sharedConfig.components.Card,
      boxShadow: '0 6px 24px rgba(0, 91, 155, 0.1)',
    },

    Button: {
      ...sharedConfig.components.Button,
      colorPrimaryBg: 'linear-gradient(90deg, #005B9B 0%, #00A4D5 100%)',
      colorPrimary: '#4E88CC',
      colorPrimaryHover: '#63a6f3ff',
      colorText: '#252220',
    },

    // 🟦 Segmented Control (Light)
    Segmented: {
      itemSelectedBg: '#00A4D5',
      itemSelectedColor: '#FFFFFF',
      colorBgLayout: '#F5F7FA',
      colorText: '#252220',
      itemHoverBg: 'rgba(0, 164, 213, 0.15)',
      itemHoverColor: '#005B9B',
    },

    // 📊 Statistic (Light)
    Statistic: {
      colorTextDescription: '#4E88CC',
      colorTextHeading: '#252220',
    },
  },
};

/* ==============================
   🌚 DARK THEME CONFIG
   ============================== */
export const darkTheme = {
  ...sharedConfig,
  token: {
    ...sharedConfig.token,
    colorPrimary: '#00A4D5',
    colorPrimaryHover: '#4E88CC',
    colorPrimaryActive: '#005B9B',
    colorBgBase: '#0A0C10',
    colorBgLayout: '#141416',
    colorTextBase: '#E0E0E0',
    colorTextSecondary: '#A0A0A0',
    colorBorder: '#2B2B2B',
  },
  components: {
    ...sharedConfig.components,

    Layout: {
      headerBg: 'rgba(10, 12, 16, 0.9)',
      siderBg: 'linear-gradient(180deg, #005B9B 0%, #00A4D5 100%)',
    },

    Menu: {
      itemSelectedBg: 'rgba(0, 164, 213, 0.25)',
      itemSelectedColor: '#FFFFFF',
      itemHoverBg: 'rgba(0, 164, 213, 0.15)',
      itemHoverColor: '#FFFFFF',
    },

    Card: {
      ...sharedConfig.components.Card,
      boxShadow: '0 8px 32px rgba(0, 164, 213, 0.1)',
      colorBgContainer: 'rgba(20, 20, 25, 0.9)',
    },

    Button: {
      ...sharedConfig.components.Button,
      colorPrimaryBg: 'linear-gradient(90deg, #00A4D5 0%, #005B9B 100%)',
      colorPrimary: '#FFFFFF',
    },

    // 🟦 Segmented Control (Dark)
    Segmented: {
      itemSelectedBg: '#00A4D5',
      itemSelectedColor: '#FFFFFF',
      colorBgLayout: '#1E1E22',
      colorText: '#E0E0E0',
      itemHoverBg: 'rgba(0, 164, 213, 0.15)',
      itemHoverColor: '#00A4D5',
    },

    // 📊 Statistic (Dark)
    Statistic: {
      colorTextDescription: '#A0A0A0',
      colorTextHeading: '#FFFFFF',
    },
  },
};
