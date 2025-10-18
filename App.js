import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import Home from './Pages/Home';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorProvider } from './Pages/ColorContext';
import { FontSizeProvider } from './Pages/FontSizeContext';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView>
      <FontSizeProvider>
        <ColorProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Home style={{ flex: 1 }}></Home>
          </View >
        </ColorProvider>
      </FontSizeProvider>
    </GestureHandlerRootView>
  );
}