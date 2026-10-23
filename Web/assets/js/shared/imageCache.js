

const IMAGE_CACHE_NAME = 'product-images-v1';
const imageBlobUrls = new Map();

function getAppRoot() {
  return window.APP_ROOT ?? '../';
}

function getPlaceholderSrc() {
  return getAppRoot() + 'assets/images/placeholder.svg';
}

function getImageUrl(path) {
  return new URL(getAppRoot() + path, document.baseURI).href;
}

async function cacheImage(path) {
  const url = getImageUrl(path);

  if (!('caches' in window)) return url;

  
    const cache = await caches.open(IMAGE_CACHE_NAME);

    if (!(await cache.match(url))) {
      const response = await fetch(url);

      if (response.ok) {
        await cache.put(url, response);
      }
    }
  return url;
}

async function getImageSrc(path) {
  const url = getImageUrl(path);

  if (imageBlobUrls.has(url)) return imageBlobUrls.get(url);

  await cacheImage(path);

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const response = await cache.match(url);

    if (response) {
      const blobUrl = URL.createObjectURL(await response.blob());
      imageBlobUrls.set(url, blobUrl);
      return blobUrl;
    }
  } catch (error) {
    
  }

  return url;
}


function loadImages(container) {
  container.querySelectorAll('img[data-image]').forEach(async image => {
    image.src = await getImageSrc(image.dataset.image);
  });
}

async function preloadImages(paths, onProgress) {
  const queue = [...new Set(paths.filter(Boolean))];
  const total = queue.length;
  const keep = new Set(queue.map(getImageUrl));
  let done = 0;

  if (onProgress) onProgress(0, total);

  async function worker() {
    while (queue.length > 0) {
      await cacheImage(queue.shift());
      done++;

      if (onProgress) onProgress(done, total);
    }
  }

  await Promise.all([worker(), worker(), worker(), worker()]);

  if ('caches' in window) {
    try {
      const cache = await caches.open(IMAGE_CACHE_NAME);

      for (const request of await cache.keys()) {
        if (!keep.has(request.url)) await cache.delete(request);
      }
    } catch (error) {
      console.error('Could not clean the image cache:', error);
    }
  }
}
