import { useEffect, useRef, useState } from 'react';
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

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function EmailSignUpVerify() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = String(params.email || '');
  const [pendingToken, setPendingToken] = useState(String(params.pendingToken || ''));
  const [devOtp, setDevOtp] = useState(params.devOtp ? String(params.devOtp) : null);

  const verifySignupOtp = useAuthStore((s) => s.verifySignupOtp);
  const resendSignupOtp = useAuthStore((s) => s.resendSignupOtp);

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const inputRefs = useRef([]);

  // Countdown timer for resend cooldown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const fullCode = code.join('');
  const isComplete = fullCode.length === CODE_LENGTH;

  function handleChange(text, index) {
    const digits = text.replace(/\D/g, '');

    // Handle paste: if more than one digit lands on a box, fill all boxes.
    if (digits.length > 1) {
      const filled = digits.slice(0, CODE_LENGTH).split('');
      const next = Array(CODE_LENGTH).fill('');
      filled.forEach((d, i) => { next[i] = d; });
      setCode(next);
      const focusIndex = Math.min(filled.length, CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const next = [...code];
    next[index] = digits;
    setCode(next);
    setError('');

    if (digits && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e, index) {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function onVerify() {
    if (!isComplete) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifySignupOtp(pendingToken, fullCode);
      router.replace('/(tabs)');
    } catch (e) {
      setError(
        e?.response?.data?.error?.message ||
          e?.response?.data?.message ||
          e?.message ||
          'Verification failed. Please check the code and try again.',
      );
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const result = await resendSignupOtp(pendingToken);
      setPendingToken(result.pendingToken);
      if (result.devOtp) setDevOtp(result.devOtp);
      setCode(Array(CODE_LENGTH).fill(''));
      setCooldown(RESEND_COOLDOWN_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (e) {
      setError(
        e?.response?.data?.error?.message ||
          e?.response?.data?.message ||
          e?.message ||
          'Could not resend code. Please try again.',
      );
    } finally {
      setResending(false);
    }
  }

  const maskedEmail = email.length > 4
    ? `${email.slice(0, 2)}${'•'.repeat(Math.max(0, email.indexOf('@') - 2))}${email.slice(email.indexOf('@'))}`
    : email;

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
                Verify email
              </Text>
            </View>
          }
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.iconWrap}>
            <Feather name="mail" size={44} color={tokens.colors.primary} strokeWidth={1.5} />
          </View>

          <Text style={styles.headline}>Check your inbox</Text>
          <Text style={styles.subline}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailHighlight}>{maskedEmail}</Text>
          </Text>

          {/* 6-box OTP input */}
          <View style={styles.codeRow}>
            {Array(CODE_LENGTH).fill(null).map((_, i) => (
              <TextInput
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                style={[
                  styles.codeBox,
                  code[i] ? styles.codeBoxFilled : null,
                  error ? styles.codeBoxError : null,
                ]}
                value={code[i]}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                selectTextOnFocus
                editable={!loading}
                textContentType="oneTimeCode"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                autoFocus={i === 0}
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Verify"
            onPress={onVerify}
            fullWidth
            loading={loading}
            disabled={loading || !isComplete}
            style={styles.verifyBtn}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive it?</Text>
            <Pressable
              onPress={onResend}
              disabled={cooldown > 0 || resending || loading}
              hitSlop={8}
            >
              <Text style={[styles.resendLink, (cooldown > 0 || resending || loading) && styles.resendLinkDisabled]}>
                {resending
                  ? 'Sending…'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend code'}
              </Text>
            </Pressable>
          </View>

          {__DEV__ && devOtp ? (
            <View style={styles.devBox}>
              <Text style={styles.devLabel}>DEV — verification code:</Text>
              <Text selectable style={styles.devCode}>{devOtp}</Text>
            </View>
          ) : null}
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
    alignItems: 'center',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${tokens.colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  subline: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: tokens.fontSize.md * 1.6,
    marginBottom: tokens.spacing.xxl,
  },
  emailHighlight: {
    fontFamily: tokens.fonts.sansMedium,
    color: tokens.colors.text,
  },
  codeRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    textAlign: 'center',
    fontSize: tokens.fontSize.xl,
    fontFamily: tokens.fonts.sansMedium,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.white,
  },
  codeBoxFilled: {
    borderColor: tokens.colors.primary,
    backgroundColor: `${tokens.colors.primary}08`,
  },
  codeBoxError: {
    borderColor: tokens.colors.danger,
  },
  error: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  verifyBtn: {
    width: '100%',
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.xl,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  resendText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  resendLink: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },
  resendLinkDisabled: {
    color: tokens.colors.textMuted,
  },
  devBox: {
    marginTop: tokens.spacing.xxl,
    width: '100%',
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    alignItems: 'center',
  },
  devLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  devCode: {
    fontFamily: 'Courier',
    fontSize: tokens.fontSize.xl,
    letterSpacing: 6,
    color: tokens.colors.text,
  },
});
