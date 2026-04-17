import { create } from 'zustand';

const useRecentsStore = create(() => ({
  recents: [
    {
      id: 'r1',
      imageUrl: 'https://picsum.photos/seed/carburetor/240/240',
      label: 'Carburetor',
    },
    {
      id: 'r2',
      imageUrl: 'https://picsum.photos/seed/taillight/240/240',
      label: 'Tail Light',
    },
    {
      id: 'r3',
      imageUrl: 'https://picsum.photos/seed/badge/240/240',
      label: 'Emblem',
    },
  ],
  saved: [
    {
      id: 's1',
      brand: 'Holley',
      name: 'Holley 750 CFM Carburetor',
      price: 549.99,
      imageUrl: 'https://picsum.photos/seed/holley750/600/400',
      fitment: 'confirmed',
    },
    {
      id: 's2',
      brand: 'OEM',
      name: 'OEM Chrome Side Mirror',
      price: 189.99,
      imageUrl: 'https://picsum.photos/seed/sidemirror/600/400',
      fitment: 'likely',
    },
  ],
}));

export default useRecentsStore;
