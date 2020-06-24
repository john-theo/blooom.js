<template>
  <div id="canvas"></div>
</template>

<script>
import NeoGraph from "../../index";
import neoData from "../../data/neo4j_resp";

export default {
  name: "Demo",
  mounted() {
    new NeoGraph("#canvas", neoData, {
      nodeLabelProperties: {
        mutation: "position",
        Molecular_Individual: "virus_id",
      },
    });
  }
};
</script>

<style>
@import "../../css/style.min.css";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

html, body, #app, #canvas {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}
</style>
