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

export default function EmailSignUp() {
  const router = useRouter();
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await signUpWithEmail(trimmedEmail, password);
      router.push({
        pathname: '/email-signup-verify',
        params: {
          email: trimmedEmail,
          pendingToken: result.pendingToken,
          ...(result.devOtp ? { devOtp: result.devOtp } : {}),
        },
      });
    } catch (e) {
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || 'Sign up failed. Please try again.');
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
                Create account
              </Text>
            </View>
          }
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.headline}>Join CarLens</Text>
          <Text style={styles.subline}>
            Save your garage, track orders, and find the right parts.
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
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={tokens.colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!loading}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={8}
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={tokens.colors.textMuted}
              />
            </Pressable>
          </View>

          <Text style={styles.label}>Confirm password</Text>
          <View style={[styles.passwordWrap, styles.confirmWrap]}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={tokens.colors.textMuted}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!loading}
              onSubmitEditing={onSignUp}
              returnKeyType="go"
            />
            <Pressable
              onPress={() => setShowConfirm((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={8}
            >
              <Feather
                name={showConfirm ? 'eye-off' : 'eye'}
                size={18}
                color={tokens.colors.textMuted}
              />
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Create Account"
            onPress={onSignUp}
            fullWidth
            loading={loading}
            disabled={loading}
            style={styles.signUpBtn}
          />

          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            style={styles.signInWrap}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </Pressable>
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
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.sm,
  },
  subline: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    lineHeight: tokens.fontSize.md * 1.5,
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
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.lg,
  },
  confirmWrap: {
    marginBottom: tokens.spacing.lg,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  eyeBtn: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
  },
  error: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
    marginBottom: tokens.spacing.md,
  },
  signUpBtn: {
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.xl,
  },
  signInWrap: {
    alignItems: 'center',
  },
  signInText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
  },
  signInLink: {
    fontFamily: tokens.fonts.sansMedium,
    color: tokens.colors.primary,
  },
});
