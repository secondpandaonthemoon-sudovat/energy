<?php
require __DIR__.'/bootstrap.php';
if(!function_exists('str_starts_with')){function str_starts_with($haystack,$needle){return $needle===''||strpos($haystack,$needle)===0;}}
if(!function_exists('str_contains')){function str_contains($haystack,$needle){return $needle===''||strpos($haystack,$needle)!==false;}}
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

$method=$_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri=parse_url($_SERVER['REQUEST_URI'] ?? '/',PHP_URL_PATH) ?: '/';
$base='/api/';
$route=isset($_GET['route']) ? trim((string)$_GET['route'],'/') : (str_starts_with($uri,$base)?substr($uri,strlen($base)):'');
$route=trim($route,'/');
$body=read_json_body();
$pdo=db();

if($method==='GET' && $route==='content'){
  $r=state_row(); json_response(decode_state($r['published_json']));
}
if($method==='GET' && $route==='content/version'){
  $r=state_row(); json_response(['version'=>(int)$r['version']]);
}
if($method==='POST' && $route==='translate/batch'){
  $target=($body['target']??'en')==='tr'?'tr':'en'; $texts=is_array($body['texts']??null)?array_slice($body['texts'],0,80):[];
  $dict=['Teklif Al'=>'Get a Quote','Hakkımızda'=>'About Us','Ürünler'=>'Products','Teknoloji'=>'Technology','Çözümler'=>'Solutions','Projeler'=>'Projects','İletişim'=>'Contact','Jeneratör'=>'Generator','Buhar Kazanı'=>'Steam Boiler','Trafo'=>'Transformer','Trijenerasyon'=>'Trigeneration','Kojenerasyon'=>'Cogeneration','Enerji Depolama'=>'Energy Storage'];
  $out=[]; foreach($texts as $t){$s=(string)$t;$out[]=$target==='tr'?$s:($dict[trim($s)]??$s);} json_response(['target'=>$target,'translations'=>$out]);
}
if($method==='POST' && $route==='admin/login'){
  $username=secure_text($body['username']??'admin',100); $password=(string)($body['password']??'');
  $st=$pdo->prepare('SELECT * FROM admin_users WHERE username=? LIMIT 1');$st->execute([$username]);$u=$st->fetch();
  if(!$u || !password_verify($password,$u['password_hash'])) json_response(['error'=>'Kullanıcı adı veya şifre hatalı.'],401);
  $token=bin2hex(random_bytes(32));$hash=hash('sha256',$token);$pdo->prepare('DELETE FROM admin_sessions WHERE expires_at<=NOW()')->execute();
  $pdo->prepare('INSERT INTO admin_sessions(user_id,token_hash,expires_at,created_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 12 HOUR),NOW())')->execute([$u['id'],$hash]);
  json_response(['token'=>$token,'user'=>['username'=>$u['username'],'role'=>$u['role']]]);
}
if(str_starts_with($route,'admin/')) $auth=require_auth();

