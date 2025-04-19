import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResultScreen({ navigation }) {
  const [bmi, setBmi] = useState(null);
  const [userData, setUserData] = useState(null);
  const [opacity] = useState(new Animated.Value(0)); // For animation

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the user data and BMI from AsyncStorage
        const userDataFromStorage = await AsyncStorage.getItem('userData');
        const bmiFromStorage = await AsyncStorage.getItem('bmi');

        if (userDataFromStorage && bmiFromStorage) {
          setUserData(JSON.parse(userDataFromStorage));
          setBmi(bmiFromStorage);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Fade-in animation for BMI and recommendation display
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getFitnessRecommendation = (bmi) => {
    if (!bmi) return '';

    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) {
      return 'Consider gaining some weight and building muscle!';
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      return 'Keep up the great work!';
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      return 'A fitness plan to lose weight could be beneficial.';
    } else {
      return 'It’s important to focus on a healthy lifestyle and weight loss.';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Result</Text>

      <Animated.View style={[styles.resultContainer, { opacity }]}>
        {userData && bmi ? (
          <>
            <Text style={styles.resultText}>
              Hello {userData.age} years old {userData.gender}, your BMI is {bmi}.
            </Text>
            <Text style={styles.recommendationText}>{getFitnessRecommendation(bmi)}</Text>
            <Text style={styles.motivationText}>
              Let's take charge of your fitness journey! Remember, every step counts! 💪
            </Text>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
      </Animated.View>

      {/* Fitness Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🏋️‍♂️</Text>
      </View>

      {/* Navigate to the health status screen */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HealthStatus', { userData })}>
        <Text style={styles.buttonText}>Let AI judge my Fitness </Text>
      </TouchableOpacity>

      {/* Go Back Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0C9C88',
  },
  resultContainer: {
    backgroundColor: '#e7f5f0',
    borderRadius: 15,
    padding: 20,
    marginVertical: 30,
    borderWidth: 1,
    borderColor: '#0C9C88',
    width: '90%',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  recommendationText: {
    fontSize: 16,
    color: '#0C9C88',
    marginBottom: 20,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 18,
    color: '#0C9C88',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#777',
  },
  iconContainer: {
    marginVertical: 20,
    fontSize: 50,
  },
  icon: {
    fontSize: 50,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0C9C88',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
