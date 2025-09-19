import React, { useEffect } from 'react'
import { Select, message } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";


import { selectLanguage, setLanguage } from '../redux/features/langSlice';
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from "../api/userApi";

import { useGetEnumsQuery } from "../api/enumsApi";
import { all_enums } from "../constants/contants";
import LoadingAnimationOverlay from './LoadingAnimation';

const { Option } = Select;

function LanguageSelector() {

    const dispatch = useDispatch();
    const { i18n } = useTranslation();
    const [messageApi, messageApiContextHolder] = message.useMessage();

    // --- Language Management ---
    // 1. Get the persisted language instantly from Redux (for offline-first UI)
    const persistedLang = useSelector(selectLanguage);

    // 2. Fetch the latest settings from the server
    const { data: serverSettings } = useGetUserSettingsQuery();

    // 3. Get the mutation hook to update settings
    const [updateUserSettings] = useUpdateUserSettingsMutation();

    // 4. Determine the current language: prioritize server data, fall back to persisted, then to default
    const currentLanguage = serverSettings?.native_language || persistedLang || 'English';

    // 5. This effect updates the i18n library whenever the language changes
    useEffect(() => {
        i18n.changeLanguage(currentLanguage);
    }, [currentLanguage, persistedLang, i18n, serverSettings]);

    // 6. This handler is called when the user selects a new language
    const handleLanguageChange = async (value) => {
        // Optimistic UI update: change the language in the UI immediately
        dispatch(setLanguage(value));
        try {
            // Send the update to the server in the background
            await updateUserSettings({ native_language: value }).unwrap();
            messageApi.success(`Language updated to ${value}`);
        } catch (err) {
            messageApi.error("Failed to save language preference.");
            // If the API call fails, revert to the previous language
            dispatch(setLanguage(currentLanguage));
        }
    };

    const { data: enums, isLoading, isError } = useGetEnumsQuery();
    if (isLoading) {
        return <LoadingAnimationOverlay />
    }

    const languages = enums?.data.native_languages || all_enums.native_languages;

    return (
        <div>
            {messageApiContextHolder}
            <Select
                defaultValue={currentLanguage}
                style={{ width: 140 }}
                bordered={false}
                onChange={handleLanguageChange}
            >
                {languages.map((lang) => (
                    <Option key={lang} value={lang}>
                        {lang}
                    </Option>
                ))}
            </Select>
        </div>
    )
}

export default LanguageSelector;