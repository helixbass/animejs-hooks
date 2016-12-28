const compressor = require('node-minify');

compressor.minify({
  compressor: 'gcc',
  input: 'anime.js',
  output: 'anime.min.js',
  callback: (err, min) => {
    if (err) console.error(err);
    console.log('Compilation was a success! 👍');
  }
});
