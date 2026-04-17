import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import tokens from '../theme/tokens';

const CONFIG = {
  confirmed: { label: 'Confirmed Fit', color: tokens.colors.primary, icon: 'check' },
  likely: { label: 'Likely Fit', color: tokens.colors.gold, icon: 'check' },
  universal: { label: 'Universal', color: tokens.colors.textMuted, icon: 'minus' },
  requires_mod: { label: 'Requires Modification', color: tokens.colors.danger, icon: 'alert-triangle' },
};

export default function FitmentBadge({ status, label: labelOverride }) {
  const { label, color, icon } = CONFIG[status] ?? CONFIG.universal;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Feather name={icon} size={10} color={color} style={styles.icon} />
      <Text style={[styles.label, { color }]}>{labelOverride ?? label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: tokens.spacing.xs,
  },
  label: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    letterSpacing: 0.3,
  },
});
