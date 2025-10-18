import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

import App from './App';

// 특정 경고 메시지 무시
LogBox.ignoreLogs([
    'Warning: ref.measureLayout must be called with a ref to a native component.',
]);

// Expo에서 앱을 루트 컴포넌트로 등록
registerRootComponent(App);