import Promesa from './Promesa'
Promesa.deferred = function () {
  var dfd = {}
  dfd.promise = new Promesa(function (resolve, reject) {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
export default Promesa