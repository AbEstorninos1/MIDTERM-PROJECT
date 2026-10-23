<?php

ini_set('display_errors', '0');
require_once __DIR__ . '/../../../config/database.php';

$sales = $conn->query("
  SELECT s.id, s.receipt_no, s.created_at, u.username AS cashier,
         s.total, s.paid, s.change_amount, s.payment_method, s.refunded_amount, s.status
  FROM sales s
  LEFT JOIN users u ON u.id = s.user_id
  ORDER BY s.created_at DESC
")->fetch_all(MYSQLI_ASSOC);

$itemRows = $conn->query("
  SELECT sale_id, name, variant, quantity, price
  FROM sale_items
")->fetch_all(MYSQLI_ASSOC);

$items = [];
foreach ($itemRows as $i) {
  $items[$i['sale_id']][] = [
    'name'     => $i['name'],
    'variant'  => $i['variant'],
    'quantity' => (int) $i['quantity'],
    'price'    => (float) $i['price']
  ];
}

$records = [];
foreach ($sales as $s) {
  $records[] = [
    'id'            => (int) $s['id'],
    'receiptNo'     => $s['receipt_no'],
    'date'          => $s['created_at'],
    'cashier'       => $s['cashier'],
    'items'         => $items[$s['id']] ?? [],
    'total'         => (float) $s['total'],
    'paid'          => (float) $s['paid'],
    'change'        => (float) $s['change_amount'],
    'paymentMethod' => $s['payment_method'],
    'refunded'      => (float) $s['refunded_amount'] > 0,
    'voided'        => strtolower((string) $s['status']) === 'voided'
  ];
}

echo json_encode($records);
