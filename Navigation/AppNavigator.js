import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../Screens/OnboardingScreen';
import ResultScreen from '../Screens/ResultScreen';
import HealthStatusScreen from '../Screens/HealthStatusScreen'; // Import the HealthStatusScreen

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="HealthStatus" component={HealthStatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
