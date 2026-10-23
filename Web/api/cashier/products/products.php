<?php

require_once __DIR__ . '/../../../config/database.php';

$products = $conn->query("
  SELECT p.id, p.name, c.name AS category, p.price, p.stock, p.barcode, p.image
  FROM products p
  JOIN categories c ON c.id = p.category_id
  ORDER BY p.name
")->fetch_all(MYSQLI_ASSOC);

$variantRows = $conn->query("
  SELECT id, product_id, name, price, stock, barcode
  FROM product_variants
  ORDER BY name
")->fetch_all(MYSQLI_ASSOC);

$variants = [];
foreach ($variantRows as $v) {
  $variants[$v['product_id']][] = [
    'id'      => (int) $v['id'],
    'name'    => $v['name'],
    'price'   => (float) $v['price'],
    'stock'   => (int) $v['stock'],
    'barcode' => $v['barcode']
  ];
}

foreach ($products as &$p) {
  $p['id']       = (int) $p['id'];
  $p['price']    = (float) $p['price'];
  $p['stock']    = (int) $p['stock'];
  $p['variants'] = $variants[$p['id']] ?? [];
}

echo json_encode($products);
