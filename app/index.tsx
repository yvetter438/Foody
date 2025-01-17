import { Text, View, TextInput, StyleSheet, Dimensions, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Svg, { Image, Ellipse, ClipPath } from 'react-native-svg';
import Animated, { 
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    withTiming,
    withDelay,
    runOnJS,
    withSequence,
    withSpring,
    withRepeat,
    } from 'react-native-reanimated';


export default function Index() {
  const { height, width } = Dimensions.get("window");
  const imagePosition = useSharedValue(1);
  const formButtonScale = useSharedValue(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const shimmer = useSharedValue(0);

  //supabase logic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1, // -1 means infinite repeat
      true // reverse the animation
    );
  }, []);

  // Add this with your other animated styles
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transform: [{
        translateX: interpolate(
          shimmer.value,
          [0, 1],
          [-width, width]
        ),
      }],
    };
  });



  const imageAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePosition.value, [0, 1], [-height * .52, 0])
    return {
      transform: [{translateY: withTiming(interpolation, {duration: 1000})}],
      zIndex: -1
    }
  })

  const buttonsAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePosition.value, [0, 1], [250, 0])
    return {
      opacity: withTiming(imagePosition.value, {duration: 500}),
      transform: [{translateY: withTiming(interpolation, {duration: 1000})}]
    }
  })

  const closeButtonContainerStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePosition.value, [0, 1], [180, 360])
    return {
      opacity: withTiming(imagePosition.value === 1 ? 0: 1, {duration: 800}),
      transform: [{rotate: withTiming(interpolation + "deg", {duration: 1000})}]
    }
  })

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: imagePosition.value === 0 
      ? withDelay(400, withTiming(1, {duration: 800})) 
      : withTiming(0, {duration: 300})
    }
  })

  const formButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: formButtonScale.value}]
    }
  })

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      formButtonScale.value = withSequence(withSpring(1.5), withSpring(1));
      setTimeout(() => {
        router.push('./(tabs)');
      }, 800);
    }
    setLoading(false);
  }
  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else if (!session) {
      Alert.alert('Please check your inbox for email verification!');
    }
    setLoading(false);
  }


  const guestLoginHandler = () => {
    // Animate the button
    formButtonScale.value = withSequence(withSpring(1.5), withSpring(1));
    setTimeout(() => {
      router.push('./(tabs)');
    }, 800);
  };


  const loginHandler = () => {
    imagePosition.value = 0;
    if (isRegistering) {
      setIsRegistering(false);
      runOnJS(setIsRegistering)(false);
    } 

    // setTimeout(() => {
    //   router.push('./auth/authIndex');
    // }, 1000);
  }

  const registerHandler = () => {
    imagePosition.value = 0;
    if (!isRegistering) {
      setIsRegistering(true);
      runOnJS(setIsRegistering)(true);
    }
    // setTimeout(() => {
    //   router.push('./auth/authIndex');
    // }, 1000);
  }

  return (
    
    <KeyboardAvoidingView
    style={styles.container} 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <Animated.View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, imageAnimatedStyle]}>
        <Svg height={height + 100} width={width}>
          <ClipPath id="clipPathId">
            <Ellipse cx={width / 2} rx={height} ry={height + 100} />
          </ClipPath>
          <Image 
          href={require('.././assets/images/login-background.png')}
          width={width + 100} 
          height={height + 100}
          preserveAspectRatio="xMidYMid slice"
          x={-50}
          clipPath="url(#clipPathId)"
          />
          {/*  <Animated.View style={shimmerStyle} /> */}
        </Svg>
        <Animated.View style={[styles.closeButtonContainer, closeButtonContainerStyle]}>
        <Pressable 
            style={styles.closeButton}
            onPress={() => imagePosition.value = 1}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
      <View style={styles.bottomContainer}>
        <Animated.View style={buttonsAnimatedStyle}>
          {/*   Guest Login Button*/    }
          <Pressable style={styles.button} onPress={guestLoginHandler}>
            <Text style={[styles.buttonText, styles.guestButtonText]}>BROWSE AS GUEST</Text>
            </Pressable>
          
          <Pressable style={styles.button} onPress={loginHandler}>
            <Text style={styles.buttonText}>LOG IN</Text>
          </Pressable>
        </Animated.View>
        <Animated.View style={buttonsAnimatedStyle}>
          <Pressable style={styles.button} onPress={registerHandler}>
            <Text style={styles.buttonText}>REGISTER</Text>
          </Pressable>
        </Animated.View>
        
        <Animated.View style={[styles.formInputContainer, formAnimatedStyle]}>
          <TextInput 
            placeholder="Email" 
            placeholderTextColor="black" 
            style={styles.textInput}
            onChangeText={(text) => setEmail(text)}
            value={email}
            autoCapitalize="none"
          />
          {/*}
          {isRegistering && (
          <TextInput 
            placeholder="Full Name"  
            placeholderTextColor="black" 
            style={styles.textInput}
          />
          )}
            */}
          <TextInput 
            placeholder="Password"  
            placeholderTextColor="black" 
            style={styles.textInput}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            autoCapitalize="none"
          />
          <Animated.View style={[styles.formButton, formButtonAnimatedStyle]}>
            <Pressable 
              style={styles.button} 
               // {width: width - 40}, 
               // {backgroundColor: 'rgba(0,255,0,0.2)'} debug for button width
              
              onPress={() => {
                formButtonScale.value = withSequence(withSpring(1.5), withSpring(1));
                if (isRegistering) {
                  signUpWithEmail();
                } else {
                  signInWithEmail();
                }
              }}>
              <Text style={styles.buttonText}>{isRegistering ? 'REGISTER' : 'LOG IN'}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View> 
      </View>
    </Animated.View>
    
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const { height, width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: 'rgba(123, 104, 238, 0.8',
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'white',
    width: width - 40,
    
  }, 
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.5
  },
  bottomContainer: {
    justifyContent: 'center',
    height: height / 3,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 25,
    paddingLeft: 10,
  },
  formButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formInputContainer: {
    marginBottom: 70,
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: 'center',
  },
  closeButtonContainer: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 25,
    top: -20,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  closeButton: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    color: 'white',
  },
  guestButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.8)', // Gray color for guest mode
    borderColor: '#ddd',
  },
});
