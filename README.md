# Blooom

![](https://img.shields.io/badge/build-passing-success) ![](https://img.shields.io/badge/language-nodejs-orange.svg) ![](http://img.shields.io/badge/license-ISC-lightgrey)

Graph visualization for human!

## Features

- **Interactive**

## Example

### Use `Blooom` as a nodejs package

(See [test_server](./test_server))

```html
<div id="canvas"></div>

<script>
  import NeoGraph from "blooom";

  new NeoGraph("#canvas", neoData, {
    nodeLabelProperties: {
      mutation: "position",
      Molecular_Individual: "virus_id",
    },
  });
</script>

<style>
  @import "blooom/css/style.min.css";
</style>
```

### Use `Blooom` as a ES6 module



## Dev preparation

```bash
sass --no-source-map --style compressed --watch css/style.scss:css/style.min.css

npm run test
```

## Credit

- [neo4jd3.js](https://github.com/eisman/neo4jd3)

## Repository

**Github:** [John-Theo/blooom.js](https://github.com/John-Theo/blooom.js)

## License

This application comes with **ABSOLUTELY NO WARRANTY**, to the extent permitted by applicable law.
