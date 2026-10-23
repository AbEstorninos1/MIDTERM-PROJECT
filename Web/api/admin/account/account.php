<?php

require_once __DIR__ . '/../../../config/database.php';


$accounts = $conn->query("
  SELECT id, username, role, status, created_at
  FROM users
  ORDER BY status = 'Pending' DESC, id
")->fetch_all(MYSQLI_ASSOC);

echo json_encode($accounts);
