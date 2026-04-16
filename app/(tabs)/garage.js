import { View, Text, StyleSheet } from 'react-native';
import tokens from '../../src/theme/tokens';

export default function GarageScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Garage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
  },
});
