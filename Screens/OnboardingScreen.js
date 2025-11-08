import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ScrollView,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView, // Import KeyboardAvoidingView
  Platform, // Import Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null); // <-- Ref for the ScrollView

  const [form, setForm] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    motivation: '',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleFinish = async () => {
    try {
      const userData = { ...form };
      const heightInMeters = parseFloat(form.height) / 100;
      const weight = parseFloat(form.weight);
      const bmi = weight / (heightInMeters * heightInMeters);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('bmi', bmi.toFixed(1));
      navigation.navigate('Result');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // --- NEW FUNCTION ---
  // This function scrolls to the next slide
  const handleNextSlide = (index) => {
    if (index < slides.length - 1 && scrollViewRef.current) {
      const nextSlideY = (index + 1) * height;
      scrollViewRef.current.scrollTo({ y: nextSlideY, animated: true });
    }
  };

  // --- REFACTORED SLIDES ARRAY ---
  // The 'input' property was replaced with 'inputType', 'inputField', and 'inputProps'
  // to allow us to add the 'onSubmitEditing' prop in the render method.
  const slides = [
    {
      title: 'Welcome to FitStart!',
      subtitle: 'Let’s begin your transformation journey 💪',
      image: require('../assets/WhatsApp Image 2025-04-10 at 4.08.45 PM.jpeg'),
      inputType: null,
      textColor: 'white',
      showArrows: true,
    },
    {
      title: 'Your Age',
      subtitle: 'Enter your age',
      image: require('../assets/step5-finalfit.jpg'),
      inputType: 'text',
      inputField: 'age',
      inputProps: {
        placeholder: "e.g. 21",
        keyboardType: "numeric",
      },
      textColor: 'white',
    },
    {
      title: 'Your Gender',
      subtitle: 'Male, Female, Other...',
      image: require('../assets/step5-finalfit.jpg'),
      inputType: 'text',
      inputField: 'gender',
      inputProps: {
        placeholder: "e.g. Male",
      },
      textColor: 'white',
    },
    {
      title: 'Your Height (cm)',
      subtitle: 'Helps us calculate BMI',
      image: require('../assets/step5-finalfit.jpg'),
      inputType: 'text',
      inputField: 'height',
      inputProps: {
        placeholder: "e.g. 170",
        keyboardType: "numeric",
      },
      textColor: 'white',
    },
    {
      title: 'Your Weight (kg)',
      subtitle: 'We’re almost there!',
      image: require('../assets/step5-finalfit.jpg'),
      inputType: 'text',
      inputField: 'weight',
      inputProps: {
        placeholder: "e.g. 65",
        keyboardType: "numeric",
      },
      textColor: 'white',
    },
    {
      title: 'Your Daily Activity Level',
      subtitle: 'Helps us personalize diet & workouts',
      image: require('../assets/step5-finalfit.jpg'),
      inputType: 'text',
      inputField: 'activityLevel',
      inputProps: {
        placeholder: "e.g. Sedentary / Moderate / Active",
      },
      textColor: 'white',
    },
    {
      title: 'Your Fitness Goal',
      subtitle: 'To help you get ur dream bod',
      image: require('../assets/step5-finalfit.jpg'),
      inputType: 'text',
      inputField: 'goal',
      inputProps: {
        placeholder: "e.g. Muscle gain",
      },
      textColor: 'white',
    },
    {
      title: 'What inspires you?',
      subtitle: 'This will help us motivate you later!',
      image: require('../assets/step5-finalfit.jpg'),
      inputType: 'textarea', // Changed to 'textarea' to handle multiline
      inputField: 'motivation',
      inputProps: {
        placeholder: "e.g. I want to be confident again",
        multiline: true,
      },
      textColor: 'white',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef} // <-- ADDED REF
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        // Disables manual scrolling to prevent accidental swipes,
        // but auto-scroll and back-swipe (if enabled) still work.
        // Remove this if you want manual vertical scrolling.
        scrollEnabled={true}
      >
        {slides.map((slide, index) => (
          <ImageBackground
            key={index}
            source={slide.image}
            style={styles.slide}
            resizeMode="cover"
            blurRadius={2}
          >
            <LinearGradient
              colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
              style={styles.topFade}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
              style={styles.bottomFade}
            />
            <View style={styles.overlay} />
            {/* --- MODIFIED VIEW --- */}
            {/* This View now conditionally centers the content for the first slide (index === 0) */}
            <View style={[
              styles.content,
              index === 0 && styles.welcomeContent // <-- THIS IS THE FIX
            ]}>
              <Text style={[styles.title, { color: slide.textColor }]}>{slide.title}</Text>
              <Text style={[styles.subtitle, { color: slide.textColor }]}>{slide.subtitle}</Text>

              {/* --- REPLACED slide.input WITH THIS RENDER LOGIC --- */}
              {slide.inputType === 'text' && (
                <TextInput
                  style={styles.input}
                  placeholder={slide.inputProps.placeholder}
                  placeholderTextColor="#666"
                  keyboardType={slide.inputProps.keyboardType || 'default'}
                  onChangeText={(val) => handleChange(slide.inputField, val)}
                  onSubmitEditing={() => handleNextSlide(index)} // <-- Auto-scrolls on "Enter"
                  returnKeyType="next" // Shows "Next" button on keyboard
                />
              )}

              {slide.inputType === 'textarea' && (
                <TextInput
                  style={[styles.input, { height: 80, color: 'white' }]} // Preserved your custom style
                  placeholder={slide.inputProps.placeholder}
                  placeholderTextColor="#ccc" // Preserved your custom color
                  multiline
                  onChangeText={(val) => handleChange(slide.inputField, val)}
                  returnKeyType="done" // "Enter" will make a new line
                />
              )}
              {/* --- END OF REPLACED LOGIC --- */}

              {slide.showArrows && (
                <View style={styles.arrows}>
                  <Text style={[styles.arrow, { fontSize: 28 }]}>▲</Text>
                  <Text style={[styles.arrow, { fontSize: 22 }]}>▲</Text>
                  <Text style={[styles.arrow, { fontSize: 16 }]}>▲</Text>
                  <Text style={styles.swipeText}>Swipe up</Text>
                </View>
              )}
              {index === slides.length - 1 && (
                <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
                  <Text style={styles.finishText}>Finish</Text>
                </TouchableOpacity>
              )}
            </View>
          </ImageBackground>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  slide: {
    height,
    width: '100%',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    paddingTop: 250,
    paddingHorizontal: 25,
    justifyContent: 'flex-start', // <-- Keeps all slides aligned top by default
  },
  // --- NEW STYLE ---
  // This style will be applied ONLY to the first slide to re-center its content
  welcomeContent: {
    justifyContent: 'center',
    paddingTop: 100, // Reset paddingTop so 'justifyContent' can center properly
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: 'black',
    marginBottom: 20,
  },
  arrows: {
    alignItems: 'center',
  },
  arrow: {
    color: '#fff',
    marginBottom: 5,
  },
  swipeText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: '#0C9C88',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 40,
  },
  finishText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  topFade: {
    height: 200,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomFade: {
    height: 200,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});