<?php
header('Content-Type: text/html; charset=utf-8');
$checks = array(
  'PHP Version' => PHP_VERSION,
  'PDO' => class_exists('PDO') ? 'VAR' : 'YOK',
  'pdo_mysql' => extension_loaded('pdo_mysql') ? 'VAR' : 'YOK',
  'mysqli' => extension_loaded('mysqli') ? 'VAR' : 'YOK',
  'JSON' => extension_loaded('json') ? 'VAR' : 'YOK',
  'mbstring' => extension_loaded('mbstring') ? 'VAR' : 'YOK',
  'config yazılabilir' => is_writable(__DIR__.'/config') ? 'EVET' : 'HAYIR',
  'data yazılabilir' => is_writable(__DIR__.'/data') ? 'EVET' : 'HAYIR',
  'uploads yazılabilir' => is_writable(__DIR__.'/uploads') ? 'EVET' : 'HAYIR',
  'schema.sql' => is_file(__DIR__.'/schema.sql') ? 'VAR' : 'YOK',
  'initial_state.json' => is_file(__DIR__.'/data/initial_state.json') ? 'VAR' : 'YOK',
);
?><!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASAY PHP Test</title><style>body{font:15px Arial;background:#111;color:#eee;padding:30px}.box{max-width:800px;margin:auto;background:#1b1b1b;padding:24px;border-radius:16px}table{width:100%;border-collapse:collapse}td{padding:10px;border-bottom:1px solid #333}.bad{color:#ff7868}.ok{color:#7fe39d}</style></head><body><div class="box"><h1>ASAY Energy PHP Tanılama</h1><table><?php foreach($checks as $k=>$v): $bad=in_array($v,array('YOK','HAYIR'),true); ?><tr><td><?=htmlspecialchars($k,ENT_QUOTES,'UTF-8')?></td><td class="<?=$bad?'bad':'ok'?>"><?=htmlspecialchars($v,ENT_QUOTES,'UTF-8')?></td></tr><?php endforeach;?></table><p>Bu sayfa açılıyorsa PHP çalışıyor. Kurulum sonrası güvenlik için php_test.php dosyasını silin.</p></div></body></html>
