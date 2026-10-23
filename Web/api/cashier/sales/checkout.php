<?php

require_once __DIR__ . '/../../../config/database.php';

session_start();
$userId = $_SESSION['user']['id'] ?? null;

$data  = json_decode(file_get_contents('php://input'), true);
$items = $data['items'] ?? [];
$paid  = $data['paid'] ?? null;

if (!is_array($items) || count($items) === 0) die(json_encode(['success' => false, 'message' => 'The cart is empty.']));
if (!is_numeric($paid)) die(json_encode(['success' => false, 'message' => 'Invalid payment amount.']));

$paid = round((float) $paid, 2);

$lines = [];

foreach ($items as $item) {
  $productId = (int) ($item['productId'] ?? 0);
  $variantId = !empty($item['variantId']) ? (int) $item['variantId'] : 0;
  $quantity  = $item['quantity'] ?? 0;

  if ($productId <= 0 || filter_var($quantity, FILTER_VALIDATE_INT) === false || (int) $quantity <= 0) {
    die(json_encode(['success' => false, 'message' => 'Invalid item in the cart.']));
  }

  $key = $productId . ':' . $variantId;

  if (!isset($lines[$key])) {
    $lines[$key] = ['productId' => $productId, 'variantId' => $variantId, 'quantity' => 0];
  }

  $lines[$key]['quantity'] += (int) $quantity;
}

try {
  $conn->begin_transaction();

  $total = 0;
  $saleItems = [];

  foreach ($lines as $line) {
    $qty = $line['quantity'];

    $stmt = $conn->prepare('SELECT name, price, stock FROM products WHERE id = ? FOR UPDATE');
    $stmt->bind_param('i', $line['productId']);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();

    if (!$product) {
      $conn->rollback();
      die(json_encode(['success' => false, 'message' => 'A product in the cart no longer exists. Please refresh.']));
    }

    $name = $product['name'];
    $variantName = null;
    $price = (float) $product['price'];

    if ($line['variantId']) {
      $stmt = $conn->prepare('SELECT name, price, stock FROM product_variants WHERE id = ? AND product_id = ? FOR UPDATE');
      $stmt->bind_param('ii', $line['variantId'], $line['productId']);
      $stmt->execute();
      $variant = $stmt->get_result()->fetch_assoc();

      if (!$variant) {
        $conn->rollback();
        die(json_encode(['success' => false, 'message' => "A variant of \"$name\" no longer exists. Please refresh."]));
      }

      if ((int) $variant['stock'] < $qty) {
        $conn->rollback();
        die(json_encode(['success' => false, 'message' => "Not enough stock for $name ({$variant['name']}). Only {$variant['stock']} left."]));
      }

      $stmt = $conn->prepare('UPDATE product_variants SET stock = stock - ? WHERE id = ?');
      $stmt->bind_param('ii', $qty, $line['variantId']);
      $stmt->execute();

      $variantName = $variant['name'];
      $price = (float) $variant['price'];
    } else {
      if ((int) $product['stock'] < $qty) {
        $conn->rollback();
        die(json_encode(['success' => false, 'message' => "Not enough stock for $name. Only {$product['stock']} left."]));
      }

      $stmt = $conn->prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
      $stmt->bind_param('ii', $qty, $line['productId']);
      $stmt->execute();
    }

    $total += $price * $qty;

    $saleItems[] = [
      'productId' => $line['productId'],
      'variantId' => $line['variantId'] ?: null,
      'name'      => $name,
      'variant'   => $variantName,
      'quantity'  => $qty,
      'price'     => $price
    ];
  }

  $total = round($total, 2);


  $change = round($paid - $total, 2);
  $method = 'Cash';

  $saleId = 0;

  for ($try = 0; $try < 5 && !$saleId; $try++) {
    $receiptNo = date('Ymd') . '-' . str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

    try {
      $stmt = $conn->prepare('INSERT INTO sales (receipt_no, user_id, total, paid, change_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?)');
      $stmt->bind_param('siddds', $receiptNo, $userId, $total, $paid, $change, $method);
      $stmt->execute();
      $saleId = (int) $conn->insert_id;
    } catch (mysqli_sql_exception $e) {
      if ($e->getCode() !== 1062) throw $e;
    }
  }

  if (!$saleId) {
    $conn->rollback();
    die(json_encode(['success' => false, 'message' => 'Could not create a receipt number. Please try again.']));
  }

  $stmt = $conn->prepare('INSERT INTO sale_items (sale_id, product_id, variant_id, name, variant, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?)');

  foreach ($saleItems as $si) {
    $stmt->bind_param('iiissid', $saleId, $si['productId'], $si['variantId'], $si['name'], $si['variant'], $si['quantity'], $si['price']);
    $stmt->execute();
  }

  $conn->commit();

  notifyRealtime('sale', ['action' => 'completed', 'id' => $saleId]);

  die(json_encode([
    'success'   => true,
    'id'        => $saleId,
    'receiptNo' => $receiptNo,
    'total'     => $total,
    'change'    => $change
  ]));
} catch (mysqli_sql_exception $e) {
  $conn->rollback();
  die(json_encode(['success' => false, 'message' => 'Could not save the sale: ' . $e->getMessage()]));
}
