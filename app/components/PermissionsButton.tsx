import React, { useState } from "react";
import { Button, View, StyleSheet, Pressable, Text } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { baseStyles } from "./baseStyles";

const requestPermissions = async () => {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === "granted") {
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === "granted") {
      await Location.startLocationUpdatesAsync("background-location-task", {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5000,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          killServiceOnDestroy: false,
          notificationTitle: "Tracker",
          notificationBody: "Location is being sent in background...",
        },
      });
    }
  }
};

const PermissionsButton = (props: { setTaskStatus: Function }) => {
  const [settingUpTask, setSettingUpTask] = useState(false);
  if (settingUpTask)
    return <Text style={baseStyles.text}>Setting up task...</Text>;
  return (
    <Pressable
      style={baseStyles.button}
      onPress={() => {
        setSettingUpTask(true);
        requestPermissions().then(() => {
          setSettingUpTask(false);
          props.setTaskStatus(null);
        });
      }}
    >
      <Text style={baseStyles.buttonText}>Send location in background</Text>
    </Pressable>
  );
};

export default PermissionsButton;
