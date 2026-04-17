import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../../src/theme/tokens';
import TopBar from '../../src/components/TopBar';
import PrimaryButton from '../../src/components/PrimaryButton';
import SectionHeader from '../../src/components/SectionHeader';
import VehicleCard from '../../src/components/VehicleCard';
import ProductCard from '../../src/components/ProductCard';
import useGarageStore from '../../src/stores/garageStore';
import useRecentsStore from '../../src/stores/recentsStore';

export default function HomeScreen() {
  const { vehicles, activeVehicleId } = useGarageStore();
  const { recents, saved } = useRecentsStore();

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="user" size={22} color={tokens.colors.text} />}
        titleNode={<Text style={styles.wordmark}>CarLens</Text>}
        rightIcon={<Feather name="search" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.push('/profile')}
        onRightPress={() => router.push('/search')}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>ACTIVE VEHICLE</Text>
          {activeVehicle ? (
            <VehicleCard vehicle={activeVehicle} variant="hero" />
          ) : null}
        </View>

        <PrimaryButton
          label="Find a Part"
          onPress={() => router.push('/camera')}
          variant="filled"
          fullWidth
          iconLeft={<Feather name="camera" size={20} color={tokens.colors.white} />}
          style={styles.findButton}
          labelStyle={styles.findLabel}
        />

        <View style={styles.section}>
          <SectionHeader title="Recent Identifications" variant="smallCaps" />
          <FlatList
            horizontal
            data={recents}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentsList}
            ItemSeparatorComponent={() => <View style={styles.recentSep} />}
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push(`/result/${item.id}`)}>
                <Image source={{ uri: item.imageUrl }} style={styles.recentThumb} />
              </Pressable>
            )}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Saved for Later" variant="smallCaps" />
          <View style={styles.savedList}>
            {saved.map((product) => (
              <ProductCard key={product.id} product={product} layout="row" />
            ))}
          </View>
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
  wordmark: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.primary,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
    gap: tokens.spacing.xl,
  },
  section: {
    gap: tokens.spacing.md,
  },
  label: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  findButton: {
    height: 72,
    borderRadius: tokens.radius.md,
  },
  findLabel: {
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.xl,
  },
  recentsList: {
    paddingVertical: tokens.spacing.xs,
  },
  recentSep: {
    width: tokens.spacing.md,
  },
  recentThumb: {
    width: 120,
    height: 120,
    borderRadius: tokens.radius.sm,
  },
  savedList: {
    gap: tokens.spacing.md,
  },
});
