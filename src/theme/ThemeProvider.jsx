import React, { useState, useMemo } from "react";
import { ConfigProvider } from "antd";
import { lightTheme, darkTheme } from "./theme";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
        return window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    });

    const toggleTheme = () => {
        setTheme((prev) => {
            const newTheme = prev === "light" ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
            return newTheme;
        });
    };

    const antdThemeConfig = useMemo(
        () => (theme === "light" ? lightTheme : darkTheme),
        [theme]
    );

    const contextValue = useMemo(
        () => ({ theme, toggleTheme }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <ConfigProvider theme={antdThemeConfig}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};