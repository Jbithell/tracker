import React, { useState } from "react";
import { Button, View, StyleSheet, Text, Pressable } from "react-native";
import * as Location from "expo-location";
import { baseStyles } from "./baseStyles";

const StopButton = (props: { setTaskStatus: Function }) => {
  const [settingUpTask, setSettingUpTask] = useState(false);
  if (settingUpTask)
    return <Text style={baseStyles.text}>Stopping task...</Text>;
  return (
    <Pressable
      style={baseStyles.button}
      onPress={() => {
        setSettingUpTask(true);
        Location.stopLocationUpdatesAsync("background-location-task").then(
          () => {
            setSettingUpTask(false);
            props.setTaskStatus(null);
          }
        );
      }}
    >
      <Text style={baseStyles.buttonText}>Stop background location</Text>
    </Pressable>
  );
};
export default StopButton;
