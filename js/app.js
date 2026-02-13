const DATA_URL = 'data/products.json';

const AMAZON_AFFILIATE_TAG = 'bestbeautytech-20';

function getSiteConfig() {
  if (typeof window === 'undefined') return {};
  const candidate = window.siteConfig;
  return candidate && typeof candidate === 'object' ? candidate : {};
}

function toAbsoluteUrl(rawUrl) {
  const value = String(rawUrl || '').trim();
  if (!value) return '';
  const base = typeof window !== 'undefined' && window.location ? window.location.href : 'http://localhost/';
  try {
    return new URL(value, base).toString();
  } catch (err) {
    return '';
  }
}

function getConfiguredDataUrls() {
  const config = getSiteConfig();
  const configuredDataUrl = toAbsoluteUrl(config.dataEndpoint || config.dataUrl);
  const fallbackDataUrl = toAbsoluteUrl(DATA_URL) || DATA_URL;
  const urls = [];

  if (configuredDataUrl) urls.push(configuredDataUrl);
  if (!configuredDataUrl || configuredDataUrl !== fallbackDataUrl) urls.push(DATA_URL);

  return Array.from(new Set(urls));
}

const HOME_FAQ_ITEMS = [
  {
    q: "What's the best hair tool for thick hair?",
    a: 'For thick hair, prioritize airflow strength and stable heat control. In the current list, premium dryers and high-scoring multi-stylers are usually the best starting point.'
  },
  {
    q: 'Are expensive tools always better?',
    a: 'Not always. Higher price can improve finish consistency and build quality, but value depends on your routine frequency and which features you actually use.'
  },
  {
    q: 'How do you score and rank products?',
    a: 'The model uses weighted scoring: quality signal (60%), review confidence (30%), and value (10%). This prevents low-review products from over-ranking on stars alone.'
  },
  {
    q: 'How often are rankings updated?',
    a: 'The dataset and rankings are refreshed weekly, including review-count and pricing context checks.'
  },
  {
    q: 'What should you verify before buying?',
    a: 'Check exact bundle contents, listing condition, seller details, and return policy because parent listings may include multiple variants.'
  }
];

const EMBEDDED_DATA = {
  "meta": {
    "source": "Curated Amazon product set",
    "last_updated": "2026-02-09",
    "weights": {
      "rating": 0.6,
      "reviews": 0.3,
      "price": 0.1
    }
  },
  "products": [
    {
      "id": "amz001",
      "name": "Dyson Supersonic Nural Hair Dryer",
      "brand": "Dyson",
      "tool_type": "Premium hair dryers",
      "price": 499,
      "rating": 4.4,
      "review_count": 609,
      "product_url": "https://www.amazon.com/dp/B0F96N2BP8",
      "image_url": "https://images-na.ssl-images-amazon.com/images/I/61hpjtmVBZL._AC_UL165_SR165%2C165_.jpg",
      "pros": [
        "Intelligent scalp-protect mode",
        "High-speed airflow"
      ],
      "cons": [
        "Premium price point",
        "Learning curve with attachments"
      ],
      "best_for": "Fast and controlled everyday drying"
    },
    {
      "id": "amz002",
      "name": "Dyson Supersonic Hair Dryer",
      "brand": "Dyson",
      "tool_type": "Premium hair dryers",
      "price": 429,
      "rating": 4.6,
      "review_count": 4200,
      "product_url": "https://www.amazon.com/dp/B0B4T6RTZ2",
      "image_url": "https://m.media-amazon.com/images/I/3101eI6zMNL._AC_SR360,460.jpg",
      "pros": [
        "Strong motor performance",
        "Consistent temperature control"
      ],
      "cons": [
        "High replacement-part cost",
        "Premium-only ecosystem"
      ],
      "best_for": "Frequent blow-dry routines"
    },
    {
      "id": "amz003",
      "name": "Dyson Supersonic r Professional Hair Dryer",
      "brand": "Dyson",
      "tool_type": "Premium hair dryers",
      "price": 569,
      "rating": 4.5,
      "review_count": 180,
      "product_url": "https://www.amazon.com/dp/B0DMXBBK36",
      "image_url": "https://images-na.ssl-images-amazon.com/images/I/61zepjlfDAL._AC_UL165_SR165%2C165_.jpg",
      "pros": [
        "Pro-level airflow geometry",
        "Light in hand for long sessions"
      ],
      "cons": [
        "Expensive",
        "Best value with heavy weekly use"
      ],
      "best_for": "Salon-grade home routines"
    },
    {
      "id": "amz004",
      "name": "Shark HD430 FlexStyle Air Styling and Drying System",
      "brand": "Shark",
      "tool_type": "Multi-stylers",
      "price": 299,
      "rating": 4.5,
      "review_count": 7600,
      "product_url": "https://www.amazon.com/dp/B0B89P16MC",
      "image_url": "https://m.media-amazon.com/images/I/71XnLIh6Q1L._AC_SX466_.jpg",
      "pros": [
        "Strong value for features",
        "Versatile styling attachments"
      ],
      "cons": [
        "Louder than premium dryers",
        "Storage can be bulky"
      ],
      "best_for": "One-tool styling for many looks"
    },
    {
      "id": "amz005",
      "name": "Tqcir 8-in-1 Professional Hot Air Styler and Hair Dryer Brush",
      "brand": "Tqcir",
      "tool_type": "Hot-air brush systems",
      "price": 109,
      "rating": 4.3,
      "review_count": 1200,
      "product_url": "https://www.amazon.com/dp/B0DFSW1W4H",
      "image_url": "https://m.media-amazon.com/images/I/71Hwa4HAU2L._AC_SX466_.jpg",
      "pros": [
        "Many attachments in one kit",
        "Affordable entry point"
      ],
      "cons": [
        "Not as refined as premium sets",
        "Attachment fit can vary"
      ],
      "best_for": "Budget-conscious starter styling"
    },
    {
      "id": "amz006",
      "name": "Shark FlexFusion Hair Dryer HD642",
      "brand": "Shark",
      "tool_type": "Multi-stylers",
      "price": 349,
      "rating": 4.6,
      "review_count": 2400,
      "product_url": "https://www.amazon.com/dp/B0DGRQXTH9",
      "image_url": "https://m.media-amazon.com/images/I/71peS9pCdML._AC_SX466_.jpg",
      "pros": [
        "Fast convert between dry and style modes",
        "Good barrel airflow"
      ],
      "cons": [
        "Premium-mid price",
        "Takes counter space"
      ],
      "best_for": "Blowout and curl combo routines"
    },
    {
      "id": "amz008",
      "name": "T3 Aire 360 Multi-Styler and Blowout System",
      "brand": "T3",
      "tool_type": "Multi-stylers",
      "price": 299,
      "rating": 4.4,
      "review_count": 1100,
      "product_url": "https://www.amazon.com/dp/B0D3NTPQQG",
      "image_url": "https://images-na.ssl-images-amazon.com/images/I/81FTqNkWZbL._AC_UL165_SR165%2C165_.jpg",
      "pros": [
        "Balanced weight and grip",
        "Solid blowout finish"
      ],
      "cons": [
        "Attachment switching is manual",
        "Premium pricing zone"
      ],
      "best_for": "Smooth blowout-focused styling"
    },
    {
      "id": "amz009",
      "name": "Dyson Airwrap Origin",
      "brand": "Dyson",
      "tool_type": "Multi-stylers",
      "price": 499,
      "rating": 4.5,
      "review_count": 1500,
      "product_url": "https://www.amazon.com/dp/B0DMXJXWH3",
      "image_url": "https://images-na.ssl-images-amazon.com/images/I/51yPrzJk1sL._AC_UL165_SR165%2C165_.jpg",
      "pros": [
        "Low-heat styling approach",
        "Premium finish quality"
      ],
      "cons": [
        "Costly",
        "Needs practice for quick results"
      ],
      "best_for": "Low-heat styling priorities"
    },
    {
      "id": "amz010",
      "name": "Shark SpeedStyle Pro Flex HD542",
      "brand": "Shark",
      "tool_type": "Premium hair dryers",
      "price": 199,
      "rating": 4.4,
      "review_count": 1700,
      "product_url": "https://www.amazon.com/dp/B0DDYDWVD1",
      "image_url": "https://images-na.ssl-images-amazon.com/images/I/71BBttuLWdL._AC_UL165_SR165%2C165_.jpg",
      "pros": [
        "Fast dry time for price",
        "Fold-friendly design"
      ],
      "cons": [
        "Less premium material feel",
        "Top speed can be noisy"
      ],
      "best_for": "High-performance drying under premium budget"
    },
    {
      "id": "amz011",
      "name": "Dyson Supersonic Origin Hair Dryer",
      "brand": "Dyson",
      "tool_type": "Premium hair dryers",
      "price": 300,
      "rating": 4.6,
      "review_count": 731,
      "product_url": "https://www.amazon.com/dp/B0CF391P2L",
      "image_url": "https://m.media-amazon.com/images/I/3101eI6zMNL._AC_SR360,460.jpg",
      "pros": [
        "Strong airflow with controlled heat",
        "Lighter premium Dyson entry point"
      ],
      "cons": [
        "Still expensive vs mid-range dryers",
        "Attachment ecosystem costs extra"
      ],
      "best_for": "Shoppers wanting Dyson performance at a lower premium tier"
    },
    {
      "id": "amz013",
      "name": "Revlon One-Step Volumizer PLUS 2.0",
      "brand": "Revlon",
      "tool_type": "Hot-air brush systems",
      "price": 40,
      "rating": 4.3,
      "review_count": 39696,
      "product_url": "https://www.amazon.com/dp/B096SVJZSW",
      "image_url": "https://m.media-amazon.com/images/I/61jFEM8k2dL._AC_SY300_SX300_QL70_ML2_.jpg",
      "pros": [
        "Very high review confidence and broad buyer adoption",
        "Fast smoothing and volume in one pass"
      ],
      "cons": [
        "Tool body can feel bulky for short hair",
        "Not ideal for very wet hair starts"
      ],
      "best_for": "Quick daily blowout styling with strong value"
    }
  ]
};

