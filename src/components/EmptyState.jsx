import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import tokens from '../theme/tokens';
import { titleSerifItalic } from '../theme/typography';
import PrimaryButton from './PrimaryButton';

export default function EmptyState({
  icon,
  title,
  subtitle,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}) {
  return (
    <View style={styles.container}>
      <Feather name={icon} size={80} color={tokens.colors.primary} strokeWidth={1} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.actions}>
        {primaryLabel ? (
          <PrimaryButton label={primaryLabel} onPress={onPrimaryPress} variant="filled" fullWidth />
        ) : null}
        {secondaryLabel ? (
          <PrimaryButton
            label={secondaryLabel}
            onPress={onSecondaryPress}
            variant="outlined"
            fullWidth
            style={styles.secondaryButton}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xxl,
  },
  icon: {
    marginBottom: tokens.spacing.xl,
  },
  title: {
    ...titleSerifItalic,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  subtitle: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: tokens.fontSize.md * 1.55,
    marginBottom: tokens.spacing.xl,
  },
  actions: {
    width: '100%',
    gap: tokens.spacing.md,
  },
  secondaryButton: {
    marginTop: 0,
  },
});
