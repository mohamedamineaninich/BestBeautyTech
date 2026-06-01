const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://bestbeautytech.pages.dev';
const LASTMOD = '2026-02-13';

function readText(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function writeText(file, content) {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

function priceText(product) {
  const price = Number(product.price);
  return Number.isFinite(price) && price > 0 ? `$${price.toFixed(0)}` : 'Price varies';
}

function formatInt(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

function productPath(product) {
  return `${slugify(product.tool_type)}/${slugify(product.name)}/`;
}

function categoryPath(category) {
  return `categories/${slugify(category)}/`;
}

function categoriesIndexPath() {
  return 'categories/';
}

function absolute(pathname) {
  return `${SITE_URL}/${pathname}`.replace(/\/+$/, '/');
}

function replaceMeta(html, selector, content) {
  const escaped = escapeAttr(content);
  return html.replace(new RegExp(`(<meta ${selector} content=")[^"]*(">)`), `$1${escaped}$2`);
}

function addBase(html) {
  if (html.includes('<base href="../../">')) return html;
  return html.replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1">\n  <base href="../../">');
}

function productJsonPayload(product, products, meta) {
  const orderedProducts = [product, ...products.filter((item) => item.id !== product.id)];
  return JSON.stringify({
    meta: {
      source: 'Build-time static product payload',
      last_updated: meta.last_updated,
      weights: meta.weights
    },
    products: orderedProducts
  }, null, 2);
}

function productsByCategory(products, category) {
  return products.filter((item) => item.tool_type === category);
}

function average(items, pick) {
  const values = items.map(pick).map(Number).filter((value) => Number.isFinite(value));
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function productPosition(product, products) {
  const peers = productsByCategory(products, product.tool_type)
    .slice()
    .sort((a, b) => (Number(b.rating) * Math.log10(Number(b.review_count) + 10)) - (Number(a.rating) * Math.log10(Number(a.review_count) + 10)));
  return peers.findIndex((item) => item.id === product.id) + 1;
}

function productFaqItems(product, products) {
  const categoryPeers = productsByCategory(products, product.tool_type).filter((item) => item.id !== product.id);
  const lowerName = product.name;
  const category = product.tool_type.toLowerCase();
  const alternative = categoryPeers[0]?.name || 'the closest peer in this category';
  return [
    {
      q: `Who is ${lowerName} best for?`,
      a: `${lowerName} is best for shoppers focused on ${product.best_for.toLowerCase()} who want a ${category} with clear price, rating, and tradeoff context before buying.`
    },
    {
      q: `What are the main advantages of ${lowerName}?`,
      a: `The strongest visible advantages are ${(product.pros || []).join(', ').toLowerCase()}. These are most useful when they match your normal styling routine.`
    },
    {
      q: `What should buyers check before choosing ${lowerName}?`,
      a: `Check the final bundle, seller condition, return window, and current price. The main tradeoffs to keep in mind are ${(product.cons || []).join(', ').toLowerCase()}.`
    },
    {
      q: `How does ${lowerName} compare with alternatives?`,
      a: `Compare it with ${alternative} and other ${category} by price, review volume, best-for fit, and whether the included attachments match your routine.`
    }
  ];
}

function buildStaticReview(product, products) {
  const peers = productsByCategory(products, product.tool_type);
  const alternatives = peers.filter((item) => item.id !== product.id).slice(0, 3);
  const avgPrice = average(peers, (item) => item.price);
  const avgRating = average(peers, (item) => item.rating);
  const position = productPosition(product, products);
  const priceComparison = Number(product.price) > avgPrice ? 'above' : 'below';
  const pros = (product.pros || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ');
  const cons = (product.cons || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ');
  const alternativeLinks = alternatives.map((item) => `<li><a href="${productPath(item)}">${escapeHtml(item.name)}</a> - ${escapeHtml(item.best_for)} at ${priceText(item)}.</li>`).join('\n          ');
  const reviewBody = `
        <h3>Review Summary</h3>
        <p>${escapeHtml(product.name)} is a ${escapeHtml(product.tool_type.toLowerCase())} from ${escapeHtml(product.brand)} positioned for ${escapeHtml(product.best_for.toLowerCase())}. In this guide, we compare it against other ${escapeHtml(product.tool_type.toLowerCase())} using visible marketplace signals, price context, pros and cons, and routine fit. The current data set shows a ${escapeHtml(String(product.rating))}/5 rating from ${escapeHtml(formatInt(product.review_count))} visible reviews and a listed price around ${escapeHtml(priceText(product))}.</p>
        <p>Inside its category, this page ranks ${escapeHtml(product.name)} at position #${position} of ${peers.length} based on the site's weighted model. That score is not a lab-performance claim; it is a structured comparison using rating quality, review confidence, and price-to-category context. Use it as a shortlisting tool, then verify current seller details before checkout.</p>

        <h3>Best Fit</h3>
        <p>The best-fit shopper is someone who wants ${escapeHtml(product.best_for.toLowerCase())}. If that describes your routine, ${escapeHtml(product.name)} deserves a closer look because its strengths line up with that use case. If your routine is occasional, highly budget-limited, or dependent on a very specific attachment bundle, the alternatives table is worth checking before you decide.</p>
        <p>Compared with the category average price of about $${avgPrice.toFixed(0)}, this model sits ${priceComparison} the category average. That does not automatically make it better or worse; it means value depends on whether the strengths matter enough for your routine. A higher price can be rational for frequent use, while a lower-priced peer can be smarter for light use.</p>

        <h3>Pros and Tradeoffs</h3>
        <div class="split">
          <div>
            <h4>Pros</h4>
            <ul class="plain-list">${pros}</ul>
          </div>
          <div>
            <h4>Cons</h4>
            <ul class="plain-list">${cons}</ul>
          </div>
        </div>
        <p>The clearest positive signals are ${(product.pros || []).map((item) => escapeHtml(item.toLowerCase())).join(' and ')}. The clearest cautions are ${(product.cons || []).map((item) => escapeHtml(item.toLowerCase())).join(' and ')}. These tradeoffs should be read together: a product can be a strong match for one routine and still be the wrong purchase for another.</p>

        <h3>Price and Review Context</h3>
        <p>${escapeHtml(product.name)} currently appears in the data set at ${escapeHtml(priceText(product))}, with a rating of ${escapeHtml(String(product.rating))}/5. The average visible rating for ${escapeHtml(product.tool_type.toLowerCase())} in this data set is ${avgRating.toFixed(1)}/5. Review volume matters because a high score from a larger review base is usually a stronger confidence signal than the same rating from a very small base.</p>
        <p>Prices and availability can change quickly on marketplace listings. Before buying, confirm the exact model, included attachments, return policy, and whether the seller is direct, fulfilled, or third-party. That final checkout context can matter as much as the headline product name.</p>

        <h3>Alternatives to Compare</h3>
        <p>Do not judge this product in isolation. The closest useful comparison is usually another tool in the same category with a different price, review count, or best-for use case.</p>
        <ul class="plain-list">
          ${alternativeLinks || '<li>Browse the category guide for the nearest alternatives.</li>'}
        </ul>

        <h3>Bottom Line</h3>
        <p>Shortlist ${escapeHtml(product.name)} if you want ${escapeHtml(product.best_for.toLowerCase())} and the price fits your budget. Skip or compare further if the listed tradeoffs are deal-breakers, if you only style occasionally, or if another category better matches your hair routine. The safest decision is to match the tool to your real weekly use rather than choosing by brand name alone.</p>`;

  const textOnly = reviewBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    html: reviewBody,
    excerpt: textOnly,
    words: textOnly.split(/\s+/).filter(Boolean).length
  };
}

function buildCategoryGuide(category, categoryProducts) {
  const count = categoryProducts.length;
  const avgPrice = average(categoryProducts, (item) => item.price);
  const avgRating = average(categoryProducts, (item) => item.rating);
  const top = categoryProducts[0];
  const lowest = categoryProducts.slice().sort((a, b) => Number(a.price) - Number(b.price))[0];
  const mostReviewed = categoryProducts.slice().sort((a, b) => Number(b.review_count) - Number(a.review_count))[0];
  const lower = category.toLowerCase();
  const productLinks = categoryProducts.map((product) => `<li><a href="${productPath(product)}">${escapeHtml(product.name)}</a> - ${escapeHtml(product.best_for)} at ${priceText(product)}.</li>`).join('\n          ');

  return `
    <section class="section category-buying-guide">
      <h2>How to Choose ${escapeHtml(category)}</h2>
      <p>This category guide compares ${count} ${escapeHtml(lower)} using visible price, rating, review volume, and buyer-fit signals. The goal is not to crown one universal winner. It is to help you decide which tool best matches your routine, budget, and tolerance for tradeoffs.</p>
      <p>In the current data set, the average price for ${escapeHtml(lower)} is about $${avgPrice.toFixed(0)} and the average visible rating is ${avgRating.toFixed(1)}/5. ${top ? `${escapeHtml(top.name)} is a strong starting point for ${escapeHtml(top.best_for.toLowerCase())}.` : ''} ${lowest ? `${escapeHtml(lowest.name)} is the lowest-priced option in this category at ${priceText(lowest)}.` : ''}</p>

      <h3>Who This Category Is For</h3>
      <p>${escapeHtml(category)} are best for shoppers who already know this tool type matches their styling habits. If you want the fastest direct drying workflow, premium dryers usually make more sense. If you want one handle with multiple styling modes, multi-stylers deserve more attention. If you want brush-assisted smoothing and volume at a lower entry price, hot-air brush systems may be the better fit.</p>

      <h3>What to Compare Before Buying</h3>
      <ul class="plain-list">
        <li>Routine fit: match the tool to how often you style and what finish you want.</li>
        <li>Price context: compare the current price against category peers, not just the brand reputation.</li>
        <li>Review confidence: consider both rating and review count; ${mostReviewed ? `${escapeHtml(mostReviewed.name)} has the largest visible review base in this category.` : 'larger review bases can make rating signals more reliable.'}</li>
        <li>Tradeoffs: read both pros and cons because attachment fit, storage, replacement cost, and noise can change the ownership experience.</li>
      </ul>

      <h3>Recommended Next Steps</h3>
      <p>Start with the product whose best-for statement matches your routine, then compare one higher-priced and one lower-priced alternative. This keeps the decision anchored in practical value instead of only star ratings.</p>
      <ul class="plain-list">
          ${productLinks}
      </ul>
    </section>

    <section class="section category-faq">
      <h2>${escapeHtml(category)} FAQ</h2>
      <details class="faq-item" open>
        <summary>Are more expensive ${escapeHtml(lower)} always better?</summary>
        <p>No. A higher price can be worth it for frequent users, but occasional users may get better value from a lower-priced tool with the right fit.</p>
      </details>
      <details class="faq-item" open>
        <summary>What is the most important comparison signal?</summary>
        <p>Routine fit is the most important signal. Ratings and price help narrow the list, but the best choice is the one that solves your actual styling use case.</p>
      </details>
      <details class="faq-item" open>
        <summary>Should I trust marketplace ratings alone?</summary>
        <p>No. Ratings are useful, but they should be read with review count, price, pros, cons, seller condition, and return policy.</p>
      </details>
    </section>`;
}

function schemaForProduct(product) {
  const productUrl = absolute(productPath(product));
  const imageUrl = `${SITE_URL}/${product.image_url}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [imageUrl],
    description: `${product.name} review with pros, cons, price context, buyer fit, alternatives, and editorial score guidance.`,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    category: product.tool_type,
    offers: {
      '@type': 'Offer',
      url: product.product_url,
      priceCurrency: 'USD',
      price: String(product.price),
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating),
      reviewCount: String(product.review_count),
      bestRating: '5',
      worstRating: '1'
    },
    review: {
      '@type': 'Review',
      author: {
        '@type': 'Organization',
        name: 'Best Beauty Tech Editorial Team'
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(product.rating),
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: `${product.name} is best for ${product.best_for.toLowerCase()}. Strengths include ${(product.pros || []).join(', ')}. Tradeoffs include ${(product.cons || []).join(', ')}.`,
      url: productUrl
    }
  };
  return JSON.stringify(schema);
}

function schemaForReview(product, reviewData = null) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: product.name,
      brand: {
        '@type': 'Brand',
        name: product.brand
      }
    },
    author: {
      '@type': 'Organization',
      name: 'Best Beauty Tech Editorial Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Best Beauty Tech Reviews',
      url: `${SITE_URL}/`
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(product.rating),
      bestRating: '5',
      worstRating: '1'
    },
    datePublished: '2026-02-09',
    dateModified: '2026-02-09',
    reviewBody: reviewData?.excerpt || `${product.name} is reviewed for ${product.best_for.toLowerCase()}, with pros, cons, price context, category alternatives, and buyer-fit guidance.`
  });
}

function buildProductPage(template, product, products, meta) {
  const title = `${product.name} Review: Pros, Cons, Price, and Alternatives | Best Beauty Tech`;
  const description = `${product.name} review for ${product.best_for.toLowerCase()}. See ${product.brand} specs, pros and cons, ${priceText(product)} price context, rating, alternatives, and buyer-fit guidance.`;
  const canonical = absolute(productPath(product));
  const categoryUrl = absolute(categoryPath(product.tool_type));
  const productPayload = productJsonPayload(product, products, meta);
  const reviewData = buildStaticReview(product, products);
  const faqItems = productFaqItems(product, products);
  const pros = (product.pros || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ');
  const cons = (product.cons || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ');
  const staticSummary = `
    <section class="section stat-card static-seo-summary" aria-label="${escapeAttr(product.name)} review summary">
      <h2>${escapeHtml(product.name)} Review Summary</h2>
      <p>${escapeHtml(product.name)} is a ${escapeHtml(product.tool_type.toLowerCase())} from ${escapeHtml(product.brand)} best suited for ${escapeHtml(product.best_for.toLowerCase())}. It currently lists around ${escapeHtml(priceText(product))} with a ${escapeHtml(product.rating)}/5 marketplace rating from ${escapeHtml(product.review_count)} visible reviews.</p>
      <div class="split">
        <div>
          <h3>Key Pros</h3>
          <ul class="plain-list">${pros}</ul>
        </div>
        <div>
          <h3>Key Cons</h3>
          <ul class="plain-list">${cons}</ul>
        </div>
      </div>
      <p>Use this page to compare buyer fit, alternatives, score breakdown, price context, and frequently asked questions before opening the retailer listing.</p>
    </section>`;

  let html = addBase(template);
  html = html.replace(/<title id="pageTitle">[\s\S]*?<\/title>/, `<title id="pageTitle">${escapeHtml(title)}</title>`);
  html = html.replace(/<meta name="description" id="productMetaDescription" content="[^"]*">/, `<meta name="description" id="productMetaDescription" content="${escapeAttr(description)}">`);
  html = html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="index,follow,max-image-preview:large">');
  html = html.replace(/<link rel="canonical" id="canonicalLink" href="[^"]*">/, `<link rel="canonical" id="canonicalLink" href="${canonical}">`);
  html = html.replace(/<link rel="alternate" hreflang="en-us" href="[^"]*">/, `<link rel="alternate" hreflang="en-us" href="${canonical}">`);
  html = html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*">/, `<link rel="alternate" hreflang="x-default" href="${canonical}">`);
  html = html.replace(/<meta property="og:title" id="productOgTitle" content="[^"]*">/, `<meta property="og:title" id="productOgTitle" content="${escapeAttr(title)}">`);
  html = html.replace(/<meta property="og:description" id="productOgDescription" content="[^"]*">/, `<meta property="og:description" id="productOgDescription" content="${escapeAttr(description)}">`);
  html = html.replace(/<meta property="og:url" id="productOgUrl" content="[^"]*">/, `<meta property="og:url" id="productOgUrl" content="${canonical}">`);
  html = html.replace(/<meta property="og:image" id="productOgImage" content="[^"]*">/, `<meta property="og:image" id="productOgImage" content="${SITE_URL}/${escapeAttr(product.image_url)}">`);
  html = html.replace(/<meta name="twitter:title" id="productTwitterTitle" content="[^"]*">/, `<meta name="twitter:title" id="productTwitterTitle" content="${escapeAttr(title)}">`);
  html = html.replace(/<meta name="twitter:description" id="productTwitterDescription" content="[^"]*">/, `<meta name="twitter:description" id="productTwitterDescription" content="${escapeAttr(description)}">`);
  html = html.replace(/<meta name="twitter:image" id="productTwitterImage" content="[^"]*">/, `<meta name="twitter:image" id="productTwitterImage" content="${SITE_URL}/${escapeAttr(product.image_url)}">`);
  html = html.replace(/href="category\.html"/g, `href="${categoriesIndexPath()}"`);
  html = html.replace(/<link rel="preload" as="image" id="heroImagePreload" href="[^"]*"/, `<link rel="preload" as="image" id="heroImagePreload" href="${escapeAttr(product.image_url)}"`);
  html = html.replace(/window\.productData = [\s\S]*?;\s*<\/script>/, `window.productData = ${productPayload};\n  </script>`);
  html = html.replace(/<a id="crumbCategory" href="[^"]*">[^<]*<\/a>/, `<a id="crumbCategory" href="${categoryPath(product.tool_type)}">${escapeHtml(product.tool_type)}</a>`);
  html = html.replace(/<span id="crumbProduct">[^<]*<\/span>/, `<span id="crumbProduct">${escapeHtml(product.name)}</span>`);
  html = html.replace(/<h1 id="productTitle">[\s\S]*?<\/h1>/, `<h1 id="productTitle">${escapeHtml(product.name)} Review</h1>`);
  html = html.replace(/<p id="productSubtitle">[\s\S]*?<\/p>/, `<p id="productSubtitle">${escapeHtml(product.best_for)} with ${escapeHtml(product.rating)}/5 rating context and ${escapeHtml(priceText(product))} price guidance.</p>`);
  html = html.replace(/<img src="[^"]*" alt="[^"]* product image" loading="eager"/, `<img src="${escapeAttr(product.image_url)}" alt="${escapeAttr(product.name)} product image" loading="eager"`);
  html = html.replace(/<div class="hero-price" id="heroPrice">[^<]*<\/div>/, `<div class="hero-price" id="heroPrice">${escapeHtml(priceText(product))}</div>`);
  html = html.replace(/<strong id="heroAmazonRating">[^<]*<\/strong>/, `<strong id="heroAmazonRating">${escapeHtml(product.rating)}/5</strong>`);
  html = html.replace(/<span id="heroAmazonReviews">[^<]*<\/span>/, `<span id="heroAmazonReviews">${escapeHtml(product.review_count)} verified Amazon reviews</span>`);
  html = html.replace(/<p class="guide-signal" id="guideSignal">[\s\S]*?<\/p>/, `<p class="guide-signal" id="guideSignal">Part of our <a id="categoryGuideLink" href="${categoryPath(product.tool_type)}">${escapeHtml(product.tool_type)} Buyer's Guide</a>. For broader context, see our <a href="index.html#top10">Top-Rated Hair Tools Guide</a> and <a href="about.html">editorial methodology</a>.</p>`);
  html = html.replace(/<\/section>\s*<nav class="quick-nav"/, `</section>\n${staticSummary}\n\n    <nav class="quick-nav"`);
  html = html.replace(/<div class="reviews" id="reviewWordCount">[\s\S]*?<\/div>/, `<div class="reviews" id="reviewWordCount">Words: ${reviewData.words}</div>`);
  html = html.replace(/<article class="review-content" id="productReview" style="padding:20px">[\s\S]*?<\/article>/, `<article class="review-content" id="productReview" style="padding:20px">\n${reviewData.html}\n      </article>`);
  html = html.replace(/<div class="faq-list" id="faqList">[\s\S]*?<\/div>\s*<\/section>/, `<div class="faq-list" id="faqList">\n${faqItems.map((item) => `        <details class="faq-item" open>\n          <summary>${escapeHtml(item.q)}</summary>\n          <p>${escapeHtml(item.a)}</p>\n        </details>`).join('\n')}\n      </div>\n    </section>`);
  html = html.replace(/<script type="application\/ld\+json" id="productSchema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="productSchema">${schemaForProduct(product)}</script>`);
  html = html.replace(/<script type="application\/ld\+json" id="reviewSchema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="reviewSchema">${schemaForReview(product, reviewData)}</script>`);
  html = html.replace(/<script type="application\/ld\+json" id="breadcrumbSchema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="breadcrumbSchema">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: product.tool_type, item: categoryUrl },
      { '@type': 'ListItem', position: 3, name: product.name, item: canonical }
    ]
  })}</script>`);
  html = html.replace(/<script type="application\/ld\+json" id="faqSchema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="faqSchema">${JSON.stringify({
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
  })}</script>`);
  return html;
}

function categoryIntro(category, count) {
  const lower = category.toLowerCase();
  return `Compare ${count} ${lower} ranked by editorial score, rating confidence, price context, and routine fit. Use this guide to shortlist the best ${lower} before reading a full product review.`;
}

function buildCategoryPage(template, category, products) {
  const categoryProducts = products.filter((product) => product.tool_type === category);
  const canonical = absolute(categoryPath(category));
  const title = `${category}: Best Picks, Reviews, and Price Comparison | Best Beauty Tech`;
  const description = categoryIntro(category, categoryProducts.length);
  const guideHtml = buildCategoryGuide(category, categoryProducts);
  const cards = categoryProducts.map((product) => `
        <article class="card">
          <div class="card-media"><img src="${escapeAttr(product.image_url)}" alt="${escapeAttr(product.name)}" loading="lazy" decoding="async" width="960" height="720"></div>
          <div class="label">${escapeHtml(product.brand)} | ${escapeHtml(product.tool_type)}</div>
          <div class="title">${escapeHtml(product.name)}</div>
          <div class="meta"><span>${escapeHtml(product.rating)}/5</span><span>${escapeHtml(product.review_count)} reviews</span><span>${escapeHtml(priceText(product))}</span></div>
          <p>${escapeHtml(product.best_for)}</p>
          <div class="card-actions"><a href="${productPath(product)}">Read review</a><a href="${escapeAttr(product.product_url)}" target="_blank" rel="nofollow sponsored noopener">Amazon</a></div>
        </article>`).join('\n');

  let html = addBase(template);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta id="categoryMetaDescription" name="description" content="[^"]*">/, `<meta id="categoryMetaDescription" name="description" content="${escapeAttr(description)}">`);
  html = html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="index,follow,max-image-preview:large">');
  html = html.replace(/<link rel="canonical" id="categoryCanonical" href="[^"]*">/, `<link rel="canonical" id="categoryCanonical" href="${canonical}">`);
  html = html.replace(/<meta property="og:title" id="categoryOgTitle" content="[^"]*">/, `<meta property="og:title" id="categoryOgTitle" content="${escapeAttr(title)}">`);
  html = html.replace(/<meta property="og:description" id="categoryOgDescription" content="[^"]*">/, `<meta property="og:description" id="categoryOgDescription" content="${escapeAttr(description)}">`);
  html = html.replace(/<meta property="og:url" id="categoryOgUrl" content="[^"]*">/, `<meta property="og:url" id="categoryOgUrl" content="${canonical}">`);
  html = html.replace(/<meta property="og:image" id="categoryOgImage" content="[^"]*">/, `<meta property="og:image" id="categoryOgImage" content="${SITE_URL}/${escapeAttr(categoryProducts[0]?.image_url || 'imgs/amz001.avif')}">`);
  html = html.replace(/<meta name="twitter:title" id="categoryTwitterTitle" content="[^"]*">/, `<meta name="twitter:title" id="categoryTwitterTitle" content="${escapeAttr(title)}">`);
  html = html.replace(/<meta name="twitter:description" id="categoryTwitterDescription" content="[^"]*">/, `<meta name="twitter:description" id="categoryTwitterDescription" content="${escapeAttr(description)}">`);
  html = html.replace(/<meta name="twitter:image" id="categoryTwitterImage" content="[^"]*">/, `<meta name="twitter:image" id="categoryTwitterImage" content="${SITE_URL}/${escapeAttr(categoryProducts[0]?.image_url || 'imgs/amz001.avif')}">`);
  html = html.replace(/href="category\.html"/g, `href="${categoriesIndexPath()}"`);
  html = html.replace(/<h1>Category Buying Guide<\/h1>/, `<h1>${escapeHtml(category)} Buying Guide</h1>`);
  html = html.replace(/<p id="categoryIntro">[\s\S]*?<\/p>/, `<p id="categoryIntro">${escapeHtml(description)}</p>`);
  html = html.replace(/<h2 id="categoryTitle">Recommended Picks<\/h2>/, `<h2 id="categoryTitle">${escapeHtml(category)} Picks</h2>`);
  html = html.replace(/<\/section>\s*<section class="section">/, `</section>\n${guideHtml}\n\n    <section class="section">`);
  html = html.replace(/<div id="categoryGrid" class="grid"><\/div>/, `<div id="categoryGrid" class="grid">${cards}\n      </div>`);
  html = html.replace('</body>', `  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categoryProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url: absolute(productPath(product))
      }))
    }
  })}</script>\n</body>`);
  return html;
}

function buildCategoriesIndexPage(products, categories) {
  const cards = categories.map((category) => {
    const categoryProducts = productsByCategory(products, category);
    const topProduct = categoryProducts[0];
    const averagePrice = Math.round(average(categoryProducts, (product) => product.price));
    const averageRating = average(categoryProducts, (product) => product.rating).toFixed(1);
    const imagePath = topProduct?.image_url ? `../${topProduct.image_url}` : '../imgs/amz001.avif';
    const categoryHref = `${slugify(category)}/`;
    return `        <article class="card">
          <div class="card-media"><img src="${escapeAttr(imagePath)}" alt="${escapeAttr(category)} guide" loading="lazy" decoding="async" width="960" height="720"></div>
          <div class="label">${categoryProducts.length} reviews | Avg. ${averageRating}/5</div>
          <div class="title">${escapeHtml(category)}</div>
          <p>Compare ${categoryProducts.length} picks with pricing around ${escapeHtml(priceText({ price: averagePrice }))}, buyer-fit notes, pros, cons, and product-level review pages.</p>
          <div class="card-actions"><a href="${categoryHref}">Open guide</a></div>
        </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Beauty Tool Categories: Reviews, Rankings, and Buying Guides | Best Beauty Tech</title>
  <meta name="description" content="Browse Best Beauty Tech category guides for premium hair dryers, multi-stylers, and hot-air brush systems with clean links to static product reviews.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#0f766e">
  <link rel="canonical" href="${absolute(categoriesIndexPath())}">
  <meta property="og:site_name" content="Best Beauty Tech Reviews">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Beauty Tool Categories: Reviews, Rankings, and Buying Guides | Best Beauty Tech">
  <meta property="og:description" content="Browse category guides with static product reviews, price context, buyer-fit notes, and comparison links.">
  <meta property="og:url" content="${absolute(categoriesIndexPath())}">
  <meta property="og:image" content="${SITE_URL}/imgs/amz001.avif">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Beauty Tool Categories: Reviews, Rankings, and Buying Guides | Best Beauty Tech">
  <meta name="twitter:description" content="Browse category guides with static product reviews, price context, buyer-fit notes, and comparison links.">
  <meta name="twitter:image" content="${SITE_URL}/imgs/amz001.avif">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:wght@500;700&display=optional">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:wght@500;700&display=optional" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:wght@500;700&display=optional"></noscript>
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <a class="skip-link" href="#mainContent">Skip to main content</a>
  <div class="noise"></div>
  <header class="site-header">
    <a class="brand" href="../index.html">
      <span class="dot"></span>
      <div>
        <div class="brand-title">Best Beauty Tech</div>
        <div class="brand-sub">Skincare devices + hair-care tools</div>
      </div>
    </a>
    <nav class="nav">
      <a href="../index.html">Home</a>
      <a class="active" href="./">Categories</a>
      <a href="../methodology.html">Methodology</a>
      <a href="../about.html">About</a>
    </nav>
  </header>

  <main id="mainContent">
    <section class="hero compact">
      <div>
        <h1>Beauty Tool Categories</h1>
        <p>Start with the tool type, then open a static review page for product-specific pros, cons, price context, alternatives, and FAQ guidance.</p>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Buying Guides</h2>
      </div>
      <div class="grid">
${cards}
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div>&copy; 2026 Best Beauty Tech Reviews</div>
    <div>Independent comparison-first reviews</div>
  </footer>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Beauty Tool Categories',
    description: 'Browse Best Beauty Tech category guides and product reviews.',
    url: absolute(categoriesIndexPath()),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categories.map((category, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: category,
        url: absolute(categoryPath(category))
      }))
    }
  })}</script>
</body>
</html>
`;
}

function buildSitemap(products, categories) {
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: absolute(categoriesIndexPath()), changefreq: 'weekly', priority: '0.8' },
    ...categories.map((category) => ({ loc: absolute(categoryPath(category)), changefreq: 'weekly', priority: '0.8' })),
    { loc: `${SITE_URL}/about.html`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${SITE_URL}/methodology.html`, changefreq: 'monthly', priority: '0.7' },
    ...products.map((product) => ({ loc: absolute(productPath(product)), changefreq: 'weekly', priority: '0.8' }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;
}

function main() {
  const data = JSON.parse(readText('data/products.json'));
  const products = data.products || [];
  const categories = Array.from(new Set(products.map((product) => product.tool_type))).sort();
  const productTemplate = readText('product.html');
  const categoryTemplate = readText('category.html');

  products.forEach((product) => {
    writeText(path.join(productPath(product), 'index.html'), buildProductPage(productTemplate, product, products, data.meta));
  });

  categories.forEach((category) => {
    writeText(path.join(categoryPath(category), 'index.html'), buildCategoryPage(categoryTemplate, category, products));
  });

  writeText(path.join(categoriesIndexPath(), 'index.html'), buildCategoriesIndexPage(products, categories));
  writeText('sitemap.xml', buildSitemap(products, categories));
  console.log(`Generated ${products.length} review pages, ${categories.length} category pages, categories index, and sitemap.xml`);
}

main();