if($method==='POST' && $route==='admin/logout'){
  $token=bearer_token();$pdo->prepare('DELETE FROM admin_sessions WHERE token_hash=?')->execute([hash('sha256',$token)]);json_response(['ok'=>true]);
}
if($method==='GET' && ($route==='admin/cms'||$route==='admin/preview')){
  $r=state_row(); json_response(decode_state($r['draft_json']));
}
if($method==='PUT' && $route==='admin/cms'){
  if (!valid_cms_state($body)) json_response(['error'=>'CMS verisinin yapısı geçersiz. Sayfalar, menüler ve içerik listeleri korunmalıdır.'],422);
  $r=state_row();$current=decode_state($r['draft_json']);
  save_revision('draft-save',$current);
  $incoming=$body; $incoming['version']=(int)$r['version'];
  $json=json_encode($incoming,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  $pdo->prepare('UPDATE cms_state SET draft_json=?,updated_at=NOW() WHERE id=1')->execute([$json]);
  json_response(['ok'=>true,'savedAt'=>gmdate('c')]);
}
if($method==='POST' && $route==='admin/publish'){
  $r=state_row();$draft=decode_state($r['draft_json']);if(!valid_cms_state($draft))json_response(['error'=>'Taslak verisinin yapısı geçersiz.'],422);$version=(int)$r['version']+1;$draft['version']=$version;
  $json=json_encode($draft,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); save_revision('publish',$draft);
  $pdo->prepare('UPDATE cms_state SET draft_json=?,published_json=?,version=?,updated_at=NOW(),published_at=NOW() WHERE id=1')->execute([$json,$json,$version]);
  json_response(['ok'=>true,'version'=>$version,'publishedAt'=>gmdate('c')]);
}
if($method==='GET' && $route==='admin/revisions'){
  $limit=max(1,min(200,(int)($_GET['limit']??30)));$st=$pdo->query('SELECT id,action,created_at,\'site\' AS scope,\'all\' AS scope_id FROM revisions ORDER BY id DESC LIMIT '.$limit);json_response($st->fetchAll());
}
if($method==='POST' && preg_match('#^admin/revisions/(\d+)/restore$#',$route,$m)){
  $st=$pdo->prepare('SELECT payload_json FROM revisions WHERE id=?');$st->execute([(int)$m[1]]);$r=$st->fetch();if(!$r)json_response(['error'=>'Revision bulunamadı.'],404);
  $pdo->prepare('UPDATE cms_state SET draft_json=?,updated_at=NOW() WHERE id=1')->execute([$r['payload_json']]);json_response(['ok'=>true]);
}
if($method==='POST' && $route==='admin/upload'){
  $data=(string)($body['data']??'');$orig=preg_replace('/[^a-zA-Z0-9._-]/','_',basename((string)($body['fileName']??'file')));
  if(!preg_match('#^data:([^;]+);base64,(.+)$#s',$data,$m))json_response(['error'=>'Geçersiz dosya verisi.'],400);
  $mime=$m[1];$allowed=['image/jpeg'=>'.jpg','image/png'=>'.png','image/webp'=>'.webp','image/gif'=>'.gif','image/svg+xml'=>'.svg','video/mp4'=>'.mp4','video/webm'=>'.webm','application/pdf'=>'.pdf'];
  if(!isset($allowed[$mime]))json_response(['error'=>'Dosya türüne izin verilmiyor.'],400);$bin=base64_decode($m[2],true);if($bin===false)json_response(['error'=>'Dosya çözülemedi.'],400);if(strlen($bin)>30*1024*1024)json_response(['error'=>'Dosya en fazla 30 MB olabilir.'],413);
  if(str_starts_with($mime,'image/') && $mime!=='image/svg+xml') {
    $image=@getimagesizefromstring($bin);
    if(!$image || ($image['mime']??'')!==$mime) json_response(['error'=>'Görselin içeriği belirtilen dosya türüyle eşleşmiyor.'],400);
  }
  if($mime==='application/pdf' && !str_starts_with($bin,'%PDF-')) json_response(['error'=>'Geçersiz PDF dosyası.'],400);
  if($mime==='video/mp4' && substr($bin,4,4)!=='ftyp') json_response(['error'=>'Geçersiz MP4 dosyası.'],400);
  if($mime==='video/webm' && substr($bin,0,4)!==hex2bin('1a45dfa3')) json_response(['error'=>'Geçersiz WebM dosyası.'],400);
  if($mime==='image/svg+xml'&&!safe_svg($bin))json_response(['error'=>'Güvensiz SVG içeriği reddedildi.'],400);
  $name=time().'-'.bin2hex(random_bytes(5)).$allowed[$mime];$dir=__DIR__.'/../uploads';if(!is_dir($dir))mkdir($dir,0755,true);if(file_put_contents($dir.'/'.$name,$bin)===false)json_response(['error'=>'Dosya sunucuya yazılamadı. uploads klasörü yazılabilir olmalı.'],500);
  $id='media_'.bin2hex(random_bytes(8));$url='/uploads/'.$name;$title=secure_text($body['title']??$orig,500);$alt=secure_text($body['altText']??'',500);
  $pdo->prepare('INSERT INTO media(id,file_name,original_name,mime_type,url,size,alt_text,title,focal_x,focal_y,created_at) VALUES(?,?,?,?,?,?,?,?,50,50,NOW())')->execute([$id,$name,$orig,$mime,$url,strlen($bin),$alt,$title]);
  json_response(['id'=>$id,'url'=>$url,'fileName'=>$name,'originalName'=>$orig,'mimeType'=>$mime,'size'=>strlen($bin),'altText'=>$alt,'title'=>$title,'focalX'=>50,'focalY'=>50]);
}
if($method==='GET' && $route==='admin/media'){
  $rows=$pdo->query('SELECT id,file_name AS fileName,original_name AS originalName,mime_type AS mimeType,url,size,alt_text AS altText,title,focal_x AS focalX,focal_y AS focalY,created_at AS createdAt FROM media ORDER BY created_at DESC')->fetchAll();json_response($rows);
}
if($method==='PUT' && preg_match('#^admin/media/([^/]+)$#',$route,$m)){
  $pdo->prepare('UPDATE media SET alt_text=?,title=?,focal_x=?,focal_y=? WHERE id=?')->execute([secure_text($body['altText']??'',500),secure_text($body['title']??'',500),max(0,min(100,(float)($body['focalX']??50))),max(0,min(100,(float)($body['focalY']??50))),$m[1]]);json_response(['ok'=>true]);
}
if($method==='DELETE' && preg_match('#^admin/media/([^/]+)$#',$route,$m)){
  $st=$pdo->prepare('SELECT * FROM media WHERE id=?');$st->execute([$m[1]]);$media=$st->fetch();if(!$media)json_response(['error'=>'Dosya bulunamadı.'],404);
  $state=state_row();if(str_contains($state['draft_json'],$media['url']) || str_contains($state['published_json'],$media['url']))json_response(['error'=>'Bu medya sitede kullanılıyor.'],409);
  @unlink(__DIR__.'/../uploads/'.$media['file_name']);$pdo->prepare('DELETE FROM media WHERE id=?')->execute([$m[1]]);json_response(['ok'=>true]);
}
if($method==='GET' && $route==='admin/link-check'){
  $type=(string)($_GET['type']??'');$target=(string)($_GET['target']??'');$ok=true;
  if($type==='external')$ok=(bool)filter_var($target,FILTER_VALIDATE_URL);elseif($type==='email')$ok=(bool)filter_var(preg_replace('/^mailto:/','',$target),FILTER_VALIDATE_EMAIL);elseif($type==='phone')$ok=(bool)preg_match('/^[+0-9()\s-]{7,}$/',preg_replace('/^tel:/','',$target));elseif($type==='file')$ok=str_starts_with($target,'/uploads/')||str_starts_with($target,'/src/assets/');
  json_response(['ok'=>$ok,'message'=>$ok?'Bağlantı geçerli.':'Bu bağlantının hedefi bulunamadı veya biçimi geçersiz.']);
}
if($method==='POST' && $route==='contact'){
  foreach(['name','phone','email','message'] as $key) if(trim((string)($body[$key]??''))==='') json_response(['error'=>'Lütfen zorunlu alanları doldurun.'],400);
  // Keep contact messages in the existing admin inbox, clearly classified.
  $body=['divisionId'=>'contact','divisionName'=>'İletişim Mesajı','name'=>$body['name'],'company'=>'İletişim formu','phone'=>$body['phone'],'email'=>$body['email'],'notes'=>$body['message']];
  $route='quotes';
}
if($method==='POST' && $route==='quotes'){
  foreach(['divisionId','name','company','phone','email'] as $k)if(trim((string)($body[$k]??''))==='')json_response(['error'=>'Lütfen zorunlu alanları doldurun.'],400);
  if(!filter_var($body['email'],FILTER_VALIDATE_EMAIL))json_response(['error'=>'Geçerli bir e-posta adresi girin.'],400);
  $ref='ASY-'.date('ymdHis').'-'.random_int(10,99);$sql='INSERT INTO quote_requests(reference,division_id,division_name,product_id,product_name,capacity,capacity_label,canopy_type,sector,name,company,phone,email,city,notes,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,\'new\',NOW())';
  $pdo->prepare($sql)->execute([$ref,secure_text($body['divisionId'],80),secure_text($body['divisionName']??'',120),secure_text($body['productId']??'',120),secure_text($body['productName']??'',200),secure_text($body['capacity']??'',120),secure_text($body['capacityLabel']??'',120),secure_text($body['canopyType']??'',80),secure_text($body['sector']??'',80),secure_text($body['name'],160),secure_text($body['company'],200),secure_text($body['phone'],80),secure_text($body['email'],200),secure_text($body['city']??'',160),secure_text($body['notes']??'',5000)]);json_response(['ok'=>true,'reference'=>$ref]);
}
if($method==='GET' && $route==='admin/quotes'){
  $rows=$pdo->query('SELECT * FROM quote_requests ORDER BY id DESC LIMIT 500')->fetchAll();json_response(['items'=>$rows,'dbFile'=>'MySQL: quote_requests']);
}
json_response(['error'=>'API endpoint bulunamadı.','route'=>$route],404);
