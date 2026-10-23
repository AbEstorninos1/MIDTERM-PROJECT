const navTab = document.querySelectorAll('.nav-tab');
const modeTab = document.querySelectorAll('.mode-tab');
const categoryItems = document.querySelectorAll('.product-category-item');
const productVariantItems = document.querySelectorAll('.product-variant-item');

triggerActive(navTab);
triggerActive(categoryItems);
triggerActive(productVariantItems);

function triggerActive(element){
  element.forEach(btn => {
    btn.addEventListener('click', () => {
      element.forEach(tab => {
        tab.classList.remove('active');
      });

      btn.classList.add('active');
    });
  });
}

function removeActive(items) {
  items.forEach(item => {
    item.classList.remove('active');
  });
}