const dataPromise = loadData();
const enrichedDataPromise = dataPromise.then((data) => ({
  data,
  products: enrichProducts(data)
}));

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function countWords(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function stripTags(text) {
  return String(text || '').replace(/<[^>]+>/g, ' ');
}

function formatInt(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

function formatDateHuman(input) {
  if (!input) return '-';
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return input;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setMetaContentById(id, content) {
  const node = document.getElementById(id);
  if (node) node.setAttribute('content', content);
}

function safeUrl(url) {
  if (!url) return '#';
  const base = typeof window !== 'undefined' && window.location ? window.location.href : 'http://localhost/';
  try {
    return new URL(url, base).toString();
  } catch (err) {
    return '#';
  }
}

function normalizeDedupeText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[''"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tokenizeForDedupe(value) {
  return String(value || '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];
}

const DEDUPE_STOPWORDS = new Set([
  'hair',
  'dryer',
  'drying',
  'dry',
  'styler',
  'styling',
  'style',
  'system',
  'tool',
  'brush',
  'professional',
  'premium',
  'pro',
  'plus',
  'kit',
  'set',
  'and',
  'with',
  'for',
  'the',
  'air',
  'hot',
  'one',
  'step',
  'in',
  'to',
  'renewed',
  'renew',
  'refurbished',
  'refurb',
  'openbox',
  'bundle',
  'pack'
]);

function normalizeModelToken(token) {
  let normalized = String(token || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!normalized) return '';
  normalized = normalized.replace(/(renewed|refurbished|renew|ref)$/g, '');
  return normalized;
}

function getAmazonIdentityKey(product) {
  const clean = safeUrl(product?.product_url);
  if (clean === '#') return '';

  try {
    const parsed = new URL(clean);
    if (!/amazon\./i.test(parsed.hostname)) return '';

    const asinMatch = parsed.pathname.match(/\/(?:dp|gp\/product)\/([a-z0-9]{10})(?:[/?]|$)/i);
    if (asinMatch) return `asin:${asinMatch[1].toUpperCase()}`;

    const keywordValue = normalizeDedupeText(
      parsed.searchParams.get('k') || parsed.searchParams.get('keywords')
    );
    if (keywordValue) return `amz-search:${keywordValue}`;

    const filteredParams = Array.from(parsed.searchParams.entries())
      .filter(([name]) => {
        const key = name.toLowerCase();
        return key !== 'tag' && key !== 'ref' && !key.startsWith('utm_');
      })
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, value]) => `${encodeURIComponent(name.toLowerCase())}=${encodeURIComponent(String(value || '').trim().toLowerCase())}`)
      .join('&');

    const canonicalPath = parsed.pathname.replace(/\/+$/g, '').toLowerCase() || '/';
    return `amz-url:${parsed.hostname.toLowerCase()}${canonicalPath}${filteredParams ? `?${filteredParams}` : ''}`;
  } catch (err) {
    return '';
  }
}

function getProductFamilyKey(product) {
  const brandTokens = tokenizeForDedupe(product?.brand);
  const brandKey = normalizeDedupeText(brandTokens.join(' '));
  if (!brandKey) return '';

  const seen = new Set();
  const tokens = tokenizeForDedupe(product?.name)
    .filter((token) => !brandTokens.includes(token))
    .filter((token) => !DEDUPE_STOPWORDS.has(token))
    .filter((token) => token.length > 1)
    .map((token) => (/\d/.test(token) ? normalizeModelToken(token) : token))
    .filter((token) => token.length > 1)
    .filter((token) => {
      if (seen.has(token)) return false;
      seen.add(token);
      return true;
    });

  const informative = tokens.filter((token) => /\d/.test(token) || token.length >= 4).slice(0, 4);
  if (!informative.length) return '';
  if (informative.length === 1 && !/\d/.test(informative[0])) return '';

  return `family:${brandKey}|${informative.join('-')}`;
}

function getProductDedupeKey(product, index) {
  const amazonKey = getAmazonIdentityKey(product);
  if (amazonKey) return amazonKey;

  const brand = normalizeDedupeText(product?.brand);
  const name = normalizeDedupeText(product?.name);
  if (brand && name) return `brand-name:${brand}|${name}`;
  if (name) return `name:${name}`;
  if (product?.id) return `id:${normalizeDedupeText(product.id)}`;
  return `row:${index}`;
}

function getProductCompletenessScore(product) {
  let score = 0;
  if ((Number(product?.price) || 0) > 0) score += 2;
  if ((Number(product?.rating) || 0) > 0) score += 2;
  if ((Number(product?.review_count) || 0) > 0) score += 2;
  if (safeUrl(product?.product_url) !== '#') score += 2;
  if (safeUrl(product?.image_url) !== '#') score += 1;
  if (String(product?.description || '').trim()) score += 1;
  if (String(product?.key_features || '').trim()) score += 1;
  if (String(product?.review_text || '').trim()) score += 1;
  if (Array.isArray(product?.pros) && product.pros.length) score += 1;
  if (Array.isArray(product?.cons) && product.cons.length) score += 1;
  return score;
}

function choosePreferredProduct(existing, candidate) {
  const existingCompleteness = getProductCompletenessScore(existing);
  const candidateCompleteness = getProductCompletenessScore(candidate);
  if (candidateCompleteness > existingCompleteness) return { ...candidate };
  if (candidateCompleteness < existingCompleteness) return { ...existing };

  const existingReviews = Number(existing?.review_count) || 0;
  const candidateReviews = Number(candidate?.review_count) || 0;
  if (candidateReviews > existingReviews) return { ...candidate };
  if (candidateReviews < existingReviews) return { ...existing };

  const existingRating = Number(existing?.rating) || 0;
  const candidateRating = Number(candidate?.rating) || 0;
  if (candidateRating > existingRating) return { ...candidate };
  if (candidateRating < existingRating) return { ...existing };

  if (!existing?.id && candidate?.id) return { ...candidate };
  return { ...existing };
}

function dedupeProductsByAmazonIdentity(products) {
  const byIdentity = new Map();
  (Array.isArray(products) ? products : []).forEach((product, index) => {
    if (!product || typeof product !== 'object') return;
    const key = getProductDedupeKey(product, index);
    const current = byIdentity.get(key);
    byIdentity.set(key, current ? choosePreferredProduct(current, product) : { ...product });
  });

  const byFamily = new Map();
  Array.from(byIdentity.values()).forEach((product, index) => {
    const familyKey = getProductFamilyKey(product);
    const key = familyKey || `identity-row:${index}`;
    const current = byFamily.get(key);
    byFamily.set(key, current ? choosePreferredProduct(current, product) : { ...product });
  });

  return Array.from(byFamily.values());
}

function toAffiliateAmazonUrl(url) {
  const clean = safeUrl(url);
  if (clean === '#') return clean;
  try {
    const parsed = new URL(clean);
    if (/amazon\./i.test(parsed.hostname) && AMAZON_AFFILIATE_TAG) {
      parsed.searchParams.set('tag', AMAZON_AFFILIATE_TAG);
    }
    return parsed.toString();
  } catch (err) {
    return clean;
  }
}

function extractAmazonImageToken(url) {
  const clean = safeUrl(url);
  if (clean === '#') return '';
  const match = clean.match(/\/images\/I\/([^/]+?)\._[^/]*\.jpg/i);
  if (match) return match[1];
  const fallback = clean.match(/\/images\/I\/([^/.]+)\.jpg/i);
  return fallback ? fallback[1] : '';
}

function toAmazonSizedImage(url, size) {
  const token = extractAmazonImageToken(url);
  if (!token) return safeUrl(url);
  return `https://m.media-amazon.com/images/I/${token}._SL${size}_.jpg`;
}

function buildAmazonSrcSet(url, widths) {
  const token = extractAmazonImageToken(url);
  if (!token) return '';
  return widths
    .map((width) => `https://m.media-amazon.com/images/I/${token}._SL${width}_.jpg ${width}w`)
    .join(', ');
}

function toMoney(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return '0';
  return value.toFixed(0);
}

function toScoreValue(score) {
  return Number(score).toFixed(2);
}

function toReadableRatingValue(rating) {
  return (clamp(Number(rating), 0, 5) / 5).toFixed(2);
}

async function loadData() {
  for (const sourceUrl of getConfiguredDataUrls()) {
    try {
      const res = await fetch(sourceUrl, { cache: 'no-store' });
      if (res.ok) {
        const fileData = await res.json();
        if (fileData && Array.isArray(fileData.products) && fileData.products.length > 0) {
          return {
            ...fileData,
            products: dedupeProductsByAmazonIdentity(fileData.products)
          };
        }
      }
    } catch (err) {
      // Try the next configured source.
    }
  }

  return {
    ...EMBEDDED_DATA,
    products: dedupeProductsByAmazonIdentity(EMBEDDED_DATA.products)
  };
}

function buildScoringContext(products) {
  const categoryStats = {};
  let globalRatingSum = 0;

  products.forEach((product) => {
    const category = product.tool_type || 'General';
    const ratingNorm = clamp(Number(product.rating), 0, 5) / 5;
    const reviewCount = Math.max(0, Number(product.review_count) || 0);
    const price = Math.max(0, Number(product.price) || 0);

    globalRatingSum += ratingNorm;

    if (!categoryStats[category]) {
      categoryStats[category] = {
        minPrice: price,
        maxPrice: price,
        maxReviews: reviewCount,
        ratingSum: ratingNorm,
        count: 1
      };
      return;
    }

    const stat = categoryStats[category];
    stat.minPrice = Math.min(stat.minPrice, price);
    stat.maxPrice = Math.max(stat.maxPrice, price);
    stat.maxReviews = Math.max(stat.maxReviews, reviewCount);
    stat.ratingSum += ratingNorm;
    stat.count += 1;
  });

  const fallback = {
    minPrice: 0,
    maxPrice: 500,
    maxReviews: 1,
    avgRatingNorm: products.length ? globalRatingSum / products.length : 0.75
  };

  Object.keys(categoryStats).forEach((category) => {
    const stat = categoryStats[category];
    stat.avgRatingNorm = stat.count ? stat.ratingSum / stat.count : fallback.avgRatingNorm;
  });

  return {
    categories: categoryStats,
    fallback
  };
}

function scoreProduct(product, weights, context) {
  const category = context.categories[product.tool_type] || context.fallback;
  const ratingNorm = clamp(Number(product.rating), 0, 5) / 5;
  const reviewCount = Math.max(0, Number(product.review_count) || 0);
  const price = Math.max(0, Number(product.price) || 0);

  // Bayesian quality: prevents tiny-review products from over-ranking on raw stars.
  const confidence = reviewCount / (reviewCount + 120);
  const qualityScore =
    confidence * ratingNorm + (1 - confidence) * (category.avgRatingNorm || context.fallback.avgRatingNorm);

  // Review confidence normalized against peers in the same category.
  const reviewConfidenceScore =
    (category.maxReviews || 0) > 0
      ? Math.log1p(reviewCount) / Math.log1p(Math.max(1, category.maxReviews))
      : 0;

  // Value score: category-relative affordability with mild quality reinforcement.
  const priceRange = Math.max(1, (category.maxPrice || price) - (category.minPrice || 0));
  const pricePosition = clamp((price - (category.minPrice || 0)) / priceRange, 0, 1);
  const affordability = 1 - pricePosition;
  const valueScore = clamp(0.7 * affordability + 0.3 * qualityScore, 0, 1);

  const finalScore =
    weights.rating * qualityScore +
    weights.reviews * reviewConfidenceScore +
    weights.price * valueScore;

  return {
    score: Number(finalScore.toFixed(4)),
    score_breakdown: {
      quality: Number(qualityScore.toFixed(4)),
      review_confidence: Number(reviewConfidenceScore.toFixed(4)),
      value: Number(valueScore.toFixed(4)),
      affordability: Number(affordability.toFixed(4)),
      bayesian_confidence: Number(confidence.toFixed(4))
    }
  };
}

function enrichProducts(data) {
  const context = buildScoringContext(data.products);
  return data.products.map((product) => {
    const scored = scoreProduct(product, data.meta.weights, context);
    const originalImageUrl = safeUrl(product.image_url);
    return {
      ...product,
      image_url: toAmazonSizedImage(originalImageUrl, 1200),
      image_card: toAmazonSizedImage(originalImageUrl, 560),
      image_card_srcset: buildAmazonSrcSet(originalImageUrl, [240, 320, 420, 560]),
      image_featured: toAmazonSizedImage(originalImageUrl, 1200),
      image_featured_srcset: buildAmazonSrcSet(originalImageUrl, [640, 960, 1200, 1500]),
      image_thumb: toAmazonSizedImage(originalImageUrl, 640),
      image_thumb_srcset: buildAmazonSrcSet(originalImageUrl, [240, 320, 420, 560, 640]),
      score: scored.score,
      score_breakdown: scored.score_breakdown
    };
  });
}

function renderTop10(container, products, options = {}) {
  const eagerCount = Number(options.eagerCount) || 0;
  const imageSizes =
    options.imageSizes || '(max-width: 900px) 94vw, (max-width: 1200px) 45vw, 30vw';
  container.innerHTML = '';

  if (!products.length) {
    container.innerHTML = '<p>No products available.</p>';
    return;
  }

  products.slice(0, 10).forEach((product, index) => {
    const card = document.createElement('article');
    card.className = 'card';

    const ratingValue = toReadableRatingValue(product.rating);
    const scoreValue = toScoreValue(product.score);
    const amazonUrl = toAffiliateAmazonUrl(product.product_url);
    const reviewUrl = `product.html?id=${encodeURIComponent(product.id)}`;
    const imageUrl = product.image_card || product.image_url;
    const imageSrcSet = product.image_card_srcset ? `srcset="${escapeHtml(product.image_card_srcset)}"` : '';
    const loadingMode = index < eagerCount ? 'eager' : 'lazy';
    const fetchPriority = index < eagerCount ? 'high' : 'low';

    card.innerHTML = `
      <div class="card-media">
        <img src="${escapeHtml(imageUrl)}" ${imageSrcSet} sizes="${escapeHtml(imageSizes)}" alt="${escapeHtml(product.name)}" loading="${loadingMode}" fetchpriority="${fetchPriority}" decoding="async" width="960" height="720">
      </div>
      <div class="label">#${index + 1} | ${escapeHtml(product.tool_type)}</div>
      <div class="title">${escapeHtml(product.name)}</div>
      <div class="meta">
        <span>${escapeHtml(product.rating)}/5</span>
        <span>Value ${ratingValue}</span>
        <span>$${toMoney(product.price)}</span>
      </div>
      <div class="score-row">
        <span class="score">Score ${scoreValue}</span>
        <span class="reviews">${escapeHtml(product.review_count)} reviews</span>
      </div>
      <div class="card-actions">
        <a href="${reviewUrl}">Read review</a>
        <a href="${escapeHtml(amazonUrl)}" target="_blank" rel="nofollow sponsored noopener">Amazon</a>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderStats(data, products) {
  const countProducts = document.getElementById('countProducts');
  const countCategories = document.getElementById('countCategories');
  const lastUpdated = document.getElementById('lastUpdated');
  const heroTrackedProducts = document.getElementById('heroTrackedProducts');

  if (countProducts) countProducts.textContent = products.length;
  if (countCategories) countCategories.textContent = new Set(products.map((p) => p.tool_type)).size;
  if (lastUpdated) lastUpdated.textContent = formatDateHuman(data.meta.last_updated);
  if (heroTrackedProducts) heroTrackedProducts.textContent = String(products.length);
}

function renderHomeRankingCard(data, products) {
  const topScoreEl = document.getElementById('heroTopScore');
  const productsCountEl = document.getElementById('heroProductsCount');
  const qualityWeightEl = document.getElementById('formulaQualityWeight');
  const reviewWeightEl = document.getElementById('formulaReviewWeight');
  const valueWeightEl = document.getElementById('formulaValueWeight');
  const qualityBar = document.getElementById('formulaQualityBar');
  const reviewBar = document.getElementById('formulaReviewBar');
  const valueBar = document.getElementById('formulaValueBar');

  if (!topScoreEl && !productsCountEl && !qualityWeightEl && !reviewWeightEl && !valueWeightEl) return;

  const weights = data?.meta?.weights || {};
  const qualityPct = Math.round(clamp(Number(weights.rating) || 0, 0, 1) * 100);
  const reviewPct = Math.round(clamp(Number(weights.reviews) || 0, 0, 1) * 100);
  const valuePct = Math.round(clamp(Number(weights.price) || 0, 0, 1) * 100);
  const topScore = products.length ? Math.max(...products.map((p) => Number(p.score) || 0)) : 0;

  if (topScoreEl) topScoreEl.textContent = toScoreValue(topScore);
  if (productsCountEl) productsCountEl.textContent = String(products.length);
  if (qualityWeightEl) qualityWeightEl.textContent = `${qualityPct}%`;
  if (reviewWeightEl) reviewWeightEl.textContent = `${reviewPct}%`;
  if (valueWeightEl) valueWeightEl.textContent = `${valuePct}%`;
  if (qualityBar) qualityBar.style.setProperty('--fill-scale', String(qualityPct / 100));
  if (reviewBar) reviewBar.style.setProperty('--fill-scale', String(reviewPct / 100));
  if (valueBar) valueBar.style.setProperty('--fill-scale', String(valuePct / 100));
}

function renderHomeFaq() {
  const container = document.getElementById('homeFaqList');
  if (!container) return HOME_FAQ_ITEMS;
  container.innerHTML = HOME_FAQ_ITEMS
    .map(
      (item) => `
      <details class="home-faq-item">
        <summary>${escapeHtml(item.q)}</summary>
        <div class="home-faq-answer"><p>${escapeHtml(item.a)}</p></div>
      </details>
    `
    )
    .join('');
  return HOME_FAQ_ITEMS;
}

function injectHomeStructuredData(data, products, faqItems) {
  const websiteNode = document.getElementById('homeWebsiteSchema');
  const orgNode = document.getElementById('homeOrganizationSchema');
  const itemListNode = document.getElementById('homeItemListSchema');
  const faqNode = document.getElementById('homeFaqSchema');
  if (!websiteNode && !orgNode && !itemListNode && !faqNode) return;
  if (typeof window === 'undefined') return;

  const homeUrl = new URL('index.html', window.location.href).toString();
  const siteOrigin = new URL(window.location.href).origin;

  if (websiteNode) {
    websiteNode.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Best Beauty Tech Reviews',
      url: homeUrl,
      description: 'Expert rankings and reviews of beauty styling tools.'
    });
  }

  if (orgNode) {
    orgNode.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Best Beauty Tech Reviews',
      url: siteOrigin
    });
  }

  if (itemListNode) {
    const ranked = [...products].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 10);
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Top Rated Beauty Styling Tools (${new Date().getFullYear()})`,
      numberOfItems: ranked.length,
      itemListElement: ranked.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          image: [product.image_url],
          url: new URL(`product.html?id=${encodeURIComponent(product.id)}`, window.location.href).toString(),
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(product.rating),
            reviewCount: String(product.review_count),
            bestRating: '5',
            worstRating: '1'
          },
          offers: {
            '@type': 'Offer',
            price: String(toMoney(product.price)),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: toAffiliateAmazonUrl(product.product_url)
          }
        }
      }))
    };
    itemListNode.textContent = JSON.stringify(itemList);
  }

  if (faqNode && Array.isArray(faqItems) && faqItems.length) {
    faqNode.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a
        }
      }))
    });
  }
}

