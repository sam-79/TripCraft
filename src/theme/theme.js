
export const lightTheme = {
  token: {
    colorPrimary: "#A855F7",
    colorBgBase: "#FDFDFD", 
    colorTextBase: "#1F2937",
    fontFamily: "Poppins, sans-serif",
    borderRadius: 12,
  },
  components: {
    Layout: {
      headerBg: "#fffafc",
      siderBg: "linear-gradient(180deg, #ff6b81 0%, #ffcc70 100%)",
    },
    Menu: {
      itemSelectedBg: "linear-gradient(90deg, #ff758c 0%, #ff7eb3 100%)",
      itemSelectedColor: "#fff",
      itemHoverBg: "rgba(255, 255, 255, 0.25)",
      itemHoverColor: "#fff",
    },
    Card: { borderRadiusLG: 16, boxShadowTertiary: "0 12px 40px rgba(0,0,0,0.12)" },
  },
};

export const darkTheme = {
  token: {
    colorPrimary: "#A855F7",
    colorBgBase: "#0D1117", 
    colorTextBase: "#D1D5DB",
    fontFamily: "Poppins, sans-serif",
    borderRadius: 12,
  },
  components: {
    Layout: {
      headerBg: "#141414",
      siderBg: "linear-gradient(180deg, #0f2027 0%, #2c5364 100%)",
    },
    Menu: {
      itemSelectedBg: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)",
      itemSelectedColor: "#fff",
      itemHoverBg: "rgba(255, 255, 255, 0.15)",
      itemHoverColor: "#fff",
    },
    Card: { borderRadiusLG: 16, boxShadowTertiary: "0 12px 40px rgba(0,0,0,0.12)" },
  },
};
