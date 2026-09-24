(() => {
  const storageKey = 'ewapp-pages-route';

  try {
    const route = sessionStorage.getItem(storageKey);
    if (route === null) return;

    sessionStorage.removeItem(storageKey);
    const basePath = new URL(document.querySelector('base')?.href ?? '/', location.origin).pathname;
    history.replaceState(null, '', `${basePath}${route}`);
  } catch {
    // Leave the app at its base path if browser storage or history is unavailable.
  }
})();
