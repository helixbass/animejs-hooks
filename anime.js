/**
 * http://anime-js.com
 * JavaScript animation engine
 * @version v2.0.0
 * @author Julian Garnier
 * @copyright © 2017 Julian Garnier
 * Released under the MIT license
**/

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.anime = factory();
  }
}(this, () => {

  // Defaults

  const defaultInstanceSettings = {
    begin: undefined,
    update: undefined,
    complete: undefined,
    loop: 0,
    direction: 'normal',
    autoplay: true
  }

  const defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    easing: 'easeOutElastic',
    elasticity: 500,
    round: 0
  }

  const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skewX', 'skewY'];

  // Utils

  function stringContains(str, text) {
    return str.indexOf(text) > -1;
  }

  const is = {
    arr: a => Array.isArray(a),
    obj: a => stringContains(Object.prototype.toString.call(a), 'Object'),
    svg: a => a instanceof SVGElement,
    dom: a => a.nodeType || is.svg(a),
    str: a => typeof a === 'string',
    fnc: a => typeof a === 'function',
    und: a => typeof a === 'undefined',
    hex: a => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a),
    rgb: a => /^rgb/.test(a),
    hsl: a => /^hsl/.test(a),
    col: a => (is.hex(a) || is.rgb(a) || is.hsl(a))
  }

  // BezierEasing https://github.com/gre/bezier-easing
  // © 2014 Gaëtan Renaudeau – MIT License

  const bezier = (() => {

    const kSplineTableSize = 11;
    const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 };
    function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 };
    function C (aA1)      { return 3.0 * aA1 };

    function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT };
    function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) };

    function binarySubdivide (aX, aA, aB, mX1, mX2) {
      let currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) { aB = currentT } else { aA = currentT };
      } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
      return currentT;
    }

    function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
      for (let i = 0; i < 4; ++i) {
        const currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) return aGuessT;
        const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }

    function bezier(mX1, mY1, mX2, mY2) {

      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) return;
      let sampleValues = new Float32Array(kSplineTableSize);

      if (mX1 !== mY1 || mX2 !== mY2) {
        for (let i = 0; i < kSplineTableSize; ++i) {
          sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
      }

      function getTForX(aX) {

        let intervalStart = 0.0;
        let currentSample = 1;
        const lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }

        --currentSample;

        const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= 0.001) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }

      }

      return (x) => {
        if (mX1 === mY1 && mX2 === mY2) return x;
        if (x === 0) return 0;
        if (x === 1) return 1;
        return calcBezier(getTForX(x), mY1, mY2);
      }

    }

    return bezier;

  })();

  const easings = (() => {

    const names = ['Quad', 'Cubic', 'Quart', 'Quint', 'Sine', 'Expo', 'Circ', 'Back', 'Elastic'];

    // Elastic easing adapted from jQueryUI http://api.jqueryui.com/easings/

    function elastic(t, p) {
      return t === 0 || t === 1 ? t :
      -Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2.0) * Math.asin(1))) * (Math.PI * 2)) / p );
    }

    // Approximated Penner equations http://matthewlein.com/ceaser/
    // © Matthew Lein

    const equations = {
      In: [
        [0.550, 0.085, 0.680, 0.530], /* InQuad */
        [0.550, 0.055, 0.675, 0.190], /* InCubic */
        [0.895, 0.030, 0.685, 0.220], /* InQuart */
        [0.755, 0.050, 0.855, 0.060], /* InQuint */
        [0.470, 0.000, 0.745, 0.715], /* InSine */
        [0.950, 0.050, 0.795, 0.035], /* InExpo */
        [0.600, 0.040, 0.980, 0.335], /* InCirc */
        [0.600, -0.280, 0.735, 0.045], /* InBack */
        elastic /* InElastic */
      ], Out: [
        [0.250, 0.460, 0.450, 0.940], /* OutQuad */
        [0.215, 0.610, 0.355, 1.000], /* OutCubic */
        [0.165, 0.840, 0.440, 1.000], /* OutQuart */
        [0.230, 1.000, 0.320, 1.000], /* OutQuint */
        [0.390, 0.575, 0.565, 1.000], /* OutSine */
        [0.190, 1.000, 0.220, 1.000], /* OutExpo */
        [0.075, 0.820, 0.165, 1.000], /* OutCirc */
        [0.175, 0.885, 0.320, 1.275], /* OutBack */
        (t, f) => 1 - elastic(1 - t, f) /* OutElastic */
      ], InOut: [
        [0.455, 0.030, 0.515, 0.955], /* InOutQuad */
        [0.645, 0.045, 0.355, 1.000], /* InOutCubic */
        [0.770, 0.000, 0.175, 1.000], /* InOutQuart */
        [0.860, 0.000, 0.070, 1.000], /* InOutQuint */
        [0.445, 0.050, 0.550, 0.950], /* InOutSine */
        [1.000, 0.000, 0.000, 1.000], /* InOutExpo */
        [0.785, 0.135, 0.150, 0.860], /* InOutCirc */
        [0.680, -0.550, 0.265, 1.550], /* InOutBack */
        (t, f) => t < .5 ? elastic(t * 2, f) / 2 : 1 - elastic(t * -2 + 2, f) / 2 /* InOutElastic */
      ]
    }

    let functions = {
      linear: bezier(0.250, 0.250, 0.750, 0.750)
    }

    for (let type in equations) {
      equations[type].forEach((f, i) => {
        functions['ease'+type+names[i]] = is.fnc(f) ? f : bezier.apply(this, f);
      });
    }

    return functions;

  })();

  // Strings

  function stringToHyphens(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  function selectString(str) {
    if (is.col(str)) return;
    try {
      let nodes = document.querySelectorAll(str);
      return nodes;
    } catch(e) {
      return;
    }
  }

  // Arrays

  function arrayLength(arr) {
    return arr.length;
  }

  function flattenArray(arr) {
    return arr.reduce((a, b) => a.concat(is.arr(b) ? flattenArray(b) : b), []);
  }

  function toArray(o) {
    if (is.arr(o)) return o;
    if (is.str(o)) o = selectString(o) || o;
    if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
    return [o];
  }

  function arrayContains(arr, val) {
    return arr.some((a) => a === val);
  }

  // Objects

  function objectHas(obj, prop) {
    return obj.hasOwnProperty(prop);
  }

  function cloneObject(o) {
    let clone = {};
    for (let p in o) clone[p] = o[p];
    return clone;
  }

  function replaceObjectProps(o1, o2) {
    let o = cloneObject(o1);
    for (let p in o1) o[p] = objectHas(o2, p) ? o2[p] : o1[p];
    return o;
  }

  function mergeObjects(o1, o2) {
    let o = cloneObject(o1);
    for (let p in o2) o[p] = is.und(o1[p]) ? o2[p] : o1[p];
    return o;
  }

  // Colors

  function hexToRgb(hexValue) {
    const rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hex = hexValue.replace(rgx, (m, r, g, b) => r + r + g + g + b + b );
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);
    return `rgb(${r},${g},${b})`;
  }

  function hslToRgb(hslValue) {
    const hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue);
    const h = parseInt(hsl[1]) / 360;
    const s = parseInt(hsl[2]) / 100;
    const l = parseInt(hsl[3]) / 100;
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    let r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return `rgb(${r * 255},${g * 255},${b * 255})`;
  }

  function colorToRgb(val) {
    if (is.rgb(val)) return val;
    if (is.hex(val)) return hexToRgb(val);
    if (is.hsl(val)) return hslToRgb(val);
  }

  // Units

  function getUnit(val) {
    if (val === 'auto' || is.obj(val)) return;
    return /([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg|rad|turn)?/.exec(val)[2];
  }

  function getTransformUnit(propName) {
    if (stringContains(propName, 'translate')) return 'px';
    if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) return 'deg';
  }

  // Values

  function getCSSValue(el, prop) {
    if (prop in el.style) {
      return getComputedStyle(el).getPropertyValue(stringToHyphens(prop)) || '0';
    }
  }

  function getAnimationType(el, prop) {
    if (is.dom(el) && arrayContains(validTransforms, prop)) return 'transform';
    if (is.dom(el) && (el.getAttribute(prop) || (is.svg(el) && el[prop]))) return 'attribute';
    if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) return 'css';
    if (el[prop] != null) return 'object';
  }

  function getTransformValue(el, propName) {
    const defaultUnit = getTransformUnit(propName);
    const defaultVal = stringContains(propName, 'scale') ? 1 : 0 + defaultUnit;
    const str = el.style.transform;
    if (!str) return defaultVal;
    let match = [];
    let props = [];
    let values = [];
    const rgx = /(\w+)\((.+?)\)/g;
    while (match = rgx.exec(str)) {
      props.push(match[1]);
      values.push(match[2]);
    }
    const value = values.filter((val, i) => props[i] === propName );
    return arrayLength(value) ? value[0] : defaultVal;
  }

  function getOriginalTargetValue(target, propName) {
    switch (getAnimationType(target, propName)) {
      case 'transform': return getTransformValue(target, propName);
      case 'css': return getCSSValue(target, propName);
      case 'attribute': return target.getAttribute(propName);
    }
    return target[propName] || 0;
  }

  function checkValueOperator(value) {
    const matches = /^(\*=|\+=|-=)/.exec(value);
    if (matches) return matches[0];
  }

  function calculateValue(operator, from, to) {
    const x = parseFloat(from);
    const y = parseFloat(to.replace(operator, ''));
    switch (operator[0]) {
      case '+': return x + y;
      case '-': return x - y;
      case '*': return x * y;
    }
  }

  function validateValue(val, unit) {
    if (is.col(val)) return colorToRgb(val);
    const originalUnit = getUnit(val);
    const unitLess = originalUnit ? val.substr(0, arrayLength(val) - arrayLength(originalUnit)) : val;
    return unit ? unitLess + unit : unitLess;
  }

  // Motion path

  function isPath(val) {
    return is.obj(val) && objectHas(val, 'totalLength');
  }

  function setDashoffset(el) {
    const pathLength = el.getTotalLength();
    el.setAttribute('stroke-dasharray', pathLength);
    return pathLength;
  }

  function getPath(path, percent) {
    const el = is.str(path) ? selectString(path)[0] : path;
    const p = percent || 100;
    return function(prop) {
      return {
        el: el,
        property: prop,
        totalLength: el.getTotalLength() * (p / 100)
      }
    }
  }

  function getPathProgress(path, progress) {
    function point(offset = 0) {
      const l = progress + offset >= 1 ? progress + offset : 0;
      return path.el.getPointAtLength(l);
    }
    const p = point();
    const p0 = point(-1);
    const p1 = point(+1);
    switch (path.property) {
      case 'x': return p.x;
      case 'y': return p.y;
      case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
    }
  }

  // Decompose / recompose functions adapted from Animate Plus https://github.com/bendc/animateplus
  // © 2015 Benjamin De Cock

  function decomposeValue(val, unit) {
    const rgx = /-?\d*\.?\d+/g;
    const value = validateValue((isPath(val) ? val.totalLength : val), unit) + '';
    return {
      original: value,
      numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
      strings: value.split(rgx)
    }
  }

  function recomposeValue(numbers, strings) {
    return strings.reduce((a, b, i) => a + numbers[i - 1] + b);
  }

  // Animatables

  function parseTargets(targets) {
    const targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
    return targetsArray.filter((item, pos, self) => self.indexOf(item) === pos);
  }

  function getAnimatables(targets) {
    const parsed = parseTargets(targets);
    return parsed.map((t, i) => {
      return {target: t, id: i, total: arrayLength(parsed)};
    });
  }

  // Properties

  function normalizePropertyTweens(prop, tweenSettings, propIndex) {
    const l = arrayLength(prop);
    if (is.arr(prop)) {
      // // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration) && l > 2 && !propIndex) tweenSettings.duration = tweenSettings.duration / l;
      // Transform [from, to] values shorthand to a valid tween value
      if ((l === 2 && !is.arr(prop[0]) && !is.obj(prop[0]))) prop = {value: prop};
    }
    return toArray(prop).map((v, i) => {
      // Default default value should be applied only on the first tween
      const delay = !i ? tweenSettings.delay : 0;
      // Use path object as a tween value
      let obj = is.obj(v) && !isPath(v) ? v : {value: v};
      // Set default delay value
      obj.delay = obj.delay || delay;
      return obj;
    }).map(k => mergeObjects(k, tweenSettings));
  }

  function getProperties(instanceSettings, tweenSettings, params) {
    let properties = [];
    const settings = mergeObjects(instanceSettings, tweenSettings);
    for (let p in params) {
      if (!objectHas(settings, p) && p !== 'targets') {
        properties.push({
          name: p,
          tweens: normalizePropertyTweens(params[p], tweenSettings, arrayLength(properties))
        });
      }
    }
    return properties;
  }

  // Tweens

  function getFunctionValue(val, animatable) {
    if (!is.fnc(val)) return val;
    return val(animatable.target, animatable.id, animatable.total);
  }

  function normalizeTweenValues(tween, animatable) {
    let t = {};
    for (let p in tween) {
      let value = getFunctionValue(tween[p], animatable);
      if (is.arr(value)) {
        value = value.map(v => getFunctionValue(v, animatable));
        if (arrayLength(value) === 1) value = value[0];
      }
      t[p] = value;
    }
    return t;
  }

  function normalizeEasing(val) {
    return is.arr(val) ? bezier.apply(this, val) : easings[val];
  }

  function normalizeTweens(prop, animatable) {
    let previousTween;
    return prop.tweens.map(function(t) {
      let tween = normalizeTweenValues(t, animatable);
      const tweenValue = tween.value;
      const originalValue = getOriginalTargetValue(animatable.target, prop.name);
      const previousValue = previousTween ? previousTween.to.original : originalValue;
      const from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
      let to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
      const unit = getUnit(to) || getUnit(from) || getUnit(originalValue);
      const operator = checkValueOperator(to);
      if (operator) to = calculateValue(operator, from, to);
      tween.from = decomposeValue(from, unit);
      tween.to = decomposeValue(to, unit);
      tween.start = previousTween ? previousTween.end + tween.delay : tween.delay;
      tween.end = tween.start + tween.duration;
      tween.easing = normalizeEasing(tween.easing);
      tween.elasticity = (1000 - Math.min(Math.max(tween.elasticity, 1), 999)) / 1000;
      if (is.col(tween.from.original)) tween.round = 1;
      previousTween = tween;
      return tween;
    });
  }

  // Tween progress

  function getTweenProgress(tween, time) {
    const elapsed = Math.min(Math.max(time - tween.start, 0), tween.duration);
    let progress = (elapsed / tween.duration);
    const round = tween.round;
    return recomposeValue(tween.to.numbers.map((number, p) => {
      const eased = tween.easing(progress, tween.elasticity);
      const start = tween.from.numbers[p];
      let value = start + eased * (number - start);
      if (isPath(tween.value)) value = getPathProgress(tween.value, value);
      if (round) value = Math.round(value * round) / round;
      return value;
    }), tween.to.strings);
  }

  // Animations

  function createAnimation(animatable, prop) {
    const animType = getAnimationType(animatable.target, prop.name);
    if (animType) {
      const tweens = normalizeTweens(prop, animatable);
      return {
        type: animType,
        property: prop.name,
        animatable: animatable,
        tweens: tweens,
        duration: tweens.reduce((a, b) => a + b.delay + b.duration, 0),
        delay: tweens[0].delay
      }
    }
  }

  function getAnimations(animatables, properties) {
    return flattenArray(animatables.map(animatable => {
      return properties.map(prop => {
        return createAnimation(animatable, prop);
      });
    })).filter(a => !is.und(a));
  }

  const setAnimationProgress = {
    css: (t, p, v) => t.style[p] = v,
    attribute: (t, p, v) => t.setAttribute(p, v),
    object: (t, p, v) => t[p] = v,
    transform: (t, p, v, transforms, id) => {
      if (!transforms[id]) transforms[id] = [];
      transforms[id].push(`${p}(${v})`);
    }
  }

  // Instance

  function toggleInstanceDirection(instance) {
    instance.reversed = !instance.reversed;
  }

  function adjustInstanceTime(instance, time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function syncInstanceChildren(instance, instanceTime) {
    const children = instance.children;
    for (let i = 0; i < arrayLength(children); i++) children[i].seek(instanceTime);
  }

  function setInstanceProgress(instance, time) {
    let transforms = {};
    const animations = instance.animations;
    const currentTime = adjustInstanceTime(instance, time);
    instance.currentTime = currentTime;
    instance.progress = (currentTime / instance.duration) * 100;
    for (let i = 0; i < arrayLength(animations); i++) {
      const anim = animations[i];
      const tweens = anim.tweens;
      const tween = tweens.filter(tween => (tween.start - tween.delay <= currentTime && tween.end >= currentTime))[0];
      const activeTween = tween || tweens[arrayLength(tweens) - 1];
      const progress = getTweenProgress(activeTween, currentTime);
      const animatable = anim.animatable;
      const setProgress = setAnimationProgress[anim.type];
      setProgress(animatable.target, anim.property, progress, transforms, animatable.id);
      anim.currentValue = progress;
    }
    if (transforms) {
      let id; for (id in transforms) {
        instance.animatables[id].target.style.transform = transforms[id].join(' ');
      }
    }
    if (instance.update) instance.update(instance);
    if (instance.children) syncInstanceChildren(instance, currentTime);
  }

  function createNewInstance(params = {}) {
    const instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
    const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
    const animatables = getAnimatables(params.targets);
    const properties = getProperties(instanceSettings, tweenSettings, params);
    const animations = getAnimations(animatables, properties);
    return mergeObjects(instanceSettings, {
      animatables: animatables,
      animations: animations,
      duration: arrayLength(animations) ? Math.max.apply(Math, animations.map((anim) => anim.duration )) : tweenSettings.duration,
      delay: arrayLength(animations) ? Math.min.apply(Math, animations.map((anim) => anim.delay )) : tweenSettings.delay,
      currentTime: 0,
      progress: 0,
      paused: true,
      began: false,
      completed: false,
      remaining: instanceSettings.loop
    })
  }

  // Core

  let instances = [];
  let running = [];
  let raf = 0;

  const engine = (() => {
    function play() { raf = requestAnimationFrame(step); };
    function step(t) {
      if (arrayLength(running)) {
        for (let i = 0; i < arrayLength(running); i++) running[i].tick(t);
        play();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    return play;
  })();

  // Public

  function anime(params) {

    let startTime, lastTime = 0;
    let instance = createNewInstance(params);

    instance.tick = function(now) {
      if (!startTime) startTime = now;
      const currentTime = (lastTime + now - startTime) * anime.speed;
      const instanceTime = Math.min(Math.max(currentTime, 0), instance.duration);
      setInstanceProgress(instance, instanceTime);
      if (!instance.began && instanceTime >= instance.delay) {
        instance.began = true;
        if (instance.begin) instance.begin(instance);
      }
      if (instanceTime >= instance.duration) {
        if (instance.remaining && !isNaN(parseFloat(instance.remaining))) instance.remaining--;
        if (instance.remaining) {
          startTime = now;
          if (instance.direction === 'alternate') toggleInstanceDirection(instance);
        } else {
          instance.completed = true;
          instance.began = false;
          instance.pause();
          if (instance.complete) instance.complete(instance);
        }
        lastTime = 0;
      }
    }

    instance.seek = function(time) {
      const now = adjustInstanceTime(instance, time);
      setInstanceProgress(instance, now);
    }

    instance.pause = function() {
      const i = running.indexOf(instance);
      if (i > -1) running.splice(i, 1);
      instance.paused = true;
    }

    instance.play = function() {
      if (!instance.paused) return;
      instance.paused = false;
      startTime = 0;
      lastTime = instance.completed ? 0 : adjustInstanceTime(instance, instance.currentTime);
      if (instance.direction === 'reverse' && !instance.reversed) toggleInstanceDirection(instance);
      if (instance.direction === 'alternate') {
        if (instance.reversed && !instance.remaining % 2) toggleInstanceDirection(instance);
        if (!instance.remaining) instance.remaining = 2;
      }
      running.push(instance);
      if (!raf) engine();
    }

    instance.restart = function() {
      instance.pause();
      if (instance.reversed) toggleInstanceDirection(instance);
      instance.completed = false;
      instance.began = false;
      instance.remaining = instance.loop;
      instance.seek(0);
      instance.play();
    }

    if (instance.autoplay) instance.restart();
    instances.push(instance);

    return instance;

  }

  // Remove targets from animation

  function removeTargets(targets) {
    const targetsArray = parseTargets(targets);
    for (let i = arrayLength(running)-1; i >= 0; i--) {
      const instance = running[i];
      const animations = instance.animations;
      for (let a = arrayLength(animations)-1; a >= 0; a--) {
        if (arrayContains(targetsArray, animations[a].animatable.target)) {
          animations.splice(a, 1);
          if (!arrayLength(animations)) instance.pause();
        }
      }
    }
  }

  // Timeline

  function timeline(params = {easing: 'linear'}) {
    let group = anime(params);
    group.children = [];
    group.add = (instance) => {
      toArray(instance).forEach(ins => {
        if (ins.duration > group.duration) group.duration = ins.duration;
        ins.pause();
        group.children.push(ins);
      });
    }
    return group;
  }

  anime.version = '2.0.0';
  anime.speed = 1;
  anime.active = running;
  anime.list = instances;
  anime.remove = removeTargets;
  anime.getValue = getOriginalTargetValue;
  anime.path = getPath;
  anime.pathDashoffset = setDashoffset;
  anime.bezier = bezier;
  anime.easings = easings;
  anime.timeline = timeline;
  anime.random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  return anime;

}));
