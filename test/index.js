const { Promesa } = require('../dist/Promesa');

new Promesa((resolve) => {
  resolve('123');
}).then((res) => {
  console.log('=======', res);
});

