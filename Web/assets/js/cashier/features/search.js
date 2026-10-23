const searchBtn = document.querySelector('.search-icon');
const searchContainer = document.querySelector('.search-container');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.querySelector('.clear-icon');

searchBtn.addEventListener('click', () => {
  searchContainer.classList.toggle('active');

  if (searchContainer.classList.contains('active')) {
    searchInput.focus();
  }else {
    searchInput.value = '';
  }
});

function searchProduct() {
  currentCategory = 'All';

  document.querySelectorAll('.product-category-item').forEach(item => {
    item.classList.toggle(
      'active',
      item.textContent.trim() === 'All'
    );
  });

  showProducts();
  renderProducts();
}

searchInput.addEventListener('input', searchProduct);

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchProduct();
  searchInput.focus();
});

