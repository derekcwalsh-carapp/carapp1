const PLACEHOLDER = 'https://placehold.co/96x96/e4e4df/6b6b66?text=Part';

const MOCK_RESULTS = [
  { id: 's1', title: 'Holley 0-80457S 600 CFM',     supplier: 'Summit Racing',   price: 389, imageUri: PLACEHOLDER, fitmentLabel: 'confirmed',    rating: 4.8, category: 'Carburetor' },
  { id: 's2', title: 'Edelbrock 1406 Performer',    supplier: 'Jegs',            price: 412, imageUri: PLACEHOLDER, fitmentLabel: 'confirmed',    rating: 4.7, category: 'Carburetor' },
  { id: 's3', title: 'Quick Fuel HR-680-VS',        supplier: 'Speedway Motors', price: 495, imageUri: PLACEHOLDER, fitmentLabel: 'requires_mod', rating: 4.5, category: 'Carburetor' },
  { id: 's4', title: 'Demon 625 CFM Street',        supplier: 'Jegs',            price: 329, imageUri: PLACEHOLDER, fitmentLabel: 'likely',       rating: 4.6, category: 'Carburetor' },
  { id: 's5', title: 'Proform 67200 Main Body',     supplier: 'Summit Racing',   price: 299, imageUri: PLACEHOLDER, fitmentLabel: 'confirmed',    rating: 4.4, category: 'Carburetor' },
  { id: 's6', title: 'Motorcraft 2100 Carburetor',  supplier: 'Rock Auto',       price: 189, imageUri: PLACEHOLDER, fitmentLabel: 'universal',    rating: 4.2, category: 'Carburetor' },
  { id: 's7', title: 'Edelbrock AVS2 650 CFM',      supplier: 'Summit Racing',   price: 459, imageUri: PLACEHOLDER, fitmentLabel: 'confirmed',    rating: 4.7, category: 'Carburetor' },
  { id: 's8', title: 'Holley Ultra HP 750 CFM',     supplier: 'Summit Racing',   price: 549, imageUri: PLACEHOLDER, fitmentLabel: 'confirmed',    rating: 4.9, category: 'Carburetor' },
];

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function searchParts(_query) {
  await delay(500);
  return MOCK_RESULTS;
}

export async function browseByCategory(_category) {
  await delay(500);
  return MOCK_RESULTS;
}
