///ThemeProvider.jsx
import React, { useState, useMemo } from "react";
import { ConfigProvider, theme as AntTheme } from "antd";
// import { lightTheme, darkTheme } from "./theme";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // checks for saved theme data 
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
        // system theme check
        // return window.matchMedia &&
        //     window.matchMedia("(prefers-color-scheme: dark)").matches
        //     ? "dark"
        //     : "light";
        // setting default theme as light
        return "light"
    });

    const toggleTheme = () => {
        setTheme((prev) => {
            const newTheme = prev === "light" ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
            return newTheme;
        });
    };

    // const antdThemeConfig = useMemo(
    //     () => (theme === "light" ? lightTheme : darkTheme),
    //     [theme]
    // );

    const contextValue = useMemo(
        () => ({ theme, toggleTheme }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <ConfigProvider
                theme={{
                    algorithm:
                        theme === "dark"
                            ? AntTheme.darkAlgorithm
                            : AntTheme.defaultAlgorithm,
                }}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};