import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../../src/theme/tokens';
import TopBar from '../../src/components/TopBar';
import useVehicleDraftStore from '../../src/stores/vehicleDraftStore';
import useGarageStore from '../../src/stores/garageStore';

const TOTAL_STEPS = 5;

// ─── Mock data ────────────────────────────────────────────────────────────────

const YEARS = Array.from({ length: 30 }, (_, i) => String(1989 - i));

// Make is inferred from model selection rather than asked separately
const MODEL_MAKE_MAP = {
  Camaro: 'Chevrolet',
  Chevelle: 'Chevrolet',
  Corvette: 'Chevrolet',
  Impala: 'Chevrolet',
  Nova: 'Chevrolet',
  'El Camino': 'Chevrolet',
  Mustang: 'Ford',
  Torino: 'Ford',
  Galaxie: 'Ford',
  Fairlane: 'Ford',
  Thunderbird: 'Ford',
  Charger: 'Dodge',
  Challenger: 'Dodge',
  Dart: 'Dodge',
  Coronet: 'Dodge',
  'Super Bee': 'Dodge',
  Barracuda: 'Plymouth',
  'Road Runner': 'Plymouth',
  GTX: 'Plymouth',
  Fury: 'Plymouth',
  Duster: 'Plymouth',
  GTO: 'Pontiac',
  Firebird: 'Pontiac',
  'Trans Am': 'Pontiac',
  Bonneville: 'Pontiac',
  LeMans: 'Pontiac',
};

const ALL_MODELS = Object.keys(MODEL_MAKE_MAP);

const TRIMS = ['SS', 'Base', 'Malibu', 'Sport', 'Custom'];

const ENGINES = ['454 V8', '396 V8', '350 V8', '427 V8', '302 V8'];

const TRANSMISSIONS = [
  '4-speed Manual',
  '3-speed Automatic',
  'Powerglide',
  'Turbo-Hydramatic',
  '3-speed Manual',
];

// ─── Step configuration ───────────────────────────────────────────────────────

const STEP_CONFIG = [
  {
    field: 'year',
    question: 'What year?',
    crumb: () => '',
    getOptions: () => YEARS,
  },
  {
    field: 'model',
    question: 'What model?',
    crumb: (d) => d.year ?? '',
    // TODO: filter by year when API data is available
    getOptions: () => ALL_MODELS,
  },
  {
    field: 'trim',
    question: 'What trim?',
    crumb: (d) => [d.year, d.make, d.model].filter(Boolean).join(' '),
    // TODO: filter by make/model when API data is available
    getOptions: () => TRIMS,
  },
  {
    field: 'engine',
    question: 'What engine?',
    crumb: (d) => [d.year, d.make, d.model, d.trim].filter(Boolean).join(' · '),
    // TODO: filter by make/model/trim when API data is available
    getOptions: () => ENGINES,
  },
  {
    field: 'transmission',
    question: 'What transmission?',
    crumb: (d) => [d.year, d.make, d.model, d.trim, d.engine].filter(Boolean).join(' · '),
    // TODO: filter by engine when API data is available
    getOptions: () => TRANSMISSIONS,
  },
];

// ─── Option row ───────────────────────────────────────────────────────────────

function OptionRow({ label, selected, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {selected && <View style={styles.activeBar} />}
      <View style={styles.iconPlaceholder} />
      <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>
        {label}
      </Text>
      <Feather
        name="chevron-right"
        size={18}
        color={selected ? tokens.colors.primary : tokens.colors.textMuted}
      />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddVehicleScreen() {
  const router = useRouter();
  const draft = useVehicleDraftStore();
  const addVehicle = useGarageStore((s) => s.addVehicle);

  const [step, setStep] = useState(1);

  const config = STEP_CONFIG[step - 1];
  const crumbText = config.crumb(draft);
  const options = config.getOptions(draft);
  const currentValue = draft[config.field];

  function handleBack() {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      draft.reset();
      router.back();
    }
  }

  function handleCancel() {
    draft.reset();
    router.back();
  }

  function handleSelect(value) {
    if (config.field === 'model') {
      // Infer make from the selected model
      draft.setField('make', MODEL_MAKE_MAP[value] ?? null);
    }
    draft.setField(config.field, value);

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    // Final step — commit vehicle to garage
    const newVehicle = {
      id: `v_${Date.now()}`,
      year: draft.year,
      make: draft.make,
      model: draft.model,
      trim: draft.trim,
      engine: draft.engine,
      transmission: value,
    };
    addVehicle(newVehicle);
    draft.reset();
    router.replace('/(tabs)/garage');
  }

  // Dots: i < (step - 1) → filled (completed steps); current step dot is unfilled.
  // When on step 3 (model), 2 dots are filled — matching the Figma reference.
  const completedCount = step - 1;

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        title="Add Vehicle"
        rightIcon={<Text style={styles.cancelLink}>Cancel</Text>}
        onLeftPress={handleBack}
        onRightPress={handleCancel}
      />

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < completedCount ? tokens.colors.primary : tokens.colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Question header */}
      <View style={styles.questionArea}>
        <Text style={styles.question}>{config.question}</Text>
        {crumbText ? <Text style={styles.crumb}>{crumbText}</Text> : null}
      </View>

      {/* Scrollable option list */}
      <FlatList
        data={options}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <OptionRow
            label={item}
            selected={currentValue === item}
            onPress={() => handleSelect(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginVertical: tokens.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  questionArea: {
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
  },
  question: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.display * 1.15,
  },
  crumb: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xs,
  },

  listContent: {
    paddingBottom: tokens.spacing.xxxl,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.border,
    marginLeft: tokens.spacing.xl,
  },

  row: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: tokens.colors.primary,
    borderRadius: 2,
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.sm,
  },
  rowLabel: {
    flex: 1,
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
    marginLeft: tokens.spacing.md,
  },
  rowLabelSelected: {
    fontFamily: tokens.fonts.serifBold,
    color: tokens.colors.primary,
  },

  cancelLink: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.primary,
  },
});
