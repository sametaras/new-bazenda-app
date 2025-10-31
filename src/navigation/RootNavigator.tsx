// src/navigation/RootNavigator.tsx - BAI TAB DİREKT KAMERA AÇAR
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../store/favoritesStore';

// Theme'den sadece colors import et
const colors = {
  primary: '#f67310',
  gray500: '#ADB5BD',
  gray200: '#E9ECEF',
  white: '#FFFFFF',
};

import HomeScreen from '../screens/Home/HomeScreen';
import SearchResultsScreen from '../screens/Search/SearchResultsScreen';
import BAICameraScreen from '../screens/BAISearch/BAICameraScreen';
import BAIResultsScreen from '../screens/BAISearch/BAIResultsScreen';
import BAIHistoryScreen from '../screens/BAISearch/BAIHistoryScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    </Stack.Navigator>
  );
}

function BAIStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="BAICamera"
    >
      <Stack.Screen name="BAICamera" component={BAICameraScreen} />
      <Stack.Screen name="BAIResults" component={BAIResultsScreen} />
      <Stack.Screen name="BAIHistory" component={BAIHistoryScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const favoriteCount = useFavorites(state => state.getFavoriteCount());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          height: 88,
          paddingBottom: 34,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
      screenListeners={({ navigation, route }) => ({
        tabPress: (e) => {
          // BAI tab'ına basıldığında her zaman kamera ekranına git
          if (route.name === 'BAI') {
            e.preventDefault();
            navigation.navigate('BAI', {
              screen: 'BAICamera',
            });
          }
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="basket-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="BAI"
        component={BAIStack}
        options={{
          tabBarLabel: 'BAI',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size + 4} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Favorilerim"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorilerim',
          tabBarBadge: favoriteCount > 0 ? favoriteCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}