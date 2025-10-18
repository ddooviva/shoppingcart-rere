import React, { createContext, useContext, useState } from "react";
const FontSizeContext = createContext();



export const FontSizeProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState("mm");

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
            {children}
        </FontSizeContext.Provider>
    );
};


export const useFontSize = () => {
    return useContext(FontSizeContext);
};