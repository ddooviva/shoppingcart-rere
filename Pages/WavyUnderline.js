import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { theme } from './color';
import { useColor } from './ColorContext';
import { useFontSize } from './FontSizeContext';
import { fontSize, fontTheme } from './font';
import { Animated, useColorScheme, ImageBackground, RefreshControl, Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Dimensions, Modal, Platform, Pressable } from 'react-native';

function getVisualLength(text) {
    return [...text].reduce((sum, char) => {
        if (char === ' ') return sum + 0.1;
        if (/[A-Z]/.test(char)) return sum + 1;
        if (/[a-z]/.test(char)) return sum + 0.9;
        if (/[가-힣]/.test(char)) return sum + 1.1;
        return sum + 1;
    }, 0);
}
const WavyUnderline = ({ LEdit, text, checked }) => {
    const { color, setColor } = useColor();
    const { fontSize, setFontSize } = useFontSize();
    const charWidth = getVisualLength(text) > 8 ? 12.5 : getVisualLength(text) > 4 ? 13.5 : 14.5; // 글자당 대략 가로 폭 (폰트에 따라 조정)
    const fontSizeChar = fontSize === "ll" ? 1.4 : fontSize === 'mm' ? 1.2 : 1
    const visualLength = getVisualLength(text); // 공백은 0.5칸
    const totalWidth = visualLength * charWidth * fontSizeChar;

    // wavy path 자동 생성
    const createWavyPath = () => {
        let path = 'M0 3 ';
        const waveWidth = 5; // 더 자잘하게
        const waveHeight = 2.2; // 진폭 낮게
        const waveCount = Math.ceil(totalWidth / waveWidth);

        path += `Q${waveWidth / 2} ${3 - waveHeight}, ${waveWidth} 3 `; // 첫 웨이브
        for (let i = 1; i < waveCount; i++) {
            path += `T${(i + 1) * waveWidth} 3 `;
        }
        return path.trim();
    };

    return (

        <View style={{ position: 'relative', paddingTop: 16, marginBottom: 4 }}>
            <Text numberOfLines={1} ellipsizeMode='clip' style={{ textDecorationLine: checked ? 'line-through' : null, textDecorationStyle: 'double', width: Dimensions.get('window').width * 4 / 6, position: 'absolute', left: 0, bottom: -2, paddingHorizontal: 10, fontSize: fontTheme[fontSize].l, color: checked ? color === "light" ? theme[color].ddgrey : theme[color].dgrey : theme[color].black, fontWeight: '500' }}>{text}</Text>
        </View>
    );
};

export default WavyUnderline;
