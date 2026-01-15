import React, { useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';
const FollowPoint = ({ position }) => {
    console.log(position)
    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: 'red',
                left: -15, // 원의 중심 보정
                top: -15,  // 원의 중심 보정
                transform: [
                    { translateX: position.x },
                    { translateY: position.y }
                ],
                zIndex: 999, // 가장 위에 보이기
            }}
        />
    );
};
export default FollowPoint;