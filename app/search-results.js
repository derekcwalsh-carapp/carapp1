import { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import ProductCard from '../src/components/ProductCard';
import Pill from '../src/components/Pill';
import EmptyState from '../src/components/EmptyState';
import { searchParts, browseByCategory } from '../src/api/searchService';

const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price_asc', label: 'Price: Low' },
  { id: 'price_desc', label: 'Price: High' },
  { id: 'rating', label: 'Best rated' },
  { id: 'confirmed', label: 'Confirmed fit only' },
];

function formatCategory(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function applySort(list, sortId) {
  const next = [...list];
  switch (sortId) {
    case 'price_asc':  return next.sort((a, b) => a.price - b.price);
    case 'price_desc': return next.sort((a, b) => b.price - a.price);
    case 'rating':     return next.sort((a, b) => b.rating - a.rating);
    case 'confirmed':  return next.filter((p) => p.fitmentLabel === 'confirmed');
    default:           return next;
  }
}

export default function SearchResultsScreen() {
  const { q, category } = useLocalSearchParams();
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [selectedSort, setSelectedSort] = useState('relevance');

  const headline = q ? String(q) : category ? formatCategory(String(category)) : '';
  const subline = q
    ? `${results.length} result${results.length === 1 ? '' : 's'}`
    : category
      ? `Browse · ${formatCategory(String(category))}`
      : '';

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus('loading');
      try {
        const data = q
          ? await searchParts(String(q))
          : category
            ? await browseByCategory(String(category))
            : [];
        if (!cancelled) {
          setResults(data);
          setStatus('success');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }
    run();
    return () => { cancelled = true; };
  }, [q, category]);

  const visible = useMemo(() => applySort(results, selectedSort), [results, selectedSort]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.title}>Results</Text>}
        rightIcon={<Feather name="sliders" size={22} color={tokens.colors.text} />}
        onRightPress={() => console.log('filter/sort')}
      />

      <View style={styles.context}>
        <Text style={styles.headline} numberOfLines={2}>{headline}</Text>
        <Text style={styles.subline}>{status === 'loading' ? 'Searching…' : subline}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {SORTS.map((s) => (
          <Pill
            key={s.id}
            label={s.label}
            selected={selectedSort === s.id}
            onPress={() => setSelectedSort(s.id)}
          />
        ))}
      </ScrollView>

      {status === 'loading' ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
        </View>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="search"
          title="No parts found"
          subtitle="Try a different search term or browse categories."
          primaryLabel="Back to search"
          onPrimaryPress={() => router.back()}
        />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              layout="row"
              onPress={() => router.push(`/product/${item.id}`)}
            />
          )}
          ListFooterComponent={
            // TODO: replace with cursor-based pagination — render a "Load more"
            // Pressable that calls the next page when the API supports it.
            <Text style={styles.footer}>Showing {visible.length} results</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.bg },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  context: {
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.md,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.xl * 1.2,
  },
  subline: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xs,
  },
  pillRow: {
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxxl,
  },
  separator: { height: tokens.spacing.md },
  footer: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    marginVertical: tokens.spacing.xl,
  },
});
