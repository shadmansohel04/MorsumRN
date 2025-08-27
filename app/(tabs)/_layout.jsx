import { Tabs } from 'expo-router';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  return (
    <>
    <StatusBar
      translucent={true}
      backgroundColor="transparent"
      barStyle={colorScheme === "light"? "light-content": "dark-content"} 
    />

    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.pop,
        tabBarInactiveTintColor: colors.textColor, 
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" color={color} size={size} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="map" color={color} size={size} />
          )
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="camera" color={color} size={size} />
          )
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="message" color={color} size={size} />
          )
        }}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          )
        }}
      />

    </Tabs>
    </>
  );
}

function createStyles(colors) {

  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.tabBar,
      borderTopColor: 'transparent',
      height: 60,
      paddingBottom: 5,
    },
    label: {
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
}
