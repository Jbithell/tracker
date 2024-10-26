import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
       <Link href="/">
          <Text>Not found - go to home</Text>
        </Link>
    </>
  );
}