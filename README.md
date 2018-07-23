# Convert SVG d path to canvas commands

针对一些不支持[Path2D](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) API的canvas环境（比如微信小程序），提供将svg path转换成canvas命令的方法。

```html
<script src="https://s0.ssl.qhres.com/!a9197479/svg-path-to-canvas.min.js"></script>
```

```bash
npm install svg-path-to-canvas
```

```js
const d = 'M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2 c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z'

const sp = new SvgPath(d)
const [cx, cy] = sp.center

const context = mycanvas.getContext('2d')

sp.save()
  .beginPath()
  .translate(-cx, -cy)
  .rotate(45)
  .scale(10)
  .translate(cx, cy)
  .translate(350, 350)
  .strokeStyle('red')
  .lineWidth(3)
  .to(context)
  .stroke()
```

![](https://p1.ssl.qhimg.com/t0169d65a65437938a7.png)
