const d3 = require("d3");

export class Config {
  nodeMouseEnter = null; // console.log;
  nodeMouseLeave = null; // console.log
  linkMouseEnter = null; // console.log
  linkMouseLeave = null; // console.log

  colors = [
    "#68bdf6",
    "#6dce9e",
    "#faafc2",
    "#f2baf6",
    "#ff928c",
    "#fcea7e",
    "#ffc766",
    "#405f9e",
    "#a5abb6",
    "#78cecb",
    "#b88cbb",
    "#ced2d9",
    "#e84646",
    "#fa5f86",
    "#ffab1a",
    "#fcda19",
    "#797b80",
    "#c9d96f",
    "#47991f",
    "#70edee",
    "#ff75ea",
  ];

  linkSourceKey = "source";
  linkTargetKey = "target";
  nodeGroupsKey = "group";

  linkLabelProperty = "type";
  // TODO: try property in order
  nodeLabelProperties = null;

  // highlightItem = ["1", "639", "289"];
  // nodeColor = {};

  constructor(graph, ...configs) {
    const that = this;
    if (configs) {
      for (let config of configs) {
        Object.entries(config).forEach(([k, v]) => (that[k] = v));
      }
    }

    this.graph = graph;

    this.borderColors = this.colors.map((c) => d3.rgb(c).darker(0.5));

    // console.log(this);
  }

  // TODO: calculate primary label / primary label index / primary label text, once for all
  getNodeLabel(labels) {
    return labels.constructor === Array ? labels[0] : labels;
  }

  getNodeClassIndex(labels) {
    return this.graph.existedGroups[this.getNodeLabel(labels)];
  }

  getNodeText(d) {
    return d.properties[this.nodeLabelProperties[this.getNodeLabel(d.labels)]];
  }
}
