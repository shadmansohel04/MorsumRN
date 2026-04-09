import { Tabs } from 'expo-router';
import { StatusBar, StyleSheet, useColorScheme, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
        initialRouteName='(home)'
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#FF8762',
          tabBarInactiveTintColor: '#7A7D79',
          tabBarLabelStyle: styles.label,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'FEED',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="menu" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="(pantry)"
          options={{
            title: 'PANTRY',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="fridge" color={color} size={size} />
            )
          }}
        />

        <Tabs.Screen
          name="(newupload)"
          options={{
            title: 'ADD',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" color={color} size={size} />
            )
          }}
        />

        {/* <Tabs.Screen
          name="(messagestack)"
          options={{
            title: 'CHATS',
            tabBarIcon: ({ color, size }) => (
              <Entypo name="message" color={color} size={size} />
            )
          }}
        /> */}

        <Tabs.Screen
          name="(profile)"
          options={{
            title: 'PROFILE',
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
      backgroundColor: '#151714', 
      borderTopColor: 'transparent',
      elevation: 0, 
      height: 65,
      paddingBottom: 5,
      paddingTop: 5,
    },

    label: {
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
  });
}