const categoryPanel = document.getElementById('categoryItems');
const productPanel = document.querySelector('.product-card-items');
const productVariants = document.getElementById('variantPanel');
const numInput = document.getElementById('numInput');
const breadCrumb = document.querySelector('.breadCrumbContainer');

let category = new Set();
let products = [];
let selectedProduct = null;
let currentCategory = 'All';

function getData(id, name, categoryName, variants, price, stock, barcode, image) {
  category.add(categoryName);

  products.push({
    id,
    name,
    categoryName,
    price,
    stock,
    barcode: barcode ?? null,
    image: image ?? null,
    variants: variants ?? []
  });
}

function renderCategories() {
  categoryPanel.replaceChildren();

  [...category].sort((a, b) => a.localeCompare(b)).forEach(name => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'product-category-item';
    button.textContent = name;

    if (name === currentCategory) {
      button.classList.add('active');
    }

    categoryPanel.appendChild(button);
  });

  renderData();
}

function renderData() {
  const categoryItems = document.querySelectorAll('.product-category-item');

  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      categoryItems.forEach(button => {
        button.classList.remove('active');
      });

      item.classList.add('active');
      currentCategory = item.textContent.trim();

      showProducts();
      renderProducts();
    });
  });
}

function getCardInfo(product) {
  if (product.variants.length > 0) {
    return '<span class="product-variant-preview">' + product.variants.length + ' items</span>';
  }

  if (Number(product.stock || 0) <= 0) {
    return '<span class="product-stock out-of-stock">Out of stock</span>';
  }

  return '<span class="product-stock">Stock: ' + Number(product.stock || 0) + '</span>';
}

