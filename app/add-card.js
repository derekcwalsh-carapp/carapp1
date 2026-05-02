import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import { createSetupIntent, createPaymentMethod } from '../src/api/paymentService';
import usePaymentStore from '../src/stores/paymentStore';

export default function AddCardScreen() {
  const router = useRouter();
  const { confirmSetupIntent } = useStripe();
  const { addMethod } = usePaymentStore();

  const [cardComplete, setCardComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preparingIntent, setPreparingIntent] = useState(true);
  const clientSecretRef = useRef(null);

  useEffect(() => {
    async function prefetchSetupIntent() {
      try {
        const { clientSecret } = await createSetupIntent();
        clientSecretRef.current = clientSecret;
      } catch {
        Alert.alert(
          'Setup error',
          'Could not initialize card setup. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setPreparingIntent(false);
      }
    }
    prefetchSetupIntent();
  }, []);

  async function handleAddCard() {
    if (!clientSecretRef.current) return;
    setSaving(true);
    try {
      const { setupIntent, error } = await confirmSetupIntent(clientSecretRef.current, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Card error', error.message || 'Could not verify your card.');
        return;
      }

      const pmId = setupIntent?.paymentMethodId;
      if (!pmId) {
        Alert.alert('Card error', 'Could not retrieve payment method. Please try again.');
        return;
      }

      const pm = await createPaymentMethod(pmId);
      addMethod(pm);
      router.back();
    } catch (e) {
      Alert.alert('Error', e?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topTitle}>Add Card</Text>}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {preparingIntent ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={tokens.colors.primary} />
              <Text style={styles.loadingText}>Preparing secure form…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.label}>CARD DETAILS</Text>

              <CardField
                postalCodeEnabled={false}
                placeholders={{ number: '4242 4242 4242 4242' }}
                cardStyle={{
                  backgroundColor: tokens.colors.bg,
                  textColor: tokens.colors.text,
                  placeholderColor: tokens.colors.textMuted,
                  borderColor: tokens.colors.border,
                  borderWidth: 1,
                  borderRadius: tokens.radius.md,
                }}
                style={styles.cardField}
                onCardChange={(details) => setCardComplete(details.complete)}
              />

              <Text style={styles.secureNote}>
                <Feather name="lock" size={11} color={tokens.colors.textMuted} />
                {'  '}
                Cards are stored securely with Stripe. CarLens never sees your full card number.
              </Text>

              <PrimaryButton
                label="Add card"
                onPress={handleAddCard}
                disabled={!cardComplete || saving}
                loading={saving}
                fullWidth
                style={styles.button}
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
    paddingTop: tokens.spacing.xxl,
    paddingBottom: tokens.spacing.xxxl,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: tokens.spacing.xxxl,
    gap: tokens.spacing.md,
  },
  loadingText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  label: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    letterSpacing: 2,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  cardField: {
    height: 50,
    marginBottom: tokens.spacing.sm,
  },
  secureNote: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.xxl,
    lineHeight: 18,
  },
  button: {
    marginTop: tokens.spacing.md,
  },
});
