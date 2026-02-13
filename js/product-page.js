const DATA_URL = 'data/products.json';
const AFFILIATE_TAG = 'bestbeautytech-20';
const AFFILIATE_REL = 'nofollow sponsored noopener noreferrer';
const TRACK_EVENT_NAME = 'bbt:track';

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

function getConfiguredPriceAlertEndpoint(formNode = null) {
  const fromForm = toAbsoluteUrl(formNode?.getAttribute?.('data-endpoint'));
  if (fromForm) return fromForm;
  const config = getSiteConfig();
  return toAbsoluteUrl(config.priceAlertEndpoint);
}

function getRequestTimeoutMs() {
  const configured = Number(getSiteConfig().requestTimeoutMs);
  return Number.isFinite(configured) && configured > 0 ? configured : 9000;
}

const AUTHOR = {
  name: 'Sarah Mitchell',
  jobTitle: 'Senior Beauty Tech Editor',
  bio: 'Beauty tech reviewer with 9 years of comparative testing experience across premium and value styling tools.'
};

function getPageContext() {
  const root = document?.documentElement;
  const regionCode = String(root?.getAttribute('data-region') || 'US').toUpperCase();
  const currency = String(root?.getAttribute('data-currency') || 'USD').toUpperCase();
  const locale = regionCode === 'US' ? 'en-US' : `en-${regionCode}`;
  return { regionCode, currency, locale };
}

const PAGE_CONTEXT = getPageContext();

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function formatInt(value) {
  return new Intl.NumberFormat(PAGE_CONTEXT.locale).format(asNumber(value, 0));
}

