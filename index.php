<?php
// Apache may serve the app at / or any folder (e.g. /asayenergy1/).
$script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/index.php');
$base = rtrim(dirname($script), '/.').'/';
if ($base === '') $base = '/';
$template = file_get_contents(__DIR__.'/index.html');
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
echo str_replace('<meta name="asay-base" content="">', '<meta name="asay-base" content="'.htmlspecialchars($base, ENT_QUOTES, 'UTF-8').'">', $template);
