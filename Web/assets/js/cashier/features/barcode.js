function findByBarcode(code) {
  for (const product of products) {
    if (product.barcode === code) {
      return { product: product, variant: null };
    }

    for (const variant of product.variants) {
      if (variant.barcode === code) {
        return { product: product, variant: variant };
      }
    }
  }

  return null;
}

async function handleBarcode(code) {
  const found = findByBarcode(code.trim());

  if (found === null) {
    scannerStatus.textContent = 'Product not found: ' + code;
    return;
  }

  await stopScanner();

  selectProduct(found.product.categoryName, found.product, found.variant);
  numInput.value = '1';
  pressEnter();
}
