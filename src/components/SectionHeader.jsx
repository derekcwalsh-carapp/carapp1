import { View, Text, StyleSheet } from 'react-native';
import tokens from '../theme/tokens';

export default function SectionHeader({ title, count, variant = 'serif' }) {
  return (
    <View style={styles.row}>
      <Text style={styles[variant]}>{title}</Text>
      {count != null && (
        <Text style={styles.count}> ({count})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  serif: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
  },
  smallCaps: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  count: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
  },
});
