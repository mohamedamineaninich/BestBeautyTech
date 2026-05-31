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

function productPath(product) {
  return `${slugify(product.tool_type)}/${slugify(product.name)}/`;
}

function categoryPath(category) {
  return `categories/${slugify(category)}/`;
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

function schemaForReview(product) {
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
    reviewBody: `${product.name} is reviewed for ${product.best_for.toLowerCase()}, with pros, cons, price context, category alternatives, and buyer-fit guidance.`
  });
}

function buildProductPage(template, product, products, meta) {
  const title = `${product.name} Review: Pros, Cons, Price, and Alternatives | Best Beauty Tech`;
  const description = `${product.name} review for ${product.best_for.toLowerCase()}. See ${product.brand} specs, pros and cons, ${priceText(product)} price context, rating, alternatives, and buyer-fit guidance.`;
  const canonical = absolute(productPath(product));
  const categoryUrl = absolute(categoryPath(product.tool_type));
  const productPayload = productJsonPayload(product, products, meta);
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
  html = html.replace(/<script type="application\/ld\+json" id="productSchema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="productSchema">${schemaForProduct(product)}</script>`);
  html = html.replace(/<script type="application\/ld\+json" id="reviewSchema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="reviewSchema">${schemaForReview(product)}</script>`);
  html = html.replace(/<script type="application\/ld\+json" id="breadcrumbSchema">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="breadcrumbSchema">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: product.tool_type, item: categoryUrl },
      { '@type': 'ListItem', position: 3, name: product.name, item: canonical }
    ]
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
  html = html.replace(/<link rel="canonical" id="categoryCanonical" href="[^"]*">/, `<link rel="canonical" id="categoryCanonical" href="${canonical}">`);
  html = html.replace(/<meta property="og:title" id="categoryOgTitle" content="[^"]*">/, `<meta property="og:title" id="categoryOgTitle" content="${escapeAttr(title)}">`);
  html = html.replace(/<meta property="og:description" id="categoryOgDescription" content="[^"]*">/, `<meta property="og:description" id="categoryOgDescription" content="${escapeAttr(description)}">`);
  html = html.replace(/<meta property="og:url" id="categoryOgUrl" content="[^"]*">/, `<meta property="og:url" id="categoryOgUrl" content="${canonical}">`);
  html = html.replace(/<meta property="og:image" id="categoryOgImage" content="[^"]*">/, `<meta property="og:image" id="categoryOgImage" content="${SITE_URL}/${escapeAttr(categoryProducts[0]?.image_url || 'imgs/amz001.avif')}">`);
  html = html.replace(/<meta name="twitter:title" id="categoryTwitterTitle" content="[^"]*">/, `<meta name="twitter:title" id="categoryTwitterTitle" content="${escapeAttr(title)}">`);
  html = html.replace(/<meta name="twitter:description" id="categoryTwitterDescription" content="[^"]*">/, `<meta name="twitter:description" id="categoryTwitterDescription" content="${escapeAttr(description)}">`);
  html = html.replace(/<meta name="twitter:image" id="categoryTwitterImage" content="[^"]*">/, `<meta name="twitter:image" id="categoryTwitterImage" content="${SITE_URL}/${escapeAttr(categoryProducts[0]?.image_url || 'imgs/amz001.avif')}">`);
  html = html.replace(/<h1>Category Buying Guide<\/h1>/, `<h1>${escapeHtml(category)} Buying Guide</h1>`);
  html = html.replace(/<p id="categoryIntro">[\s\S]*?<\/p>/, `<p id="categoryIntro">${escapeHtml(description)}</p>`);
  html = html.replace(/<h2 id="categoryTitle">Recommended Picks<\/h2>/, `<h2 id="categoryTitle">${escapeHtml(category)} Picks</h2>`);
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

function buildSitemap(products, categories) {
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE_URL}/category.html`, changefreq: 'weekly', priority: '0.7' },
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

  writeText('sitemap.xml', buildSitemap(products, categories));
  console.log(`Generated ${products.length} review pages, ${categories.length} category pages, and sitemap.xml`);
}

main();
