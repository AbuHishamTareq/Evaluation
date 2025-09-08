import { AppContext } from "../context/AppContext";
import { useContext } from "react";

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