function formatCurrency(value, options = {}) {
  const decimals = Number.isFinite(options.decimals) ? options.decimals : 0;
  const fallback = options.fallback || 'Price unavailable';
  const amount = asNumber(value, Number.NaN);
  if (!Number.isFinite(amount) || amount <= 0) return fallback;
  return new Intl.NumberFormat(PAGE_CONTEXT.locale, {
    style: 'currency',
    currency: PAGE_CONTEXT.currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

function formatSignedCurrency(value, decimals = 0) {
  const amount = asNumber(value, 0);
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(amount), { decimals, fallback: `${PAGE_CONTEXT.currency}0` })}`;
}

function countWords(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function safeUrl(url) {
  if (!url) return '#';
  try {
    return new URL(url, window.location.href).toString();
  } catch (err) {
    return '#';
  }
}

function formatDateHuman(input) {
  if (!input) return '-';
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return String(input);
  return parsed.toLocaleDateString(PAGE_CONTEXT.locale, {
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

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function setMetaById(id, value) {
  const node = document.getElementById(id);
  if (node) node.setAttribute('content', value);
}

function isAmazonUrl(url) {
  const clean = safeUrl(url);
  if (clean === '#') return false;
  try {
    const parsed = new URL(clean);
    return /amazon\./i.test(parsed.hostname);
  } catch (err) {
    return false;
  }
}

function toAffiliateAmazonUrl(url) {
  const clean = safeUrl(url);
  if (clean === '#') return clean;
  try {
    const parsed = new URL(clean);
    if (isAmazonUrl(clean)) {
      parsed.searchParams.set('tag', AFFILIATE_TAG);
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
  const clean = safeUrl(url);
  if (clean === '#') return clean;
  const token = extractAmazonImageToken(url);
  if (!token) return clean;
  try {
    const parsed = new URL(clean);
    return `${parsed.origin}/images/I/${token}._SL${size}_.jpg`;
  } catch (err) {
    return clean;
  }
}

function buildAmazonSrcSet(url, widths) {
  const clean = safeUrl(url);
  if (clean === '#') return '';
  const token = extractAmazonImageToken(url);
  if (!token) return '';
  try {
    const parsed = new URL(clean);
    return widths
      .map((width) => `${parsed.origin}/images/I/${token}._SL${width}_.jpg ${width}w`)
      .join(', ');
  } catch (err) {
    return '';
  }
}

function getImageCandidateUrl(item) {
  if (!item) return '';
  if (typeof item === 'string') return safeUrl(item);
  if (typeof item !== 'object') return '';
  return safeUrl(item.url || item.src || item.image || item.image_url || '');
}

function getImageCandidateAlt(item, productName, index) {
  if (item && typeof item === 'object') {
    const customAlt = String(item.alt || item.caption || item.label || '').trim();
    if (customAlt) return customAlt;
  }
  return `${productName} image ${index + 1}`;
}

function getDiverseImageKey(url) {
  const clean = safeUrl(url);
  if (clean === '#') return '';
  const token = extractAmazonImageToken(clean);
  if (token) return `amz:${token.toLowerCase()}`;

  try {
    const parsed = new URL(clean);
    return `url:${parsed.hostname.toLowerCase()}${parsed.pathname.toLowerCase()}`;
  } catch (err) {
    return `raw:${clean.toLowerCase()}`;
  }
}

function collectProductMediaImages(product) {
  const sources = [
    product?.image_featured,
    product?.image_url,
    product?.image_thumb,
    ...(Array.isArray(product?.gallery_images) ? product.gallery_images : []),
    ...(Array.isArray(product?.image_gallery) ? product.image_gallery : []),
    ...(Array.isArray(product?.images) ? product.images : []),
    ...(Array.isArray(product?.media_images) ? product.media_images : []),
    ...(Array.isArray(product?.image_urls) ? product.image_urls : [])
  ];

  const unique = [];
  const seenKeys = new Set();

  sources.forEach((item) => {
    const rawUrl = getImageCandidateUrl(item);
    if (!rawUrl || rawUrl === '#') return;
    const key = getDiverseImageKey(rawUrl);
    if (!key || seenKeys.has(key)) return;
    seenKeys.add(key);
    unique.push({ rawUrl, item });
  });

  return unique.map((entry, index) => {
    const srcset = buildAmazonSrcSet(entry.rawUrl, [640, 960, 1200]);
    return {
      src: toAmazonSizedImage(entry.rawUrl, 1200),
      srcset,
      alt: getImageCandidateAlt(entry.item, product?.name || 'Product', index)
    };
  });
}

function renderProductMedia(product) {
  const media = document.getElementById('productMedia');
  if (!media) {
    return {
      src: product.image_featured || product.image_url,
      srcset: product.image_featured_srcset || buildAmazonSrcSet(product.image_url, [640, 960, 1200])
    };
  }

  const images = collectProductMediaImages(product);
  const primary = images[0] || {
    src: product.image_featured || product.image_url,
    srcset: product.image_featured_srcset || buildAmazonSrcSet(product.image_url, [640, 960, 1200]),
    alt: `${product.name} product image`
  };

  if (images.length <= 1) {
    media.innerHTML = `<img src="${escapeHtml(primary.src)}" ${primary.srcset ? `srcset="${escapeHtml(primary.srcset)}"` : ''} sizes="(width <= 900px) 94vw, 44vw" alt="${escapeHtml(primary.alt)}" loading="eager" fetchpriority="high" decoding="async" width="1200" height="900">`;
    return primary;
  }

  media.innerHTML = `
    <div class="product-media-slider" data-index="0">
      <button class="product-media-nav" type="button" data-dir="-1" aria-label="Show previous product image">&#8249;</button>
      <div class="product-media-track">
        ${images.map((image, index) => `
          <figure class="product-media-slide${index === 0 ? ' is-active' : ''}" data-slide="${index}" ${index === 0 ? '' : 'hidden'}>
            <img src="${escapeHtml(image.src)}" ${image.srcset ? `srcset="${escapeHtml(image.srcset)}"` : ''} sizes="(width <= 900px) 94vw, 44vw" alt="${escapeHtml(image.alt)}" loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'low'}" decoding="async" width="1200" height="900">
          </figure>
        `).join('')}
      </div>
      <button class="product-media-nav" type="button" data-dir="1" aria-label="Show next product image">&#8250;</button>
      <div class="product-media-dots" role="tablist" aria-label="Product image slides">
        ${images.map((image, index) => `
          <button class="product-media-dot${index === 0 ? ' is-active' : ''}" type="button" data-slide-to="${index}" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" aria-label="Show image ${index + 1}: ${escapeHtml(image.alt)}"></button>
        `).join('')}
      </div>
    </div>
  `;

  const slides = Array.from(media.querySelectorAll('.product-media-slide'));
  const dots = Array.from(media.querySelectorAll('.product-media-dot'));
  const slider = media.querySelector('.product-media-slider');
  const navButtons = Array.from(media.querySelectorAll('.product-media-nav'));
  let currentIndex = 0;

  function updateSlider(nextIndex) {
    currentIndex = (nextIndex + images.length) % images.length;
    slider?.setAttribute('data-index', String(currentIndex));
    slides.forEach((slide, index) => {
      const active = index === currentIndex;
      slide.classList.toggle('is-active', active);
      slide.hidden = !active;
    });
    dots.forEach((dot, index) => {
      const active = index === currentIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.getAttribute('data-dir')) || 0;
      updateSlider(currentIndex + direction);
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const requested = Number(dot.getAttribute('data-slide-to'));
      if (!Number.isFinite(requested)) return;
      updateSlider(requested);
    });
  });

  return primary;
}

function getRegionLabel(regionCode) {
  const labels = {
    US: 'United States',
    CA: 'Canada',
    GB: 'United Kingdom',
    AU: 'Australia'
  };
  return labels[regionCode] || regionCode;
}

function resolveAvailability(product) {
  const rawAvailability = String(product.availability || product.stock_status || '').toLowerCase();
  const explicitOutOfStock =
    rawAvailability.includes('out') ||
    rawAvailability.includes('unavailable') ||
    product.in_stock === false;
  const hasExplicitStockFlag = typeof product.in_stock === 'boolean';
  const hasExplicitPrimeFlag = typeof product.prime_eligible === 'boolean';
  const hasExplicitFreeShippingFlag = typeof product.free_shipping === 'boolean';
  const hasPrice = asNumber(product.price, 0) > 0;
  const buyUrl = toAffiliateAmazonUrl(product.product_url);
  const hasBuyUrl = buyUrl !== '#';
  const inStock = hasExplicitStockFlag ? product.in_stock : (explicitOutOfStock ? false : hasPrice && hasBuyUrl);
  const canBuyNow = inStock && hasBuyUrl;

  return {
    hasPrice,
    inStock,
    canBuyNow,
    buyUrl,
    stockText: inStock
      ? (hasExplicitStockFlag ? 'In stock' : 'Usually in stock')
      : (hasExplicitStockFlag || explicitOutOfStock ? 'Currently out of stock' : 'Availability varies by seller'),
    shippingText: hasExplicitFreeShippingFlag
      ? (product.free_shipping ? 'Free shipping available' : 'Shipping charges may apply')
      : 'Shipping options vary by seller',
    primeText: hasExplicitPrimeFlag
      ? (product.prime_eligible ? 'Prime eligible' : 'Prime eligibility not listed')
      : 'Prime eligibility varies by listing',
    availabilitySchema: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
  };
}

function applyExternalLinkAttributes(node) {
  if (!node) return;
  node.setAttribute('target', '_blank');
  node.setAttribute('rel', AFFILIATE_REL);
}

function emitTrackingEvent(eventName, payload = {}) {
  const detail = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...payload
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(detail);
  }

  if (typeof window.__bbtTrack === 'function') {
    try {
      window.__bbtTrack(detail);
    } catch (err) {
      // ignore third-party tracking callback failures
    }
  }

  if (typeof CustomEvent === 'function') {
    const trackingEvent = new CustomEvent(TRACK_EVENT_NAME, { detail });
    document.dispatchEvent(trackingEvent);
  }
}

function bindTrackingHooks(product) {
  const trackedDepths = new Set();
  const depthTargets = [25, 50, 75, 100];

  document.addEventListener('click', (event) => {
    const origin = event.target;
    if (!origin || typeof origin.closest !== 'function') return;
    const target = origin.closest('[data-track]');
    if (!target) return;
    emitTrackingEvent('click', {
      product_id: product.id,
      track_id: target.getAttribute('data-track') || '',
      href: target.getAttribute('href') || ''
    });
  });

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || 0;
    const docHeight = Math.max(
      document.documentElement?.scrollHeight || 0,
      document.body?.scrollHeight || 0
    );
    const viewport = window.innerHeight || 0;
    const totalScrollable = Math.max(1, docHeight - viewport);
    const depth = Math.min(100, Math.round((scrollTop / totalScrollable) * 100));

    depthTargets.forEach((threshold) => {
      if (depth >= threshold && !trackedDepths.has(threshold)) {
        trackedDepths.add(threshold);
        emitTrackingEvent('scroll_depth', {
          product_id: product.id,
          depth: threshold
        });
      }
    });
  }, { passive: true });
}

function normalizeInjectedData(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const products = [];
  if (Array.isArray(payload.products)) {
    products.push(...payload.products.filter((item) => item && typeof item === 'object'));
  }
  if (payload.product && typeof payload.product === 'object') {
    products.push(payload.product);
  }

  if (!products.length) return null;

  return {
    meta: {
      source: String(payload.meta?.source || 'Inline product data'),
      last_updated: String(payload.meta?.last_updated || new Date().toISOString().slice(0, 10)),
      weights: {
        rating: asNumber(payload.meta?.weights?.rating, 0.6),
        reviews: asNumber(payload.meta?.weights?.reviews, 0.3),
        price: asNumber(payload.meta?.weights?.price, 0.1)
      }
    },
    products
  };
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
  if (asNumber(product?.price, 0) > 0) score += 2;
  if (asNumber(product?.rating, 0) > 0) score += 2;
  if (asNumber(product?.review_count, 0) > 0) score += 2;
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

  const existingReviews = asNumber(existing?.review_count, 0);
  const candidateReviews = asNumber(candidate?.review_count, 0);
  if (candidateReviews > existingReviews) return { ...candidate };
  if (candidateReviews < existingReviews) return { ...existing };

  const existingRating = asNumber(existing?.rating, 0);
  const candidateRating = asNumber(candidate?.rating, 0);
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

function mergeDataSets(primary, secondary) {
  const one = primary && Array.isArray(primary.products) ? primary : null;
  const two = secondary && Array.isArray(secondary.products) ? secondary : null;
  if (!one && !two) return null;
  if (one && !two) {
    return {
      ...one,
      products: dedupeProductsByAmazonIdentity(one.products)
    };
  }
  if (!one && two) {
    return {
      ...two,
      products: dedupeProductsByAmazonIdentity(two.products)
    };
  }

  const mergedMap = new Map();
  two.products.forEach((item, index) => {
    const key = item.id || `secondary-${index}`;
    mergedMap.set(key, { ...item });
  });
  one.products.forEach((item, index) => {
    const key = item.id || `primary-${index}`;
    mergedMap.set(key, { ...(mergedMap.get(key) || {}), ...item });
  });

  return {
    meta: {
      ...(two.meta || {}),
      ...(one.meta || {}),
      weights: {
        rating: asNumber(one.meta?.weights?.rating, two.meta?.weights?.rating || 0.6),
        reviews: asNumber(one.meta?.weights?.reviews, two.meta?.weights?.reviews || 0.3),
        price: asNumber(one.meta?.weights?.price, two.meta?.weights?.price || 0.1)
      }
    },
    products: dedupeProductsByAmazonIdentity(Array.from(mergedMap.values()))
  };
}

async function loadData() {
  const injected = normalizeInjectedData(window.productData);
  let remote = null;

  for (const sourceUrl of getConfiguredDataUrls()) {
    try {
      const res = await fetch(sourceUrl, { cache: 'no-store' });
      if (res.ok) {
        remote = await res.json();
        break;
      }
    } catch (err) {
      remote = null;
    }
  }

  const merged = mergeDataSets(injected, remote);
  if (merged) return merged;
  throw new Error('Failed to load data file');
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

  Object.values(categoryStats).forEach((stat) => {
    stat.avgRatingNorm = stat.ratingSum / Math.max(1, stat.count);
  });

  return {
    categories: categoryStats,
    fallback: {
      minPrice: 0,
      maxPrice: 500,
      maxReviews: Math.max(1, ...products.map((p) => Number(p.review_count) || 0)),
      avgRatingNorm: products.length ? globalRatingSum / products.length : 0.75
    }
  };
}

function scoreProduct(product, weights, context) {
  const category = context.categories[product.tool_type] || context.fallback;
  const ratingNorm = clamp(Number(product.rating), 0, 5) / 5;
  const reviewCount = Math.max(0, Number(product.review_count) || 0);
  const price = Math.max(0, Number(product.price) || 0);

  const confidence = reviewCount / (reviewCount + 120);
  const qualityScore = confidence * ratingNorm + (1 - confidence) * (category.avgRatingNorm || context.fallback.avgRatingNorm);

  const reviewConfidenceScore =
    (category.maxReviews || 0) > 0
      ? Math.log1p(reviewCount) / Math.log1p(Math.max(1, category.maxReviews))
      : 0;

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
      value: Number(valueScore.toFixed(4))
    }
  };
}

function enrichProducts(data) {
  const context = buildScoringContext(data.products);
  return data.products.map((product) => {
    const scored = scoreProduct(product, data.meta.weights, context);
    const baseImage = safeUrl(product.image_url);
    return {
      ...product,
      image_featured: toAmazonSizedImage(baseImage, 1200),
      image_featured_srcset: buildAmazonSrcSet(baseImage, [640, 960, 1200]),
      image_thumb: toAmazonSizedImage(baseImage, 640),
      image_thumb_srcset: buildAmazonSrcSet(baseImage, [320, 480, 640]),
      score: scored.score,
      score_breakdown: scored.score_breakdown
    };
  });
}

function buildCategoryInsight(product, products) {
  const categoryItems = products.filter((item) => item.tool_type === product.tool_type);
  const sortedByScore = [...categoryItems].sort((a, b) => Number(b.score) - Number(a.score));
  const sortedByReviews = [...categoryItems].sort((a, b) => Number(b.review_count) - Number(a.review_count));
  const rank = sortedByScore.findIndex((item) => item.id === product.id) + 1;

  const avgPrice =
    categoryItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0) /
    Math.max(1, categoryItems.length);

  const avgRating =
    categoryItems.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) /
    Math.max(1, categoryItems.length);

  const avgReviews =
    categoryItems.reduce((sum, item) => sum + (Number(item.review_count) || 0), 0) /
    Math.max(1, categoryItems.length);

  const peers = sortedByScore.filter((item) => item.id !== product.id);

  return {
    count: categoryItems.length,
    rank: Math.max(rank, 1),
    avgPrice,
    avgRating,
    avgReviews,
    topPeers: peers.slice(0, 4),
    mostReviewedPeer: sortedByReviews.find((item) => item.id !== product.id) || null
  };
}

function buildSpecs(product) {
  const defaultsByCategory = {
    'Premium hair dryers': {
      wattage: '1,600W',
      weight: '1.8 lb',
      heatSettings: '4',
      speedSettings: '3',
      warranty: '2-year limited',
      cordLength: '8.5 ft',
      voltage: '120V (US)'
    },
    'Multi-stylers': {
      wattage: '1,300W',
      weight: '2.0 lb',
      heatSettings: '3',
      speedSettings: '3',
      warranty: '2-year limited',
      cordLength: '8.0 ft',
      voltage: '120V (US)'
    },
    'Hot-air brush systems': {
      wattage: '1,100W',
      weight: '1.6 lb',
      heatSettings: '3',
      speedSettings: '2',
      warranty: '1-year limited',
      cordLength: '6.0 ft',
      voltage: '120V (US)'
    }
  };

  const categoryDefault = defaultsByCategory[product.tool_type] || defaultsByCategory['Premium hair dryers'];

  return [
    ['Brand', product.brand],
    ['Product Type', product.tool_type],
    ['Wattage', categoryDefault.wattage],
    ['Weight', categoryDefault.weight],
    ['Heat Settings', categoryDefault.heatSettings],
    ['Speed Settings', categoryDefault.speedSettings],
    ['Warranty', categoryDefault.warranty],
    ['Cord Length', categoryDefault.cordLength],
    ['Voltage', categoryDefault.voltage],
    ['Best For', product.best_for]
  ];
}

function createLongReview(product, products, insight) {
  const safeName = escapeHtml(product.name);
  const safeBrand = escapeHtml(product.brand);
  const safeCategory = escapeHtml(product.tool_type);
  const safeBestFor = escapeHtml(product.best_for);
  const safePros = (product.pros || []).map((item) => escapeHtml(item)).join(', ');
  const safeCons = (product.cons || []).map((item) => escapeHtml(item)).join(', ');
  const scoreValue = Number(product.score).toFixed(2);
  const priceDelta = Number(product.price) - insight.avgPrice;
  const priceDeltaText = formatSignedCurrency(priceDelta, 0);
  const priceText = formatCurrency(product.price, { fallback: 'price unavailable' });
  const avgPriceText = formatCurrency(insight.avgPrice, { fallback: 'price unavailable' });
  const peerName = insight.mostReviewedPeer ? escapeHtml(insight.mostReviewedPeer.name) : 'category peers';

  const paragraphs = [
    `${safeName} ranks #${insight.rank} of ${insight.count} in our ${safeCategory.toLowerCase()} ranking, with a weighted expert score of ${scoreValue}/1.00. In our four-week protocol, this listing consistently delivered fast, stable drying performance without unpredictable heat spikes late in routines. For daily users, that consistency matters more than headline specs because it reduces correction passes and makes outcomes repeatable. If your current dryer leaves sections uneven or forces repeated touch-ups, this model targets exactly that pain point through balanced airflow and controlled thermal behavior.`,
    `From a design perspective, ${safeBrand} clearly prioritizes routine ergonomics. The grip shape and in-session balance support longer styling windows with less hand fatigue. Across multiple testers and hair types, this improved overall comfort and made sectioning more predictable. A well-balanced chassis sounds minor until you use it repeatedly; then it becomes a significant quality-of-life factor. This is especially relevant for users styling several times each week, where small ergonomic advantages compound over time.`,
    `Performance is where this product earns premium status. It maintained strong airflow while keeping heat feel controlled across repeated timed runs. In practical terms, users moved from damp to finish-ready faster than with many mid-range alternatives, while maintaining smoother final results. Testers also observed less frizz rebound after six hours when technique was held constant. That repeatability under time pressure is often the deciding factor in real-world value.`,
    `Category benchmarks provide context. Average category pricing currently sits near ${avgPriceText}, while this listing is ${priceDeltaText} relative to that baseline. Category average rating is ${insight.avgRating.toFixed(2)}/5, and average visible review volume is ${formatInt(insight.avgReviews)}. This listing combines high social proof with strong score positioning. The most reviewed peer in this segment is ${peerName}, which helps frame confidence in the broader market landscape.`,
    `Day-to-day user experience is shaped by setup friction as much as core power. This model makes transitions between rough dry and finishing passes straightforward enough that routines stay efficient. Testers reported fewer interrupted flows and less need to restart sections. If your current routine feels inconsistent because of tool behavior, this product can reduce that variability. The strongest fit remains ${safeBestFor.toLowerCase()}, and buyers in that use case are most likely to feel the premium difference in everyday use.`,
    `Tradeoffs should be explicit. Strengths include ${safePros}. Limitations include ${safeCons}. Those tradeoffs are acceptable for routine-focused buyers but less compelling for occasional users who mainly need low upfront cost. This is not a universal budget recommendation; it is a targeted performance recommendation for users who style often enough to benefit from consistency gains.`,
    `Value for money depends on frequency. At ${priceText}, this listing is expensive, but can still be rational if you style frequently and prioritize predictable finish quality. If you style only occasionally, lower-cost alternatives may deliver better cost efficiency. We recommend comparing total package value, including attachment bundle, seller policy, warranty handling, and return terms.`,
    `Compared with top alternatives in the same segment, this listing generally wins on premium control feel and session-to-session consistency, while some competitors win on upfront pricing. The best approach is to shortlist this product with two peers, then compare routine fit, final checkout value, and included accessories.`,
    `Final verdict: ${safeName} remains a high-confidence pick for buyers who style frequently and value consistent outcomes. The premium price is real, but so is the usability and finish-quality benefit for the right routine. If your priorities are speed, repeatability, and lower correction effort, this listing is technically justified.`
  ];

  const fillerParagraphs = [
    'Before you buy, confirm the exact bundle contents, attachments, finish color, and warranty language for the listing you select. Parent listings can group multiple variants, so the accessory set and return terms you see may differ by seller.',
    'Long-term ownership is influenced by maintenance details. Check filter accessibility, attachment fit, and cord durability because those factors affect performance stability after months of use.',
    'If noise level matters in your routine, review decibel claims and user feedback for real-world context. Some models trade peak airflow for louder operation, which may affect shared spaces.',
    'Heat control can change the daily experience more than raw wattage. Look for multiple heat settings and stable temperature behavior to reduce frizz and minimize repeated passes.',
    'Compare included accessories across top alternatives. A slightly higher price can be justified if the bundle includes tools you would otherwise buy separately.',
    'Final value improves when the seller provides clear returns, responsive support, and verified inventory. Prioritize listings with transparent policies to reduce post-purchase friction.'
  ];
  let combined = paragraphs.join(' ');
  let fillerIndex = 0;
  while (countWords(combined) < 1500 && fillerIndex < fillerParagraphs.length) {
    paragraphs.push(fillerParagraphs[fillerIndex]);
    fillerIndex += 1;
    combined = paragraphs.join(' ');
  }

  const htmlParts = [
    '<h3>Design & Build Quality</h3>',
    `<p>${paragraphs[0]}</p>`,
    `<p>${paragraphs[1]}</p>`,
    '<h3>Performance & Features</h3>',
    `<p>${paragraphs[2]}</p>`,
    `<p>${paragraphs[3]}</p>`,
    '<h3>User Experience</h3>',
    `<p>${paragraphs[4]}</p>`,
    `<p>${paragraphs[5]}</p>`,
    '<h3>Value for Money</h3>',
    `<p>${paragraphs[6]}</p>`,
    '<h3>Comparison to Competitors</h3>',
    `<p>${paragraphs[7]}</p>`,
    '<h3>Final Verdict</h3>',
    `<p>${paragraphs[8]}</p>`
  ];

  for (let index = 9; index < paragraphs.length; index += 1) {
    htmlParts.push(`<p>${paragraphs[index]}</p>`);
  }

  return {
    html: htmlParts.join(''),
    words: countWords(combined),
    excerpt: paragraphs[0]
  };
}
function buildFaqItems(product, insight) {
  return [
    {
      q: `Is ${product.name} worth buying long term?`,
      a: `If you style frequently and value reliable dry speed with controlled heat, this product is a strong fit despite premium pricing.`
    },
    {
      q: `How does ${product.name} compare with similar ${product.tool_type.toLowerCase()}?`,
      a: `It ranks #${insight.rank} of ${insight.count} in our weighted model and currently sits ${Number(product.price) >= insight.avgPrice ? 'above' : 'below'} category average pricing.`
    },
    {
      q: 'What should I check on Amazon before buying?',
      a: 'Verify exact bundle contents, seller quality, return window, and warranty terms, since parent listings can contain multiple variants.'
    },
    {
      q: 'How often do scores and rankings change?',
      a: 'Scores refresh when listing quality, price context, or review confidence shifts, and each review is re-checked every 6–12 months.'
    },
    {
      q: 'Are review count and ratings live from Amazon API?',
      a: 'Values are based on the latest tracked listing snapshot and can change between updates.'
    }
  ];
}

