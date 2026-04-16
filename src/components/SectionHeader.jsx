import { Text, StyleSheet } from 'react-native';
import tokens from '../theme/tokens';

export default function SectionHeader({ title, variant = 'serif' }) {
  return <Text style={styles[variant]}>{title}</Text>;
}

const styles = StyleSheet.create({
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
});
