<?php

require_once __DIR__ . '/../../../config/database.php';


$name = trim(json_decode(file_get_contents('php://input'), true)['name'] ?? '');

try {
  $stmt = $conn->prepare('SELECT id FROM categories WHERE name = ?');
  $stmt->bind_param('s', $name);
  $stmt->execute();

  if ($stmt->get_result()->fetch_row()) {
    die(json_encode(['success' => false, 'message' => 'That category already exists.']));
  }

  $stmt = $conn->prepare('INSERT INTO categories (name) VALUES (?)');
  $stmt->bind_param('s', $name);
  $stmt->execute();

  notifyRealtime('inventory');

  die(json_encode([
    'success'  => true,
    'message'  => 'Category added',
    'category' => ['id' => (int) $conn->insert_id, 'name' => $name]
  ]));
} catch (mysqli_sql_exception $e) {
  die(json_encode(['success' => false, 'message' => 'Could not add the category: ' . $e->getMessage()]));
}
