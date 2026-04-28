import { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../../src/theme/tokens';
import TopBar from '../../src/components/TopBar';
import PrimaryButton from '../../src/components/PrimaryButton';
import useGarageStore from '../../src/stores/garageStore';
import useVehicleDraftStore from '../../src/stores/vehicleDraftStore';

const FIELD_ROWS = [
  { label: 'Year',         field: 'year',         editStep: 0 },
  { label: 'Make',         field: 'make',         editStep: 1 },
  { label: 'Model',        field: 'model',        editStep: 1 },
  { label: 'Trim',         field: 'trim',         editStep: 2 },
  { label: 'Engine',       field: 'engine',       editStep: 3 },
  { label: 'Transmission', field: 'transmission', editStep: 4 },
];

export default function EditVehicleScreen() {
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams();

  const vehicles      = useGarageStore((s) => s.vehicles);
  const updateVehicle = useGarageStore((s) => s.updateVehicle);
  const deleteVehicle = useGarageStore((s) => s.deleteVehicle);
  const draft         = useVehicleDraftStore();

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!vehicle) return;
    draft.setField('year',         vehicle.year);
    draft.setField('make',         vehicle.make);
    draft.setField('model',        vehicle.model);
    draft.setField('trim',         vehicle.trim         ?? null);
    draft.setField('engine',       vehicle.engine       ?? null);
    draft.setField('transmission', vehicle.transmission ?? null);
    draft.setField('modsNotes',    vehicle.modsNotes    ?? '');
    return () => draft.reset();
  }, [vehicleId]);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar
          leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
          onLeftPress={() => router.back()}
        />
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Vehicle not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const modsNotes = draft.modsNotes ?? '';

  const hasChanges =
    String(draft.year)      !== String(vehicle.year)              ||
    draft.make              !== vehicle.make                      ||
    draft.model             !== vehicle.model                     ||
    draft.trim              !== (vehicle.trim         ?? null)    ||
    draft.engine            !== (vehicle.engine       ?? null)    ||
    draft.transmission      !== (vehicle.transmission ?? null)    ||
    modsNotes               !== (vehicle.modsNotes    ?? '');

  async function handleSave() {
    try {
      await updateVehicle(vehicleId, {
        year: draft.year,
        make: draft.make,
        model: draft.model,
        trim: draft.trim,
        engine: draft.engine,
        transmission: draft.transmission,
        modsNotes: draft.modsNotes,
      });
      router.back();
    } catch (e) {
      Alert.alert('Save failed', e?.message || 'Could not update vehicle.');
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete vehicle?',
      'This will remove the vehicle and all associated identification history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(vehicleId);
              router.replace('/(tabs)/garage');
            } catch (e) {
              Alert.alert('Error', e?.message || 'Could not delete vehicle.');
            }
          },
        },
      ]
    );
  }

  // TODO: handle editMode in add vehicle screen — pre-select current draft values
  //       and call updateVehicle(vehicleId, ...) instead of addVehicle on confirm.
  function handleFieldPress(editStep) {
    router.push({
      pathname: '/garage/add',
      params: { editMode: 'true', editStep: String(editStep), vehicleId },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        titleNode={<Text style={styles.topBarTitle}>Edit Vehicle</Text>}
        onLeftPress={() => router.back()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Photo area ── */}
        <View style={styles.photoWrap}>
          {vehicle.imageUri ? (
            <>
              <Image
                source={{ uri: vehicle.imageUri }}
                style={styles.photo}
                resizeMode="cover"
              />
              <Pressable
                style={styles.cameraOverlay}
                onPress={() => console.log('Open image picker')}
              >
                <Feather name="camera" size={20} color={tokens.colors.primary} />
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.photoPlaceholder}
              onPress={() => console.log('Open image picker')}
            >
              <Feather name="camera" size={24} color={tokens.colors.textMuted} />
              <Text style={styles.photoPlaceholderLabel}>Add photo</Text>
            </Pressable>
          )}
        </View>

        {/* ── Vehicle Details ── */}
        <Text style={styles.sectionTitle}>Vehicle Details</Text>

        {FIELD_ROWS.map(({ label, field, editStep }) => (
          <Pressable
            key={field}
            style={({ pressed }) => [styles.fieldRow, pressed && styles.fieldRowPressed]}
            onPress={() => handleFieldPress(editStep)}
          >
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <Text style={styles.fieldValue} numberOfLines={1}>
                {draft[field] != null ? String(draft[field]) : '—'}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={tokens.colors.textMuted} />
          </Pressable>
        ))}

        {/* ── Modification Notes ── */}
        <Text style={styles.sectionTitle}>Modification Notes</Text>

        <TextInput
          style={styles.notesInput}
          value={modsNotes}
          onChangeText={(text) => draft.setField('modsNotes', text)}
          placeholder="Add notes about modifications, swaps, or custom work…"
          placeholderTextColor={tokens.colors.textMuted}
          multiline
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{modsNotes.length}/1000</Text>

        {/* ── Save ── */}
        <PrimaryButton
          label="Save Changes"
          variant="filled"
          fullWidth
          disabled={!hasChanges}
          onPress={handleSave}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
        />

        {/* ── Danger zone ── */}
        <View style={styles.dangerZone}>
          <Pressable onPress={handleDelete}>
            {({ pressed }) => (
              <Text style={[styles.deleteText, pressed && styles.deleteTextPressed]}>
                Delete this vehicle
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },

  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },

  // Photo
  photoWrap: {
    marginTop: tokens.spacing.lg,
    position: 'relative',
  },
  photo: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: tokens.radius.md,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: tokens.spacing.sm,
    right: tokens.spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.colors.bg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  },
  photoPlaceholderLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },

  // Section headers
  sectionTitle: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
    marginTop: tokens.spacing.xl,
  },

  // Field rows
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    marginTop: tokens.spacing.md,
  },
  fieldRowPressed: {
    opacity: 0.65,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
    marginTop: tokens.spacing.xs,
  },

  // Mods notes
  notesInput: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    minHeight: 120,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    marginTop: tokens.spacing.md,
  },
  charCount: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textAlign: 'right',
    marginTop: tokens.spacing.xs,
  },

  // Save button
  saveButton: {
    marginTop: tokens.spacing.xl,
  },
  saveButtonLabel: {
    fontFamily: tokens.fonts.serifItalic,
  },

  // Danger zone
  dangerZone: {
    marginTop: tokens.spacing.xxxl,
    marginBottom: tokens.spacing.xxxl,
    alignItems: 'center',
  },
  deleteText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.danger,
  },
  deleteTextPressed: {
    opacity: 0.6,
  },

  // Not-found fallback
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.textMuted,
  },
});