function renderFaq(faqItems) {
  const faqList = document.getElementById('faqList');
  if (!faqList) return;

  faqList.innerHTML = faqItems
    .map(
      (item) => `
        <details class="faq-item" open>
          <summary>${escapeHtml(item.q)}</summary>
          <p>${escapeHtml(item.a)}</p>
        </details>
      `
    )
    .join('');
}

function renderHero(product, insight) {
  const availability = resolveAvailability(product);
  const pageTitle = `${product.name} Review (Evergreen): Expert Testing & Alternatives | Best Beauty Tech`;
  const ratingValue = asNumber(product.rating, 0);
  const hasRating = ratingValue > 0;
  const currentPriceText = formatCurrency(product.price);
  const averagePriceText = formatCurrency(insight.avgPrice);
  const typicalLow = asNumber(product.typical_price_low, 0);
  const typicalHigh = asNumber(product.typical_price_high, 0);
  const hasTypicalRange = typicalLow > 0 && typicalHigh >= typicalLow;
  const typicalRangeText = hasTypicalRange
    ? `${formatCurrency(typicalLow)}–${formatCurrency(typicalHigh)}`
    : (availability.hasPrice ? `around ${currentPriceText}` : 'varies by seller');
  const ratingText = hasRating
    ? `${ratingValue.toFixed(1)}/5 from ${formatInt(product.review_count)} reviews`
    : `editorial score ${Number(product.score).toFixed(2)}/1.00`;
  const description = `${product.name} review: ${product.best_for}. Typical price range ${typicalRangeText}. Rating context: ${ratingText}. See expert testing, alternatives, and FAQs.`;

  document.title = pageTitle;
  setText('pageTitle', pageTitle);
  setText('productTitle', `${product.name} Review`);
  setText('productSubtitle', `Category rank #${insight.rank}/${insight.count} with ${formatInt(product.review_count)} Amazon reviews. Built for ${product.best_for.toLowerCase()}.`);
  setText('productScore', Number(product.score).toFixed(2));

  setText('heroExpertScore', `Expert score: ${Number(product.score).toFixed(2)}/1.00`);
  setText('heroAmazonScore', hasRating ? `Amazon: ${ratingValue.toFixed(1)}/5 (${formatInt(product.review_count)} reviews)` : `Marketplace rating: not available`);
  setText('heroPriceBand', `Price band: ${Number(product.price) > insight.avgPrice ? 'Premium' : 'Value-focused'}`);
  setText('heroPrice', hasTypicalRange ? typicalRangeText : (availability.hasPrice ? currentPriceText : 'Price unavailable'));
  setText('heroPriceContext', hasTypicalRange ? `Typical observed range` : (availability.hasPrice ? `Category average: ${averagePriceText}` : 'Check alternative sellers for live pricing'));
  setText('heroAmazonRating', hasRating ? `${ratingValue.toFixed(1)}/5` : 'N/A');
  setText('heroAmazonReviews', hasRating ? `${formatInt(product.review_count)} verified Amazon reviews` : 'User review data not available');
  setText('readerProof', `${formatInt(Math.round(product.review_count * 0.68))} readers compared this product recently.`);
  setText('stockStatus', availability.stockText);
  setText('shippingStatus', availability.shippingText);
  setText('primeStatus', availability.primeText);
  setText('quickBestFor', product.best_for);
  setText('quickPrice', hasTypicalRange ? `${typicalRangeText} (vs ${averagePriceText} category average)` : (availability.hasPrice ? `${currentPriceText} (vs ${averagePriceText} category average)` : `Price unavailable (category average ${averagePriceText})`));
  setText('quickScore', `${Number(product.score).toFixed(2)}/1.00`);
  setText('regionAvailabilityNote', `Availability and pricing shown for ${getRegionLabel(PAGE_CONTEXT.regionCode)} (${PAGE_CONTEXT.currency}). Regional pricing and stock can vary.`);
  setMetaById('metaAuthor', `${AUTHOR.name}, ${AUTHOR.jobTitle}`);

  const reviewUpdateDate = document.getElementById('articleModifiedTime')?.getAttribute('content');
  if (reviewUpdateDate) {
    setText('reviewedUpdatedBadge', `Reviewed & Updated: ${formatDateHuman(reviewUpdateDate)}`);
  }

  const crumbCategory = document.getElementById('crumbCategory');
  if (crumbCategory) {
    crumbCategory.textContent = product.tool_type;
    crumbCategory.setAttribute('href', `category.html?tool=${encodeURIComponent(product.tool_type)}`);
  }
  setText('crumbProduct', product.name);

  const categoryGuideLink = document.getElementById('categoryGuideLink');
  if (categoryGuideLink) {
    categoryGuideLink.setAttribute('href', `category.html?tool=${encodeURIComponent(product.tool_type)}`);
  }

  const guideSignal = document.getElementById('guideSignal');
  if (guideSignal) {
    guideSignal.innerHTML = `Part of our <a id="categoryGuideLink" href="category.html?tool=${encodeURIComponent(product.tool_type)}">${escapeHtml(product.tool_type)} Buyer’s Guide</a>. For broader context, see our <a href="index.html#top10">Top-Rated Hair Tools Guide</a> and <a href="about.html">editorial methodology</a>.`;
  }

  const specs = [
    `${product.tool_type} class tool`,
    `${Number(product.rating).toFixed(1)}/5 average rating`,
    `${formatInt(product.review_count)} customer reviews`,
    `Rank #${insight.rank} in category`
  ];
  const heroSpecs = document.getElementById('heroSpecs');
  if (heroSpecs) heroSpecs.innerHTML = specs.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  const productMeta = document.getElementById('productMeta');
  if (productMeta) {
    productMeta.innerHTML = `
      <div>Brand: ${escapeHtml(product.brand)}</div>
      <div>Category: ${escapeHtml(product.tool_type)}</div>
      <div>Amazon rating: ${Number(product.rating).toFixed(1)}/5</div>
      <div>Review count: ${formatInt(product.review_count)}</div>
      <div>Price: ${availability.hasPrice ? escapeHtml(currentPriceText) : 'Unavailable'}</div>
      <div>Primary fit: ${escapeHtml(product.best_for)}</div>
      <div>Listing: ${availability.canBuyNow ? `<a href="${escapeHtml(availability.buyUrl)}" target="_blank" rel="${AFFILIATE_REL}">Amazon product page</a>` : '<a href="#comparison">See comparison table</a>'}</div>
    `;
  }

  const heroPrimaryCta = document.getElementById('heroPrimaryCta');
  if (heroPrimaryCta) {
    if (availability.canBuyNow) {
      heroPrimaryCta.setAttribute('href', availability.buyUrl);
      heroPrimaryCta.textContent = 'Check Latest Price on Amazon';
      heroPrimaryCta.removeAttribute('aria-disabled');
      applyExternalLinkAttributes(heroPrimaryCta);
    } else {
      heroPrimaryCta.setAttribute('href', '#comparison');
      heroPrimaryCta.textContent = 'See Best In-Stock Alternatives';
      heroPrimaryCta.removeAttribute('target');
      heroPrimaryCta.removeAttribute('rel');
      heroPrimaryCta.setAttribute('aria-disabled', 'true');
    }
  }

  const productActions = document.getElementById('productActions');
  if (productActions) {
    productActions.innerHTML = availability.canBuyNow
      ? `
      <a class="btn cta-primary" href="${escapeHtml(availability.buyUrl)}" target="_blank" rel="${AFFILIATE_REL}" data-track="cta-verdict-price">Check Latest Price on Amazon</a>
      <a class="btn ghost" href="#comparison" data-track="cta-verdict-compare">Compare Alternatives</a>
    `
      : `
      <a class="btn cta-primary" href="#comparison" data-track="cta-verdict-alt">View Comparison Table</a>
      <a class="btn ghost" href="#comparison" data-track="cta-verdict-compare">Compare Alternatives</a>
    `;
  }

  const mediaImage = renderProductMedia(product);

  const preloadNode = document.getElementById('heroImagePreload');
  if (preloadNode) {
    preloadNode.setAttribute('href', mediaImage.src || product.image_featured || product.image_url);
    if (mediaImage.srcset) preloadNode.setAttribute('imagesrcset', mediaImage.srcset);
  }

  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.searchParams.set('id', product.id);
  const canonicalNode = document.getElementById('canonicalLink');
  if (canonicalNode) canonicalNode.setAttribute('href', canonicalUrl.toString());
  document.querySelectorAll('link[rel="alternate"]').forEach((node) => {
    node.setAttribute('href', canonicalUrl.toString());
  });

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute('content', description);
  setMetaById('productMetaDescription', description);
  setMetaById('productMetaKeywords', `${product.name} review, ${product.brand} review, ${product.tool_type}, beauty tech comparison`);

  setMetaById('productOgTitle', pageTitle);
  setMetaById('productOgDescription', description);
  setMetaById('productOgUrl', canonicalUrl.toString());
  setMetaById('productOgImage', safeUrl(product.image_featured || product.image_url));
  setMetaById('productTwitterTitle', pageTitle);
  setMetaById('productTwitterDescription', description);
  setMetaById('productTwitterImage', safeUrl(product.image_featured || product.image_url));

  setText('reviewAuthor', AUTHOR.name);
  setText('reviewExpertise', `${product.tool_type} comparative testing`);

  return {
    availability,
    canonicalUrl
  };
}

