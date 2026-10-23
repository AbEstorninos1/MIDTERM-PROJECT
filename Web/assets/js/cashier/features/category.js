const expandButton = document.getElementById('categoryExpand');
const categoryBox = document.getElementById('productCategory');
const cardPanel = document.querySelector('.product-card-panel');
const next = document.getElementById('categoryNext');
const prev = document.getElementById('categoryPrev');


function updateArrows() {
  const expanded = categoryBox.classList.contains('expanded');
  const maxScroll = categoryPanel.scrollWidth - categoryPanel.clientWidth;

  prev.style.display = expanded || categoryPanel.scrollLeft <= 1
    ? 'none'
    : '';

  next.style.display = expanded || categoryPanel.scrollLeft >= maxScroll - 1
    ? 'none'
    : '';
}

function centerActiveCategory() {
  const active = categoryPanel.querySelector('.product-category-item.active');

  if (!active) return;

  active.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  });
}

function toggleCategory() {
  const expanded = categoryBox.classList.toggle('expanded');

  cardPanel.style.gridTemplateRows = expanded ? '1fr 0px' : '';
  expandButton.textContent = expanded ? '−' : '⛶';

  expandButton.setAttribute('aria-expanded', String(expanded));

  requestAnimationFrame(() => {
    centerActiveCategory();
    updateArrows();
  });
}

function scrollCategory(direction) {
  categoryPanel.scrollBy({
    left: direction * 200,
    behavior: 'smooth'
  });
}

next.addEventListener('click', () => {
  scrollCategory(1);
});

prev.addEventListener('click', () => {
  scrollCategory(-1);
});

expandButton.addEventListener('click', toggleCategory);


categoryPanel.addEventListener('click', e => {
  const item = e.target.closest('.product-category-item');

  if (!item) return;

  if (categoryBox.classList.contains('expanded')) {
    toggleCategory();
  }

  requestAnimationFrame(() => {
    item.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    updateArrows();
  });
});

categoryPanel.addEventListener('scroll', updateArrows);
window.addEventListener('resize', updateArrows);
window.addEventListener('load', updateArrows);

updateArrows();