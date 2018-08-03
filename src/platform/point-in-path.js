const clone = (obj) => {
  if(typeof obj === 'function' || Object(obj) !== obj) {
    return obj;
  }

  const res = new obj.constructor();
  /* eslint-disable no-restricted-syntax */
  for(const key in obj) {
    /* eslint-disable no-prototype-builtins */
    if(obj.hasOwnProperty(key)) {
      res[key] = clone(obj[key]);
    }
    /* eslint-enable no-prototype-builtins */
  }
  /* eslint-enable no-restricted-syntax */
  return res;
};

function paths(ps) {
  const p = paths.ps = paths.ps || {};
  if(p[ps]) {
    p[ps].sleep = 100;
  } else {
    p[ps] = {
      sleep: 100,
    };
  }
  setTimeout(() => {
    /* eslint-disable no-restricted-syntax */
    for(const key in p) {
      /* eslint-disable no-prototype-builtins */
      if(p.hasOwnProperty(key) && key !== ps) {
        p[key].sleep--;
        if(!p[key].sleep) delete p[key];
      }
      /* eslint-enable no-prototype-builtins */
    }
    /* eslint-enable no-restricted-syntax */
  });
  return p[ps];
}

function box(x, y, width, height) {
  if(x == null) {
    x = y = width = height = 0;
  }
  if(y == null) {
    y = x.y;
    width = x.width;
    height = x.height;
    x = x.x;
  }
  return {
    x,
    y,
    width,
    w: width,
    height,
    h: height,
    x2: x + width,
    y2: y + height,
    cx: x + width / 2,
    cy: y + height / 2,
    r1: Math.min(width, height) / 2,
    r2: Math.max(width, height) / 2,
    r0: Math.sqrt(width * width + height * height) / 2,
    path: rectPath(x, y, width, height),
    vb: [x, y, width, height].join(' '),
  };
}

function findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
  const t1 = 1 - t,
    t13 = t1 ** 3,
    t12 = t1 ** 2,
    t2 = t * t,
    t3 = t2 * t,
    x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
    y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
    mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
    my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
    nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
    ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
    ax = t1 * p1x + t * c1x,
    ay = t1 * p1y + t * c1y,
    cx = t1 * c2x + t * p2x,
    cy = t1 * c2y + t * p2y,
    alpha = 90 - Math.atan2(mx - nx, my - ny) * 180 / Math.PI;
  // (mx > nx || my < ny) && (alpha += 180);
  return {
    x,
    y,
    m: {x: mx, y: my},
    n: {x: nx, y: ny},
    start: {x: ax, y: ay},
    end: {x: cx, y: cy},
    alpha,
  };
}

function bezierBBox(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
  if(!Array.isArray(p1x)) {
    p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
  }
  const bbox = curveDim(...p1x);
  return box(
    bbox.min.x,
    bbox.min.y,
    bbox.max.x - bbox.min.x,
    bbox.max.y - bbox.min.y
  );
}

function isPointInsideBBox(bbox, x, y) {
  return x >= bbox.x
    && x <= bbox.x + bbox.width
    && y >= bbox.y
    && y <= bbox.y + bbox.height;
}

function isBBoxIntersect(bbox1, bbox2) {
  bbox1 = box(bbox1);
  bbox2 = box(bbox2);
  const {x: x1, y: y1, width: w1, height: h1} = bbox1,
    {x: x2, y: y2, width: w2, height: h2} = bbox2;

  const c1x = x1 + w1 / 2,
    c1y = y1 + h1 / 2;

  const c2x = x2 + w2 / 2,
    c2y = y2 + h2 / 2;

  return Math.abs(c1x - c2x) <= (w1 + w2) / 2
    || Math.abs(c1y - c2y) <= (h1 + h2) / 2;
}

function base3(t, p1, p2, p3, p4) {
  const t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
    t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
  return t * t2 - 3 * p1 + 3 * p2;
}

