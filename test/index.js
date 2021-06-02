const { Promesa } = require('../dist/Promesa')


new Promesa((resolve) => {
  setTimeout(() => {
    resolve('123')
  }, 2000)

}).then((res) => {
  console.log('=======', res)
})

