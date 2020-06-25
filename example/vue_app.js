import Vue from 'vue'
import Blooom from "../dist/main.es.browser.js";
import neoData from "../data/neo4j_resp";

Vue.config.productionTip = false

new Vue({
  el: '#app',
  template: '<div id="canvas"></div>',
  mounted() {
    new Blooom("#canvas", neoData, {
      nodeLabelProperties: {
        mutation: "position",
        Molecular_Individual: "virus_id",
      },
    });
  }
})
