const MOCK_ITEMS = [
  {
    productId: 'wl-1',
    targetPriceCents: 4500,
    currentPriceCents: 4999,
    lastNotifiedAt: null,
    createdAt: '2026-03-10T10:00:00Z',
    product: {
      id: 'wl-1',
      title: 'Holley 4150 Double Pumper 750 CFM Carburetor',
      imageUri: 'https://picsum.photos/seed/holley4150/400/400',
      supplier: 'Holley Performance',
      fitmentLabel: 'confirmed',
    },
  },
  {
    productId: 'wl-2',
    targetPriceCents: 18900,
    currentPriceCents: 21499,
    lastNotifiedAt: null,
    createdAt: '2026-03-14T14:30:00Z',
    product: {
      id: 'wl-2',
      title: 'Flowmaster Super 44 Muffler 2.5" Inlet / 2.5" Outlet',
      imageUri: 'https://picsum.photos/seed/flowmaster44/400/400',
      supplier: 'Flowmaster',
      fitmentLabel: 'likely',
    },
  },
  {
    productId: 'wl-3',
    targetPriceCents: 8999,
    currentPriceCents: 8750,
    lastNotifiedAt: '2026-04-20T09:00:00Z',
    createdAt: '2026-04-01T08:00:00Z',
    product: {
      id: 'wl-3',
      title: 'MSD 6AL Ignition Control with Rev Limiter',
      imageUri: 'https://picsum.photos/seed/msd6al/400/400',
      supplier: 'MSD Ignition',
      fitmentLabel: 'universal',
    },
  },
];

export async function fetchWatchlist() {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_ITEMS), 600));
}

export async function addToWatchlist(productId, targetPriceCents) {
  return new Promise((resolve) => setTimeout(() => resolve({ productId, targetPriceCents }), 300));
}

export async function removeFromWatchlist(productId) {
  return new Promise((resolve) => setTimeout(() => resolve({ productId }), 300));
}
