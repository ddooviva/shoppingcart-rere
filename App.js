import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import Home from './Pages/Home';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorProvider } from './Pages/ColorContext';
import { FontSizeProvider } from './Pages/FontSizeContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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