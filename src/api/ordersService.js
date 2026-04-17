export const createOrder = (_cart, _address, _payment) =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ id: 'CL-10482' }), 1500)
  );

export const fetchOrders = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            id: 'CL-10482',
            placedAt: '2026-04-08T10:23:00Z',
            status: 'shipped',
            itemCount: 2,
            subtotal: 778.00,
            shipping: 12.50,
            tax: 34.18,
            total: 824.68,
            trackingNumber: '1Z999AA10123456784',
            shippingAddress: {
              name: 'Michael Thompson',
              line1: '1847 Oak Ridge Drive',
              city: 'Nashville',
              state: 'TN',
              zip: '37215',
              country: 'United States',
            },
            items: [
              {
                title: 'Holley 650 CFM Carburetor',
                supplier: 'Classic Carb Co.',
                price: 389.00,
                thumbnailUri: 'https://placehold.co/72x72/e8e8e4/555?text=Carb',
              },
              {
                title: 'Edelbrock Performer Intake Manifold',
                supplier: 'Edelbrock',
                price: 389.00,
                thumbnailUri: 'https://placehold.co/72x72/e8e8e4/555?text=Intake',
              },
            ],
          },
          {
            id: 'CL-10391',
            placedAt: '2026-03-22T14:05:00Z',
            status: 'delivered',
            itemCount: 3,
            subtotal: 396.97,
            shipping: 0.00,
            tax: 59.35,
            total: 456.32,
            trackingNumber: '1Z999AA10987654321',
            shippingAddress: {
              name: 'Michael Thompson',
              line1: '1847 Oak Ridge Drive',
              city: 'Nashville',
              state: 'TN',
              zip: '37215',
              country: 'United States',
            },
            items: [
              {
                title: 'Mr. Gasket Valve Cover Gasket Set',
                supplier: 'Mr. Gasket',
                price: 24.99,
                thumbnailUri: 'https://placehold.co/72x72/e8e8e4/555?text=Gasket',
              },
              {
                title: 'Mallory Unilite Distributor',
                supplier: 'Mallory Ignition',
                price: 219.99,
                thumbnailUri: 'https://placehold.co/72x72/e8e8e4/555?text=Dist',
              },
              {
                title: 'Accel 8mm Spark Plug Wire Set',
                supplier: 'Accel Performance',
                price: 151.99,
                thumbnailUri: 'https://placehold.co/72x72/e8e8e4/555?text=Wires',
              },
            ],
          },
          {
            id: 'CL-10305',
            placedAt: '2026-03-15T09:11:00Z',
            status: 'processing',
            itemCount: 1,
            subtotal: 249.99,
            shipping: 18.50,
            tax: 21.50,
            total: 289.99,
            trackingNumber: null,
            shippingAddress: {
              name: 'Michael Thompson',
              line1: '1847 Oak Ridge Drive',
              city: 'Nashville',
              state: 'TN',
              zip: '37215',
              country: 'United States',
            },
            items: [
              {
                title: 'Hurst Competition Plus 4-Speed Shifter',
                supplier: 'Hurst Performance',
                price: 249.99,
                thumbnailUri: 'https://placehold.co/72x72/e8e8e4/555?text=Shifter',
              },
            ],
          },
          {
            id: 'CL-10204',
            placedAt: '2026-02-28T16:44:00Z',
            status: 'delivered',
            itemCount: 2,
            subtotal: 544.98,
            shipping: 0.00,
            tax: 67.47,
            total: 612.45,
            trackingNumber: '1Z999AA10555444333',
            shippingAddress: {
              name: 'Michael Thompson',
              line1: '1847 Oak Ridge Drive',
              city: 'Nashville',
              state: 'TN',
              zip: '37215',
              country: 'United States',
            },
            items: [
              {
                title: 'Summit Racing SFI Flexplate',
                supplier: 'Summit Racing',
                price: 89.99,
                thumbnailUri: 'https://placehold.co/72x72/e8e8e4/555?text=Flex',
              },
              {
                title: 'TCI Streetfighter TH350 Transmission',
                supplier: 'TCI Automotive',
                price: 454.99,
                thumbnailUri: 'https://placehold.co/72x72/e8e8e4/555?text=Trans',
              },
            ],
          },
        ]),
      400
    )
  );
