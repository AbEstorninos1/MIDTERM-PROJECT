<?php

require_once __DIR__ . '/../../../config/database.php';

$data   = json_decode(file_get_contents('php://input'), true);
$saleId = (int) ($data['id'] ?? 0);

if ($saleId <= 0) die(json_encode(['success' => false, 'message' => 'Invalid sale.']));

try {
  $conn->begin_transaction();

  $stmt = $conn->prepare('SELECT total, status, refunded_amount FROM sales WHERE id = ? FOR UPDATE');
  $stmt->bind_param('i', $saleId);
  $stmt->execute();
  $sale = $stmt->get_result()->fetch_assoc();

  if (!$sale) {
    $conn->rollback();
    die(json_encode(['success' => false, 'message' => 'Sale not found.']));
  }

  if (strtolower($sale['status']) === 'voided') {
    $conn->rollback();
    die(json_encode(['success' => false, 'message' => 'A voided sale cannot be refunded.']));
  }

  if ((float) $sale['refunded_amount'] > 0) {
    $conn->rollback();
    die(json_encode(['success' => false, 'message' => 'This sale was already refunded.']));
  }

  $stmt = $conn->prepare('SELECT product_id, variant_id, quantity FROM sale_items WHERE sale_id = ?');
  $stmt->bind_param('i', $saleId);
  $stmt->execute();
  $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

  $variantStmt = $conn->prepare('UPDATE product_variants SET stock = stock + ? WHERE id = ?');
  $productStmt = $conn->prepare('UPDATE products SET stock = stock + ? WHERE id = ?');

  foreach ($items as $item) {
    $qty = (int) $item['quantity'];

    if (!empty($item['variant_id'])) {
      $variantId = (int) $item['variant_id'];
      $variantStmt->bind_param('ii', $qty, $variantId);
      $variantStmt->execute();
    } elseif (!empty($item['product_id'])) {
      $productId = (int) $item['product_id'];
      $productStmt->bind_param('ii', $qty, $productId);
      $productStmt->execute();
    }
  }

  $refund = (float) $sale['total'];
  $stmt = $conn->prepare('UPDATE sales SET refunded_amount = ? WHERE id = ?');
  $stmt->bind_param('di', $refund, $saleId);
  $stmt->execute();

  $conn->commit();

  notifyRealtime('sale', ['action' => 'refunded', 'id' => $saleId]);

  die(json_encode(['success' => true, 'id' => $saleId, 'refunded_amount' => $refund]));
} catch (mysqli_sql_exception $e) {
  $conn->rollback();
  die(json_encode(['success' => false, 'message' => 'Could not refund the sale: ' . $e->getMessage()]));
}
