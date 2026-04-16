import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  useFonts,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import tokens from '../src/theme/tokens';

export default function SplashScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular_Italic,
    Inter_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={styles.blank} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.lockup}>
        <View style={styles.rule} />
        <Text style={styles.wordmark}>CarLens</Text>
        <View style={styles.rule} />
        <Text style={styles.tagline}>IDENTIFY · FIT · BUY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blank: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    alignItems: 'center',
  },
  rule: {
    width: 180,
    height: 1,
    backgroundColor: tokens.colors.primary,
  },
  wordmark: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.hero,
    color: tokens.colors.primary,
    marginVertical: tokens.spacing.xl,
  },
  tagline: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: tokens.spacing.md,
  },
});
