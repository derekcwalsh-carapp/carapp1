const MOCK_RESULTS = [
  { id: '1', name: 'Holley 4-Barrel Carburetor', brand: 'Holley', category: 'Carburetor', price: 449.99, imageUrl: null },
  { id: '2', name: 'H4 Headlight Assembly', brand: 'SealBeam', category: 'Headlight Assembly', price: 89.99, imageUrl: null },
  { id: '3', name: 'Bucket Seat – Black Vinyl', brand: 'TMI Products', category: 'Bucket Seat', price: 329.00, imageUrl: null },
  { id: '4', name: 'Chrome Rally Wheel 15"', brand: 'American Racing', category: 'Wheel', price: 219.00, imageUrl: null },
];

export async function searchParts(query) {
  await new Promise((r) => setTimeout(r, 400));
  const q = query.toLowerCase();
  return MOCK_RESULTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );
}
