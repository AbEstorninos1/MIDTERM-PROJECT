<?php

session_start();

setcookie('login', '', ['expires' => time() - 3600, 'path' => '/']);
session_destroy();

header('Location: ../index.php');
exit;