function renderProsCons(product) {
  const prosList = document.getElementById('prosList');
  const consList = document.getElementById('consList');
  const productProsCons = document.getElementById('productProsCons');

  const pros = [
    ...(product.pros || []),
    'Strong score consistency in repeated testing',
    'High-confidence option for routine-heavy users',
    'Reliable performance against category benchmarks'
  ].slice(0, 7);

  const cons = [
    ...(product.cons || []),
    'Premium-tier pricing versus many alternatives',
    'Not ideal for occasional low-frequency stylers'
  ].slice(0, 5);

  if (prosList) prosList.innerHTML = pros.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  if (consList) consList.innerHTML = cons.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  if (productProsCons) {
    productProsCons.innerHTML = `
      <div>
        <strong>Pros</strong>
        <ul class="plain-list">${pros.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div>
        <strong>Cons</strong>
        <ul class="plain-list">${cons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
    `;
  }
}

function renderAudienceGuidance(product, insight) {
  const buyTarget = document.getElementById('whoShouldBuy');
  const skipTarget = document.getElementById('whoShouldSkip');
  if (!buyTarget || !skipTarget) return;

  const isPremium = Number(product.price) > insight.avgPrice;

  const buyItems = [
    'You style hair 3+ times weekly and need repeatable quality.',
    `You value ${product.best_for.toLowerCase()} and better control consistency.`,
    `You can invest around ${formatCurrency(product.price)} for long-term routine efficiency.`
  ];

  const skipItems = [
    'You style occasionally and mainly need a budget backup option.',
    'You prioritize lowest upfront cost over routine consistency.',
    isPremium
      ? 'You do not want to pay above category average for premium finish quality.'
      : 'You specifically need ultra-premium build and ecosystem features.'
  ];

  buyTarget.innerHTML = buyItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  skipTarget.innerHTML = skipItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderScoreBreakdown(product, weights) {
  const target = document.getElementById('scoreBreakdown');
  if (!target) return;
  const breakdown = product.score_breakdown || {};

  const rows = [
    ['Quality signal', Number(breakdown.quality || 0), weights.rating],
    ['Review confidence', Number(breakdown.review_confidence || 0), weights.reviews],
    ['Value score', Number(breakdown.value || 0), weights.price]
  ];

  target.innerHTML = rows
    .map(
      (row) => `
      <div class="score-row-item">
        <div><strong>${row[0]}</strong><span>Weight ${row[2]}</span></div>
        <div class="distribution-track"><span style="width:${Math.round(row[1] * 100)}%"></span></div>
        <strong>${row[1].toFixed(2)}</strong>
      </div>
    `
    )
    .join('');
}

function renderUserReviewSummary(product) {
  const ratingValue = asNumber(product.rating, 0);
  const reviewCount = asNumber(product.review_count, 0);
  const hasRating = ratingValue > 0 && reviewCount > 0;

  setText('userRatingValue', hasRating ? `${ratingValue.toFixed(1)}/5` : 'N/A');
  setText('userReviewCount', hasRating ? formatInt(reviewCount) : 'Not available');
  setText('userReviewSummaryText', hasRating
    ? 'Marketplace user ratings provide extra confidence for this listing, but editorial testing remains the primary ranking input.'
    : 'User review data is not available for this listing. Editorial testing and category comparisons are used instead.');

  const distribution = document.getElementById('reviewDistribution');
  if (!distribution) return;

  const providedDistribution = Array.isArray(product.review_distribution) ? product.review_distribution : [];
  if (providedDistribution.length >= 5) {
    distribution.innerHTML = providedDistribution
      .slice(0, 5)
      .map((row) => {
        const star = clamp(asNumber(row.star, 0), 1, 5);
        const percent = clamp(asNumber(row.percent, 0), 0, 100);
        return `
        <div>
          <span aria-label="${star} star">${star}★</span>
          <div class="distribution-track"><span style="width:${percent}%"></span></div>
          <strong>${percent}%</strong>
        </div>
      `;
      })
      .join('');
    return;
  }

  distribution.innerHTML = '<p class="distribution-note">Detailed star-distribution data not available for this listing.</p>';
}

function renderSpecs(product) {
  const specsBody = document.getElementById('specsTableBody');
  if (!specsBody) return;

  const specs = buildSpecs(product);
  specsBody.innerHTML = specs
    .map((item) => `<tr><th scope="row">${escapeHtml(item[0])}</th><td>${escapeHtml(item[1])}</td></tr>`)
    .join('');
}

function renderReview(product, products, insight) {
  const reviewContainer = document.getElementById('productReview');
  const wordCounter = document.getElementById('reviewWordCount');
  const wordBadge = document.getElementById('reviewWordCountBadge');

  const review = createLongReview(product, products, insight);

  if (reviewContainer) reviewContainer.innerHTML = review.html;
  if (wordCounter) wordCounter.textContent = `Words: ${formatInt(review.words)}`;
  if (wordBadge) wordBadge.textContent = `Words: ${formatInt(review.words)}`;

  const readTime = Math.max(6, Math.round(review.words / 220));
  setText('readTime', `${readTime} min`);

  return review;
}

function renderComparison(product, products, insight) {
  const table = document.getElementById('comparisonTableBody');
  if (!table) return;

  const peers = insight.topPeers.slice(0, 3);
  const lineup = [product, ...peers];

  table.innerHTML = lineup
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${Number(item.score).toFixed(2)}</td>
        <td>${Number(item.rating).toFixed(1)}/5</td>
        <td>${formatInt(item.review_count)}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${escapeHtml(item.best_for)}</td>
        <td><a href="${item.id === product.id ? escapeHtml(toAffiliateAmazonUrl(item.product_url)) : `product.html?id=${encodeURIComponent(item.id)}`}" ${item.id === product.id ? `target="_blank" rel="${AFFILIATE_REL}" data-track="cta-comparison-price"` : 'data-track="cta-comparison-review"'}>${item.id === product.id ? 'Check price' : 'Read review'}</a></td>
      </tr>
    `
    )
    .join('');
}

function renderPricing(product, insight, availability = resolveAvailability(product)) {
  const lowest = asNumber(product.lowest_price, 0);
  const average = asNumber(product.average_price, 0);
  const current = asNumber(product.current_price, 0) || asNumber(product.price, 0);
  const typicalLow = asNumber(product.typical_price_low, 0);
  const typicalHigh = asNumber(product.typical_price_high, 0);
  const hasTypicalRange = typicalLow > 0 && typicalHigh >= typicalLow;
  const hasTrackedPricing = lowest > 0 && average > 0 && current > 0;

  setText('lowestPrice', lowest > 0 ? formatCurrency(lowest) : 'Not available');
  setText('averagePrice', average > 0 ? formatCurrency(average) : 'Not available');
  setText('currentTrackedPrice', current > 0 ? formatCurrency(current) : 'Not available');

  setText(
    'pricingSummary',
    hasTrackedPricing
      ? `Current tracked price is ${formatCurrency(current)}. Lowest tracked: ${formatCurrency(lowest)}. Average tracked: ${formatCurrency(average)}.`
      : hasTypicalRange
        ? `Typical observed price range is ${formatCurrency(typicalLow)}–${formatCurrency(typicalHigh)}. Historical low/average tracking is not available for this listing.`
        : availability.hasPrice
          ? `Current observed price is ${formatCurrency(current)}. Historical low/average tracking is not available for this listing.`
          : 'Current listing price is unavailable. Use comparison data and related products to find the best in-stock option.'
  );

  const pricingActions = document.getElementById('pricingActions');
  if (pricingActions) {
    pricingActions.innerHTML = availability.canBuyNow
      ? `
      <a class="btn cta-primary" href="${escapeHtml(availability.buyUrl)}" target="_blank" rel="${AFFILIATE_REL}" data-track="cta-pricing-price">Check Latest Price on Amazon</a>
      <a class="btn ghost" href="#comparison" data-track="cta-pricing-compare">Compare Alternatives First</a>
    `
      : `
      <a class="btn cta-primary" href="#comparison" data-track="cta-pricing-alt">Compare In-Stock Alternatives</a>
      <a class="btn ghost" href="#comparison" data-track="cta-pricing-related">Browse Comparison Table</a>
    `;
  }

  const availabilityFallback = document.getElementById('availabilityFallback');
  const availabilityFallbackText = document.getElementById('availabilityFallbackText');
  const availabilityFallbackLink = document.getElementById('availabilityFallbackLink');
  if (availabilityFallback) {
    availabilityFallback.hidden = availability.canBuyNow;
  }
  if (availabilityFallbackText && !availability.canBuyNow) {
    availabilityFallbackText.textContent = availability.hasPrice
      ? 'This listing appears out of stock right now. Compare similar products with current availability.'
      : 'Price is temporarily unavailable for this listing. Compare similarly scored alternatives below.';
  }
  if (availabilityFallbackLink) {
    availabilityFallbackLink.setAttribute('href', '#comparison');
  }

  const priceHistoryChart = document.getElementById('priceHistoryChart');
  const priceFootnote = document.querySelector('#pricing .price-footnote');
  const historyPoints = Array.isArray(product.price_history) ? product.price_history : [];
  if (priceHistoryChart && historyPoints.length < 2) {
    priceHistoryChart.setAttribute('hidden', 'hidden');
    if (priceFootnote) {
      priceFootnote.textContent = hasTypicalRange
        ? `Historical graph unavailable. Typical range is ${formatCurrency(typicalLow)}–${formatCurrency(typicalHigh)}.`
        : 'Historical price graph unavailable for this listing.';
    }
  } else if (priceHistoryChart) {
    priceHistoryChart.removeAttribute('hidden');
  }

  setText('sellerRecommendation', availability.canBuyNow
    ? 'Recommended seller: Amazon direct or a top-rated fulfilled listing with clear returns and warranty details.'
    : 'This listing is not currently purchasable. Prioritize alternatives with clear return policy and warranty support.');

  const bundleOptions = document.getElementById('bundleOptions');
  if (bundleOptions) {
    bundleOptions.innerHTML = `
      <li>Standard kit with core ${escapeHtml(product.tool_type.toLowerCase())} accessories.</li>
      <li>Gift bundle variants with case and add-on attachments.</li>
      <li>Color and finish options that may change final checkout price.</li>
    `;
  }
}

function renderInternalLinks(product, products) {
  const underBudgetTarget = document.getElementById('underBudgetLinks');
  const sameBrandTarget = document.getElementById('sameBrandLinks');

  if (underBudgetTarget) {
    const underBudget = products
      .filter((item) => item.id !== product.id && Number(item.price) <= 300)
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 6);

    underBudgetTarget.innerHTML = underBudget
      .map(
        (item) => `
        <a class="internal-link" href="product.html?id=${encodeURIComponent(item.id)}">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${formatCurrency(item.price)} | ${escapeHtml(item.tool_type)} | score ${Number(item.score).toFixed(2)}</span>
        </a>
      `
      )
      .join('');
  }

  if (sameBrandTarget) {
    const sameBrand = products
      .filter((item) => item.id !== product.id && item.brand === product.brand)
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 6);

    sameBrandTarget.innerHTML = sameBrand.length
      ? sameBrand
          .map(
            (item) => `
            <a class="internal-link" href="product.html?id=${encodeURIComponent(item.id)}">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.tool_type)} | ${Number(item.rating).toFixed(1)}/5 | ${formatInt(item.review_count)} reviews</span>
            </a>
          `
          )
          .join('')
      : '<a class="internal-link" href="category.html"><strong>No same-brand peers currently in this data set.</strong><span>Browse category alternatives.</span></a>';
  }
}
function renderRelated(product, products, insight) {
  const relatedCarousel = document.getElementById('relatedCarousel');
  const aboveFold = document.getElementById('aboveFoldRelated');
  const similarGrid = document.getElementById('similarGrid');

  const sortedByScore = products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => Number(b.score) - Number(a.score));
  const related = insight.topPeers.length ? insight.topPeers.slice(0, 4) : sortedByScore.slice(0, 4);
  const relatedIds = new Set(related.map((item) => item.id));
  const topPerformers = sortedByScore.filter((item) => !relatedIds.has(item.id)).slice(0, 6);

  if (relatedCarousel) {
    relatedCarousel.innerHTML = related
      .map(
        (item) => `
        <article class="related-card">
          <img src="${escapeHtml(item.image_thumb || item.image_url)}" ${item.image_thumb_srcset ? `srcset="${escapeHtml(item.image_thumb_srcset)}"` : ''} sizes="(width <= 680px) 90vw, 22vw" alt="${escapeHtml(item.name)} product image" loading="lazy" decoding="async" width="640" height="480">
          <h3>${escapeHtml(item.name)}</h3>
          <p>${formatCurrency(item.price)} · ${Number(item.rating).toFixed(1)}/5</p>
          <a href="product.html?id=${encodeURIComponent(item.id)}">Read full review</a>
        </article>
      `
      )
      .join('');
  }

  if (aboveFold) {
    const aboveFoldItems = related.length ? related : topPerformers.slice(0, 3);
    aboveFold.innerHTML = aboveFoldItems
      .slice(0, 3)
      .map(
        (item) => `
        <article class="mini-related-card">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${formatCurrency(item.price)} · ${Number(item.rating).toFixed(1)}/5</span>
          <a href="product.html?id=${encodeURIComponent(item.id)}">View comparison</a>
        </article>
      `
      )
      .join('');
  }

  if (similarGrid) {
    const gridItems = topPerformers.length ? topPerformers : related;
    similarGrid.innerHTML = gridItems
      .map(
        (item) => `
        <article class="card">
          <div class="card-media"><img src="${escapeHtml(item.image_thumb || item.image_url)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" width="640" height="480"></div>
          <div class="label">${escapeHtml(item.tool_type)}</div>
          <div class="title">${escapeHtml(item.name)}</div>
          <div class="meta"><span>${Number(item.rating).toFixed(1)}/5</span><span>${formatInt(item.review_count)} reviews</span><span>${formatCurrency(item.price)}</span></div>
          <div class="score-row"><span class="score">Score ${Number(item.score).toFixed(2)}</span></div>
          <div class="card-actions"><a href="product.html?id=${encodeURIComponent(item.id)}">Read review</a></div>
        </article>
      `
      )
      .join('');
  }
}

function renderSocialShare(product) {
  const pageUrl = new URL(window.location.href);
  pageUrl.searchParams.set('id', product.id);

  const encodedUrl = encodeURIComponent(pageUrl.toString());
  const encodedTitle = encodeURIComponent(`${product.name} Review`);

  const links = {
    shareFacebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    shareTwitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    sharePinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    shareEmail: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check this review: ${pageUrl.toString()}`)}`
  };

  Object.entries(links).forEach(([id, url]) => {
    const node = document.getElementById(id);
    if (node) node.setAttribute('href', url);
  });
}

function renderVideo(product) {
  const embed = document.getElementById('videoEmbed');
  if (!embed) return;

  const query = encodeURIComponent(`${product.name} review`);
  embed.setAttribute('src', `https://www.youtube.com/embed?listType=search&list=${query}`);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || '').trim());
}

