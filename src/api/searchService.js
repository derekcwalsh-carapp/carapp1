import client from './client.js';
import { mapProduct } from './productsService.js';

export const searchParts = (query) =>
  client
    .get('/v1/search', { params: { q: query } })
    .then((r) => (r.data.data || []).map(mapProduct));

export const browseByCategory = (category) =>
  client
    .get('/v1/search', { params: { category } })
    .then((r) => (r.data.data || []).map(mapProduct));

export const fetchCategories = () =>
  client.get('/v1/search/categories').then((r) => r.data.data);

export const fetchRecentSearches = () =>
  client.get('/v1/search/recent').then((r) => r.data.data);

export const deleteRecentSearch = (q) =>
  client.delete('/v1/search/recent', { params: { q } }).then((r) => r.data.data);

export const clearRecentSearches = () =>
  client.delete('/v1/search/recent').then((r) => r.data.data);
