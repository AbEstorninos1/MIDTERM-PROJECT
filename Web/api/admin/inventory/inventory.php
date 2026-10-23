<?php

require_once __DIR__ . '/../../../config/database.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (($_POST['action'] ?? '') === 'edit') editProduct($conn);
  else saveProduct($conn);
  exit;
}

listProducts($conn);


function listProducts($conn) {
  $categories = $conn->query("SELECT id, name FROM categories ORDER BY name")
    ->fetch_all(MYSQLI_ASSOC);

  foreach ($categories as &$c) {
    $c['id'] = (int) $c['id'];
  }

  $products = $conn->query("
    SELECT p.id, p.name, p.category_id, c.name AS category,
           p.price, p.stock, p.barcode, p.image,
           COALESCE((SELECT SUM(si.quantity) FROM sale_items si WHERE si.product_id = p.id), 0) AS sold
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ORDER BY p.id DESC
  ")->fetch_all(MYSQLI_ASSOC);

  $variantRows = $conn->query("
    SELECT id, product_id, name, price, stock, barcode
    FROM product_variants
    ORDER BY id
  ")->fetch_all(MYSQLI_ASSOC);

  $variants = [];
  foreach ($variantRows as $v) {
    $variants[$v['product_id']][] = [
      'id'      => (int) $v['id'],
      'name'    => $v['name'],
      'price'   => (float) $v['price'],
      'stock'   => (int) $v['stock'],
      'barcode' => $v['barcode'] ?? ''
    ];
  }

  foreach ($products as &$p) {
    $p['id']         = (int) $p['id'];
    $p['categoryId'] = (int) $p['category_id'];
    $p['price']      = (float) $p['price'];
    $p['stock']      = (int) $p['stock'];
    $p['sold']       = (int) $p['sold'];
    $p['barcode']    = $p['barcode'] ?? '';
    $p['variants']   = $variants[$p['id']] ?? [];
    unset($p['category_id']);
  }

  echo json_encode([
    'success'    => true,
    'products'   => $products,
    'categories' => $categories
  ]);
}


function cleanPrice($value, $label) {
  if (!is_numeric($value) || (float) $value < 0 || (float) $value > 99999999) {
    die(json_encode(['success' => false, 'message' => "$label must be a number of 0 or more."]));
  }

  return round((float) $value, 2);
}

function cleanStock($value, $label) {
  if (filter_var($value, FILTER_VALIDATE_INT) === false || (int) $value < 0) {
    die(json_encode(['success' => false, 'message' => "$label must be a whole number of 0 or more."]));
  }

  return (int) $value;
}

function barcodeTaken($conn, $barcode, $productId, $variantId) {
  $stmt = $conn->prepare('SELECT 1 FROM products WHERE barcode = ? AND id <> ?');
  $stmt->bind_param('si', $barcode, $productId);
  $stmt->execute();
  if ($stmt->get_result()->fetch_row()) return true;

  $stmt = $conn->prepare('SELECT 1 FROM product_variants WHERE barcode = ? AND id <> ?');
  $stmt->bind_param('si', $barcode, $variantId);
  $stmt->execute();
  return (bool) $stmt->get_result()->fetch_row();
}

function makeBarcode($conn) {
  do {
    $code = '2' . str_pad((string) random_int(0, 99999999999), 11, '0', STR_PAD_LEFT);
    $sum = 0;

    for ($i = 0; $i < 12; $i++) {
      $sum += (int) $code[$i] * ($i % 2 === 0 ? 1 : 3);
    }

    $code .= (10 - $sum % 10) % 10;
  } while (barcodeTaken($conn, $code, 0, 0));

  return $code;
}

function storeImage($file) {
  if (!isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) return null;

  if ($file['error'] !== UPLOAD_ERR_OK) {
    die(json_encode(['success' => false, 'message' => 'The image could not be uploaded.']));
  }

  if ($file['size'] > 2 * 1024 * 1024) die(json_encode(['success' => false, 'message' => 'The image must be 2 MB or smaller.']));

  $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
  $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);

  if (!isset($types[$mime])) die(json_encode(['success' => false, 'message' => 'Only JPG, PNG or WEBP images are allowed.']));

  $dir = __DIR__ . '/../../../assets/images/products';

  if (!is_dir($dir) && !mkdir($dir, 0775, true)) die(json_encode(['success' => false, 'message' => 'Image folder is missing.']));

  $name = bin2hex(random_bytes(8)) . '.' . $types[$mime];

  if (!move_uploaded_file($file['tmp_name'], "$dir/$name")) {
    die(json_encode(['success' => false, 'message' => 'Could not save the image.']));
  }

  return 'assets/images/products/' . $name;
}

function removeImage($path) {
  if (!$path) return;

  $file = realpath(__DIR__ . '/../../../' . $path);
  $dir = realpath(__DIR__ . '/../../../assets/images/products');

  if ($file && $dir && strpos($file, $dir) === 0 && is_file($file)) @unlink($file);
}

function saveProduct($conn) {
  $id = (int) ($_POST['id'] ?? 0);
  $name = trim($_POST['name'] ?? '');
  $category = trim($_POST['category'] ?? '');
  $hasVariants = ($_POST['has_variants'] ?? '') === '1';

  if ($name === '' || strlen($name) > 100) die(json_encode(['success' => false, 'message' => 'Enter a product name.']));
  if ($category === '' || strlen($category) > 100) die(json_encode(['success' => false, 'message' => 'Enter a category.']));

  
  $price = 0;
  $stock = 0;
  $barcode = null;
  $variants = [];

  if ($hasVariants) {
    $rows = $_POST['variants'] ?? [];

    if (!is_array($rows) || count($rows) === 0) die(json_encode(['success' => false, 'message' => 'Add at least one variant.']));

    $seen = [];

    foreach ($rows as $key => $row) {
      $vName = trim($row['name'] ?? '');
      $n = count($variants) + 1;

      if ($vName === '') die(json_encode(['success' => false, 'message' => "Variant $n needs a name."]));
      if (isset($seen[strtolower($vName)])) die(json_encode(['success' => false, 'message' => "Variant name \"$vName\" is used twice."]));
      $seen[strtolower($vName)] = true;

      $vBarcode = trim($row['barcode'] ?? '');

      if ($vBarcode !== '' && isset($seen['bc' . $vBarcode])) die(json_encode(['success' => false, 'message' => "Barcode $vBarcode is used twice."]));
      if ($vBarcode !== '') $seen['bc' . $vBarcode] = true;

      $variants[] = [
        'id'      => ctype_digit((string) $key) ? (int) $key : 0,
        'name'    => $vName,
        'price'   => cleanPrice($row['price'] ?? '', "Price of \"$vName\""),
        'stock'   => cleanStock($row['stock'] ?? '', "Stock of \"$vName\""),
        'barcode' => $vBarcode
      ];
    }
  } else {
    $price = cleanPrice($_POST['price'] ?? '', 'Price');
    $stock = cleanStock($_POST['stock'] ?? '', 'Stock');
    $barcode = trim($_POST['barcode'] ?? '');
  }

  try {
    $conn->begin_transaction();

    $oldImage = null;

    if ($id) {
      $stmt = $conn->prepare('SELECT image FROM products WHERE id = ? FOR UPDATE');
      $stmt->bind_param('i', $id);
      $stmt->execute();
      $existing = $stmt->get_result()->fetch_assoc();

      if (!$existing) {
        $conn->rollback();
        die(json_encode(['success' => false, 'message' => 'Product not found.']));
      }

      $oldImage = $existing['image'];
    }

    
    $stmt = $conn->prepare('SELECT id FROM categories WHERE name = ?');
    $stmt->bind_param('s', $category);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if ($row) {
      $categoryId = (int) $row['id'];
    } else {
      $stmt = $conn->prepare('INSERT INTO categories (name) VALUES (?)');
      $stmt->bind_param('s', $category);
      $stmt->execute();
      $categoryId = (int) $conn->insert_id;
    }

    if (!$hasVariants) {
      if ($barcode === '') {
        $barcode = makeBarcode($conn);
      } elseif (barcodeTaken($conn, $barcode, $id, 0)) {
        $conn->rollback();
        die(json_encode(['success' => false, 'message' => "Barcode $barcode is already used by another item."]));
      }
    }

    $newImage = storeImage($_FILES['image'] ?? []);

    if ($id) {
      $image = $newImage ?? $oldImage;
      $stmt = $conn->prepare('UPDATE products SET category_id = ?, name = ?, price = ?, stock = ?, barcode = ?, image = ? WHERE id = ?');
      $stmt->bind_param('isdissi', $categoryId, $name, $price, $stock, $barcode, $image, $id);
      $stmt->execute();
    } else {
      $stmt = $conn->prepare('INSERT INTO products (category_id, name, price, stock, barcode, image) VALUES (?, ?, ?, ?, ?, ?)');
      $stmt->bind_param('isdiss', $categoryId, $name, $price, $stock, $barcode, $newImage);
      $stmt->execute();
      $id = (int) $conn->insert_id;
    }

    $keep = [];

    foreach ($variants as $v) {
      $vid = $v['id'];

      if ($vid) {
        $stmt = $conn->prepare('SELECT 1 FROM product_variants WHERE id = ? AND product_id = ?');
        $stmt->bind_param('ii', $vid, $id);
        $stmt->execute();
        if (!$stmt->get_result()->fetch_row()) $vid = 0;
      }

      if ($v['barcode'] === '') {
        $v['barcode'] = makeBarcode($conn);
      } elseif (barcodeTaken($conn, $v['barcode'], 0, $vid) ) {
        $conn->rollback();
        if ($newImage) removeImage($newImage);
        die(json_encode(['success' => false, 'message' => "Barcode {$v['barcode']} is already used."]));
      }

      if ($vid) {
        $stmt = $conn->prepare('UPDATE product_variants SET name = ?, price = ?, stock = ?, barcode = ? WHERE id = ?');
        $stmt->bind_param('sdisi', $v['name'], $v['price'], $v['stock'], $v['barcode'], $vid);
        $stmt->execute();
      } else {
        $stmt = $conn->prepare('INSERT INTO product_variants (product_id, name, price, stock, barcode) VALUES (?, ?, ?, ?, ?)');
        $stmt->bind_param('isdis', $id, $v['name'], $v['price'], $v['stock'], $v['barcode']);
        $stmt->execute();
        $vid = (int) $conn->insert_id;
      }

      $keep[] = $vid;
    }

    if ($keep) {
      $list = implode(',', array_map('intval', $keep));
      $conn->query("DELETE FROM product_variants WHERE product_id = $id AND id NOT IN ($list)");
    } else {
      $conn->query("DELETE FROM product_variants WHERE product_id = $id");
    }

    $conn->commit();

    if ($newImage && $oldImage) removeImage($oldImage);

    notifyRealtime('inventory');

    die(json_encode(['success' => true, 'message' => 'Product saved', 'id' => $id]));
  } catch (mysqli_sql_exception $e) {
    $conn->rollback();
    if (!empty($newImage)) removeImage($newImage);

    die(json_encode(['success' => false, 'message' => 'Could not save the product: ' . $e->getMessage()]));
  }
}


function editProduct($conn) {
  $id = (int) ($_POST['id'] ?? 0);
  $name = trim($_POST['name'] ?? '');

  if ($id <= 0) die(json_encode(['success' => false, 'message' => 'Product not found.']));
  if ($name === '' || strlen($name) > 100) die(json_encode(['success' => false, 'message' => 'Enter a product name.']));

  $rows = $_POST['variants'] ?? null;
  $price = null;
  $variants = [];

  if (is_array($rows)) {
    $seen = [];

    foreach ($rows as $key => $row) {
      if (!ctype_digit((string) $key)) continue;

      $vName = trim($row['name'] ?? '');
      if ($vName === '' || strlen($vName) > 100) die(json_encode(['success' => false, 'message' => 'Input Variant name.']));
      if (isset($seen[strtolower($vName)])) die(json_encode(['success' => false, 'message' => "Variant name \"$vName\" is used twice."]));
      $seen[strtolower($vName)] = true;

      $variants[(int) $key] = [
        'name'  => $vName,
        'price' => cleanPrice($row['price'] ?? '', "Price of \"$vName\"")
      ];
    }
  } else {
    $price = cleanPrice($_POST['price'] ?? '', 'Price');
  }

  $newImage = null;

  try {
    $conn->begin_transaction();

    $stmt = $conn->prepare('SELECT image FROM products WHERE id = ? FOR UPDATE');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();

    if (!$existing) {
      $conn->rollback();
      die(json_encode(['success' => false, 'message' => 'Product not found.']));
    }

    $oldImage = $existing['image'];
    $newImage = storeImage($_FILES['image'] ?? []);
    $image = $newImage ?? $oldImage;

    if ($price !== null) {
      $stmt = $conn->prepare('UPDATE products SET name = ?, price = ?, image = ? WHERE id = ?');
      $stmt->bind_param('sdsi', $name, $price, $image, $id);
    } else {
      $stmt = $conn->prepare('UPDATE products SET name = ?, image = ? WHERE id = ?');
      $stmt->bind_param('ssi', $name, $image, $id);
    }
    $stmt->execute();

    foreach ($variants as $vid => $v) {
      $stmt = $conn->prepare('UPDATE product_variants SET name = ?, price = ? WHERE id = ? AND product_id = ?');
      $stmt->bind_param('sdii', $v['name'], $v['price'], $vid, $id);
      $stmt->execute();
    }

    $conn->commit();

    if ($newImage && $oldImage) removeImage($oldImage);

    notifyRealtime('inventory');

    die(json_encode(['success' => true, 'message' => 'Product updated', 'id' => $id]));
  } catch (mysqli_sql_exception $e) {
    $conn->rollback();
    if ($newImage) removeImage($newImage);

    die(json_encode(['success' => false, 'message' => 'Could not update the product: ' . $e->getMessage()]));
  }
}
