<?php

require_once __DIR__ . '/../../../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$productId = (int) ($data['product_id'] ?? 0);
$items = $data['items'] ?? [];

if ($productId <= 0 || !is_array($items) || count($items) === 0) {
  die(json_encode(['success' => false, 'message' => 'Nothing to add.']));
}

foreach ($items as $item) {
  $quantity = $item['quantity'] ?? null;

  if (!is_int($quantity) && !(is_string($quantity) && ctype_digit($quantity))) {
    die(json_encode(['success' => false, 'message' => 'Quantity must be a whole number.']));
  }

  if ((int) $quantity < 1) {
    die(json_encode(['success' => false, 'message' => 'Quantity cannot be negative.']));
  }
}

try {
  $conn->begin_transaction();

  $stmt = $conn->prepare('SELECT 1 FROM products WHERE id = ? FOR UPDATE');
  $stmt->bind_param('i', $productId);
  $stmt->execute();

  if (!$stmt->get_result()->fetch_row()) {
    $conn->rollback();
    die(json_encode(['success' => false, 'message' => 'Product not found.']));
  }

  foreach ($items as $item) {
    $quantity = (int) $item['quantity'];
    $variantId = (int) ($item['variant_id'] ?? 0);

    if ($variantId) {
      $stmt = $conn->prepare('UPDATE product_variants SET stock = stock + ? WHERE id = ? AND product_id = ?');
      $stmt->bind_param('iii', $quantity, $variantId, $productId);
    } else {
      $stmt = $conn->prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
      $stmt->bind_param('ii', $quantity, $productId);
    }

    $stmt->execute();

    if ($variantId && $stmt->affected_rows === 0) {
      $conn->rollback();
      die(json_encode(['success' => false, 'message' => 'A variant no longer exists. Please reload and try again.']));
    }
  }

  $conn->commit();

  notifyRealtime('inventory');

  die(json_encode(['success' => true, 'message' => 'Stock added']));
} catch (mysqli_sql_exception $e) {
  $conn->rollback();
  die(json_encode(['success' => false, 'message' => 'Could not add stock: ' . $e->getMessage()]));
}