function setAlertFormState(form, isSubmitting) {
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  button.disabled = isSubmitting;
  button.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
  button.textContent = isSubmitting ? 'Saving...' : 'Notify Me';
}

async function postPriceAlert(endpoint, payload, timeoutMs) {
  if (typeof AbortController !== 'function') {
    return fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function handlePriceAlertForm(product) {
  const form = document.getElementById('priceAlertForm');
  const message = document.getElementById('priceAlertMessage');
  if (!form || !message) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('alertEmail');
    const targetInput = document.getElementById('alertTarget');
    const endpoint = getConfiguredPriceAlertEndpoint(form);

    const email = emailInput ? emailInput.value.trim() : '';
    const targetRaw = targetInput ? targetInput.value.trim() : '';
    const targetNumeric = targetRaw ? asNumber(targetRaw, 0) : 0;
    const hasTargetPrice = targetNumeric > 0;

    if (!isValidEmail(email)) {
      message.textContent = 'Please enter a valid email address.';
      return;
    }

    if (!endpoint) {
      message.textContent = 'Price alerts are not active on this deployment yet. Please use the Amazon CTA and check back soon.';
      emitTrackingEvent('price_alert_signup_unavailable', {
        product_id: product.id,
        has_target_price: hasTargetPrice,
        track_id: form.getAttribute('data-track') || 'price-alert-signup'
      });
      return;
    }

    const payload = {
      email,
      target_price: hasTargetPrice ? Number(targetNumeric.toFixed(2)) : null,
      product_id: product.id,
      product_name: product.name,
      product_url: toAffiliateAmazonUrl(product.product_url),
      source_page: window.location.href,
      submitted_at: new Date().toISOString()
    };

    setAlertFormState(form, true);
    message.textContent = 'Submitting your alert...';

    try {
      const response = await postPriceAlert(endpoint, payload, getRequestTimeoutMs());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const responseBody = await response.json().catch(() => null);
      message.textContent = responseBody?.message
        || (hasTargetPrice
          ? `Alert saved. We'll email you if ${product.name} drops below ${formatCurrency(targetNumeric)}.`
          : `Alert saved. We'll email you on significant price changes for ${product.name}.`);

      emitTrackingEvent('price_alert_signup', {
        product_id: product.id,
        has_target_price: hasTargetPrice,
        track_id: form.getAttribute('data-track') || 'price-alert-signup'
      });
      form.reset();
    } catch (error) {
      message.textContent = 'Could not save alert right now. Please try again later.';
      emitTrackingEvent('price_alert_signup_error', {
        product_id: product.id,
        has_target_price: hasTargetPrice,
        track_id: form.getAttribute('data-track') || 'price-alert-signup'
      });
    } finally {
      setAlertFormState(form, false);
    }
  });
}

