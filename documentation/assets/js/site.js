var fireworks = (function() {

  function getFontSize() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  var canvasEl = document.querySelector('.fireworks');
  var ctx = canvasEl.getContext('2d');
  var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
  var numberOfParticules = 24;
  var distance = 200;
  var x = 0;
  var y = 0;
  var animations = [];
  var targets = [];
  var colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C'];

  function setCanvasSize() {
    canvasEl.width = window.innerWidth * 2;
    canvasEl.height = window.innerHeight * 2;
    canvasEl.style.width = window.innerWidth + 'px';
    canvasEl.style.height = window.innerHeight + 'px';
    canvasEl.getContext('2d').scale(2, 2);
  }

  function updateCoords(e) {
    x = e.clientX || e.touches[0].clientX;
    y = e.clientY || e.touches[0].clientY;
  }

  function createCircle(x,y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = colors[anime.random(0, colors.length - 1)];
    p.color = '#FFF';
    p.radius = 0.1;
    p.alpha = 1;
    p.lineWidth = 6;
    p.draw = function() {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.lineWidth = p.lineWidth;
      ctx.strokeStyle = p.color;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    return p;
  }

  function createParticule(x,y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = colors[anime.random(0, colors.length - 1)];
    p.radius = anime.random(getFontSize(), getFontSize() * 2.25);
    p.draw = function() {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    return p;
  }

  function createParticles(x,y) {
    var particules = [];
    for (var i = 0; i < numberOfParticules; i++) {
      var p = createParticule(x, y);
      particules.push(p);
      targets.push(p);
    }
    return particules;
  }

  function removeTargets(animation) {
    for (var i = 0; i < animation.animatables.length; i++) {
      var index = targets.indexOf(animation.animatables[i].target);
      if (index > -1) targets.splice(index, 1);
    }
  }

  function removeAnimation(animation) {
    removeTargets(animation);
    var index = animations.indexOf(animation);
    if (index > -1) animations.splice(index, 1);
    if (!animations.length) mainLoop.pause();
  }

  function getParticulePos(p) {
    var angle = anime.random(0, 360) * Math.PI / 180;
    var radius = anime.random(-distance, distance);
    return {
      x: p.x + radius * Math.cos(angle),
      y: p.y + radius * Math.sin(angle)
    }
  }

  function animateParticules(x, y) {
    var particules = createParticles(x, y);
    var circle = createCircle(x, y);
    targets.push(circle);
    particules.forEach(function(p) {
      var position = getParticulePos(p);
      var particuleAnimation = anime({
        targets: p,
        x: position.x,
        y: position.y,
        radius: 0.1,
        duration: function() { return anime.random(1200, 1800); },
        easing: 'easeOutExpo',
        complete: removeAnimation
      });
      animations.push(particuleAnimation);
    });
    var circleAnimation = anime({
      targets: circle,
      radius: function() { return anime.random(getFontSize() * 8.75, getFontSize() * 11.25); },
      lineWidth: 0,
      alpha: {
        value: 0,
        easing: 'linear',
        duration: function() { return anime.random(400, 600); }
      },
      duration: function() { return anime.random(1200, 1800); },
      easing: 'easeOutExpo',
      complete: removeAnimation
    });
    animations.push(circleAnimation);
  }

  var mainLoop = anime({
    duration: Infinity,
    update: function() {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      for (var t = 0; t < targets.length; t++ ) {
        targets[t].draw();
      }
    }
  });

  document.addEventListener(tap, function(e) {
    updateCoords(e);
    mainLoop.play();
    animateParticules(x, y);
    ga('send', 'event', 'Fireworks', 'Click');
  }, false);

  window.addEventListener('resize', setCanvasSize, false);

  return {
    setCanvasSize: setCanvasSize,
    animateParticules: animateParticules
  }

})();

var logoAnimation = (function() {

  var logoEl = document.querySelector('.logo-animation');
  var buttonEls = document.querySelectorAll('.button');
  var pathEls = document.querySelectorAll('.logo-animation path:not(.icon-curve)');
  var innerWidth = window.innerWidth;
  var maxWidth = 740;
  var logoScale = innerWidth <= maxWidth ? innerWidth / maxWidth : 1;
  var logoTimeline = anime.timeline({ autoplay: false });

  logoEl.style.transform = 'translateY(50px) scale('+logoScale+')';

  function createBouncyButton(el) {
    var pathEl = el.querySelector('path');
    var spanEl = el.querySelector('span');
    pathEl.setAttribute('stroke-dashoffset', anime.setDashoffset(pathEl));
    var animation = anime.timeline({
      autoplay: false
    });
    animation
    .add({
      targets: pathEl,
      d: 'M10,10 C10,10 50,7 90,7 C130,7 170,10 170,10 C170,10 172,20 172,30 C172,40 170,50 170,50 C170,50 130,53 90,53 C50,53 10,50 10,50 C10,50 8,40 8,30 C8,20 10,10 10,10 Z',
      duration: 150,
      easing: 'easeInOutSine',
      offset: 0
    })
    .add({
      targets: spanEl,
      scale: 1.1,
      duration: 150,
      easing: 'easeInOutSine',
      offset: 0
    })
    el.onmouseenter = function() {
      if (animation.reversed) animation.reverse();
      animation.play();
    }
    el.onmouseleave = function() {
      if (!animation.reversed) animation.reverse();
      animation.play();
    }
  }

  for (var i = 0; i < buttonEls.length; i++) {
    var el = buttonEls[i];
    createBouncyButton(el);
  }

  for (var i = 0; i < pathEls.length; i++) {
    var el = pathEls[i];
    el.setAttribute('stroke-dashoffset', anime.setDashoffset(el));
  }

  logoTimeline
    .add({
      targets: '.dot-e',
      translateX: [
        { value: -600, duration: 520, delay: 200, easing: 'easeInQuart' },
        { value: [-100, 0], duration: 500, delay: 1000, easing: 'easeOutQuart' }
      ],
      scale: [
        { value: [0, 1], duration: 200, easing: 'easeOutBack' },
        { value: 0, duration: 20, delay: 500, easing: 'easeInQuart' },
        { value: 1, duration: 200, delay: 1000, easing: 'easeOutQuart' },
        { value: 0, duration: 400, delay: 500, easing: 'easeInBack' }
      ],
      offset: 0
    })
    .add({
      targets: '.dot-i',
      translateY: { value: [-200, 0], duration: 500, elasticity: 400 },
      scale: [
        { value: [0, 1], duration: 100, easing: 'easeOutQuart' },
        { value: 0, duration: 400, delay: 1400, easing: 'easeInBack' }
      ],
      delay: 1200,
      offset: 0
    })
    .add({
      targets: '.fill.in',
      strokeDashoffset: {
        value: [anime.setDashoffset, 0],
        duration: 600,
        delay: function(el, i, t) { return 700 + ( i * 100 ); },
        easing: 'easeOutQuart'
      },
      stroke: {
        value: ['#FFF', function(el) { return anime.getValue(el.parentNode, 'stroke') } ],
        duration: 500,
        delay: 500,
        easing: 'easeInQuad'
      },
      opacity: {
        value: 0,
        duration: 1,
        delay: function(el, i, t) { return 1900 + ( i * 80 ); },
      },
      offset: 0
    })
    .add({
      targets: '.fill.out',
      strokeDashoffset: [
        { value: [anime.setDashoffset, anime.setDashoffset], duration: 1890 },
        {
          value: [0, anime.setDashoffset],
          duration: 800,
          delay: function(el, i) { return (i * 80); },
          easing: 'easeInQuart'
        }
      ],
      offset: 0
    })
    .add({
      targets: '.line.out',
      strokeDashoffset: {
        value: [0, anime.setDashoffset],
        duration: 1200,
        delay: function(el, i, t) { return 2500 + ( i * 100 ); },
        easing: 'easeInQuart'
      },
      strokeWidth: {
        value: [0, 2],
        delay: function(el, i, t) { return 2000 + ( i * 100 ); },
        duration: 200,
        easing: 'linear'
      },
      offset: 0
    })
    .add({
      targets: '.icon',
      opacity: { value: 1, duration: 10, delay: 2800, easing: 'linear' },
      translateY: { value: 60, duration: 800 },
      delay: 4200,
      offset: 0
    })
    .add({
      targets: '.icon-line',
      strokeDashoffset: [
        { value: [anime.setDashoffset, anime.setDashoffset], duration: 3000 },
        { value: 0, duration: 1200, easing: 'easeInOutQuart' }
      ],
      strokeWidth: {
        value: [8, 2],
        delay: 3000,
        duration: 800,
        easing: 'easeInQuad'
      },
      stroke: {
        value: ['#FFF', function(el) { return anime.getValue(el, 'stroke') } ],
        duration: 800,
        delay: 3400,
        easing: 'easeInQuad'
      },
      offset: 0
    })
    .add({
      targets: ['.icon-text path', '.icon-text polygon'],
      translateY: [50, 0],
      opacity: { value: [0, 1], duration: 100, easing: 'linear' },
      delay: function(el, i, t) { return 4200 + ( i * 20 ); },
      offset: 0
    })
    .add({
      targets: ['.logo-animation', '.description', '.button', '.credits'],
      translateY: [50, 0],
      scale: 1,
      opacity: 1,
      easing: 'easeOutExpo',
      delay: function(el, i) {
        return i * 150
      },
      offset: '-=250'
    })
    .add({
      targets: '.button path',
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutQuart',
      duration: 500,
      delay: function(el, i) { return i * 250; },
      offset: '-=1250'
    })


  function init() {
    document.body.classList.add('ready');
    logoTimeline.play();
  }

  return {
    init: init
  }

})();

window.onload = function() {
  logoAnimation.init();
  fireworks.setCanvasSize();
}