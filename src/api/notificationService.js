export function fetchNotificationPreferences() {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          orderUpdates: true,
          identifyComplete: true,
          lookupWarning: true,
          subscriptionEmail: true,
          priceDropEmail: true,
          marketingEmail: true,
        }),
      400
    )
  );
}

export function updateNotificationPreference(key, value) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ key, value }), 200)
  );
}
