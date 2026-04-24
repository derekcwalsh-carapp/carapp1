export const fetchPaymentMethods = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            id: 'pm_1',
            brand: 'visa',
            last4: '4242',
            expMonth: 8,
            expYear: 2027,
            isDefault: true,
          },
          {
            id: 'pm_2',
            brand: 'mastercard',
            last4: '5588',
            expMonth: 3,
            expYear: 2026,
            isDefault: false,
          },
        ]),
      400
    )
  );

export const deletePaymentMethod = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id }), 300));

export const setDefaultPaymentMethod = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id }), 300));
