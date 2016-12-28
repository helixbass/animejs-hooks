const compressor = require('node-minify');

console.log('Compiling... 😤');

compressor.minify({
  compressor: 'gcc',
  input: 'anime.js',
  output: 'anime.min.js',
  opcitons: {
    compilation_level: 'SIMPLE_OPTIMIZATIONS',
    language_out: 'ECMASCRIPT5'
  },
  callback: (err, min) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Compilation was a success! 😎 🍺');
    }
  }
});
