export function createCheckoutSession(tier, cycle) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ url: 'https://checkout.stripe.com/mock' }), 800)
  );
}

export function fetchSubscription() {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          tier: 'enthusiast',
          billingCycle: 'monthly',
          lookupsUsed: 32,
          lookupsLimit: 50,
          vehicleLimit: 5,
          status: 'active',
          currentPeriodEnd: '2026-05-15',
        }),
      400
    )
  );
}

export function cancelSubscription() {
  return new Promise((resolve) => setTimeout(resolve, 600));
}
