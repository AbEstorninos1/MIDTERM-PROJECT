<?php
ini_set('display_errors', '0');
require_once __DIR__ . '/../../../config/database.php';

$id = (int) ($_GET['id'] ?? 0);

$stmt = $conn->prepare("
  SELECT s.id, s.receipt_no, s.created_at, u.username AS cashier,
         s.total, s.paid, s.change_amount, s.payment_method
  FROM sales s
  LEFT JOIN users u ON u.id = s.user_id
  WHERE s.id = ?
");
$stmt->bind_param('i', $id);
$stmt->execute();
$s = $stmt->get_result()->fetch_assoc();

$stmt = $conn->prepare("SELECT name, variant, quantity, price FROM sale_items WHERE sale_id = ?");
$stmt->bind_param('i', $id);
$stmt->execute();
$items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

foreach ($items as &$i) {
  $i['quantity'] = (int) $i['quantity'];
  $i['price']    = (float) $i['price'];
}

echo json_encode([
  'id'            => (int) $s['id'],
  'receiptNo'     => $s['receipt_no'],
  'date'          => $s['created_at'],
  'cashier'       => $s['cashier'],
  'items'         => $items,
  'total'         => (float) $s['total'],
  'paid'          => (float) $s['paid'],
  'change'        => (float) $s['change_amount'],
  'paymentMethod' => $s['payment_method']
]);
