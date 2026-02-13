(function configureSite(global) {
  const existing = global.siteConfig && typeof global.siteConfig === 'object'
    ? global.siteConfig
    : {};

  const parseString = (value) => (typeof value === 'string' ? value.trim() : '');
  const timeoutValue = Number(existing.requestTimeoutMs);

  global.siteConfig = {
    dataEndpoint: parseString(existing.dataEndpoint),
    priceAlertEndpoint: parseString(existing.priceAlertEndpoint),
    requestTimeoutMs: Number.isFinite(timeoutValue) && timeoutValue > 0 ? timeoutValue : 9000
  };
})(window);
