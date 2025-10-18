import React, { useCallback } from 'react';
import { TextInput } from 'react-native';
import { useFontSize } from './FontSizeContext';
import { useColor } from './ColorContext';
import { theme } from './color';
import { fontTheme } from './font';

const InputBox = ({ value, onChangeText, onSubmit, placeholder }) => {
    const { color } = useColor();
    const { fontSize } = useFontSize();

    // onChangeText를 useCallback으로 메모이제이션
    const handleChangeText = useCallback((text) => {
        onChangeText(text);
    }, [onChangeText]);

    return (
        <TextInput
            style={{
                paddingHorizontal: 20,
                fontSize: fontTheme[fontSize].l,
                textAlign: 'center',
                color: theme[color].black
            }}
            placeholder={placeholder}
            placeholderTextColor={theme[color].ddgrey}
            value={value}
            onChangeText={handleChangeText}
            blurOnSubmit={false}
            onSubmitEditing={onSubmit}
            // 성능 최적화를 위한 추가 속성들
            maxFontSizeMultiplier={1}
            textAlignVertical="center"
            autoCapitalize="none"
            autoCorrect={false}
        />
    );
};

// React.memo에 비교 함수 추가
export default React.memo(InputBox, (prevProps, nextProps) => {
    return prevProps.value === nextProps.value &&
        prevProps.placeholder === nextProps.placeholder;
});