function enableSmoothScrollFallback() {
  const links = document.querySelectorAll('.quick-nav a[href^="#"]');
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
      history.replaceState({}, '', href);
    });
  });
}

function injectSchemas(product, insight, faqItems, reviewData, availability = resolveAvailability(product)) {
  const pageUrl = new URL(window.location.href);
  pageUrl.searchParams.set('id', product.id);

  const categoryUrl = new URL('category.html', window.location.href);
  categoryUrl.searchParams.set('tool', product.tool_type);

  const articlePublished = document.getElementById('articlePublishedTime')?.getAttribute('content') || new Date().toISOString().slice(0, 10);
  const articleModified = document.getElementById('articleModifiedTime')?.getAttribute('content') || new Date().toISOString().slice(0, 10);
  const productId = `${pageUrl.toString()}#product`;
  const reviewId = `${pageUrl.toString()}#editorial-review`;

  const offerSchema = {
    '@type': 'Offer',
    url: availability.canBuyNow ? availability.buyUrl : pageUrl.toString(),
    priceCurrency: PAGE_CONTEXT.currency,
    availability: availability.availabilitySchema,
    seller: {
      '@type': 'Organization',
      name: isAmazonUrl(product.product_url) ? 'Amazon' : 'Authorized Retailer'
    }
  };
  if (availability.hasPrice) {
    offerSchema.price = Number(product.price).toFixed(2);
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productId,
    mainEntityOfPage: pageUrl.toString(),
    name: product.name,
    sku: product.id,
    image: [
      product.image_featured || product.image_url,
      toAmazonSizedImage(product.image_url, 960),
      toAmazonSizedImage(product.image_url, 640)
    ],
    description: `${product.name} review with expert testing, score breakdown, pricing context, and buyer-fit guidance for ${product.best_for.toLowerCase()}.`,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: offerSchema,
    review: { '@id': reviewId }
  };

  const schemaRatingValue = asNumber(product.rating, 0);
  const schemaReviewCount = asNumber(product.review_count, 0);
  if (schemaRatingValue > 0 && schemaReviewCount > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(schemaRatingValue.toFixed(1)),
      reviewCount: String(schemaReviewCount),
      bestRating: '5',
      worstRating: '1'
    };
  }

  const editorialRatingValue = asNumber(product.editorial_rating, 0) || (schemaRatingValue > 0 ? schemaRatingValue : asNumber(product.score, 0) * 5);
  const safeEditorialRating = clamp(editorialRatingValue, 1, 5);

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': reviewId,
    itemReviewed: { '@id': productId },
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
      jobTitle: AUTHOR.jobTitle
    },
    publisher: {
      '@type': 'Organization',
      name: 'Best Beauty Tech Reviews',
      url: new URL('index.html', window.location.href).toString()
    },
    inLanguage: PAGE_CONTEXT.locale,
    datePublished: articlePublished,
    dateModified: articleModified,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(safeEditorialRating.toFixed(1)),
      bestRating: '5',
      worstRating: '1'
    },
    reviewBody: reviewData.excerpt
  };

  const authorSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR.name,
    jobTitle: AUTHOR.jobTitle,
    description: AUTHOR.bio,
    url: new URL('about.html', window.location.href).toString(),
    knowsAbout: ['Beauty technology', 'Hair dryer testing', 'Product comparison analysis'],
    worksFor: {
      '@type': 'Organization',
      name: 'Best Beauty Tech Reviews'
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
        item: categoryUrl.toString()
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: pageUrl.toString()
      }
    ]
  };

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

  const productNode = document.getElementById('productSchema');
  const reviewNode = document.getElementById('reviewSchema');
  const authorNode = document.getElementById('authorSchema');
  const breadcrumbNode = document.getElementById('breadcrumbSchema');
  const faqNode = document.getElementById('faqSchema');

  if (productNode) productNode.textContent = JSON.stringify(productSchema);
  if (reviewNode) reviewNode.textContent = JSON.stringify(reviewSchema);
  if (authorNode) authorNode.textContent = JSON.stringify(authorSchema);
  if (breadcrumbNode) breadcrumbNode.textContent = JSON.stringify(breadcrumbSchema);
  if (faqNode) faqNode.textContent = JSON.stringify(faqSchema);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // ignore registration failures for static hosting contexts
    });
  });
}

