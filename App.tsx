import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function Gallery() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!!</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Gallery></Gallery>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
