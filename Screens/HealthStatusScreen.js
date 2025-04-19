import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Animated } from 'react-native';
import axios from 'axios';

const HealthStatusScreen = ({ route, navigation }) => {
  const { userData } = route.params;  // Receiving user data from previous screen
  const [healthStatus, setHealthStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [opacity, setOpacity] = useState(new Animated.Value(0)); // For animation

  const getHealthStatus = async () => {
    try {
      // Make API request to get health status based on user data
      const activityMap = {
        'Sedentary': 0,
        'Moderate': 1,
        'Active': 2,
      };
      
      const response = await axios.post('http://10.14.220.249:5000/predict', {
        age: parseInt(userData.age),
        gender: userData.gender === 'Male' ? 1 : 0,
        height: parseInt(userData.height),
        weight: parseInt(userData.weight),
        activity_level: activityMap[userData.activity_level] ?? 1,  // fallback to 1 if not found
        goal: userData.goal === 'Muscle gain' ? 1 : (userData.goal === 'Weight loss' ? 2 : 0),
      });

      const status = response.data.body_type; // Get the body type from the backend response
      setHealthStatus(status);
      
      // Set appropriate message based on health status
      if (status === 'Underweight') {
        setStatusMessage("You're underweight! Consider gaining some healthy weight and building muscle.");
      } else if (status === 'Fit') {
        setStatusMessage("You're in great shape! Keep up the excellent work and maintain your fitness!");
      } else if (status === 'Overweight') {
        setStatusMessage("You're overweight. It's time to focus on a balanced workout and diet plan to achieve your goals!");
      } else {
        setStatusMessage("We couldn't determine your health status. Please try again.");
      }
    } catch (error) {
      console.error('Error getting health status', error);
      setStatusMessage("There was an error fetching your health status. Please try again.");
    }
  };

  useEffect(() => {
    getHealthStatus();

    // Fade-in animation for health status display
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Health Status</Text>

      {/* Animated Health Status Display */}
      <Animated.View style={[styles.statusContainer, { opacity }]}>
        <Text style={styles.statusText}>Health Status: {healthStatus || 'Loading...'}</Text>
        <Text style={styles.messageText}>{statusMessage}</Text>
      </Animated.View>

      {/* Fitness Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>💪</Text>
      </View>

      {/* Back Button */}
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0C9C88',
  },
  statusContainer: {
    backgroundColor: '#e7f5f0',
    borderRadius: 15,
    padding: 20,
    marginVertical: 30,
    borderWidth: 1,
    borderColor: '#0C9C88',
  },
  statusText: {
    fontSize: 24,
    color: '#0C9C88',
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 18,
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  iconContainer: {
    marginVertical: 20,
    fontSize: 50,
  },
  icon: {
    fontSize: 50,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default HealthStatusScreen;
