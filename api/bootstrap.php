<?php

function json_response($data, $status=200) {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store, max-age=0');
  echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}
function read_json_body() {
  $raw=file_get_contents('php://input') ?: '';
  if ($raw==='') return [];
  $data=json_decode($raw,true);
  if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) json_response(['error'=>'Geçersiz JSON verisi.'],400);
  return $data;
}
function db() {
  static $pdo=null;
  if ($pdo) return $pdo;
  $configFile=__DIR__.'/../config/database.php';
  $cfg=is_file($configFile)?require $configFile:[];
  foreach (['host'=>'ASAY_DB_HOST','port'=>'ASAY_DB_PORT','database'=>'ASAY_DB_NAME','username'=>'ASAY_DB_USER','password'=>'ASAY_DB_PASSWORD'] as $key=>$name) {
    $value=getenv($name); if ($value!==false) $cfg[$key]=$value;
  }
  $cfg+=['host'=>'localhost','port'=>3306,'database'=>'ASAY_DB_ADI','username'=>'','password'=>'','charset'=>'utf8mb4'];
  if (($cfg['database']??'')==='ASAY_DB_ADI') json_response(['error'=>'Veritabanı kurulumu yapılmamış. /install.php adresini açın.'],503);
  $dsn=sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s',$cfg['host'],$cfg['port']??3306,$cfg['database'],$cfg['charset']??'utf8mb4');
  try {
    $pdo=new PDO($dsn,$cfg['username'],$cfg['password'],[
      PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES=>false,
    ]);
  } catch(Throwable $e) { json_response(['error'=>'Veritabanı bağlantısı kurulamadı.'],503); }
  return $pdo;
}
function bearer_token() {
  $h=$_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$h && function_exists('apache_request_headers')) {
    $headers=apache_request_headers(); $h=$headers['Authorization'] ?? $headers['authorization'] ?? '';
  }
  return preg_match('/^Bearer\s+(.+)$/i',$h,$m)?trim($m[1]):'';
}
function require_auth() {
  $token=bearer_token(); if(!$token) json_response(['error'=>'Oturum geçersiz veya süresi dolmuş.'],401);
  $hash=hash('sha256',$token);
  $st=db()->prepare('SELECT s.*,u.username,u.role FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>NOW() LIMIT 1');
  $st->execute([$hash]); $row=$st->fetch(); if(!$row) json_response(['error'=>'Oturum geçersiz veya süresi dolmuş.'],401);
  return $row;
}
function state_row() {
  $r=db()->query('SELECT * FROM cms_state WHERE id=1')->fetch();
  if(!$r) json_response(['error'=>'CMS başlangıç verisi bulunamadı. install.php ile kurulumu tekrar çalıştırın.'],500);
  return $r;
}
function decode_state($json) { $d=json_decode($json,true); return is_array($d)?$d:[]; }
function save_revision($action, $payload) {
  $st=db()->prepare('INSERT INTO revisions(action,payload_json,created_at) VALUES(?,?,NOW())');
  $st->execute([$action,json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)]);
}
function secure_text($v,$max=5000) { $s=strip_tags((string)$v); return function_exists('mb_substr')?mb_substr($s,0,$max):substr($s,0,$max); }

function valid_cms_state($state) {
  if (!is_array($state) || !isset($state['settings'], $state['pages'], $state['menus'], $state['entities'])) return false;
  if (!is_array($state['settings']) || !is_array($state['settings']['site_config']??null) || !is_array($state['pages']) || !is_array($state['menus']) || !is_array($state['entities'])) return false;
  foreach (['products','projects','services','hotspots'] as $key) {
    if (!is_array($state['entities'][$key]??null)) return false;
    foreach ($state['entities'][$key] as $item) if (!is_array($item)) return false;
  }
  foreach ($state['pages'] as $page) {
    if (!is_array($page) || !is_array($page['sections']??null)) return false;
    foreach ($page['sections'] as $section) if (!is_array($section) || !is_string($section['type']??null)) return false;
  }
  foreach ($state['menus'] as $menu) {
    if (!is_array($menu) || !is_array($menu['items']??null)) return false;
    foreach ($menu['items'] as $item) if (!is_array($item)) return false;
  }
  return true;
}
function safe_svg($xml) {
  if (!class_exists('DOMDocument') || preg_match('/<!DOCTYPE|<!ENTITY|<\?(?!xml\s)/i', $xml)) return false;
  $doc=new DOMDocument();
  $previous=libxml_use_internal_errors(true);
  $ok=$doc->loadXML($xml, LIBXML_NONET);
  libxml_clear_errors(); libxml_use_internal_errors($previous);
  if (!$ok || !$doc->documentElement || $doc->documentElement->localName!=='svg') return false;
  $allowed=['svg','g','path','rect','circle','ellipse','line','polyline','polygon','text','tspan','defs','linearGradient','radialGradient','stop','clipPath','mask','title','desc','symbol','use'];
  foreach ($doc->getElementsByTagName('*') as $element) {
    if (!in_array($element->localName,$allowed,true) || $element->namespaceURI!=='http://www.w3.org/2000/svg') return false;
    foreach ($element->attributes as $attr) {
      if (preg_match('/^on/i',$attr->localName) || preg_match('/javascript:|data:|https?:|@import|expression\s*\(/i',$attr->value)) return false;
      if ($attr->localName==='href' && !preg_match('/^#[a-zA-Z_][a-zA-Z0-9_.:-]*$/',$attr->value)) return false;
      if (preg_match('/url\s*\(/i',$attr->value) && !preg_match('/^url\(\s*#[a-zA-Z_][a-zA-Z0-9_.:-]*\s*\)$/',$attr->value)) return false;
      if ($attr->localName==='style') return false;
    }
  }
  return true;
}
