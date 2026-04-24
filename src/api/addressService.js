export const fetchAddresses = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            id: 'a1',
            name: 'Michael Thompson',
            line1: '1847 Oak Ridge Drive',
            line2: '',
            city: 'Nashville',
            state: 'TN',
            zip: '37215',
            country: 'United States',
            isDefault: true,
          },
          {
            id: 'a2',
            name: 'Michael Thompson',
            line1: '402 Workshop Lane',
            line2: 'Bay 3',
            city: 'Franklin',
            state: 'TN',
            zip: '37064',
            country: 'United States',
            isDefault: false,
          },
        ]),
      400
    )
  );

export const createAddress = (address) =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ ...address, id: `a${Date.now()}` }), 300)
  );

export const updateAddress = (id, address) =>
  new Promise((resolve) => setTimeout(() => resolve({ ...address, id }), 300));

export const deleteAddress = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id }), 300));