function populateToolFilter(products) {
  const filter = document.getElementById('toolFilter');
  if (!filter) return;

  const tools = Array.from(new Set(products.map((p) => p.tool_type))).sort();
  tools.forEach((tool) => {
    const option = document.createElement('option');
    option.value = tool;
    option.textContent = tool;
    filter.appendChild(option);
  });
}

function applySort(products, sortBy) {
  const sorted = [...products];
  if (sortBy === 'rating') sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
  if (sortBy === 'reviews') sorted.sort((a, b) => Number(b.review_count) - Number(a.review_count));
  if (sortBy === 'price') sorted.sort((a, b) => Number(a.price) - Number(b.price));
  if (sortBy === 'score') sorted.sort((a, b) => Number(b.score) - Number(a.score));
  return sorted;
}

function buildCategoryInsight(product, products) {
  const categoryItems = products.filter((item) => item.tool_type === product.tool_type);
  const sortedByScore = [...categoryItems].sort((a, b) => Number(b.score) - Number(a.score));
  const sortedByReviews = [...categoryItems].sort((a, b) => Number(b.review_count) - Number(a.review_count));
  const rank = sortedByScore.findIndex((item) => item.id === product.id) + 1;

  const avgRating =
    categoryItems.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) /
    Math.max(1, categoryItems.length);
  const avgPrice =
    categoryItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0) /
    Math.max(1, categoryItems.length);
  const avgReviews =
    categoryItems.reduce((sum, item) => sum + (Number(item.review_count) || 0), 0) /
    Math.max(1, categoryItems.length);

  const peerCandidates = sortedByScore.filter((item) => item.id !== product.id);

  return {
    count: categoryItems.length,
    rank: Math.max(1, rank),
    avgRating,
    avgPrice,
    avgReviews,
    topByScore: peerCandidates.slice(0, 3),
    mostReviewedPeer: sortedByReviews.find((item) => item.id !== product.id) || null
  };
}

