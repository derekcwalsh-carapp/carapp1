import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import { labelSans } from '../src/theme/typography';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import useAddressStore from '../src/stores/addressStore';

function FieldLabel({ children }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export default function CheckoutAddressEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addressId = typeof params.id === 'string' ? params.id : '';

  const addresses = useAddressStore((s) => s.addresses);
  const fetchAddresses = useAddressStore((s) => s.fetchAddresses);
  const updateAddress = useAddressStore((s) => s.updateAddress);

  const address = useMemo(
    () => addresses.find((entry) => entry.id === addressId) ?? null,
    [addresses, addressId],
  );

  const [name, setName] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (!address) return;
    setName(address.name || '');
    setLine1(address.line1 || '');
    setLine2(address.line2 || '');
    setCity(address.city || '');
    setStateField(address.state || '');
    setZip(address.zip || '');
    setCountry(address.country || 'United States');
    setIsDefault(!!address.isDefault);
  }, [address]);

  const valid = name.trim() && line1.trim() && city.trim() && stateField.trim() && zip.trim();

  async function handleSave() {
    if (!addressId) {
      Alert.alert('Address error', 'No address selected for editing.');
      return;
    }
    if (!valid) {
      Alert.alert('Missing info', 'Please complete all required fields.');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await updateAddress(addressId, {
        name: name.trim(),
        line1: line1.trim(),
        line2: line2.trim(),
        city: city.trim(),
        state: stateField.trim(),
        zip: zip.trim(),
        country: country.trim() || 'United States',
        isDefault,
      });
      router.back();
    } catch (e) {
      const msg =
        e?.response?.data?.error?.message ??
        e?.response?.data?.message ??
        e?.message ??
        'Could not update address. Please try again.';
      Alert.alert('Address error', msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topTitle}>Edit address</Text>}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.form}>
          <FieldLabel>Full name</FieldLabel>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <FieldLabel>Address line 1</FieldLabel>
          <TextInput style={styles.input} value={line1} onChangeText={setLine1} />

          <FieldLabel>Address line 2</FieldLabel>
          <TextInput style={styles.input} value={line2} onChangeText={setLine2} />

          <View style={styles.row}>
            <View style={styles.rowItemFlex}>
              <FieldLabel>City</FieldLabel>
              <TextInput style={styles.input} value={city} onChangeText={setCity} />
            </View>
            <View style={styles.rowItemShort}>
              <FieldLabel>State</FieldLabel>
              <TextInput
                style={styles.input}
                value={stateField}
                onChangeText={setStateField}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItemShort}>
              <FieldLabel>ZIP code</FieldLabel>
              <TextInput
                style={styles.input}
                value={zip}
                onChangeText={setZip}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.rowItemFlex}>
              <FieldLabel>Country</FieldLabel>
              <TextInput style={styles.input} value={country} onChangeText={setCountry} />
            </View>
          </View>

          <Pressable style={styles.defaultToggle} onPress={() => setIsDefault((v) => !v)}>
            <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
              {isDefault ? <Feather name="check" size={14} color={tokens.colors.white} /> : null}
            </View>
            <Text style={styles.defaultToggleText}>Set as default address</Text>
          </Pressable>

          <View style={styles.formButtons}>
            <PrimaryButton
              label="Cancel"
              variant="outlined"
              onPress={() => router.back()}
              style={styles.formButton}
            />
            <PrimaryButton
              label={saving ? 'Saving…' : 'OK'}
              variant="filled"
              onPress={handleSave}
              style={styles.formButton}
              disabled={!valid || saving}
            />
          </View>
        </View>
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
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  form: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    margin: tokens.spacing.xl,
    backgroundColor: tokens.colors.bg,
  },
  fieldLabel: {
    ...labelSans,
    letterSpacing: 2,
    marginTop: tokens.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    height: 48,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    marginTop: tokens.spacing.xs,
    backgroundColor: tokens.colors.bg,
  },
  row: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  rowItemFlex: {
    flex: 1,
  },
  rowItemShort: {
    width: 100,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: tokens.colors.primary,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: tokens.colors.primary,
  },
  defaultToggleText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  formButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.xl,
  },
  formButton: {
    flex: 1,
  },
});
