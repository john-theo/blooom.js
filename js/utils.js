export const unique = (array) => array.filter((v, i, a) => a.indexOf(v) === i);

export function renameItemDict(original, keys) {
  return original.map(
    (i) =>
      Object.entries(keys).map(([k, v]) => {
        if (k === v) return i;
        Object.defineProperty(i, k, Object.getOwnPropertyDescriptor(i, v));
        delete i[v];
        return i;
      })[0]
  );
}

export class Utils {
  rotation(source, target) {
    return (
      (Math.atan2(target.y - source.y, target.x - source.x) * 180) / Math.PI
    );
  }

  unitaryVector(source, target, newLength) {
    var length =
      Math.sqrt(
        Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)
      ) / Math.sqrt(newLength || 1);

    return {
      x: (target.x - source.x) / length,
      y: (target.y - source.y) / length,
    };
  }

  unitaryNormalVector(source, target, newLength) {
    var center = { x: 0, y: 0 },
      vector = this.unitaryVector(source, target, newLength);

    return this.rotatePoint(center, vector, 90);
  }

  rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (x - cx) + sin * (y - cy) + cx,
      ny = cos * (y - cy) - sin * (x - cx) + cy;

    return { x: nx, y: ny };
  }

  rotatePoint(c, p, angle) {
    return this.rotate(c.x, c.y, p.x, p.y, angle);
  }
}