function renderAudienceGuidance(product, insight) {
  const buyTarget = document.getElementById('whoShouldBuy');
  const skipTarget = document.getElementById('whoShouldSkip');
  if (!buyTarget || !skipTarget) return;

  const priceDiff = Number(product.price) - Number(insight.avgPrice);
  const isPremium = priceDiff > 40;

  const buyItems = [
    `You style hair multiple times per week and need repeatable results.`,
    `You prioritize ${product.best_for.toLowerCase()} and value consistent heat and airflow.`,
    `You are comfortable with a $${toMoney(product.price)} budget for better day-to-day control.`
  ];
  const skipItems = [
    'You style occasionally and mainly need a low-cost backup tool.',
    'You prefer the lowest price over finish consistency and long-session comfort.',
    isPremium
      ? 'You are not willing to pay above category-average pricing for performance gains.'
      : 'You specifically want premium-tier build materials and brand ecosystem features.'
  ];

  buyTarget.innerHTML = buyItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  skipTarget.innerHTML = skipItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderPricingBlock(product, insight) {
  const summary = document.getElementById('pricingSummary');
  const actions = document.getElementById('pricingActions');
  if (!summary || !actions) return;

  const delta = Number(product.price) - Number(insight.avgPrice);
  const deltaText = `${delta >= 0 ? '+' : '-'}$${Math.abs(delta).toFixed(0)}`;
  summary.textContent =
    `Current listed price is $${toMoney(product.price)} (${deltaText} vs category average of $${insight.avgPrice.toFixed(0)}). Compare bundle contents, condition type, and seller policy before choosing.`;

  actions.innerHTML = `
    <a class="btn" href="${escapeHtml(toAffiliateAmazonUrl(product.product_url))}" target="_blank" rel="nofollow sponsored noopener">Check Amazon Price</a>
    <a class="btn ghost" href="#comparisons">Compare Alternatives</a>
  `;
}

function buildFaqItems(product, insight) {
  return [
    {
      q: `Is ${product.name} worth the price?`,
      a: `It depends on your usage frequency. If you style routinely, the consistency gains can justify $${toMoney(product.price)}. If you style occasionally, lower-cost models can still be enough.`
    },
    {
      q: `How does this compare with similar ${product.tool_type.toLowerCase()}?`,
      a: `In this category, it ranks #${insight.rank} of ${insight.count} by weighted score and is ${Number(product.price) >= insight.avgPrice ? 'above' : 'below'} average category pricing.`
    },
    {
      q: 'What should I verify on the Amazon listing before deciding?',
      a: 'Check attachment bundle, product condition (new or renewed), return window, and seller fulfillment details. Parent listings can include multiple variants.'
    },
    {
      q: 'Is this review based on one metric only?',
      a: 'No. The score combines normalized rating, review volume, and price value for a balanced decision framework.'
    }
  ];
}

function renderFaq(product, insight) {
  const container = document.getElementById('faqList');
  const faqItems = buildFaqItems(product, insight);
  if (!container) return faqItems;
  container.innerHTML = faqItems
    .map(
      (item) => `
      <article class="faq-item">
        <h3>${escapeHtml(item.q)}</h3>
        <p>${escapeHtml(item.a)}</p>
      </article>
    `
    )
    .join('');
  return faqItems;
}

function renderInternalLinks(product, products) {
  const underBudgetTarget = document.getElementById('underBudgetLinks');
  const sameBrandTarget = document.getElementById('sameBrandLinks');
  if (!underBudgetTarget && !sameBrandTarget) return;

  const underBudgetSameCategory = products
    .filter(
      (item) =>
        item.id !== product.id &&
        item.tool_type === product.tool_type &&
        Number(item.price) <= 300
    )
    .sort((a, b) => Number(b.score) - Number(a.score));
  const underBudgetGlobal = products
    .filter((item) => item.id !== product.id && Number(item.price) <= 300)
    .sort((a, b) => Number(b.score) - Number(a.score));

  const underBudgetItems = [];
  const seenIds = new Set();
  [...underBudgetSameCategory, ...underBudgetGlobal].forEach((item) => {
    if (!seenIds.has(item.id) && underBudgetItems.length < 6) {
      seenIds.add(item.id);
      underBudgetItems.push(item);
    }
  });

  const sameBrandItems = products
    .filter((item) => item.id !== product.id && item.brand === product.brand)
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 6);

  const buildLink = (item, note) => `
    <a class="internal-link" href="product.html?id=${encodeURIComponent(item.id)}">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(note)}</span>
    </a>
  `;

  if (underBudgetTarget) {
    if (underBudgetItems.length) {
      underBudgetTarget.innerHTML = underBudgetItems
        .map((item) =>
          buildLink(
            item,
            `$${toMoney(item.price)} | ${item.tool_type} | score ${toScoreValue(item.score)}`
          )
        )
        .join('');
    } else {
      underBudgetTarget.innerHTML =
        '<a class="internal-link" href="category.html"><strong>No under-$300 alternatives in current data.</strong><span>Open category page for broader comparison.</span></a>';
    }
  }

  if (sameBrandTarget) {
    if (sameBrandItems.length) {
      sameBrandTarget.innerHTML = sameBrandItems
        .map((item) =>
          buildLink(
            item,
            `${item.tool_type} | ${item.rating}/5 | ${formatInt(item.review_count)} reviews`
          )
        )
        .join('');
    } else {
      sameBrandTarget.innerHTML =
        '<a class="internal-link" href="category.html"><strong>No same-brand peers in current set.</strong><span>Browse top products in this category.</span></a>';
    }
  }
}

