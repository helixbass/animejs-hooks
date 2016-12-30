var demoEls = document.querySelectorAll('.demo');
var codeOutputEl = document.querySelector('.code-output');
var demos = [];

function outputCode(code) {
  codeOutputEl.innerHTML = code;
  hljs.highlightBlock(codeOutputEl);
}

function createDemo(el) {
  var demo = {};
  var scriptEl = el.querySelector('script');
  var title = el.querySelector('h3').innerHTML;
  var demoCode = scriptEl ? scriptEl.innerHTML : '';
  var code = '// '+title+'<br>'+demoCode;
  var id = el.id;
  var demoAnim = window[id];
  function highlightDemo() {
    if (!el.classList.contains('active')) {
      for (var i = 0; i < demos.length; i++) {
        var d = demos[i];
        d.el.classList.remove('active');
        d.anim.pause();
      }
      history.pushState(null, null, '#'+id);
      outputCode(code);
      el.classList.add('active');
    }
    demoAnim.restart();
  }
  function enterDemo() {
    if (!el.classList.contains('active')) {
      demoAnim.play();
    }
  }
  function leaveDemo() {
    if (!el.classList.contains('active')) {
      demoAnim.pause();
      demoAnim.seek(0);
    }
  }
  el.addEventListener('click', highlightDemo);
  el.addEventListener('mouseenter', enterDemo);
  el.addEventListener('mouseleave', leaveDemo);
  demoAnim.pause();
  demo.el = el;
  demo.id = id;
  demo.anim = demoAnim;
  demo.highlight = highlightDemo;
  demos.push(demo);
}

for (var i = 0; i < demoEls.length; i++) {
  createDemo(demoEls[i]);
}

(function updateDemos() {
  var hash = window.location.hash;
  if (hash) {
    var id = hash.replace('#','');
    var demo = demos.filter(function(a) { return a.id === id})[0];
    if (demo) demo.highlight();
  } else {
    demos[0].highlight();
  }
})();
