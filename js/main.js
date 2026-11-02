(function () {
  'use strict';
  var each = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };

  // 今いるページ: URLではなく body の data-view で判断する(本番は /about のように .html なしで開かれるため)
  var view = document.body.getAttribute('data-view');
  var here = view === 'home' ? 'index.html' : view + '.html';
  each('#mp a, .topnav a', function (a) {
    if (a.getAttribute('href') !== here) return;
    a.classList.add('current');
    a.setAttribute('aria-current', 'page');
    a.addEventListener('click', function (e) { e.preventDefault(); });  // 同じページは読み込み直さない
  });

  // スマホのメニュー
  var mb = document.getElementById('mb'), mp = document.getElementById('mp'), wrap = document.querySelector('.wrap');
  function setMenu(open) {
    mp.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (wrap) wrap.inert = open;  // 開いている間は、裏の内容にTabで移動しない
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    mb.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    if (open) { var a = mp.querySelector('a'); if (a) a.focus(); }
  }
  mb.addEventListener('click', function () { setMenu(mp.hidden); });
  mp.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mp.hidden) { setMenu(false); mb.focus(); } });
  // 戻る・進むで復元されたとき、PC幅に変わったとき(メニューが出ない幅)は閉じる
  addEventListener('pageshow', function () { setMenu(false); });
  var pc = matchMedia('(min-width: 821px)');
  var onWide = function () { if (pc.matches && !mp.hidden) setMenu(false); };
  if (pc.addEventListener) pc.addEventListener('change', onWide); else pc.addListener(onWide);

  // コピーボタン: 表示は rise[at]chocola.top、コピーするときだけ @ に戻す(HTMLに生のアドレスを書かないため)
  each('button.copy', function (btn) {
    var addr = btn.parentNode.querySelector('.addr');
    var status = btn.parentNode.querySelector('[role="status"]');
    var label = btn.querySelector('.cp-b');
    if (!addr || !label) return;
    // 文字を1つずつ包んで、順番に動かせるようにする
    var split = function (el, text) {
      el.textContent = '';
      Array.prototype.forEach.call(text, function (ch, i) {
        var c = document.createElement('span');
        c.className = 'ch'; c.style.setProperty('--i', i); c.textContent = ch;
        el.appendChild(c);
      });
    };
    split(btn.querySelector('.cp-a'), 'コピー');
    split(label, 'コピーしました');

    var timer;
    var done = function (text) {
      btn.classList.remove('done');
      split(label, text);
      void label.offsetWidth;  // 作り直した文字を一度「下にある状態」で描画させてから動かす
      btn.classList.add('done');
      if (status) status.textContent = text;  // 読み上げソフト向け
      clearTimeout(timer);
      timer = setTimeout(function () { btn.classList.remove('done'); if (status) status.textContent = ''; }, 1800);
    };
    var value = function () { return addr.textContent.replace('[at]', '@'); };
    var fallback = function () {
      // クリップボードAPIが使えないときは、隠した入力欄からコピーする
      var t = document.createElement('textarea');
      t.value = value(); t.setAttribute('readonly', '');
      t.style.position = 'fixed'; t.style.top = '0'; t.style.left = '0'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t);
      done(ok ? 'コピーしました' : 'コピーできません');
    };
    btn.addEventListener('click', function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value()).then(function () { done('コピーしました'); }, fallback);
      } else fallback();
    });
  });
})();