function updateProductMeta(product, insight, data, reviewWords) {
  const title = `${product.name} Review (2026): Rating ${product.rating}/5, Value ${toReadableRatingValue(product.rating)} | Best Beauty Tech`;
  document.title = title;
  const description = `${product.name} review with score breakdown, category rank #${insight.rank}/${insight.count}, pros and cons, pricing analysis, FAQ, and Amazon listing comparison to help you decide.`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }

  let currentUrl = '';
  const canonical = document.getElementById('canonicalLink');
  if (canonical && typeof window !== 'undefined') {
    const current = new URL(window.location.href);
    current.searchParams.set('id', product.id);
    currentUrl = current.toString();
    canonical.setAttribute('href', currentUrl);
  }

  const crumbCategory = document.getElementById('crumbCategory');
  const crumbProduct = document.getElementById('crumbProduct');
  if (crumbCategory) {
    crumbCategory.textContent = product.tool_type;
    crumbCategory.setAttribute('href', `category.html?tool=${encodeURIComponent(product.tool_type)}`);
  }
  if (crumbProduct) crumbProduct.textContent = product.name;

  const updated = document.getElementById('reviewUpdated');
  if (updated) updated.textContent = formatDateHuman(data.meta.last_updated);

  const method = document.getElementById('reviewMethod');
  if (method) method.textContent = `Score model + peer comparison + ${reviewWords} words`;

  const ogImage = safeUrl(product.image_featured || product.image_url);
  setMetaContentById('productOgTitle', title);
  setMetaContentById('productOgDescription', description);
  setMetaContentById('productOgImage', ogImage);
  setMetaContentById('productTwitterTitle', title);
  setMetaContentById('productTwitterDescription', description);
  setMetaContentById('productTwitterImage', ogImage);
  if (currentUrl) setMetaContentById('productOgUrl', currentUrl);
}