function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
  if(z == null) {
    z = 1;
  }
  z = Math.max(0, Math.min(z, 1));

  const z2 = z / 2,
    n = 12,
    Tvalues = [-0.1252, 0.1252, -0.3678, 0.3678, -0.5873, 0.5873, -0.7699, 0.7699, -0.9041, 0.9041, -0.9816, 0.9816],
    Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472];
  let sum = 0;
  for(let i = 0; i < n; i++) {
    const ct = z2 * Tvalues[i] + z2,
      xbase = base3(ct, x1, x2, x3, x4),
      ybase = base3(ct, y1, y2, y3, y4),
      comb = xbase * xbase + ybase * ybase;
    sum += Cvalues[i] * Math.sqrt(comb);
  }
  return z2 * sum;
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  if(
    Math.max(x1, x2) < Math.min(x3, x4)
    || Math.min(x1, x2) > Math.max(x3, x4)
    || Math.max(y1, y2) < Math.min(y3, y4)
    || Math.min(y1, y2) > Math.max(y3, y4)
  ) {
    return;
  }
  const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
    ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
    denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if(!denominator) {
    return;
  }
  const px = nx / denominator,
    py = ny / denominator,
    px2 = Number(px.toFixed(2)),
    py2 = Number(py.toFixed(2));
  if(
    px2 < Number(Math.min(x1, x2).toFixed(2))
    || px2 > Number(Math.max(x1, x2).toFixed(2))
    || px2 < Number(Math.min(x3, x4).toFixed(2))
    || px2 > Number(Math.max(x3, x4).toFixed(2))
    || py2 < Number(Math.min(y1, y2).toFixed(2))
    || py2 > Number(Math.max(y1, y2).toFixed(2))
    || py2 < Number(Math.min(y3, y4).toFixed(2))
    || py2 > Number(Math.max(y3, y4).toFixed(2))
  ) {
    return;
  }
  return {x: px, y: py};
}

function interHelper(bez1, bez2, justCount) {
  const bbox1 = bezierBBox(bez1),
    bbox2 = bezierBBox(bez2);
  if(!isBBoxIntersect(bbox1, bbox2)) {
    return justCount ? 0 : [];
  }
  const l1 = bezlen.apply(0, bez1),
    l2 = bezlen.apply(0, bez2),
    n1 = Math.ceil(l1 / 8),
    n2 = Math.ceil(l2 / 8),
    dots1 = [],
    dots2 = [],
    xy = {};
  let res = justCount ? 0 : [];
  for(let i = 0; i < n1 + 1; i++) {
    const p = findDotsAtSegment.apply(0, bez1.concat(i / n1));
    dots1.push({x: p.x, y: p.y, t: i / n1});
  }
  for(let i = 0; i < n2 + 1; i++) {
    const p = findDotsAtSegment.apply(0, bez2.concat(i / n2));
    dots2.push({x: p.x, y: p.y, t: i / n2});
  }
  for(let i = 0; i < n1; i++) {
    for(let j = 0; j < n2; j++) {
      const di = dots1[i],
        di1 = dots1[i + 1],
        dj = dots2[j],
        dj1 = dots2[j + 1],
        ci = Math.abs(di1.x - di.x) < 0.001 ? 'y' : 'x',
        cj = Math.abs(dj1.x - dj.x) < 0.001 ? 'y' : 'x',
        is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
      if(is) {
        if(xy[is.x.toFixed(4)] !== is.y.toFixed(4)) {
          xy[is.x.toFixed(4)] = is.y.toFixed(4);
          const t1 = di.t + Math.abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
            t2 = dj.t + Math.abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
          if(t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
            if(justCount) {
              res++;
            } else {
              res.push({
                x: is.x,
                y: is.y,
                t1,
                t2,
              });
            }
          }
        }
      }
    }
  }
  return res;
}

function interPathHelper(path1, path2, justCount) {
  let x1,
    y1,
    x2,
    y2,
    x1m,
    y1m,
    x2m,
    y2m,
    bez1,
    bez2,
    res = justCount ? 0 : [];
  for(let i = 0, ii = path1.length; i < ii; i++) {
    const pi = path1[i];
    if(pi[0] === 'M') {
      x1 = x1m = pi[1];
      y1 = y1m = pi[2];
    } else {
      if(pi[0] === 'C') {
        bez1 = [x1, y1].concat(pi.slice(1));
        x1 = bez1[6];
        y1 = bez1[7];
      } else {
        bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
        x1 = x1m;
        y1 = y1m;
      }
      for(let j = 0, jj = path2.length; j < jj; j++) {
        const pj = path2[j];
        if(pj[0] === 'M') {
          x2 = x2m = pj[1];
          y2 = y2m = pj[2];
        } else {
          if(pj[0] === 'C') {
            bez2 = [x2, y2].concat(pj.slice(1));
            x2 = bez2[6];
            y2 = bez2[7];
          } else {
            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
            x2 = x2m;
            y2 = y2m;
          }
          const intr = interHelper(bez1, bez2, justCount);
          if(justCount) {
            res += intr;
          } else {
            for(let k = 0, kk = intr.length; k < kk; k++) {
              intr[k].segment1 = i;
              intr[k].segment2 = j;
              intr[k].bez1 = bez1;
              intr[k].bez2 = bez2;
            }
            res = res.concat(intr);
          }
        }
      }
    }
  }
  return res;
}

