import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Tag, GraduationCap, BookOpen, Settings } from 'lucide-react-native';

import HomeScreen from './src/screens/HomeScreen';
import DealsScreen from './src/screens/DealsScreen';
import StudentHubScreen from './src/screens/StudentHubScreen';
import BlogScreen from './src/screens/BlogScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { COLORS } from './src/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primaryDark, elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '800' },
          tabBarStyle: {
            backgroundColor: COLORS.primaryDark,
            borderTopColor: COLORS.cardBorder,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Smart Picks',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Deals"
          component={DealsScreen}
          options={{
            title: 'Flash Deals',
            tabBarIcon: ({ color, size }) => <Tag color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="StudentHub"
          component={StudentHubScreen}
          options={{
            title: 'Student Hub',
            tabBarIcon: ({ color, size }) => <GraduationCap color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Blog"
          component={BlogScreen}
          options={{
            title: 'Journal',
            tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
