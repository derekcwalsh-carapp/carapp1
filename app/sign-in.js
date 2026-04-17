import { View, Text, StyleSheet, Image, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FontAwesome, Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import useAuthStore from '../src/stores/authStore';
import PrimaryButton from '../src/components/PrimaryButton';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function SignIn() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [loading, setLoading] = useState(null);

  const handleSignIn = async (provider) => {
    setLoading(provider);
    try {
      await signIn(provider);
      router.replace('/(tabs)');
    } finally {
      setLoading(null);
    }
  };

  const anyLoading = loading !== null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.heroContainer}>
        <Image
          source={require('../assets/signin-hero.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
      </View>

      <SafeAreaView edges={['bottom']} style={styles.content}>
        <Text style={styles.headline}>Welcome to CarLens</Text>
        <Text style={styles.subline}>
          Sign in to save your garage, orders, and parts.
        </Text>

        <View style={styles.buttons}>
          <PrimaryButton
            label="Continue with Apple"
            onPress={() => handleSignIn('apple')}
            fullWidth
            loading={loading === 'apple'}
            disabled={anyLoading}
            iconLeft={<FontAwesome name="apple" size={20} color={tokens.colors.white} />}
            style={styles.appleBtn}
            labelStyle={styles.appleBtnLabel}
          />
          <PrimaryButton
            label="Continue with Google"
            onPress={() => handleSignIn('google')}
            fullWidth
            variant="outlined"
            loading={loading === 'google'}
            disabled={anyLoading}
            iconLeft={<Feather name="chrome" size={20} color={tokens.colors.primary} />}
            style={styles.googleBtn}
            labelStyle={styles.googleBtnLabel}
          />
          <PrimaryButton
            label="Continue with email"
            onPress={() => handleSignIn('email')}
            fullWidth
            variant="outlined"
            loading={loading === 'email'}
            disabled={anyLoading}
            iconLeft={<Feather name="mail" size={20} color={tokens.colors.primary} />}
            labelStyle={styles.emailBtnLabel}
          />
        </View>

        <Text style={styles.legal}>
          By continuing you agree to our{' '}
          <Text style={styles.legalLink} onPress={() => console.log('Terms')}>
            Terms
          </Text>
          {' '}and{' '}
          <Text style={styles.legalLink} onPress={() => console.log('Privacy Policy')}>
            Privacy Policy
          </Text>
          .
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  heroContainer: {
    height: SCREEN_HEIGHT * 0.5,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,95,60,0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.xxl * 1.25,
  },
  subline: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.md,
    lineHeight: tokens.fontSize.md * 1.5,
  },
  buttons: {
    marginTop: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  appleBtn: {
    backgroundColor: tokens.colors.black,
    height: 52,
  },
  googleBtn: {
    backgroundColor: tokens.colors.white,
    height: 52,
  },
  appleBtnLabel: {
    fontFamily: tokens.fonts.sansMedium,
    color: tokens.colors.white,
  },
  googleBtnLabel: {
    fontFamily: tokens.fonts.sansMedium,
    color: tokens.colors.text,
  },
  emailBtnLabel: {
    fontFamily: tokens.fonts.sansMedium,
  },
  legal: {
    marginTop: 'auto',
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: tokens.fontSize.xs * 1.6,
  },
  legalLink: {
    color: tokens.colors.primary,
  },
});
