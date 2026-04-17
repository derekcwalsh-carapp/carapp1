// TODO: replace mock with POST /v1/identify via axios client
const MOCK_LOW_CONFIDENCE = {
  confidence: 'low',
  clarifyQuestion: 'Is this a carburetor?',
  options: ['Carburetor', 'Throttle body', 'Intake manifold'],
};

const MOCK_HIGH_CONFIDENCE = {
  confidence: 'high',
  partName: 'Holley 4-barrel carburetor',
  category: 'fuel_system.carburetor',
  alternatives: [
    { partName: 'Edelbrock 4-barrel carburetor', confidence: 0.11 },
  ],
};

// Toggle to simulate low-confidence clarification flow
const USE_LOW_CONFIDENCE_MOCK = true;

export function identifyPart(photoUri, vehicle) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USE_LOW_CONFIDENCE_MOCK ? MOCK_LOW_CONFIDENCE : MOCK_HIGH_CONFIDENCE);
    }, 2500);
  });
}
