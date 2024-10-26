import { baseStyles } from "@/components/baseStyles";
import PermissionsButton from "@/components/PermissionsButton";
import StopButton from "@/components/StopButton";
import * as TaskManager from "expo-task-manager";
import { useEffect, useState } from "react";
import { Text, Button, View, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications"; // Used only for local notifs
import * as Location from "expo-location";
import { sendLocation } from "@/components/sendLocation";
import SendTestButton from "@/components/SendTestButton";

console.log("App started");
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
Notifications.scheduleNotificationAsync({
  content: {
    sound: false,
    body: "Tracker app opened at " + new Date().toLocaleTimeString(),
  },
  trigger: null,
});
const REFRESH_TASK_DEFINITION = true;
if (
  !TaskManager.isTaskDefined("background-location-task") ||
  REFRESH_TASK_DEFINITION
) {
  console.log("Defining task");
  TaskManager.defineTask("background-location-task", ({ data, error }) => {
    console.log("Task executed");
    if (error) {
      console.error(error.message);
      return;
    }
    if (data) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Tracker location sent",
          sound: false,
          body:
            "Location sent at " +
            new Date().toLocaleTimeString() +
            JSON.stringify(data),
        },
        trigger: null,
      });
      const locations = data.locations as Array<Location.LocationObject>;
      console.log("Locations:", locations);
      locations.forEach((location) => {
        sendLocation(location);
      });
    }
  });
}

export default function Page() {
  return (
    <View style={styles.container}>
      <Status />
      <SendTestButton />
    </View>
  );
}

const Status = () => {
  const [taskStatus, setTaskStatus] = useState<
    "unavailable" | "notRegistered" | "running" | null
  >(null);

  useEffect(() => {
    console.log("Checking task status");
    TaskManager.isAvailableAsync().then((available) => {
      if (!available) setTaskStatus("unavailable");
      else
        TaskManager.isTaskRegisteredAsync("background-location-task").then(
          (registered) =>
            setTaskStatus(registered ? "running" : "notRegistered")
        );
    });
  }, [taskStatus]);

  if (taskStatus === null)
    return <Text style={baseStyles.text}>Loading status...</Text>;
  else if (taskStatus === "unavailable")
    return (
      <Text style={baseStyles.text}>
        Device does not support background tasks
      </Text>
    );
  else if (taskStatus === "notRegistered")
    return <PermissionsButton setTaskStatus={setTaskStatus} />;
  else
    return (
      <>
        <Text style={baseStyles.text}>Sending location in background</Text>
        <StopButton setTaskStatus={setTaskStatus} />
      </>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
