import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

import tokens from '../../src/theme/tokens';
import TopBar from '../../src/components/TopBar';
import Pill from '../../src/components/Pill';
import ProductCard from '../../src/components/ProductCard';
import useSavedStore from '../../src/stores/savedStore';
import useGarageStore from '../../src/stores/garageStore';

const ALL_PILL = 'all';

export default function SavedScreen() {
  const router = useRouter();
  const { savedItems, toggleSave, isSaved } = useSavedStore();
  const { vehicles } = useGarageStore();
  const [selectedVehicleId, setSelectedVehicleId] = useState(ALL_PILL);

  const filtered =
    selectedVehicleId === ALL_PILL
      ? savedItems
      : savedItems.filter((p) => p.vehicleId === selectedVehicleId);

  const pillLabel = (vehicle) => `For ${vehicle.year} ${vehicle.model.split(' ')[0]}`;

  const renderItem = ({ item }) => (
    <ProductCard
      product={item}
      layout="grid"
      isSaved={isSaved(item.id)}
      onToggleSave={(id) => toggleSave(id)}
      onPress={() => router.push(`/product/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        leftIcon={<Feather name="user" size={22} color={tokens.colors.text} />}
        titleNode={<Text style={styles.wordmark}>CarLens</Text>}
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.push('/profile')}
      />

      {savedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="bookmark" size={60} color={tokens.colors.primary} strokeWidth={1} />
          <Text style={styles.emptyHeadline}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>Tap the heart on any part to save it here.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <Text style={styles.heading}>Saved</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsRow}
              >
                <Pill
                  label="All"
                  selected={selectedVehicleId === ALL_PILL}
                  onPress={() => setSelectedVehicleId(ALL_PILL)}
                />
                {vehicles.map((v) => (
                  <Pill
                    key={v.id}
                    label={pillLabel(v)}
                    selected={selectedVehicleId === v.id}
                    onPress={() => setSelectedVehicleId(v.id)}
                  />
                ))}
              </ScrollView>
            </>
          }
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  wordmark: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifItalic,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  heading: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.display,
    color: tokens.colors.text,
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.md,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  listContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  columnWrapper: {
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  emptyHeadline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: tokens.fontSize.md * 1.5,
  },
});
