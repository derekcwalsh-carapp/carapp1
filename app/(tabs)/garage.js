import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
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
  const vehicles = useGarageStore((s) => s.vehicles);
  const activeVehicleId = useGarageStore((s) => s.activeVehicleId);
  const status = useGarageStore((s) => s.status);
  const error = useGarageStore((s) => s.error);
  const fetchVehicles = useGarageStore((s) => s.fetchVehicles);
  const setActive = useGarageStore((s) => s.setActive);
  const deleteVehicle = useGarageStore((s) => s.deleteVehicle);

  const vehicleLimit = useSubscriptionStore((s) => s.vehicleLimit);
  const showUpgrade = useUpgradeModalStore((s) => s.show);

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [fetchVehicles])
  );

  function handleLongPress(vehicle) {
    Alert.alert(
      `${vehicle.year} ${vehicle.model}`,
      null,
      [
        {
          text: 'Edit',
          onPress: () =>
            router.push({ pathname: '/garage/edit', params: { vehicleId: vehicle.id } }),
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
                onPress: async () => {
                  try {
                    await deleteVehicle(vehicle.id);
                  } catch (e) {
                    Alert.alert('Error', e?.message || 'Could not delete vehicle.');
                  }
                },
              },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  const loading = status === 'loading';

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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
        </View>
      ) : status === 'error' ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => fetchVehicles()} style={styles.retryBtn}>
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      ) : (
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
              onPress={async () => {
                try {
                  await setActive(vehicle.id);
                } catch (e) {
                  Alert.alert('Error', e?.message || 'Could not update active vehicle.');
                }
              }}
              onLongPress={() => handleLongPress(vehicle)}
            />
          ))}
        </ScrollView>
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  errorText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.danger,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  retryBtn: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
  },
  retryLabel: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.primary,
  },
});
