var fireworks = (function() {

  function getFontSize() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  var canvasEl = document.querySelector('.fireworks');
  var ctx = canvasEl.getContext('2d');
  var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
  var numberOfParticules = 24;
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
    p.alpha = .5;
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
    var value = anime.random(50, 180);
    var radius = [-1, 1][anime.random(0, 1)] * value;
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
      radius: anime.random(getFontSize() * 8, getFontSize() * 12),
      lineWidth: 0,
      alpha: {
        value: 0,
        easing: 'linear',
        duration: anime.random(600, 800),  
      },
      duration: anime.random(1200, 1800),
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
    window.human = true;
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