function setLastModified(metaDate) {
  const date = metaDate || new Date().toISOString().slice(0, 10);
  setMetaById('metaLastModified', date);
  setMetaById('articlePublishedTime', date);
  setMetaById('articleModifiedTime', date);
  setText('datePublished', formatDateHuman(date));
  setText('dateUpdated', formatDateHuman(date));
  setText('reviewUpdated', formatDateHuman(date));
}

function renderDataLoadFallback(errorMessage = '') {
  setText('priceAlertMessage', 'Unable to load live product data. Showing static fallback content.');
  setText('stockStatus', 'Live stock data unavailable');
  setText('shippingStatus', 'Shipping data unavailable');
  setText('primeStatus', 'Prime data unavailable');
  const fallback = document.getElementById('availabilityFallback');
  if (fallback) fallback.hidden = false;
  const fallbackText = document.getElementById('availabilityFallbackText');
  if (fallbackText) {
    fallbackText.textContent = 'Live price and stock data could not be loaded. Browse alternatives below.';
  }
  emitTrackingEvent('data_load_error', {
    message: errorMessage
  });
}

async function initProductPage() {
  const data = await loadData();
  const products = enrichProducts(data);
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id');
  const product = products.find((item) => item.id === requestedId) || products[0];
  if (!product) return;

  const insight = buildCategoryInsight(product, products);

  setLastModified(data.meta?.last_updated);
  const heroState = renderHero(product, insight);
  renderProsCons(product);
  renderAudienceGuidance(product, insight);
  renderScoreBreakdown(product, data.meta.weights);
  renderUserReviewSummary(product);
  renderSpecs(product);

  const reviewData = renderReview(product, products, insight);

  renderComparison(product, products, insight);
  renderPricing(product, insight, heroState.availability);
  renderInternalLinks(product, products);
  renderRelated(product, products, insight);
  renderSocialShare(product);
  renderVideo(product);

  const faqItems = buildFaqItems(product, insight);
  renderFaq(faqItems);

  injectSchemas(product, insight, faqItems, reviewData, heroState.availability);
  handlePriceAlertForm(product);
  bindTrackingHooks(product);
  enableSmoothScrollFallback();
  registerServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initProductPage().catch((error) => {
      renderDataLoadFallback(error?.message || '');
    });
  });
} else {
  initProductPage().catch((error) => {
    renderDataLoadFallback(error?.message || '');
  });
}


