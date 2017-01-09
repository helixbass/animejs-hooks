# [anime.js](http://anime-js.com) ![](https://badge-size.herokuapp.com/juliangarnier/anime/master/anime.min.js?&color=319BFF)

<img src="http://anime-js.com/v2/documentation/assets/img/documentation/animejs-logo.gif" width="100%" />

*Anime* `(/ˈæn.ə.meɪ/)` is a lightweight JavaScript animation library. It works with CSS Properties, individual Transforms, SVG or any DOM attributes, and JavaScript Objects.

**Main features**

* Keyframes
* Timeline
* Playback controls
* Function based values
* SVG Animations
* Custom easing functions

**Demos and examples**

* [CodePen demos and examples](http://codepen.io/collection/b392d3a52d6abf5b8d9fda4e4cab61ab/)
* [juliangarnier.com](http://juliangarnier.com)
* [anime-js.com](http://anime-js.com)
* [kenzo.com/en/thejunglebook](https://kenzo.com/en/thejunglebook)
* [Stress test](http://codepen.io/juliangarnier/pen/9aea7f045d7db301eab41bc09dcfc04d?editors=0010)

**Browser support**

| Chrome | Safari | IE / Edge | Firefox | Opera |
| --- | --- | --- | --- | --- |
| 24+ | 7+ | 10+ | 32+ | 15+ |

## Usage

```bash
$ npm install animejs
# OR
$ bower install animejs
```

```javascript
import anime from 'animejs'
```

Or manually [download](https://github.com/juliangarnier/anime/archive/master.zip) and link `anime.min.js` in your HTML:

```html
<script src="anime.min.js"></script>
```

Then start animating:

```javascript
anime({
  targets: 'div',
  translateX: [
    { value: 100, duration: 1200 },
    { value: 0, duration: 800 }
  ],
  rotate: 180,
  backgroundColor: '#FFF',
  duration: 2000,
  loop: true
});
```

# API

## Targets

The `targets` property defines the elements or JS Objects to animate.

| Type | Examples
| --- | ---
| CSS Selectors | `'div'`, `'.item'`, `'path'`
| DOM Element | `document.querySelector('.thing')`
| NodeList | `document.querySelectorAll('.thing')`
| JavaScript Object | `{prop1: 100, prop2: 200}`
| JavaScript Array | `['.thing-1', 'div']`

➜ [Targets code examples](http://anime-js.com/v2/documentation/#cssSelector)

## Animatable properties

| Type | Examples
| --- | ---
| CSS | `opacity`, `backgroundColor`, `fontSize` ...
| Transforms | `translateX`, `rotate`, `scale` ...
| Object properties | Any Object property containing some numerical values
| DOM attributes | Any DOM attributes containing some numerical values
| SVG attributes | Any SVG attributes containing some numerical values

➜ [Properties code examples](http://anime-js.com/v2/documentation/#cssDemo)

### CSS

Animate any CSS properties:

```javascript
anime({
  targets: 'div',
  left: '90%', // Animate all divs left position to 90%
  opacity: .5, // Animate all divs opacity to .5
  backgroundColor: '#FFF' // Animate all divs background color to #FFF
});
```

➜ [CSS Property code example](http://anime-js.com/v2/documentation/#cssDemo)

### Transforms

CSS transforms can be animated individually :

```javascript
anime({
  targets: 'div',
  translateX: 250, // Animate all divs translateX transform property to 250px
  scale: 1.5, // Animate all divs scale transform property to 1.5
  rotate: '1turn' // Animate all divs rotate transform property to 1 turn
});
```

➜ [CSS Transforms code example](http://anime-js.com/v2/documentation/#transformsDemo)

### Object properties

Any Object property containing a numerical values can be animated :

```javascript
var myObject = {
  prop1: 0,
  prop2: '0%'
}

anime({
  targets: myObject,
  prop1: 50, // Animate the 'prop1' property from myObject to 50
  prop2: '100%' // Animate the 'prop2' property from myObject to 100%
});
```

➜ [Object properties code example](http://anime-js.com/v2/documentation/#objectPropDemo)

### DOM Attributes

Any DOM Attribute containing a numerical values can be animated :

```html
<input value="0">
```

```javascript
anime({
  targets: input,
  value: 1000 // Animate the input value to 1000
});
```

➜ [DOM Attribute code example](http://anime-js.com/v2/documentation/#domAttributes)

### SVG Attributes

<img src="http://anime-js.com/v2/documentation/assets/img/documentation/doc-prop-svg.gif" width="332" />

Any SVG Attribute containing a numerical values can be animated :

```html
<svg width="128" height="128" viewBox="0 0 128 128">
  <polygon points="64 68.73508918222262 8.574 99.9935923731656 63.35810017508558 67.62284396863708 64 3.993592373165592 64.64189982491442 67.62284396863708 119.426 99.9935923731656"></polygon>
</svg>
```

```javascript
anime({
  targets: 'polygon',
  points: '64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96'
});
```

➜ [DOM Attribute code example](http://anime-js.com/v2/documentation/#svgAttributes)

## Property parameters

Control duration, delay and easing for each property animations.
Can be set to globally, or independently to each properties :

| Names | Defaults | Types | Info
| --- | --- | --- | ---
| duration | `1000` | `number`, `function`  | millisecond
| delay | `0` | `number`, `function`   | millisecond
| easing | `'easeOutElastic'` | `function`  | See Easing functions
| elasticity | `500` | `number`, `function` | Range [0 - 1000]
| round | `false` | `number`, `boolean`, `function` | Power of 10

```javascript
anime({
  targets: 'div',
  translateX: {
    value: 100,
    duration: 1000 // Translate X to 100px in 1000ms
  },
  rotate: {
    value: 180,
    delay: 500  // Start rotation after 500ms for 1500ms
  },
  backgroundColor: '#FFF', // Inherit duration 1500ms
  duration: 1500 // Set 1500ms to all properties that doesn't specify a duration
});
```

➜ [Property parameters code examples](http://anime-js.com/v2/documentation/#duration)

## Function based property parameters

Every property parameters can be a function with 3 arguments : `function(target, index, targetsLength)`.
Useful to set different animation values to specific targets :

```javascript
anime({
  targets: 'div',
  translateX: 100,
  duration: (el) => el.getAttribute(data-duration), // Get the data-duration attribute from each animated div
  delay: (el, i) => i * 100, // Increase delay for each div
  elasticity: (el, i, l) => 200 + ((l - i) * 50) // Reduce the elasticity for each div
});
```

➜ [Function based parameters code examples](http://anime-js.com/v2/documentation/#functionBasedDuration)

## Animation parameters

Parameters relative to the animation to control the direction, number of loops and autoplay.

| Names | Defaults | Types
| --- | --- | ---
| autoplay | `true` | `boolean`
| loop | `false` | `number`, `boolean`
| direction | `'normal'` | `'normal'`, `'reverse'`, `'alternate'`

```javascript
anime({
  targets: 'div',
  translateX: 100,
  duration: 2000,
  loop: 3, // Play the animation 3 times
  direction: 'reverse' // Play the animation in reverse
  autoplay: false // Prevent the animation from starting right away
});
```

➜ [Animation parameters code examples](http://anime-js.com/v2/documentation/#alternate)

## Property values

### Single value

Defines the end value of the animation.
Anime will automatically try to get the 'from' value of the animated target, and fallback to default value, or 0 if needed.

| Types | Examples | Infos
| --- | --- | ---
| Number | `100`, | -
| String | `'10em'`, `'1turn'`, `'M21 1v160'` | Must contains at least one numerical value
| Relative values | `'+=100px'`, `'-=20em'`, `'*=4'` | Add, subtract or multiply the original property value
| Colors | `'#FFF'`, `'rgb(255,0,0)'`, `'hsl(100, 20%, 80%)'` | Accepts 3 or 6 hex digit, rgb, or hsl values

➜ [Values code examples](http://anime-js.com/v2/documentation/#unitlessValue)

```javascript
anime({
  targets: 'div',
  translateX: 100, // Will add 'px' by default (from 0px to 100px)
  rotate: '1turn', // Will use 'turn' as unit (from 0turn to 1turn)
  scale: '*=2', // Will multiply the current scale value by 2 (from 1 to 1*2)
  backgroundColor: '#FFF', // Will transition the background color to #FFF (from 'rgb(0,0,0)' to 'rgb(255,255,255)')
  duration: 1500
});
```

### From > To values

Force the animation to start at a certain value.

```javascript
anime({
  targets: 'div',
  translateX: [100, 200], // Translate X from 100 to 200
  rotate: ['.5turn', '1turn'], // Rotate from 180deg to 360deg
  scale: ['*=2', 1], // Scale from 2 times the original value to 1,
  backgroundColor: ['rgb(255,0,0)', '#FFF'], // Will transition the background color from red to white
  duration: 1500
});
```

➜ [Specific initial value code example](http://anime-js.com/v2/documentation/#specificInitialValue)

### Function based values

Like property parameters, every values can be a function with 3 arguments: `function(target, index, targetsLength)`

```javascript
anime({
  targets: 'div',
  translateX: (el) => el.getAttribute(data-x), // Get the data-x attribute from each animated div
  translateY: (el, i) => 200 + (i * 10), // Increase translate Y value for each divs
  rotate: (el, i, l) => (l - i) + 'turn' // Reduce the number of turns for each div
});
```

➜ [Function based value code example](http://anime-js.com/v2/documentation/#functionBasedPropVal)

## Keyframes

### Basic keyframes

Properties can accept multiple values that are played in sequence. All the above values can be used in a sequence.

```javascript
anime({
  targets: 'div',
  translateX: [
	  { value: 400 },
	  { value: 200 },
	  { value: 0 }
  ],
  translateY: [
	  { value: -200 },
	  { value: 200 },
	  { value: 0 }
  ],
  duration: 1500, // The duration will be divided by the number of keyframes of each properties, so 500ms each in this example
  delay: 500 // Delay will be applied only at the first keyframe
});
```

➜ [Basic keyframes code example](http://anime-js.com/v2/documentation/#basicKeyframes)

### Specific keyframes properties

Use specific timing and easing for more complex animations.

```javascript
anime({
  targets: 'div',
  translateX: [
	  { value: 400, duration: 1000, easing: 'easeOutExpo' },
	  { value: 200, duration: 500, easing: 'easeOutQuad' },
	  { value: 0, duration: 500, easing: 'easeInQuad' }
  ],
  translateY: [
	  { value: -200, duration: 500, delay: 500, easing: 'easeOutExpo' },
	  { value: 200, duration: 500, easing: 'easeOutQuad' },
	  { value: 0, duration: 500, easing: 'easeOutQuad' }
  ]
});
```

➜ [Specific keyframes properties code example](http://anime-js.com/v2/documentation/#specificKeyframeTimings)

## Timeline

Synchronise animations together.

➜ [Timeline code examples](http://anime-js.com/v2/documentation/#basicTimeline)

### Creating a timeline

```javascript
let myTimeline = anime.timeline();
```

A timeline is basically an Anime instance, and accepts the animation parameters: `direction`, `loop` and `autoplay`.

```javascript
var myTimeline = anime.timeline({
  direction: 'alternate',
  loop: 3,
  autoplay: false
});
```

### Adding animations to a timeline

Timeline has a .add() function that accepts an array of animations:

```javascript
myTimeline.add([
  anime({
    target: '.el-01',
    translateX: 100
  }),
  anime({
    target: '.el-02',
    translateX: 100,
    delay: 500
  })
]);
```

Or

```javascript
var animation01 = anime({
  target: '.el-01',
  translateX: 100
});
var animation02 = anime({
  target: '.el-02',
  translateX: 100,
  delay: 500
});

myTimeline.add([animation01, animation01]);
```

You can access timeline children animations with `myTimeline.children`


## Playback controls

Play, pause, restart or seek an animation or timeline.

### Play / Pause

```javascript
var playPauseAnim = anime({
  targets: 'div',
  translateX: 100,
  autoplay: false // prevent the instance from playing
});

playPauseAnim.play(); //  Manually play
playPauseAnim.pause(); //  Manually pause
```

➜ [Play / Pause code example](http://anime-js.com/v2/documentation/#playPause)

### Restart

```javascript
var restartAnim = anime({
  targets: 'div',
  translateX: 100,
  loop: 3,
  direction: 'alternate'
});

restartAnim.restart(); // Restart the animation and reset the loop count / current direction
```

➜ [Restart code example](http://anime-js.com/v2/documentation/#restartAnim)

### Seek

Seeking an animation or timeline let you change their current time. Like a progress bar.

```javascript
var seekAnim = anime({
  targets: 'div',
  translateX: 100
});

seekAnim.seek(500); // Set the animation current time to 500ms
```

➜ [Seek code example](http://anime-js.com/v2/documentation/#seekAnim)

## Callbacks

Execute function at the beginning, during or when an animation or timeline is completed.

Access the animation Object by passing one argument to a callback function.

| Names | Types | Arguments | Info
| --- | --- | --- | ---
| update | `function`| animation Object | Called at time = 0
| begin | `function` | animation Object | Called after animation delay is over
| complete | `function` | animation Object | Called only after all the loops are completed

➜ [Callbacks code examples](http://anime-js.com/v2/documentation/#allCallbacks)

### Update

Get current animation time with `myAnimation.currentTime`, return value in ms.
Get current animation progress with `myAnimation.progress`, return value in %.

```javascript
var myAnimation = anime({
  targets: '#callbacks .el',
  translateX: 250,
  delay: 1000,
  update: function(anim) {
    console.log(anim.currentTime + 'ms');
    console.log(anim.progress + '%');
  }
});
```

➜ [Update code example](http://anime-js.com/v2/documentation/#update)

### Begin

Check if the animation began with `myAnimation.began`, return `true` or `false`.

`begin()` is not called if the animation is added to a timeline.

```javascript
var myAnimation = anime({
  targets: '#begin .el',
  translateX: 250,
  delay: 1000,
  begin: function(anim) {
    console.log(anim.began); // true after 1000ms
  }
});
```

➜ [Begin code example](http://anime-js.com/v2/documentation/#begin)

### Complete

Check if the animation is completed with `myAnimation.completed`, return `true` or `false`.

`complete()` is not called if the animation is added to a timeline.

```javascript
var myAnimation = anime({
  targets: '#complete .el',
  translateX: 250,
  complete: function(anim) {
    console.log(anim.completed);
  }
});
```

➜ [Complete code example](http://anime-js.com/v2/documentation/#complete)

## SVG

### Motion path

Animate DOM elements along an SVG path.

```javascript
// Create a path Object
var path = anime.path('#motionPath path');

var motionPath = anime({
  targets: '#motionPath .el',
  translateX: path('x'), // Use the x values from the path Object
  translateY: path('y'), // Use the y values from the path Object
  rotate: path('angle'), // Use the angle values from the path Object
});
```

➜ [Motion path code example](http://anime-js.com/v2/documentation/#motionPath)

### Morphing

Animate the transition between two SVG shapes.
Shapes need to have the same number of points.

```html
<svg class=".shape" width="128" height="128" viewBox="0 0 128 128">
  <polygon points="64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100" fill="red"></polygon>
</svg>
```

```javascript
var svgAttributes = anime({
  targets: '.shape polygon',
  points: '64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96'
});
```

➜ [Morphing code example](http://anime-js.com/v2/documentation/#morphing)

### Line drawing

Line drawing animation of an SVG shape

```javascript
anime({
  targets: '.shape path',
	strokeDashoffset: [anime.pathDashoffset, 0]
});
```

➜ [Line drawing code example](http://anime-js.com/v2/documentation/#lineDrawing)

## Easing functions

The `easing` parameter can accept either a string or a custom Bézier curve array coordinates.

### Built in functions

Linear easing : `'linear'`

Penner's equations:

| easeIn | easeOut | easeInOut
| --- | --- | ---
| easeInQuad | easeOutQuad | easeInOutQuad |
| easeInCubic | easeOutCubic | easeInOutCubic
| easeInQuart | easeOutQuart | easeInOutQuart
| easeInQuint | easeOutQuint | easeInOutQuint
| easeInSine | easeOutSine | easeInOutSine
| easeInExpo | easeOutExpo | easeInOutExpo
| easeInCirc | easeOutCirc | easeInOutCirc
| easeInBack | easeOutBack | easeInOutBack
| easeInElastic | easeOutElastic | easeInOutElastic

➜ [Built in easings code examples](http://anime-js.com/v2/documentation/#penner)

Usage :

```javascript
anime({
  targets: 'div',
	translateX: 100,
	easing: 'easeOutExpo' // Default 'easeOutElastic'
});
```

Elasticity of Elastic easings can be configured with the `elasticity` parameters :

```javascript
anime({
  targets: 'div',
	translateX: 100,
	easing: 'easeOutElastic',
	elasticity: 600 // Default 500, range [0-1000]
});
```

➜ [Elasticity code examples](http://anime-js.com/v2/documentation/#elasticity)

### Custom Bézier curves

Define a Bézier curve with an array of 4 coordinates :

```javascript
anime({
  targets: 'div',
	translateX: 100,
	easing: [.91,-0.54,.29,1.56],
});
```

Custom Bézier curves coordinates can be generated here https://matthewlein.com/ceaser/

➜ [Custom Bézier curves code examples](http://anime-js.com/v2/documentation/#customBezier)

### Defining custom functions

Expand the built in easing functions with `anime.easings`.

```javascript
// Custom function
anime.easings['myCustomEasingName'] = function(time) { ... };

// Usage
anime({
  targets: 'div',
	translateX: 100,
	easing: 'myCustomEasingName'
});

// Register Bézier curves
anime.easings['myCustomCurve'] = anime.bezier([.91,-0.54,.29,1.56]);

// Usage
anime({
  targets: 'div',
	translateX: 100,
	easing: 'myCustomCurve'
});
```

## Helpers

### anime.speed = x

Change all animations speed (from 0 to 1).

```javascript
anime.speed = .5; // Slow down all animations by half of their original speed
```

### anime.running

Return an array of all active Anime instances

```javascript
anime.running;
```

### anime.remove(target)

Remove one or multiple targets from the animation.

```javascript
anime.remove('.item-2'); // Remove all divs with the class '.item-2'
```

### anime.getValue(target, property)

Get current valid value from an element.

```javascript
anime.getValue('div', 'translateX'); // Return '100px'
```

### anime.path(pathEl)

Create a path Function for motion path animation.
Accept either a DOM node or CSS selector.

```javascript
rar path = anime.path('svg path', 'translateX'); // Return path(attribute)
```

➜ [Motion path code example](http://anime-js.com/v2/documentation/#motionPath)

### anime.setDashoffset(pathEl)

An helper for line drawing animation, set the 'stroke-dasharray' to the total path length and return it.

```javascript
anime({
  targets: '.shape path',
	strokeDashoffset: [anime.pathDashoffset, 0]
});
```

➜ [Line drawing code example](http://anime-js.com/v2/documentation/#lineDrawing)

### anime.easings

Return the complete list of built in easing functions

```javascript
anime.easings;
```

### anime.bezier(x1, x2, y1, y2)

Return a custom Bézier curve easing function

```javascript
anime.bezier(x1, x2, y1, y2); // Return function(t)
```

### anime.timeline()

Create a timeline to synchronise other Anime instances.

```javascript
var timeline = anime.timeline();
timeline.add([instance1, instance2, ...]);
```

➜ [Timeline code examples](http://anime-js.com/v2/documentation/#basicTimeline)

### anime.random(x, y)

Generate a random number between two numbers.

```javascript
anime.random(10, 40); // Will return a random number between 10 and 40
```

====

[MIT License](LICENSE.md). © 2017 [Julian Garnier](http://juliangarnier.com).

Big thanks to [Animate Plus](https://github.com/bendc/animateplus) and [Velocity](https://github.com/julianshapiro/velocity) that inspired `anime.js` API, [BezierEasing](https://github.com/gre/bezier-easing) and [jQuery UI](https://jqueryui.com/) for the easing system.
