const { Promesa } = require('../dist/Promesa');

Promesa.deferred = () => {
  const dfd = {};
  dfd.promise = new Promesa((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });

  return dfd;
};

module.exports = Promesa;
