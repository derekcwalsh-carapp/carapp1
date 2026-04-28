import client from './client.js';

/** Normalize API product shapes (price + priceCents) for UI using dollar `price`. */
export function mapProduct(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const hasPrice = typeof raw.price === 'number' && !Number.isNaN(raw.price);
  const hasCents = typeof raw.priceCents === 'number' && !Number.isNaN(raw.priceCents);
  const price = hasPrice ? raw.price : hasCents ? raw.priceCents / 100 : undefined;
  const priceCents =
    typeof raw.priceCents === 'number'
      ? raw.priceCents
      : typeof price === 'number'
        ? Math.round(price * 100)
        : undefined;

  let shippingEstimate = raw.shippingEstimate;
  if (
    shippingEstimate == null &&
    (raw.shippingEstimateMin != null || raw.shippingEstimateMax != null)
  ) {
    const lo = raw.shippingEstimateMin;
    const hi = raw.shippingEstimateMax;
    if (lo != null && hi != null && lo !== hi) {
      shippingEstimate = `${lo}–${hi} days`;
    } else if (lo != null) {
      shippingEstimate = `${lo}+ days`;
    }
  }

  return {
    ...raw,
    price,
    priceCents,
    shippingEstimate,
  };
}

function mapGroupedGroups(groups) {
  const out = {};
  for (const [key, group] of Object.entries(groups || {})) {
    out[key] = {
      ...group,
      products: (group.products || []).map(mapProduct),
    };
  }
  return out;
}

export async function fetchGroupedResults(params) {
  const res = await client.get('/v1/products/grouped', { params });
  return mapGroupedGroups(res.data.data.groups);
}

export async function fetchProduct(id, options = {}) {
  const { vehicleId } = options;
  const res = await client.get(`/v1/products/${id}`, {
    params: vehicleId ? { vehicleId } : undefined,
  });
  return mapProduct(res.data.data);
}

export async function searchProducts(query, category) {
  const res = await client.get('/v1/search', { params: { q: query, category } });
  const rows = res.data.data || [];
  return rows.map(mapProduct);
}
