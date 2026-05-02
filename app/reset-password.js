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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import useAuthStore from '../src/stores/authStore';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const resetPasswordFn = useAuthStore((s) => s.resetPassword);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onReset = async () => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
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
      await resetPasswordFn(token, password);
      setDone(true);
    } catch (e) {
      setError(
        e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || 'Reset failed. The link may have expired.'
      );
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
          titleNode={
            <View style={styles.topTitleWrap}>
              <Text style={styles.topTitle} numberOfLines={1}>
                Reset password
              </Text>
            </View>
          }
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {done ? (
            <>
              <View style={styles.iconWrap}>
                <Feather name="check-circle" size={40} color={tokens.colors.primary} />
              </View>
              <Text style={styles.headline}>Password updated</Text>
              <Text style={styles.body}>
                Your password has been changed. You can now sign in with your new password.
              </Text>
              <PrimaryButton
                label="Sign In"
                onPress={() => router.replace('/email-signin')}
                fullWidth
                style={styles.signInBtn}
              />
            </>
          ) : (
            <>
              <Text style={styles.headline}>Choose a new password</Text>
              <Text style={styles.body}>
                Your new password must be at least 8 characters.
              </Text>

              <Text style={styles.label}>New password</Text>
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

              <Text style={styles.label}>Confirm new password</Text>
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
                  onSubmitEditing={onReset}
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
                label="Reset Password"
                onPress={onReset}
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
  label: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.sm,
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
  signInBtn: {
    marginTop: tokens.spacing.md,
  },
});
