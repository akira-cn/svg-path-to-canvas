# Convert SVG d path to canvas commands

针对一些不支持[Path2D](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) API的canvas环境（比如微信小程序），提供将svg path转换成canvas命令的方法。

```bash
npm install svg-path-to-canvas
```

```js
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const pathToCanvas = require('svg-path-to-canvas')

const commands = pathToCanvas('M280,250A200,200,0,1,1,680,250A200,200,0,1,1,180,250Z')

context.strokeStyle = 'red'
commands.forEach(cmd => {
  context[cmd.cmd](...cmd.args)
})

context.stroke()
```

![](https://p4.ssl.qhimg.com/t01b1451d9c057cdfb9.png)
