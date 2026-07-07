import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppHeader } from "@/components/app-header";
import { useTheme } from "@/context/ThemeContext";

const CheckInTabButton = ({ children, onPress, colors }: any) => (
  <TouchableOpacity style={styles.checkInButtonContainer} onPress={onPress}>
    <View style={[styles.checkInButton, { backgroundColor: colors.primary, borderColor: colors.background }]}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <AppHeader />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tabIconSelected,
          tabBarInactiveTintColor: colors.tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
            backgroundColor: colors.tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={24} name="house.fill" color={focused ? colors.tabIconSelected : color} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: "Events",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={24} name="calendar.badge.plus" color={focused ? colors.tabIconSelected : color} />
            ),
          }}
        />
        <Tabs.Screen
          name="check-in"
          options={{
            title: "Check-In",
            tabBarButton: (props) => (
              <CheckInTabButton {...props} colors={colors}>
                <IconSymbol size={35} name="qrcode" color="#FFFFFF" />
              </CheckInTabButton>
            ),
            tabBarIcon: () => (
              <IconSymbol size={32} name="qrcode" color="#FFFFFF" />
            ),
          }}
        />
        <Tabs.Screen
          name="incidents"
          options={{
            title: "Incidents",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={24} name="exclamationmark.triangle.fill" color={focused ? colors.tabIconSelected : color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={24} name="person.fill" color={focused ? colors.tabIconSelected : color} />
            ),
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  checkInButtonContainer: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  checkInButton: {
    width: 65,
    height: 65,
    borderRadius: 40,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