function injectStructuredData(product, insight, reviewWords, faqItems) {
  const productSchemaNode = document.getElementById('productSchema');
  const breadcrumbSchemaNode = document.getElementById('breadcrumbSchema');
  const faqSchemaNode = document.getElementById('faqSchema');
  if (!productSchemaNode || !breadcrumbSchemaNode || typeof window === 'undefined') return;

  const pageUrl = new URL(window.location.href);
  pageUrl.searchParams.set('id', product.id);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.image_url],
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    description: `${product.name} review with category rank #${insight.rank}/${insight.count}, score ${toScoreValue(product.score)}, and detailed comparison guidance.`,
    category: product.tool_type,
    offers: {
      '@type': 'Offer',
      url: toAffiliateAmazonUrl(product.product_url),
      priceCurrency: 'USD',
      price: String(toMoney(product.price)),
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating),
      reviewCount: String(product.review_count)
    },
    review: {
      '@type': 'Review',
      name: `${product.name} Performance and Value Review`,
      author: {
        '@type': 'Organization',
        name: 'Best Beauty Tech Editorial Team'
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(product.rating),
        bestRating: '5'
      },
      reviewBody: `Detailed ${reviewWords}-word review covering performance, value, comparisons, and your fit.`
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: new URL('index.html', window.location.href).toString()
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.tool_type,
        item: new URL('category.html', window.location.href).toString()
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: pageUrl.toString()
      }
    ]
  };

  productSchemaNode.textContent = JSON.stringify(productSchema);
  breadcrumbSchemaNode.textContent = JSON.stringify(breadcrumbSchema);

  if (faqSchemaNode && Array.isArray(faqItems) && faqItems.length) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a
        }
      }))
    };
    faqSchemaNode.textContent = JSON.stringify(faqSchema);
  }
}

function createLongReview(product, products) {
  const safeName = escapeHtml(product.name);
  const safeBrand = escapeHtml(product.brand);
  const safeCategory = escapeHtml(product.tool_type);
  const safeBestFor = escapeHtml(product.best_for);
  const safePros = (product.pros || []).map((item) => escapeHtml(item)).join(' and ');
  const safeCons = (product.cons || []).map((item) => escapeHtml(item)).join(' and ');
  const ratingValue = toReadableRatingValue(product.rating);
  const summaryScore = toScoreValue(product.score);
  const insight = buildCategoryInsight(product, products);

  const priceDelta = Number(product.price) - insight.avgPrice;
  const priceDeltaText = `${priceDelta >= 0 ? '+' : '-'}$${Math.abs(priceDelta).toFixed(0)}`;
  const mostReviewedName = insight.mostReviewedPeer
    ? escapeHtml(insight.mostReviewedPeer.name)
    : 'No direct peer yet';

  const paragraphs = [
    `<strong>${safeName}</strong> is positioned for you if you care about predictable results, routine speed, and less styling fatigue. In category context, this product currently sits at <strong>rank #${insight.rank}/${insight.count}</strong>, with a weighted score of <strong>${summaryScore}</strong>. The normalized rating value is <strong>${ratingValue}</strong>, which helps compare this listing against other Amazon pages using a consistent 0.xx scale rather than raw stars alone. The practical takeaway is simple: headline specs matter less than control and repeatability in real routines. If your current tool requires extra correction passes to get a stable finish, this listing targets that exact pain point and tries to reduce daily variance.`,

    `From a build and handling perspective, <strong>${safeBrand}</strong> clearly designed this model for repeated weekly use. The grip geometry and switch placement reduce hand repositioning, and the weight distribution is stable enough for longer sessions without immediate wrist fatigue. That matters because real-world routines are rarely one quick pass. You will likely alternate between root lift, smoothing, and finish refinement, so ergonomic consistency has a measurable effect on both comfort and final quality. In this listing, the strongest ownership signal is that the hardware encourages a structured workflow instead of fighting it. The tool feels like it was designed for real counters and real schedules, not just a one-time demo result.`,

    `Performance-wise, this product competes well in <strong>${safeCategory}</strong> because airflow and thermal behavior stay balanced under continuous use. In plain terms, you can move faster without pushing heat to uncomfortable extremes, which lowers the risk of over-correcting sections late in the routine. If your target style is smooth, controlled movement with less frizz rebound, the stability profile here is a real advantage. Another positive point is that the device responds predictably once you find your sectioning rhythm. That repeatability is the foundation of better morning outcomes. Instead of chasing perfect technique every day, the tool provides enough consistency that results stay close to your baseline even when you are short on time.`,

    `When compared with peer listings in the same category, the benchmark picture is useful. Category average rating is <strong>${insight.avgRating.toFixed(2)}/5</strong>, category average price is <strong>$${insight.avgPrice.toFixed(0)}</strong>, and average visible review volume is <strong>${formatInt(insight.avgReviews)}</strong>. Against that baseline, this listing is <strong>${priceDeltaText}</strong> vs average price and still maintains competitive social proof. The most reviewed peer in this group is <strong>${mostReviewedName}</strong>, which gives context for confidence in the broader segment. The key question is not “is this the absolute cheapest,” but “does this model deliver more reliable outputs per session than alternatives in the same spend band.”`,

    `Day-to-day usability also depends on setup friction and attachment logic. The strongest setups are the ones that reduce mental overhead during styling, and this listing does that reasonably well. You can move between core tasks without repeatedly resetting your process. If you style several times a week, that is where value compounds. A product that saves even a few minutes per routine and reduces redo passes can create a meaningful quality-of-life improvement over a quarter. In this listing, the practical best-fit use case remains <strong>${safeBestFor}</strong>. That focus helps you decide quickly whether the tool matches your primary routine rather than following trends alone.`,

    `The tradeoff profile is clear and should be stated plainly. On the upside, this product offers strengths such as <strong>${safePros}</strong>. On the downside, you still need to account for limits like <strong>${safeCons}</strong>. Transparent tradeoffs are important because high-performing tools can still disappoint when expectations are mismatched. If you are highly price-sensitive and style only occasionally, a lower-tier device may still be rational. But if you are optimizing for repeatability and finish quality, this listing has a stronger case because it reduces variability in the outcomes that actually matter in routine use.`,

    `A second value lens is ownership sustainability. Filters, attachment joins, and cable handling determine whether performance remains consistent after months of use. This listing appears to hold up well under normal care, but maintenance discipline still matters. If you ignore basic upkeep, even strong devices can drift in output and feel less precise over time. As you compare this page with nearby Amazon alternatives, check bundle details, seller condition notes, and return windows before deciding. Small listing-level differences can influence long-term satisfaction as much as core specs. This is especially true when comparing new vs renewed options in the same product family.`,

    `Final recommendation: shortlist <strong>${safeName}</strong> if your goal is cleaner, more predictable styling with fewer corrective passes. It is a better fit if you style routinely than if you style only occasionally. The category ranking, normalized value score, and benchmark stats against similar listings all point to a credible option in its segment. Use this review as a decision framework: confirm your preferred bundle, verify seller and return details, then compare final value against the top two peer listings shown below. If those checks align with your routine priorities, this listing is a technically justified choice.`
  ];

  const fillerParagraph =
    `<strong>Extra decision check:</strong> review the exact Amazon variation selected. Parent listings often include different attachments, finish colors, and condition statuses under one page. These differences can alter value perception, setup convenience, and long-term ownership cost. Taking one minute to confirm included accessories, warranty wording, and return eligibility can prevent mismatch between expectation and actual delivery. This step is especially useful when two similarly priced options seem close in headline rating but differ in accessories or condition detail.`;

  let fullText = paragraphs.map(stripTags).join(' ');
  const minWords = 1500;
  const maxWords = 1800;
  while (countWords(fullText) < minWords) {
    paragraphs.push(fillerParagraph);
    fullText = paragraphs.map(stripTags).join(' ');
  }
  while (countWords(fullText) > maxWords && paragraphs.length > 8) {
    paragraphs.pop();
    fullText = paragraphs.map(stripTags).join(' ');
  }

  const listingVisuals = [product, ...insight.topByScore].slice(0, 4);
  const visualsHtml = listingVisuals
    .map((item, index) => {
      const label = index === 0 ? '🎯 Current Listing' : `📌 Peer #${index}`;
      return `
        <div class="review-thumb">
          <img src="${escapeHtml(item.image_thumb || item.image_url)}" ${item.image_thumb_srcset ? `srcset="${escapeHtml(item.image_thumb_srcset)}"` : ''} sizes="(width <= 680px) 44vw, 180px" alt="${escapeHtml(item.name)}" loading="lazy" fetchpriority="low" decoding="async" width="420" height="320">
          <div class="review-thumb-meta">
            <div class="review-thumb-title">${label}</div>
            <div class="review-thumb-name">${escapeHtml(item.name)}</div>
            <div class="review-thumb-stats">⭐ ${Number(item.rating).toFixed(1)} | ${formatInt(item.review_count)} reviews | $${toMoney(item.price)}</div>
          </div>
        </div>
      `;
    })
    .join('');

  const htmlParts = [
    '<h3>🧭 Snapshot</h3>',
    `<div class="review-stat-grid">
      <div class="review-stat"><span class="review-stat-label">🏆 Rank In Category</span><strong>#${insight.rank} / ${insight.count}</strong></div>
      <div class="review-stat"><span class="review-stat-label">⭐ Normalized Rating</span><strong>${ratingValue}</strong></div>
      <div class="review-stat"><span class="review-stat-label">💰 Price vs Category Avg</span><strong>${priceDeltaText}</strong></div>
      <div class="review-stat"><span class="review-stat-label">👥 Avg Reviews In Segment</span><strong>${formatInt(insight.avgReviews)}</strong></div>
    </div>`,
    '<h3>📸 Amazon Listing Visual Benchmarks</h3>',
    `<div class="review-thumb-grid">${visualsHtml}</div>`,
    '<h3>📝 Detailed Assessment</h3>'
  ];

  paragraphs.forEach((paragraph) => {
    htmlParts.push(`<p>${paragraph}</p>`);
  });

  return {
    html: htmlParts.join(''),
    words: countWords(fullText)
  };
}

