import { View, TouchableOpacity, StyleSheet } from 'react-native';
import tokens from '../theme/tokens';

export default function Card({ children, padding = tokens.spacing.lg, onPress, style }) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container onPress={onPress} activeOpacity={0.8} style={[styles.card, { padding }, style]}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
});
