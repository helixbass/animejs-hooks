const fs = require('fs');
const compile = require('google-closure-compiler-js').compile;

console.info('Compiling... 😤');

fs.unlink('anime.min.js', (err) => {

  fs.readFile('anime.js', {encoding: 'utf-8'}, function(err, data) {
    if (err) throw err;
    
    const flags = {
      jsCode: [{src: data}],
      languageIn: 'ES6',
      languageOut: 'ES5'
    };

    const out = compile(flags);

    fs.writeFile('anime.min.js', out.compiledCode, function(err) {
      if (err) throw err;
      console.info('Compilation was a success! 😎 🍺');
    });
  });
});