function pathBBox(path) {
  const pth = paths(path);

  if(pth.bbox) {
    return clone(pth.bbox);
  }

  if(!path) {
    return box();
  }

  let x = 0;
  let y = 0;
  let X = [];
  let Y = [];
  let p = [];

  for(let i = 0, c = path.length; i < c; i++) {
    p = path[i];
    if(p[0] === 'M') {
      x = p[1];
      y = p[2];
      X.push(x);
      Y.push(y);
    } else {
      const dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
      X = X.concat(dim.min.x, dim.max.x);
      Y = Y.concat(dim.min.y, dim.max.y);
      x = p[5];
      y = p[6];
    }
  }

  const xmin = Math.min.apply(0, X);
  const ymin = Math.min.apply(0, Y);
  const xmax = Math.max.apply(0, X);
  const ymax = Math.max.apply(0, Y);
  const bb = box(xmin, ymin, xmax - xmin, ymax - ymin);

  pth.bbox = clone(bb);
  return bb;
}

function rectPath(x, y, w, h, r) {
  if(r) {
    return [
      ['M', Number(x) + Number(r), y],
      ['l', w - r * 2, 0],
      ['a', r, r, 0, 0, 1, r, r],
      ['l', 0, h - r * 2],
      ['a', r, r, 0, 0, 1, -r, r],
      ['l', r * 2 - w, 0],
      ['a', r, r, 0, 0, 1, -r, -r],
      ['l', 0, r * 2 - h],
      ['a', r, r, 0, 0, 1, r, -r],
      ['z'],
    ];
  }
  const res = [['M', x, y], ['l', w, 0], ['l', 0, h], ['l', -w, 0], ['z']];
  // res.toString = toString;
  return res;
}

// Returns bounding box of cubic bezier curve.
// Source: http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
// Original version: NISHIO Hirokazu
// Modifications: https://github.com/timo22345
function curveDim(x0, y0, x1, y1, x2, y2, x3, y3) {
  const tvalues = [],
    bounds = [[], []];
  let a,
    b,
    c,
    t,
    t1,
    t2,
    b2ac,
    sqrtb2ac;
  /* eslint-disable no-continue */
  for(let i = 0; i < 2; ++i) {
    if(i === 0) {
      b = 6 * x0 - 12 * x1 + 6 * x2;
      a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
      c = 3 * x1 - 3 * x0;
    } else {
      b = 6 * y0 - 12 * y1 + 6 * y2;
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
      c = 3 * y1 - 3 * y0;
    }
    if(Math.abs(a) < 1e-12) {
      if(Math.abs(b) < 1e-12) {
        continue;
      }
      t = -c / b;
      if(t > 0 && t < 1) {
        tvalues.push(t);
      }
      continue;
    }
    b2ac = b * b - 4 * c * a;
    sqrtb2ac = Math.sqrt(b2ac);
    if(b2ac < 0) {
      continue;
    }
    t1 = (-b + sqrtb2ac) / (2 * a);
    if(t1 > 0 && t1 < 1) {
      tvalues.push(t1);
    }
    t2 = (-b - sqrtb2ac) / (2 * a);
    if(t2 > 0 && t2 < 1) {
      tvalues.push(t2);
    }
  }
  /* eslint-enable no-continue */

  let j = tvalues.length,
    mt;
  const jlen = j;

  while(j--) {
    t = tvalues[j];
    mt = 1 - t;
    bounds[0][j] = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
    bounds[1][j] = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
  }

  bounds[0][jlen] = x0;
  bounds[1][jlen] = y0;
  bounds[0][jlen + 1] = x3;
  bounds[1][jlen + 1] = y3;
  bounds[0].length = bounds[1].length = jlen + 2;

  return {
    min: {x: Math.min.apply(0, bounds[0]), y: Math.min.apply(0, bounds[1])},
    max: {x: Math.max.apply(0, bounds[0]), y: Math.max.apply(0, bounds[1])},
  };
}

const normalize = require('../normalize-svg-path');
export default function pointInPath(path, x, y) {
  const bbox = pathBBox(path);

  if(!isPointInsideBBox(bbox, x, y)) {
    return false;
  }

  if(interPathHelper(path, normalize([['M', x, y], ['H', bbox.x2 + 10]]), 1) % 2 !== 1) {
    return false;
  }

  return true;
}
