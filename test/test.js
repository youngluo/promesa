const { Promesa } = require('../dist/Promesa')
const then = {
  then(resolve) {
    resolve && resolve(1)
  },
}

// console.log(Promise.resolve(then).then(console.log))
// console.log(Promesa.resolve(then).then(console.log))

// console.log(
//   Promesa.all([
//     1,
//     '',
//     new Promesa((resolve) => {
//       setTimeout(resolve, 3000, 123)
//     }),
//     Promesa.resolve(100),
//     undefined,
//   ])
//     .then(console.log)
//     .catch(console.log)
// )

// const p = Promesa.all([])
// console.log(p)
// p.then(console.log).catch(console.log)
// setTimeout(() => {
//   console.log(p)
// }, 0)

console.time('promesa')
Promesa.race([
  new Promesa((resolve) => {
    setTimeout(resolve, 3000, 123)
  }),
  new Promesa((resolve, reject) => {
    setTimeout(reject, 10000, 456)
  }),
])
  .then(console.log)
  .catch(console.log)
  .finally(() => {
    console.timeEnd('promesa')
  })
