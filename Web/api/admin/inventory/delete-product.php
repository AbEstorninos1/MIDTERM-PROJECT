<?php

require_once __DIR__ . '/../../../config/database.php';


$id = (int) (json_decode(file_get_contents('php://input'), true)['id'] ?? 0);

try {
  $stmt = $conn->prepare('SELECT image FROM products WHERE id = ?');
  $stmt->bind_param('i', $id);
  $stmt->execute();
  $product = $stmt->get_result()->fetch_assoc();

  if (!$product) {
    die(json_encode(['success' => false, 'message' => 'Product not found.']));
  }

  $stmt = $conn->prepare('DELETE FROM products WHERE id = ?');
  $stmt->bind_param('i', $id);
  $stmt->execute();

  if ($product['image']) {
    $file = __DIR__ . '/../../../' . $product['image'];
    if (is_file($file)) @unlink($file);
  }

  notifyRealtime('inventory');

  die(json_encode(['success' => true]));
} catch (mysqli_sql_exception $e) {
  die(json_encode(['success' => false, 'message' => 'Could not remove the product.']));
}
