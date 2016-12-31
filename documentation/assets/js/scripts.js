var navigationEl = document.querySelector('.navigation');
var articleEls = document.querySelectorAll('article');
var codeOutputEl = document.querySelector('.code-output');
var demos = [];

function getScrollTop() {
  return document.body.scrollTop || document.documentElement.scrollTop;
}

function scrollTo(selector, offset, cb) {
  var offset = offset || 0;
  var el = document.querySelector(selector);
  var rect = el.getBoundingClientRect();
  var top = getScrollTop();
  var value = rect.top + top;
  var scrollAnim = anime({
    targets: {scroll: top},
    scroll: value - offset,
    duration: 500,
    easing: 'easeInOutQuart',
    update: function(a) {
      window.scroll(0, a.animations[0].currentValue);
    },
    complete: function() {
      if (cb) cb();
    }
  });
}

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
      var linkEls = document.querySelectorAll('.demo-link');
      for (var i = 0; i < demos.length; i++) {
        var d = demos[i];
        d.el.classList.remove('active');
        linkEls[i].classList.remove('active');
        d.anim.pause();
      }
      history.pushState(null, null, '#'+id);
      outputCode(code);
      var linkEl = document.querySelector('a[href="#'+id+'"]');
      linkEl.classList.add('active');
      el.classList.add('active');
      scrollTo('#'+id);
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
  return {
    el: el,
    title: title,
    id: id,
    anim: demoAnim,
    highlight: highlightDemo
  }
}

function createLinksSection(articleEl) {
  var articleId = articleEl.id;
  var articleTitle = articleEl.querySelector('h2').innerHTML;
  var colorClass = articleEl.classList[0];
  var ulEl = document.createElement('ul');
  var liEl = document.createElement('li');
  var sectionLinkEl = document.createElement('a');
  sectionLinkEl.setAttribute('href', '#'+articleId);
  sectionLinkEl.innerHTML = articleTitle;
  liEl.appendChild(sectionLinkEl);
  ulEl.appendChild(liEl);
  ulEl.classList.add(colorClass);
  return ulEl;
}

function createDemoLink(demo) {
  var liEl = document.createElement('li');
  var demoLinkEl = document.createElement('a');
  demoLinkEl.setAttribute('href', '#'+demo.id);
  demoLinkEl.innerHTML = demo.title;
  demoLinkEl.classList.add('demo-link');
  demoLinkEl.addEventListener('click', demo.highlight);
  liEl.appendChild(demoLinkEl);
  return liEl;
}

var fragment = document.createDocumentFragment();
for (var i = 0; i < articleEls.length; i++) {
  var articleEl = articleEls[i];
  var linksSectionEl = createLinksSection(articleEl);
  var demoEls = articleEl.querySelectorAll('.demo');
  for (var d = 0; d < demoEls.length; d++) {
    var demo = createDemo(demoEls[d]);
    var demoLinkEl = createDemoLink(demo);
    linksSectionEl.appendChild(demoLinkEl);
    demos.push(demo);
  }
  fragment.appendChild(linksSectionEl);
}
navigationEl.appendChild(fragment);

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
