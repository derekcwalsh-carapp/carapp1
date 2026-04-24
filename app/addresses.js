import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import { labelSans } from '../src/theme/typography';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import EmptyState from '../src/components/EmptyState';
import useAddressStore from '../src/stores/addressStore';

const EMPTY_FORM = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  isDefault: false,
};

function FieldLabel({ children }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function AddressCard({ address, onEdit, onSetDefault, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardName}>{address.name}</Text>
        {address.isDefault ? (
          <View style={styles.defaultPill}>
            <Text style={styles.defaultPillText}>Default</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.line}>{address.line1}</Text>
      {address.line2 ? <Text style={styles.line}>{address.line2}</Text> : null}
      <Text style={styles.line}>
        {address.city}, {address.state} {address.zip}
      </Text>
      <Text style={styles.line}>{address.country}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onEdit}>
          <Text style={styles.actionPrimary}>Edit</Text>
        </Pressable>
        {!address.isDefault ? (
          <Pressable onPress={onSetDefault}>
            <Text style={styles.actionPrimary}>Set as default</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onDelete}>
          <Text style={styles.actionDanger}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AddressForm({ initial, onCancel, onSave }) {
  const [name, setName] = useState(initial.name);
  const [line1, setLine1] = useState(initial.line1);
  const [line2, setLine2] = useState(initial.line2);
  const [city, setCity] = useState(initial.city);
  const [stateField, setStateField] = useState(initial.state);
  const [zip, setZip] = useState(initial.zip);
  const [country, setCountry] = useState(initial.country);
  const [isDefault, setIsDefault] = useState(initial.isDefault);

  const handleSave = () => {
    onSave({
      name: name.trim(),
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: stateField.trim(),
      zip: zip.trim(),
      country: country.trim() || 'United States',
      isDefault,
    });
  };

  return (
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
        <PrimaryButton label="Cancel" variant="outlined" onPress={onCancel} style={styles.formButton} />
        <PrimaryButton label="Save" variant="filled" onPress={handleSave} style={styles.formButton} />
      </View>
    </View>
  );
}

export default function AddressesScreen() {
  const router = useRouter();
  const { addresses, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefault } =
    useAddressStore();
  const [formState, setFormState] = useState({ showForm: false, editingId: null });
  const [formInitial, setFormInitial] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddForm = () => {
    setFormInitial(EMPTY_FORM);
    setFormState({ showForm: true, editingId: null });
  };

  const openEditForm = (address) => {
    setFormInitial({
      name: address.name,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      isDefault: !!address.isDefault,
    });
    setFormState({ showForm: true, editingId: address.id });
  };

  const closeForm = () => setFormState({ showForm: false, editingId: null });

  const handleSave = (values) => {
    if (formState.editingId) {
      updateAddress(formState.editingId, values);
    } else {
      addAddress(values);
    }
    closeForm();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete address?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAddress(id) },
    ]);
  };

  const isEmpty = addresses.length === 0 && !formState.showForm;

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topTitle}>Addresses</Text>}
        rightIcon={<Feather name="plus" size={22} color={tokens.colors.text} />}
        onRightPress={openAddForm}
      />

      {isEmpty ? (
        <EmptyState
          icon="map-pin"
          title="No saved addresses"
          subtitle="Add a shipping address to speed up checkout."
          primaryLabel="Add address"
          onPrimaryPress={openAddForm}
        />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              formState.showForm ? (
                <AddressForm
                  initial={formInitial}
                  onCancel={closeForm}
                  onSave={handleSave}
                />
              ) : null
            }
            renderItem={({ item }) => (
              <AddressCard
                address={item}
                onEdit={() => openEditForm(item)}
                onSetDefault={() => setDefault(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            )}
          />
        </KeyboardAvoidingView>
      )}
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
  listContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxxl,
  },
  card: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    backgroundColor: tokens.colors.bg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  cardName: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  defaultPill: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 3,
    borderRadius: tokens.radius.pill,
  },
  defaultPillText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.white,
  },
  line: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    lineHeight: tokens.fontSize.sm * 1.5,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.lg,
    marginTop: tokens.spacing.md,
  },
  actionPrimary: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },
  actionDanger: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
  },
  form: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
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