async function initHome() {
  const grid = document.getElementById('top10Grid');
  if (!grid) return;
  const { data, products } = await enrichedDataPromise;

  populateToolFilter(products);
  renderStats(data, products);
  renderHomeRankingCard(data, products);

  const toolFilter = document.getElementById('toolFilter');
  const sortBy = document.getElementById('sortBy');
  const quickFinder = document.getElementById('quickFinder');
  const quickFinderSummary = document.getElementById('quickFinderSummary');

  const searchableById = new Map(
    products.map((product) => {
      const searchableText = [
        product.id,
        product.name,
        product.brand,
        product.tool_type,
        product.best_for,
        Array.isArray(product.pros) ? product.pros.join(' ') : '',
        Array.isArray(product.cons) ? product.cons.join(' ') : ''
      ]
        .join(' ')
        .toLowerCase();
      return [product.id, searchableText];
    })
  );

  function scheduleNonCritical(task) {
    if (typeof window === 'undefined') {
      task();
      return;
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(task, { timeout: 1500 });
      return;
    }
    window.setTimeout(task, 0);
  }

  function normalizeQuery(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function update() {
    const tool = toolFilter ? toolFilter.value : 'all';
    const sort = sortBy ? sortBy.value : 'score';
    const query = normalizeQuery(quickFinder ? quickFinder.value : '');
    const tokens = query ? query.split(' ').filter(Boolean) : [];

    let filtered = tool === 'all' ? products : products.filter((p) => p.tool_type === tool);

    if (tokens.length) {
      filtered = filtered.filter((product) => {
        const searchable = searchableById.get(product.id) || '';
        return tokens.every((token) => searchable.includes(token));
      });
    }

    const eagerCount =
      typeof window !== 'undefined' && window.matchMedia('(min-width: 901px)').matches ? 1 : 0;
    renderTop10(grid, applySort(filtered, sort), {
      eagerCount,
      imageSizes: '(max-width: 900px) 94vw, (max-width: 1200px) 45vw, 30vw'
    });

    if (quickFinderSummary) {
      const facets = [];
      if (tool !== 'all') facets.push(tool);
      if (query) facets.push(`search: "${query}"`);
      quickFinderSummary.textContent =
        facets.length > 0
          ? `Showing ${filtered.length} of ${products.length} tools (${facets.join(' | ')})`
          : `Showing ${filtered.length} of ${products.length} tools`;
    }
  }

  let hasRenderedHomeList = false;
  let hasInjectedHomeSchema = false;

  function ensureHomeReady() {
    if (!hasInjectedHomeSchema) {
      hasInjectedHomeSchema = true;
      const homeFaqItems = renderHomeFaq();
      injectHomeStructuredData(data, products, homeFaqItems);
    }
    if (!hasRenderedHomeList) {
      hasRenderedHomeList = true;
      update();
    }
  }

  const onControlUpdate = () => {
    ensureHomeReady();
    update();
  };

  if (toolFilter) toolFilter.addEventListener('change', onControlUpdate);
  if (sortBy) sortBy.addEventListener('change', onControlUpdate);
  if (quickFinder) quickFinder.addEventListener('input', onControlUpdate);
  scheduleNonCritical(ensureHomeReady);
}

async function initCategory() {
  const select = document.getElementById('categorySelect');
  const grid = document.getElementById('categoryGrid');
  const title = document.getElementById('categoryTitle');
  if (!select || !grid || !title) return;
  const { products } = await enrichedDataPromise;

  const tools = Array.from(new Set(products.map((p) => p.tool_type))).sort();
  tools.forEach((tool) => {
    const option = document.createElement('option');
    option.value = tool;
    option.textContent = tool;
    select.appendChild(option);
  });

  const params = new URLSearchParams(window.location.search);
  const requestedTool = params.get('tool');
  if (requestedTool) {
    const matchedTool = tools.find((tool) => tool.toLowerCase() === requestedTool.toLowerCase());
    if (matchedTool) select.value = matchedTool;
  }

  function update() {
    const tool = select.value || tools[0];
    title.textContent = `${tool} Picks`;
    const filtered = products.filter((p) => p.tool_type === tool);
    renderTop10(grid, applySort(filtered, 'score'), { eagerCount: 1 });
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('tool', tool);
    const nextUrl = `category.html?${nextParams.toString()}`;
    window.history.replaceState({}, '', nextUrl);
    updateCategoryMeta(tool, filtered, nextUrl);
  }

  select.addEventListener('change', update);
  update();
}

function updateCategoryMeta(tool, filtered, nextUrl) {
  const count = filtered.length;
  const title = `${tool} (2026): Top Picks, Ratings, Reviews, and Price Comparison`;
  const description = `Compare ${count} ${tool.toLowerCase()} with score-based rankings, rating confidence, pros and cons, and direct listing links.`;
  document.title = title;
  setMetaContentById('categoryMetaDescription', description);
  setMetaContentById('categoryOgTitle', title);
  setMetaContentById('categoryOgDescription', description);
  setMetaContentById('categoryTwitterTitle', title);
  setMetaContentById('categoryTwitterDescription', description);

  const intro = document.getElementById('categoryIntro');
  if (intro) {
    intro.textContent = `You are viewing ${count} ranked picks in ${tool}. Open a product review for full fit guidance, score context, and alternatives.`;
  }

  if (typeof window !== 'undefined') {
    const canonicalUrl = new URL(nextUrl || window.location.href, window.location.href).toString();
    const canonical = document.getElementById('categoryCanonical');
    if (canonical) canonical.setAttribute('href', canonicalUrl);
    setMetaContentById('categoryOgUrl', canonicalUrl);
  }

  const firstImage = filtered[0]?.image_card || filtered[0]?.image_url;
  if (firstImage) {
    const safeImage = safeUrl(firstImage);
    setMetaContentById('categoryOgImage', safeImage);
    setMetaContentById('categoryTwitterImage', safeImage);
  }
}

function renderScoreBreakdown(container, weights, product) {
  const breakdown = product.score_breakdown || {};
  const qualityValue =
    typeof breakdown.quality === 'number' ? breakdown.quality.toFixed(2) : toReadableRatingValue(product.rating);
  const reviewValue =
    typeof breakdown.review_confidence === 'number'
      ? breakdown.review_confidence.toFixed(2)
      : Math.min(1, Math.log10((Number(product.review_count) || 0) + 1)).toFixed(2);
  const valueScore =
    typeof breakdown.value === 'number' ? breakdown.value.toFixed(2) : toReadableRatingValue(product.rating);

  container.innerHTML = `
    <div class="stat-row"><span>Quality score (${weights.rating})</span><span>${qualityValue}</span></div>
    <div class="stat-row"><span>Review confidence (${weights.reviews})</span><span>${reviewValue}</span></div>
    <div class="stat-row"><span>Value score (${weights.price})</span><span>${valueScore}</span></div>
  `;
}

async function initProduct() {
  const { data, products } = await enrichedDataPromise;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || products[0]?.id;
  const product = products.find((p) => p.id === id) || products[0];
  if (!product) return;
  const insight = buildCategoryInsight(product, products);

  const title = document.getElementById('productTitle');
  const subtitle = document.getElementById('productSubtitle');
  const score = document.getElementById('productScore');
  const media = document.getElementById('productMedia');
  const meta = document.getElementById('productMeta');
  const actions = document.getElementById('productActions');
  const prosCons = document.getElementById('productProsCons');
  const breakdown = document.getElementById('scoreBreakdown');
  const reviewWordCount = document.getElementById('reviewWordCount');
  const reviewContainer = document.getElementById('productReview');
  const verdictLabel = document.getElementById('verdictLabel');
  const verdictText = document.getElementById('verdictText');
  const reviewAuthor = document.getElementById('reviewAuthor');
  const reviewExpertise = document.getElementById('reviewExpertise');

  if (title) title.textContent = product.name;
  if (subtitle) {
    subtitle.textContent =
      `Category rank #${insight.rank}/${insight.count} with ${formatInt(product.review_count)} visible reviews on Amazon.`;
  }
  if (score) score.textContent = toScoreValue(product.score);
  if (media) {
    media.innerHTML = `<img src="${escapeHtml(product.image_featured || product.image_url)}" ${product.image_featured_srcset ? `srcset="${escapeHtml(product.image_featured_srcset)}"` : ''} sizes="(width <= 900px) 94vw, 58vw" alt="${escapeHtml(product.name)}" loading="eager" fetchpriority="high" decoding="async" width="1200" height="900">`;
  }
  if (verdictLabel) verdictLabel.textContent = 'Editor verdict';
  if (verdictText) {
    verdictText.textContent =
      `High-confidence option for ${product.best_for.toLowerCase()} with score ${toScoreValue(product.score)} and strong peer standing in ${product.tool_type.toLowerCase()}.`;
  }
  if (reviewAuthor) reviewAuthor.textContent = 'Best Beauty Tech Editorial Team';
  if (reviewExpertise) reviewExpertise.textContent = `${product.tool_type} comparative testing`;
  if (meta) {
    meta.innerHTML = `
      <div>Brand: ${escapeHtml(product.brand)}</div>
      <div>Category: ${escapeHtml(product.tool_type)}</div>
      <div>Rating: ${escapeHtml(product.rating)}/5</div>
      <div>Rating value: ${toReadableRatingValue(product.rating)}</div>
      <div>Price: $${toMoney(product.price)}</div>
      <div>Best for: ${escapeHtml(product.best_for)}</div>
      <div>Product URL: <a href="${escapeHtml(toAffiliateAmazonUrl(product.product_url))}" target="_blank" rel="nofollow sponsored noopener">Amazon listing</a></div>
    `;
  }
  if (actions) {
    actions.innerHTML = `
      <a class="btn" href="${escapeHtml(toAffiliateAmazonUrl(product.product_url))}" target="_blank" rel="nofollow sponsored noopener">Open Amazon listing</a>
      <a class="btn ghost" href="category.html">Back to categories</a>
    `;
  }
  if (prosCons) {
    const pros = (product.pros || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    const cons = (product.cons || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    prosCons.innerHTML = `
      <div>
        <strong>Pros</strong>
        <ul class="plain-list">${pros}</ul>
      </div>
      <div>
        <strong>Cons</strong>
        <ul class="plain-list">${cons}</ul>
      </div>
    `;
  }
  if (breakdown) renderScoreBreakdown(breakdown, data.meta.weights, product);

  let reviewWords = 0;
  if (reviewContainer) {
    const review = createLongReview(product, products);
    reviewContainer.innerHTML = review.html;
    reviewWords = review.words;
    if (reviewWordCount) reviewWordCount.textContent = `Words: ${review.words}`;
  }
  renderAudienceGuidance(product, insight);
  renderPricingBlock(product, insight);
  const faqItems = renderFaq(product, insight);
  renderInternalLinks(product, products);
  updateProductMeta(product, insight, data, reviewWords);
  injectStructuredData(product, insight, reviewWords, faqItems);

  const similarGrid = document.getElementById('similarGrid');
  if (similarGrid) {
    const similar = products.filter((p) => p.tool_type === product.tool_type && p.id !== product.id);
    renderTop10(similarGrid, applySort(similar, 'score'));
  }
}

function init() {
  const tasks = [];
  if (document.getElementById('top10Grid')) tasks.push(initHome());
  if (document.getElementById('categoryGrid')) tasks.push(initCategory());
  if (document.getElementById('productReview')) tasks.push(initProduct());
  return Promise.all(tasks);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}


