import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import useAuthStore from '../src/stores/authStore';

const isDevEnv =
  (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development';

export default function EmailSignIn() {
  const router = useRouter();
  const sendMagicLink = useAuthStore((s) => s.sendMagicLink);
  const [phase, setPhase] = useState('input');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastDevToken, setLastDevToken] = useState(null);

  const onSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await sendMagicLink(trimmed);
      setLastDevToken(result.devToken ?? null);
      setPhase('sent');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Could not send link.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const result = await sendMagicLink(trimmed);
      setLastDevToken(result.devToken ?? null);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Could not resend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TopBar
          leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
          onLeftPress={() => router.back()}
          titleNode={
            <View style={styles.topTitleWrap}>
              <Text style={styles.topTitle} numberOfLines={1}>
                Sign in with email
              </Text>
            </View>
          }
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {phase === 'input' ? (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={tokens.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton
                label="Send sign-in link"
                onPress={onSend}
                fullWidth
                loading={loading}
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Text style={styles.headline}>Check your email</Text>
              <Text style={styles.body}>
                We sent a link to {email.trim()}. Tap it to sign in.
              </Text>
              {/* TODO: Use expo-linking to intercept the magic-link URL and call authStore.verifyMagicLink(token). */}
              <Pressable onPress={onResend} disabled={loading} style={styles.resendWrap}>
                <Text style={styles.resend}>Resend</Text>
              </Pressable>
              {isDevEnv && lastDevToken ? (
                <Text style={styles.devToken} selectable>
                  Dev token: {lastDevToken}
                </Text>
              ) : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  topTitleWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  label: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 8,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.md,
  },
  error: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
    marginBottom: tokens.spacing.md,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.md,
  },
  body: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    lineHeight: tokens.fontSize.md * 1.5,
    marginBottom: tokens.spacing.lg,
  },
  resendWrap: {
    alignSelf: 'flex-start',
    marginBottom: tokens.spacing.lg,
  },
  resend: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.primary,
    textDecorationLine: 'underline',
  },
  devToken: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.md,
  },
});
