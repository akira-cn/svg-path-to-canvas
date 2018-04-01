# Convert SVG d path to canvas commands

针对一些不支持[Path2D](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) API的canvas环境（比如微信小程序），提供将svg path转换成canvas命令的方法。

```html
<script src="https://s1.ssl.qhres.com/!84fe0ff5/svg-path-to-canvas.min.js"></script>
```

```bash
npm install svg-path-to-canvas
```

```js
const d = 'M638.9,259.3v-23.8H380.4c-0.7-103.8-37.3-200.6-37.3-200.6s-8.5,0-22.1,0C369.7,223,341.4,465,341.4,465h22.1c0,0,11.4-89.5,15.8-191h210.2l11.9,191h22.1c0,0-5.3-96.6-0.6-205.7H638.9z'

const sp = new SvgPath(d)
console.log(sp)
const [cx, cy] = sp.center
sp.save()
sp.translate(-cx, -cy)
//sp.translate(-100, -100)
sp.rotate(45)
sp.translate(cx, cy)

const context = mycanvas.getContext('2d')
context.strokeStyle = 'red'
context.lineWidth = 3
sp.render(context)
context.stroke()

console.log(sp.bounds)
console.log(sp.getTotalLength())
console.log(sp.getPointAtLength(10))

mycanvas.addEventListener('click', evt => {
  const {clientX, clientY} = evt  
  console.log(sp.isPointInPath(clientX, clientY))
  console.log(context.isPointInPath(clientX, clientY))
})
```

![](https://p4.ssl.qhimg.com/t01b1451d9c057cdfb9.png)
