<?php
error_reporting(E_ALL);
ini_set('display_errors','1');
$root=__DIR__;
$appBase=rtrim(str_replace('\\','/',dirname($_SERVER['SCRIPT_NAME']??'/install.php')), '/.');
$lock=$root.'/data/installed.lock';
$msg='';$err='';
function h($v){return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8');}
function env_status(){
  return array(
    'PHP Sürümü'=>PHP_VERSION,
    'PDO MySQL'=>extension_loaded('pdo_mysql')?'VAR':'YOK',
    'MySQLi'=>extension_loaded('mysqli')?'VAR':'YOK',
    'config yazma'=>is_writable(__DIR__.'/config')?'EVET':'HAYIR',
    'data yazma'=>is_writable(__DIR__.'/data')?'EVET':'HAYIR',
    'schema.sql'=>is_file(__DIR__.'/schema.sql')?'VAR':'YOK',
    'initial_state.json'=>is_file(__DIR__.'/data/initial_state.json')?'VAR':'YOK'
  );
}
if(version_compare(PHP_VERSION,'7.4.0','<')){
  $err='PHP 7.4 veya üzeri gerekli. Mevcut sürüm: '.PHP_VERSION;
} elseif(is_file($lock)){
  $msg='Kurulum daha önce tamamlanmış. Yeniden kurmak için data/installed.lock dosyasını silin. Güvenlik için kurulum sonunda install.php dosyasını silin.';
} elseif(($_SERVER['REQUEST_METHOD']??'GET')==='POST'){
  $host=trim(isset($_POST['host'])?$_POST['host']:'localhost');
  $port=(int)(isset($_POST['port'])?$_POST['port']:3306);
  $database=trim(isset($_POST['database'])?$_POST['database']:'');
  $username=trim(isset($_POST['username'])?$_POST['username']:'');
  $password=isset($_POST['password'])?(string)$_POST['password']:'';
  $adminPassword=isset($_POST['admin_password'])?(string)$_POST['admin_password']:'';
  if($database===''||$username===''||strlen($adminPassword)<10){
    $err='DB adı, DB kullanıcısı ve en az 10 karakter admin şifresi zorunludur.';
  } elseif(!extension_loaded('pdo_mysql')){
    $err='Sunucuda PDO MySQL (pdo_mysql) aktif değil. cPanel > Select PHP Version / PHP Extensions bölümünden pdo_mysql etkinleştirilmelidir.';
  } else {
    try{
      $dsn='mysql:host='.$host.';port='.$port.';dbname='.$database.';charset=utf8mb4';
      $pdo=new PDO($dsn,$username,$password,array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false));
      $schema=@file_get_contents($root.'/schema.sql');
      if($schema===false) throw new Exception('schema.sql okunamadı.');
      // Her CREATE TABLE statement'ını güvenilir şekilde ayır.
      $statements=preg_split('/;\s*(?=CREATE TABLE|$)/i',$schema);
      foreach($statements as $sql){$sql=trim($sql);if($sql!==''){$pdo->exec($sql);}}
      $seed=@file_get_contents($root.'/data/initial_state.json');
      $decoded=$seed?json_decode($seed,true):null;
      if(!$seed||!is_array($decoded)) throw new Exception('Başlangıç CMS verisi okunamadı / JSON geçersiz.');
      $st=$pdo->prepare('INSERT INTO cms_state(id,draft_json,published_json,version,updated_at,published_at) VALUES(1,?,?,1,NOW(),NOW()) ON DUPLICATE KEY UPDATE draft_json=VALUES(draft_json),published_json=VALUES(published_json),version=1,updated_at=NOW(),published_at=NOW()');
      $st->execute(array($seed,$seed));
      $hash=password_hash($adminPassword,PASSWORD_DEFAULT);
      $st=$pdo->prepare("INSERT INTO admin_users(username,password_hash,role,created_at) VALUES('admin',?,'admin',NOW()) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash),role='admin'");
      $st->execute(array($hash));
      $cfg="<?php\nreturn ".var_export(array('host'=>$host,'port'=>$port,'database'=>$database,'username'=>$username,'password'=>$password,'charset'=>'utf8mb4'),true).";\n";
      if(@file_put_contents($root.'/config/database.php',$cfg)===false) throw new Exception('config/database.php yazılamadı. config klasör izinlerini kontrol edin.');
      if(@file_put_contents($lock,date('c'))===false) throw new Exception('data/installed.lock yazılamadı. data klasör izinlerini kontrol edin.');
      $msg='Kurulum tamamlandı. '.$appBase.'/admin adresinden giriş yapabilirsiniz. Güvenlik için install.php ve php_test.php dosyalarını silin.';
    } catch(Exception $e){
      $err='Kurulum hatası: '.$e->getMessage();
    }
  }
}
$env=env_status();
?><!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASAY Energy Kurulum</title><style>body{font-family:Arial,sans-serif;background:#0b0b0b;color:#fff;margin:0;padding:30px}.box{max-width:820px;margin:auto;background:#151515;border:1px solid #333;border-radius:22px;padding:30px}h1{margin-top:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}label{display:block;font-size:13px;color:#bbb}input{width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border-radius:10px;border:1px solid #444;background:#0d0d0d;color:#fff}button{margin-top:20px;padding:13px 20px;border:0;border-radius:999px;background:#F1482E;color:white;font-weight:bold}.msg{padding:14px;border-radius:10px;margin:18px 0}.ok{background:#14351e}.err{background:#49191b}.diag{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:20px 0}.diag div{background:#0d0d0d;border:1px solid #333;padding:10px;border-radius:8px}.good{color:#7fe39d}.bad{color:#ff7868}@media(max-width:650px){.grid,.diag{grid-template-columns:1fr}}</style></head><body><div class="box"><h1>ASAY Energy · PHP/MySQL Kurulum</h1><p>Turkticaret MySQL bilgilerini gir. Önce aşağıdaki sunucu kontrolünün sağlıklı olduğundan emin ol.</p><div class="diag"><?php foreach($env as $k=>$v):$bad=in_array($v,array('YOK','HAYIR'),true);?><div><b><?=h($k)?></b><br><span class="<?=$bad?'bad':'good'?>"><?=h($v)?></span></div><?php endforeach;?></div><?php if($msg):?><div class="msg ok"><?=h($msg)?></div><?php endif;?><?php if($err):?><div class="msg err"><?=h($err)?></div><?php endif;?><?php if(!is_file($lock)&&version_compare(PHP_VERSION,'7.4.0','>=')&&extension_loaded('pdo_mysql')):?><form method="post"><div class="grid"><label>DB Host<input name="host" value="<?=h(isset($_POST['host'])?$_POST['host']:'localhost')?>" required></label><label>DB Port<input name="port" type="number" value="<?=h(isset($_POST['port'])?$_POST['port']:'3306')?>" required></label><label>DB Adı<input name="database" value="<?=h(isset($_POST['database'])?$_POST['database']:'asay_energy_web_cms')?>" required></label><label>DB Kullanıcı<input name="username" value="<?=h(isset($_POST['username'])?$_POST['username']:'db_user')?>" required></label><label>DB Şifre<input name="password" type="password"></label><label>Admin Şifresi<input name="admin_password" type="password" minlength="10" required></label></div><button type="submit">Kurulumu Başlat</button></form><?php endif;?></div></body></html>
