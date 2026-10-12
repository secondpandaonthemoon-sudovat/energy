<?php
// Local PHP development server only; production uses the root .htaccess.
$root = dirname(__DIR__);
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (preg_match('#^/(config|data|scripts|tests|node_modules)(/|$)#', $path)) {
  http_response_code(403);
  exit;
}
if (strpos($path, '/api/') === 0) {
  require $root.'/api/index.php';
  return true;
}
$file = realpath($root.$path);
if ($path !== '/' && $file && strpos($file, $root.DIRECTORY_SEPARATOR) === 0 && is_file($file)) return false;
$_SERVER['SCRIPT_NAME'] = '/index.php';
require $root.'/index.php';
