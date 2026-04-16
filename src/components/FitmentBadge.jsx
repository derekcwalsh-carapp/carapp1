import { View, Text, StyleSheet } from 'react-native';
import tokens from '../theme/tokens';

const CONFIG = {
  confirmed: { label: 'Confirmed Fit', color: tokens.colors.primary },
  likely: { label: 'Likely Fit', color: tokens.colors.gold },
  universal: { label: 'Universal', color: tokens.colors.textMuted },
  requires_mod: { label: 'Requires Mod', color: tokens.colors.danger },
};

export default function FitmentBadge({ status }) {
  const { label, color } = CONFIG[status] ?? CONFIG.universal;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
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
  dot: {
    width: 5,
    height: 5,
    borderRadius: tokens.radius.pill,
    marginRight: tokens.spacing.xs,
  },
  label: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    letterSpacing: 0.3,
  },
});
