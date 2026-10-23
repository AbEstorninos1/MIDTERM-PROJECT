<?php

require_once __DIR__ . '/../../../config/database.php';


$lowStockLimit = 10;

$totals = $conn->query("
  SELECT COALESCE(SUM(total - refunded_amount), 0) AS sales, COUNT(*) AS transactions
  FROM sales
")->fetch_assoc();

$productCount = (int) $conn->query("SELECT COUNT(*) FROM products")->fetch_row()[0];

$salesChart = $conn->query("
  SELECT DATE(created_at) AS date, SUM(total - refunded_amount) AS total
  FROM sales
  WHERE created_at >= CURDATE() - INTERVAL 6 DAY
  GROUP BY DATE(created_at)
  ORDER BY date
")->fetch_all(MYSQLI_ASSOC);

$topProducts = $conn->query("
  SELECT si.name, SUM(si.quantity) AS quantity
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  GROUP BY si.name
  ORDER BY quantity DESC
  LIMIT 5
")->fetch_all(MYSQLI_ASSOC);

$stmt = $conn->prepare("
  SELECT p.name AS product, c.name AS category, p.stock
  FROM products p
  JOIN categories c ON c.id = p.category_id
  WHERE p.stock <= ?
    AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id)
  UNION ALL
  SELECT CONCAT(p.name, ' (', v.name, ')') AS product, c.name AS category, v.stock
  FROM product_variants v
  JOIN products p ON p.id = v.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE v.stock <= ?
  ORDER BY stock ASC
");
$stmt->bind_param('ii', $lowStockLimit, $lowStockLimit);
$stmt->execute();
$lowStockProducts = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$recentTransactions = $conn->query("
  SELECT s.receipt_no AS receipt, u.username AS cashier, s.total, s.created_at AS date
  FROM sales s
  LEFT JOIN users u ON u.id = s.user_id
  WHERE s.status <> 'Voided'
  ORDER BY s.created_at DESC
  LIMIT 5
")->fetch_all(MYSQLI_ASSOC);

echo json_encode([
  'success' => true,
  'stats' => [
    'sales'        => (float) $totals['sales'],
    'transactions' => (int) $totals['transactions'],
    'products'     => $productCount,
    'lowStock'     => count($lowStockProducts)
  ],
  'salesChart'         => $salesChart,
  'topProducts'        => $topProducts,
  'lowStockProducts'   => $lowStockProducts,
  'recentTransactions' => $recentTransactions
]);
