// TODO: replace mock with POST /v1/identify via axios client
export function identifyPart(photoUri, vehicle) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        partName: 'Holley 4-barrel carburetor',
        category: 'fuel_system.carburetor',
        confidence: 0.82,
        alternatives: [
          { partName: 'Edelbrock 4-barrel carburetor', confidence: 0.11 },
        ],
      });
    }, 25000);
  });
}
