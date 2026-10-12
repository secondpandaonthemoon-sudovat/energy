(function () {
  'use strict';
  var completed = false;
  var timer;
  function fail(error) {
    if (completed) return;
    clearTimeout(timer);
    var status = document.getElementById('startup-status');
    var panel = document.getElementById('startup-error');
    var message = document.getElementById('startup-message');
    if (status) status.textContent = 'Site başlatılamadı.';
    if (panel) panel.hidden = false;
    if (message) message.textContent = location.protocol === 'file:'
      ? 'Dosya doğrudan açılmış. XAMPP Apache üzerinden http://localhost/klasör-adı/ adresini kullanın.'
      : 'Uygulama yüklenemedi. assets klasörüyle index dosyalarını birlikte güncelleyin ve Ctrl+F5 ile yeniden açın.';
    console.error('ASAY startup failed', error);
  }
  window.asayStartup = {
    ready: function () { completed = true; clearTimeout(timer); },
    fail: fail
  };
  if (location.protocol === 'file:') { fail(new Error('HTTP server required')); return; }
  timer = setTimeout(function () { fail(new Error('Application startup timed out')); }, 15000);
  import(new URL('assets/app.js?v=4-localhost', document.baseURI).href).catch(fail);
})();
