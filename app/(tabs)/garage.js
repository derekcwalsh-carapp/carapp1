import { SafeAreaView, ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import TopBar from '../../src/components/TopBar';
import VehicleCard from '../../src/components/VehicleCard';
import useGarageStore from '../../src/stores/garageStore';
import useSubscriptionStore from '../../src/stores/subscriptionStore';
import useUpgradeModalStore from '../../src/stores/upgradeModalStore';
import tokens from '../../src/theme/tokens';

export default function GarageScreen() {
  const router = useRouter();
  const { vehicles, activeVehicleId, setActive, deleteVehicle } = useGarageStore();
  const vehicleLimit = useSubscriptionStore((s) => s.vehicleLimit);
  const showUpgrade = useUpgradeModalStore((s) => s.show);

  function handleLongPress(vehicle) {
    Alert.alert(
      `${vehicle.year} ${vehicle.model}`,
      null,
      [
        {
          text: 'Edit',
          onPress: () => router.push({ pathname: '/garage/edit', params: { vehicleId: vehicle.id } }),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Delete Vehicle?', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteVehicle(vehicle.id),
              },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="user" size={22} color={tokens.colors.text} />}
        titleNode={<Text style={styles.wordmark}>CarLens</Text>}
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.push('/profile')}
      />

      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Garage</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            if (vehicles.length >= vehicleLimit) {
              showUpgrade('vehicle_limit');
            } else {
              router.push('/garage/add');
            }
          }}
          hitSlop={8}
        >
          <Feather name="plus" size={28} color={tokens.colors.primary} />
        </Pressable>
      </View>

      <Text style={styles.hint}>Tap a vehicle to set it as active.</Text>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            variant="garage"
            isActive={vehicle.id === activeVehicleId}
            onPress={() => setActive(vehicle.id)}
            onLongPress={() => handleLongPress(vehicle)}
          />
        ))}
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
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
  },
  pageTitle: {
    flex: 1,
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.lg,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  list: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
    gap: tokens.spacing.lg,
  },
});
