import React, { createContext, useContext, useState } from "react";
const ColorContext = createContext();



export const ColorProvider = ({ children }) => {
    const [color, setColor] = useState("light");

    return (
        <ColorContext.Provider value={{ color, setColor }}>
            {children}
        </ColorContext.Provider>
    );
};


export const useColor = () => {
    return useContext(ColorContext);
};