(function () {
  var mb = document.getElementById('mb'), mp = document.getElementById('mp');

  function setMenu(open) {
    mp.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    mb.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    if (open) { var a = mp.querySelector('a'); if (a) a.focus(); }
  }
  mb.addEventListener('click', function () { setMenu(mp.hidden); });
  mp.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    // 今いるページを選んだときは、移動せずにメニューだけ閉じる
    if (a) { if (a.classList.contains('current')) e.preventDefault(); setMenu(false); }
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mp.hidden) { setMenu(false); mb.focus(); } });
  // 戻る・進むで復元されたときにメニューが開いたままにならないように
  addEventListener('pageshow', function () { setMenu(false); });

  // 今いるページの項目に印を付ける(スマホのメニューと、PCの上部ナビの両方)
  var here = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('#mp a, .topnav a'), function (a) {
    if (a.getAttribute('href') === here) { a.classList.add('current'); a.setAttribute('aria-current', 'page'); }
  });
  Array.prototype.forEach.call(document.querySelectorAll('.topnav a'), function (a) {
    a.addEventListener('click', function (e) { if (a.classList.contains('current')) e.preventDefault(); });
  });

  // コピーボタン: 表示は rise[at]chocola.top でも、コピーするときは @ に戻す(HTMLに生のアドレスを書かないため)
  Array.prototype.forEach.call(document.querySelectorAll('button.copy'), function (btn) {
    var addr = btn.parentNode.querySelector('.addr');
    if (!addr) return;
    var label = btn.querySelector('.cp-b');
    // 文字を1つずつ包んで、順番に動かせるようにする
    var split = function (el, text) {
      el.textContent = '';
      Array.prototype.forEach.call(text, function (ch, i) {
        var c = document.createElement('span'); c.className = 'ch'; c.style.setProperty('--i', i); c.textContent = ch; el.appendChild(c);
      });
    };
    split(btn.querySelector('.cp-a'), 'コピー'); split(label, 'コピーしました');

    var timer;
    var done = function (text) {
      btn.classList.remove('done');
      split(label, text);
      void label.offsetWidth;  // 作り直した文字を一度「下にある状態」として描画させてから、動かす
      btn.classList.add('done');
      clearTimeout(timer); timer = setTimeout(function () { btn.classList.remove('done'); }, 1800);
    };
    var value = function () { return addr.textContent.replace('[at]', '@'); };
    var fallback = function () {
      // クリップボードAPIが使えないときは、隠した入力欄からコピーする
      var t = document.createElement('textarea');
      t.value = value(); t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t);
      done(ok ? 'コピーしました' : '選択できません');
    };
    btn.addEventListener('click', function () {
      try { navigator.clipboard.writeText(value()).then(function () { done('コピーしました'); }, fallback); } catch (e) { fallback(); }
    });
  });
})();
