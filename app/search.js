import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import { labelSans, bodySerif } from '../src/theme/typography';
import TopBar from '../src/components/TopBar';
import useSearchStore from '../src/stores/searchStore';

const CATEGORIES = [
  { label: 'Carburetor',         slug: 'carburetor',        icon: 'settings',  lib: 'feather' },
  { label: 'Headlight Assembly', slug: 'headlight-assembly', icon: 'zap',       lib: 'feather' },
  { label: 'Bucket Seat',        slug: 'bucket-seat',        icon: 'sidebar',   lib: 'feather' },
  { label: 'Badge & Emblem',     slug: 'badge-emblem',       icon: 'award',     lib: 'feather' },
  { label: 'Steel Wheel',        slug: 'steel-wheel',        icon: 'disc',      lib: 'feather' },
  { label: 'Exhaust Manifold',   slug: 'exhaust-manifold',   icon: 'wind',      lib: 'feather' },
];

function CategoryIcon({ icon, lib, size, color }) {
  if (lib === 'mci') {
    return <MaterialCommunityIcons name={icon} size={size} color={color} />;
  }
  return <Feather name={icon} size={size} color={color} />;
}

export default function SearchScreen() {
  const { query, setQuery, recentQueries, addRecent, removeRecent } = useSearchStore();

  useEffect(() => {
    useSearchStore.getState().hydrate();
  }, []);

  const handleSubmit = () => {
    const q = query.trim();
    if (!q) return;
    addRecent(q);
    router.push(`/search-results?q=${encodeURIComponent(q)}`);
  };

  const handleRecentPress = (q) => {
    setQuery(q);
    addRecent(q);
    router.push(`/search-results?q=${encodeURIComponent(q)}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        titleNode={<Text style={styles.wordmark}>CarLens</Text>}
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={tokens.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search parts, brands, categories"
            placeholderTextColor={tokens.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
          />
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.sectionLabel}>POPULAR CATEGORIES</Text>

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.slug}
              style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
              onPress={() => router.push(`/search-results?category=${cat.slug}`)}
            >
              <CategoryIcon icon={cat.icon} lib={cat.lib} size={32} color={tokens.colors.primary} />
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        {recentQueries.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, styles.recentHeader]}>RECENT SEARCHES</Text>
            {recentQueries.map((q) => (
              <Pressable
                key={q}
                style={({ pressed }) => [styles.recentRow, pressed && styles.pressed]}
                onPress={() => handleRecentPress(q)}
              >
                <Feather name="clock" size={16} color={tokens.colors.textMuted} style={styles.clockIcon} />
                <Text style={styles.recentLabel} numberOfLines={1}>{q}</Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => removeRecent(q)}
                  style={styles.removeBtn}
                >
                  <Feather name="x" size={16} color={tokens.colors.textMuted} />
                </Pressable>
              </Pressable>
            ))}
          </>
        )}
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
  searchRow: {
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: tokens.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    height: 48,
  },
  scroll: {
    paddingBottom: tokens.spacing.xxxl,
  },
  sectionLabel: {
    ...labelSans,
    letterSpacing: 3,
    marginTop: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.md,
  },
  categoryCard: {
    width: '47%',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
  },
  categoryLabel: {
    ...bodySerif,
    marginTop: tokens.spacing.sm,
    textAlign: 'center',
  },
  recentHeader: {
    marginTop: tokens.spacing.xl,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: tokens.spacing.xl,
  },
  clockIcon: {
    marginRight: tokens.spacing.md,
  },
  recentLabel: {
    ...bodySerif,
    flex: 1,
  },
  removeBtn: {
    paddingLeft: tokens.spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
});
