<?php

ini_set('display_errors', '0');
require_once __DIR__ . '/../../../config/database.php';


try {

$sales = $conn->query("
  SELECT s.id, s.receipt_no, s.created_at, u.username AS cashier,
         s.total, s.paid, s.change_amount, s.payment_method,
         s.status, s.refunded_amount
  FROM sales s
  LEFT JOIN users u ON u.id = s.user_id
  ORDER BY s.created_at DESC
")->fetch_all(MYSQLI_ASSOC);

$lineRows = $conn->query("
  SELECT sale_id, name, variant, quantity, price
  FROM sale_items
")->fetch_all(MYSQLI_ASSOC);

$lines = [];
foreach ($lineRows as $l) {
  $lines[$l['sale_id']][] = [
    'name'     => $l['name'],
    'variant'  => $l['variant'],
    'quantity' => (int) $l['quantity'],
    'price'    => (float) $l['price']
  ];
}

$transactions = [];
foreach ($sales as $s) {
  $saleLines = $lines[$s['id']] ?? [];

  $transactions[] = [
    'id'              => (int) $s['id'],
    'receipt_no'      => $s['receipt_no'],
    'created_at'      => $s['created_at'],
    'cashier'         => $s['cashier'],
    'items'           => array_sum(array_column($saleLines, 'quantity')),
    'total'           => (float) $s['total'],
    'paid'            => (float) $s['paid'],
    'change'          => (float) $s['change_amount'],
    'payment_method'  => $s['payment_method'],
    'status'          => $s['status'],
    'refunded_amount' => (float) $s['refunded_amount'],
    'lines'           => $saleLines
  ];
}

  echo json_encode($transactions);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
