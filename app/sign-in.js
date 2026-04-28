import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { FontAwesome, Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import useAuthStore from '../src/stores/authStore';
import PrimaryButton from '../src/components/PrimaryButton';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function SignIn() {
  const router = useRouter();
  const signInWithApple = useAuthStore((s) => s.signInWithApple);
  const [loading, setLoading] = useState(null);

  const handleApple = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Apple Sign In', 'Sign in with Apple is available on iOS.');
      return;
    }
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      Alert.alert('Apple Sign In', 'Apple Sign In is not available on this device.');
      return;
    }

    setLoading('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token.');
      }
      await signInWithApple(credential.identityToken);
      router.replace('/(tabs)');
    } catch (e) {
      if (e?.code === 'ERR_REQUEST_CANCELED' || e?.code === 'ERR_CANCELED') return;
      Alert.alert('Sign in failed', e?.message || 'Unable to complete Apple Sign In.');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = () => {
    // TODO: Wire Google Sign-In via expo-auth-session / Google OAuth — needs client IDs and redirect URI.
    Alert.alert('Coming soon', 'Google sign-in will be available in a future update.');
  };

  const handleEmail = () => {
    router.push('/email-signin');
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
            onPress={handleApple}
            fullWidth
            loading={loading === 'apple'}
            disabled={anyLoading}
            iconLeft={<FontAwesome name="apple" size={20} color={tokens.colors.white} />}
            style={styles.appleBtn}
            labelStyle={styles.appleBtnLabel}
          />
          <PrimaryButton
            label="Continue with Google"
            onPress={handleGoogle}
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
            onPress={handleEmail}
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
