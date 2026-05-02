import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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

export default function ForgotPassword() {
  const router = useRouter();
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const onSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await forgotPassword(trimmed);
      setDevToken(result?.devToken ?? null);
      setSent(true);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || 'Something went wrong. Please try again.');
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
                Forgot password
              </Text>
            </View>
          }
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {sent ? (
            <>
              <View style={styles.iconWrap}>
                <Feather name="mail" size={40} color={tokens.colors.primary} />
              </View>
              <Text style={styles.headline}>Check your inbox</Text>
              <Text style={styles.body}>
                If <Text style={styles.emailHighlight}>{email.trim()}</Text> is registered, we've
                sent a reset link. Tap it to choose a new password.
              </Text>
              <Text style={styles.note}>
                Didn't receive it? Check your spam folder or try again.
              </Text>
              {__DEV__ && devToken ? (
                <Text selectable style={styles.devLink}>
                  Dev link:{'\n'}carlens://reset-password?token={devToken}
                </Text>
              ) : null}
              <PrimaryButton
                label="Back to Sign In"
                onPress={() => router.back()}
                fullWidth
                style={styles.backBtn}
              />
            </>
          ) : (
            <>
              <Text style={styles.headline}>Reset your password</Text>
              <Text style={styles.body}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

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
                autoComplete="email"
                editable={!loading}
                onSubmitEditing={onSend}
                returnKeyType="send"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <PrimaryButton
                label="Send Reset Link"
                onPress={onSend}
                fullWidth
                loading={loading}
                disabled={loading}
              />
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
    paddingBottom: tokens.spacing.xxxl,
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
  iconWrap: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
    marginTop: tokens.spacing.lg,
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
    marginBottom: tokens.spacing.xl,
  },
  emailHighlight: {
    fontFamily: tokens.fonts.sansMedium,
    color: tokens.colors.text,
  },
  note: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.xl,
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
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.lg,
  },
  error: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
    marginBottom: tokens.spacing.md,
  },
  backBtn: {
    marginTop: tokens.spacing.md,
  },
  devLink: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: tokens.colors.textMuted,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
    lineHeight: 18,
  },
});
