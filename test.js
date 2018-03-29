const {pathToCanvas, getBounds} = require('./lib')

const d = 'M280,250A200,200,0,1,1,680,250A200,200,0,1,1,180,250Z'

console.log(pathToCanvas(d), getBounds(d))