function renderProducts() {
  const keyword = searchInput.value.toLowerCase().trim();

  const productItems = products.filter(item => {
    const matchCategory =
      currentCategory === 'All' ||
      item.categoryName === currentCategory;

    const matchSearch =
      item.name.toLowerCase().includes(keyword) ||
      item.variants.some(variant =>
        variant.name.toLowerCase().includes(keyword)
      );

    return matchCategory && matchSearch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  productPanel.replaceChildren();

  if (productItems.length === 0) {
    productPanel.textContent = 'No products found.';
    return;
  }

  productItems.forEach(product => {
    productPanel.insertAdjacentHTML('beforeend', `
      <div class="product-card-item" data-id="${product.id}">
        <img
          class="product-image"
          src="${getPlaceholderSrc()}"
          ${product.image ? `data-image="${escapeHTML(product.image)}"` : ''}
          alt=""
        >
        <p class="product-name">${escapeHTML(product.name)}</p>
        ${getCardInfo(product)}
      </div>
    `);
  });

  loadImages(productPanel);
  renderVariants();
}

function showProducts() {
  productVariants.hidden = true;
  productPanel.hidden = false;
}

function markActiveCard(card) {
  const cards = document.querySelectorAll('.product-card-item');

  removeActive(cards);
  card.classList.add('active');
}

function renderVariants() {
  const productCards = document.querySelectorAll('.product-card-item');

  productCards.forEach(card => {
    card.addEventListener('click', () => {
      markActiveCard(card);
      numInput.value = '';

      const product = products.find(
        item => Number(item.id) === Number(card.dataset.id)
      );

      if (!product) return;

      const variants = product.variants;

      productVariants.replaceChildren();

      if (variants.length === 0) {
        selectProduct(product.categoryName, product);
        return;
      }

      productPanel.hidden = true;
      productVariants.hidden = false;

      productVariants.insertAdjacentHTML('beforeend', `
        <header class="product-variants-header">
          <button
            class="back"
            id="variantBack"
            type="button"
            aria-label="Back to products"
          >&lt;</button>

          <nav class="product-breadcrumbs">
            <span class="breadcrumb-category"></span>
            <span class="breadcrumb-separator">/</span>
            <span class="base-product"></span>
          </nav>
        </header>

        <div class="product-variants-items"></div>
      `);

      productVariants.querySelector('.breadcrumb-category')
        .textContent = product.categoryName;

      productVariants.querySelector('.base-product')
        .textContent = product.name;

      const variantItems = productVariants.querySelector('.product-variants-items');

      [...variants].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      ).forEach(variant => {
        const button = document.createElement('button');
        const name = document.createElement('span');
        const stock = document.createElement('span');

        button.className = 'product-variant-item';
        button.dataset.id = variant.id;
        button.type = 'button';

        name.className = 'variant-name';
        name.textContent = variant.name;

        stock.className = 'variant-stock';
        if (Number(variant.stock || 0) <= 0) {
          stock.textContent = 'Out of stock';
          stock.classList.add('out-of-stock');
        } else {
          stock.textContent = 'Stock: ' + Number(variant.stock);
        }

        button.append(name, stock);
        variantItems.appendChild(button);
      });

      const variantButtons = variantItems.querySelectorAll('.product-variant-item');
      const backButton = document.getElementById('variantBack');

      variantButtons.forEach(button => {
        button.addEventListener('click', () => {
          numInput.value = '';

          const variant = variants.find(
            item => Number(item.id) === Number(button.dataset.id)
          );

          if (!variant) return;

          variantButtons.forEach(item => {
            item.classList.remove('active');
          });

          button.classList.add('active');

          selectProduct(product.categoryName, product, variant);
        });
      });

      backButton.addEventListener('click', showProducts);
    });
  });
}

function selectProduct(categoryName, product, variant = null) {
  selectedProduct = {
    productId: product.id,
    variantId: variant ? variant.id : null,
    category: categoryName,
    product: product.name,
    variant: variant ? variant.name : null,
    price: variant ? variant.price : product.price,
    stock: variant ? variant.stock : product.stock
  };

  numInput.style.border = '2px solid var(--main)';

  renderBreadcrumb();
}

function renderBreadcrumb() {
  if (!breadCrumb) return;

  breadCrumb.replaceChildren();

  if (!selectedProduct) return;

  const name = document.createElement('div');
  const row = document.createElement('div');
  const price = document.createElement('div');
  const stock = document.createElement('div');
  const stockCount = Number(selectedProduct.stock || 0);

  name.className = 'selected-name';
  name.textContent = selectedProduct.variant
    ? `${selectedProduct.product} (${selectedProduct.variant})`
    : selectedProduct.product;

  row.className = 'selected-row';
  price.className = 'selected-price';
  price.textContent = formatPeso(selectedProduct.price);

  stock.className = 'selected-stock';

  if (stockCount <= 0) {
    stock.classList.add('out');
    stock.textContent = 'Out of stock';
  } else {
    stock.textContent = `Stock : ${stockCount}`;
  }

  row.append(price, stock);
  breadCrumb.append(name, row);
}

function backdefault() {
  currentCategory = 'All';
  selectedProduct = null;

  numInput.value = '';
  numInput.style.border = '';
  searchInput.value = '';

  renderBreadcrumb();
  renderCategories();
  showProducts();
  renderProducts();
}

async function initialize() {
  try {
    await fetchProducts();

    renderCategories();
    showProducts();
    renderProducts();

    if (typeof updateArrows === 'function') {
      updateArrows();
    }
  } catch (error) {
    console.error(error);
    showModal('Unable to load products. Please try again.');
  }
}

// Reload only the product list (and each product's variants). The cart,
// the search box and the rest of the page stay exactly as they are.
async function reloadProducts() {
  const previous = selectedProduct;

  await fetchProducts();

  if (!category.has(currentCategory)) currentCategory = 'All';

  if (previous) {
    const product = products.find(item => Number(item.id) === Number(previous.productId));
    const variant = product && previous.variantId
      ? product.variants.find(item => Number(item.id) === Number(previous.variantId))
      : null;

    if (product && (!previous.variantId || variant)) {
      selectProduct(product.categoryName, product, variant);
    } else {
      selectedProduct = null;
      numInput.style.border = '';
      renderBreadcrumb();
    }
  }

  renderCategories();
  showProducts();
  renderProducts();

  if (typeof updateArrows === 'function') {
    updateArrows();
  }
}

initialize();