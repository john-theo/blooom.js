

class Blooom {
  constructor(selector, data, customConfig) {
    let sourceConfig;
    [data, sourceConfig] = this.transformData(data);

    this.config = new Config(this, sourceConfig, customConfig);
    this.handler = new Handler(this);
    this.renderer = new Renderer();

    const [dataNodes, dataLinks] = this.washData(data);

    this.container = this.initCanvas(selector);
    this.simulation = this.initSimulation(dataNodes, dataLinks);
    this.links = this.initLinks(dataLinks);
    this.nodes = this.initNodes(dataNodes);

    this.registerInteraction(dataLinks);
    this.renderTick();
  }

  loadNeo4j(json) {
    let nodes = [];
    let links = [];

    json
      .map((i) => i.graph)
      .forEach((i) => {
        nodes = nodes.concat(i.nodes);
        links = links.concat(i.relationships);
      });

    return [
      { nodes, links },
      {
        linkSourceKey: "startNode",
        linkTargetKey: "endNode",
        nodeGroupsKey: "labels",
      },
    ];
  }

  transformData(data) {
    let sourceConfig = {};
    if (typeof data === "string") data = JSON.parse(data);

    if (data[0].graph) [data, sourceConfig] = this.loadNeo4j(data);

    return [data, sourceConfig];
  }

  washData(data) {
    let linkedNodes = [];
    const dataLinks = renameItemDict(data.links, {
      source: this.config.linkSourceKey,
      target: this.config.linkTargetKey,
    }).map((d) => {
      linkedNodes.push(d.source), linkedNodes.push(d.target);
      return Object.create(d);
    });

    linkedNodes = unique(linkedNodes);

    let existedNodes = [];
    let existedGroups = [];
    const dataNodes = renameItemDict(data.nodes, {
      labels: this.config.nodeGroupsKey,
    })
      .map((d) => {
        if (existedNodes.indexOf(d.id) >= 0 || linkedNodes.indexOf(d.id) < 0)
          return null;
        existedNodes.push(d.id);
        existedGroups.push(d[this.config.nodeGroupsKey]);
        return Object.create(d);
      })
      .filter((x) => x);

    this.existedGroups = Object.assign(
      ...unique(existedGroups.flat()).map((v, i) => ({ [v]: i }))
    );

    return [dataNodes, dataLinks];
  }

  initCanvas(selector) {
    this.svg = d3
      .select(selector)
      .html("")
      .append("svg")
      .attr("class", "blooom")
      .attr("width", "100%")
      .attr("height", "100%");

    this.width = this.svg.node().clientWidth;
    this.height = this.svg.node().clientHeight;
    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    return this.svg.append("g");
  }

  initSimulation(dataNodes, dataLinks) {
    return (
      d3
        .forceSimulation(dataNodes)
        .velocityDecay(0.1)
        .force(
          "link",
          d3.forceLink(dataLinks).id((d) => d.id)
        )
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force("collide", d3.forceCollide().radius(40).iterations(2))
    );
  }

  initNodes(dataNodes) {
    const nodes = this.container
      .selectAll(".node")
      .data(dataNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(this.handler.drag(this.simulation));

    this.nodeGroup = {
      circle: nodes.append("circle").attr("class", "glow").attr("r", 25),
      glow: nodes
        .append("circle")
        .attr("class", "circle")
        .attr("r", 25)
        .attr(
          "fill",
          (d) => this.config.colors[this.config.getNodeClassIndex(d.labels)]
        )
        .attr(
          "stroke",
          (d) =>
            this.config.borderColors[this.config.getNodeClassIndex(d.labels)]
        ),
      label: nodes.append("text").text((d) => this.config.getNodeText(d)),
    };

    return nodes;
  }

  initLinks(dataLinks) {
    var links = this.container
      .selectAll(".link")
      .data(dataLinks)
      .enter()
      .append("g")
      .attr("class", "link");

    this.linkGroup = {
      glow: links.append("path").attr("class", "glow"),
      arrow: links.append("path").attr("class", "arrow"),
      text: links.append("text").text((d) => d[this.config.linkLabelProperty]),
    };

    return links;
  }

  registerInteraction(dataLinks) {
    const that = this;

    this.nodesLinked = [];
    dataLinks.forEach(function (d) {
      that.nodesLinked[d.source.index + "-" + d.target.index] = true;
      that.nodesLinked[d.target.index + "-" + d.source.index] = true;
    });

    this.links
      .on("mouseenter", function (d) {
        that.handler.focusLink(d);
        that.config.linkMouseEnter && that.config.linkMouseEnter(d, that);
      })
      .on("mouseleave", function (d) {
        that.handler.removeFocus(that.nodes, that.links);
        that.config.linkMouseLeave && that.config.linkMouseLeave(d, that);
      });

    this.nodes
      .on("contextmenu", (d) => {
        that.handler.pinNode(that.nodes, d);
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("mouseenter", function (d) {
        that.handler.focusNode(d);
        that.config.nodeMouseEnter && that.config.nodeMouseEnter(d, that);
      })
      .on("mouseleave", function (d) {
        that.handler.removeFocus(that.nodes, that.links);
        that.config.nodeMouseLeave && that.config.nodeMouseLeave(d, that);
      });

    this.svg
      .on("contextmenu", () => d3.event.preventDefault())
      .call(this.handler.zoom());
    this.svg.on("dblclick.zoom", null);
  }

  renderTick() {
    this.simulation.on("tick", () => {
      this.renderer.renderLink(
        this.links,
        this.linkGroup.glow,
        this.linkGroup.text
      );
      this.nodes.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });
  }
}

class Config {
  nodeMouseEnter = null; 
  nodeMouseLeave = null; 
  linkMouseEnter = null; 
  linkMouseLeave = null; 

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
  nodeLabelProperties = null;


  constructor(graph, ...configs) {
    const that = this;
    if (configs) {
      for (let config of configs) {
        Object.entries(config).forEach(([k, v]) => (that[k] = v));
      }
    }

    this.graph = graph;

    this.borderColors = this.colors.map((c) => d3.rgb(c).darker(0.5));

  }

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

class Handler {
  constructor(graph) {
    this.graph = graph;
  }

  focusLink(d) {
    this.graph.nodes.each(function(i) {
      if (i.index == d.source.index || i.index == d.target.index) return;
      this.classList.add("faded");
    });
    this.graph.links.each(function(i) {
      if (i.source.index == d.source.index && i.target.index == d.target.index)
        return;
      this.classList.add("faded");
    });
  }

  focusNode(d) {

    const that = this;
    this.graph.nodes.each(function(i) {
      if (i.index == d.index || that.graph.nodesLinked[i.index + "-" + d.index])
        return;
      this.classList.add("faded");
    });
    this.graph.links.each(function(i) {
      if (i.source.index == d.index || i.target.index == d.index) return;
      this.classList.add("faded");
    });
  }

  removeFocus() {
    this.graph.nodes.each(function() {
      this.classList.remove("faded");
    });
    this.graph.links.each(function() {
      this.classList.remove("faded");
    });
  }

  pinNode(node, d) {
    this.graph.nodes.each(function(i) {
      if (i.index !== d.index) return;
      this.classList.add("pinned");
    });
  }

  removeNodePin(d) {
    this.graph.nodes.each(function(i) {
      if (i.index !== d.index) return;
      this.classList.remove("pinned");
    });
  }

  zoom() {
    const that = this;
    return d3
      .zoom()
      .scaleExtent([0.1, 2])
      .on("zoom", () => {
        const scale = +d3.event.transform.k;
        that.graph.nodeGroup.label.attr(
          "opacity",
          scale > 0.5 ? 1 : scale < 0.4 ? 0 : (scale - 0.4) * 10
        );
        that.graph.linkGroup.text.attr(
          "opacity",
          scale > 0.5 ? 1 : scale < 0.4 ? 0 : (scale - 0.4) * 10
        );
        that.graph.container.attr("transform", d3.event.transform);
      });
  }

  drag(simulation) {
    const that = this;

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      that.removeNodePin(d);
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
}

class Renderer {
    utils = new Utils();

      renderLink(link, linkGlow, linkText) {
      const that = this;

        link.attr("transform", function (d) {
        var angle = that.utils.rotation(d.source, d.target);
        return (
          "translate(" +
          d.source.x +
          ", " +
          d.source.y +
          ") rotate(" +
          angle +
          ")"
        );
      });

        const options = {
        nodeRadius: 25,
        arrowSize: 4,
      };

        this.renderLinkText(linkText);
      this.renderLinkGlow(linkGlow);
      this.renderLinkArrow(link, options);
    }

      renderLinkArrow(link, options) {
      const that = this;

        link.each(function () {
        var rel = d3.select(this),
          outline = rel.select(".arrow"),
          text = rel.select("text");

          outline.attr("d", function (d) {
          var center = { x: 0, y: 0 },
            angle = that.utils.rotation(d.source, d.target),
            textBoundingBox = text.node().getBBox(),
            textPadding = 5,
            u = that.utils.unitaryVector(d.source, d.target),
            textMargin = {
              x:
                (d.target.x -
                  d.source.x -
                  (textBoundingBox.width + textPadding) * u.x) *
                0.5,
              y:
                (d.target.y -
                  d.source.y -
                  (textBoundingBox.width + textPadding) * u.y) *
                0.5,
            },
            n = that.utils.unitaryNormalVector(d.source, d.target),
            rotatedPointA1 = that.utils.rotatePoint(
              center,
              {
                x: 0 + (options.nodeRadius + 1) * u.x - n.x,
                y: 0 + (options.nodeRadius + 1) * u.y - n.y,
              },
              angle
            ),
            rotatedPointB1 = that.utils.rotatePoint(
              center,
              { x: textMargin.x - n.x, y: textMargin.y - n.y },
              angle
            ),
            rotatedPointC1 = that.utils.rotatePoint(
              center,
              { x: textMargin.x, y: textMargin.y },
              angle
            ),
            rotatedPointD1 = that.utils.rotatePoint(
              center,
              {
                x: 0 + (options.nodeRadius + 1) * u.x,
                y: 0 + (options.nodeRadius + 1) * u.y,
              },
              angle
            ),
            rotatedPointA2 = that.utils.rotatePoint(
              center,
              {
                x: d.target.x - d.source.x - textMargin.x - n.x,
                y: d.target.y - d.source.y - textMargin.y - n.y,
              },
              angle
            ),
            rotatedPointB2 = that.utils.rotatePoint(
              center,
              {
                x:
                  d.target.x -
                  d.source.x -
                  (options.nodeRadius + 1) * u.x -
                  n.x -
                  u.x * options.arrowSize,
                y:
                  d.target.y -
                  d.source.y -
                  (options.nodeRadius + 1) * u.y -
                  n.y -
                  u.y * options.arrowSize,
              },
              angle
            ),
            rotatedPointC2 = that.utils.rotatePoint(
              center,
              {
                x:
                  d.target.x -
                  d.source.x -
                  (options.nodeRadius + 1) * u.x -
                  n.x +
                  (n.x - u.x) * options.arrowSize,
                y:
                  d.target.y -
                  d.source.y -
                  (options.nodeRadius + 1) * u.y -
                  n.y +
                  (n.y - u.y) * options.arrowSize,
              },
              angle
            ),
            rotatedPointD2 = that.utils.rotatePoint(
              center,
              {
                x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x,
                y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y,
              },
              angle
            ),
            rotatedPointE2 = that.utils.rotatePoint(
              center,
              {
                x:
                  d.target.x -
                  d.source.x -
                  (options.nodeRadius + 1) * u.x +
                  (-n.x - u.x) * options.arrowSize,
                y:
                  d.target.y -
                  d.source.y -
                  (options.nodeRadius + 1) * u.y +
                  (-n.y - u.y) * options.arrowSize,
              },
              angle
            ),
            rotatedPointF2 = that.utils.rotatePoint(
              center,
              {
                x:
                  d.target.x -
                  d.source.x -
                  (options.nodeRadius + 1) * u.x -
                  u.x * options.arrowSize,
                y:
                  d.target.y -
                  d.source.y -
                  (options.nodeRadius + 1) * u.y -
                  u.y * options.arrowSize,
              },
              angle
            ),
            rotatedPointG2 = that.utils.rotatePoint(
              center,
              {
                x: d.target.x - d.source.x - textMargin.x,
                y: d.target.y - d.source.y - textMargin.y,
              },
              angle
            );

            return (
            "M " +
            rotatedPointA1.x +
            " " +
            rotatedPointA1.y +
            " L " +
            rotatedPointB1.x +
            " " +
            rotatedPointB1.y +
            " L " +
            rotatedPointC1.x +
            " " +
            rotatedPointC1.y +
            " L " +
            rotatedPointD1.x +
            " " +
            rotatedPointD1.y +
            " Z M " +
            rotatedPointA2.x +
            " " +
            rotatedPointA2.y +
            " L " +
            rotatedPointB2.x +
            " " +
            rotatedPointB2.y +
            " L " +
            rotatedPointC2.x +
            " " +
            rotatedPointC2.y +
            " L " +
            rotatedPointD2.x +
            " " +
            rotatedPointD2.y +
            " L " +
            rotatedPointE2.x +
            " " +
            rotatedPointE2.y +
            " L " +
            rotatedPointF2.x +
            " " +
            rotatedPointF2.y +
            " L " +
            rotatedPointG2.x +
            " " +
            rotatedPointG2.y +
            " Z"
          );
        });
      });
    }

      renderLinkGlow(linkGlow) {
      const that = this;
      linkGlow.attr("d", function (d) {
        var center = { x: 0, y: 0 },
          angle = that.utils.rotation(d.source, d.target),
          n = that.utils.unitaryNormalVector(d.source, d.target),
          rotatedPointA = that.utils.rotatePoint(
            center,
            { x: 0 - n.x, y: 0 - n.y },
            angle
          ),
          rotatedPointB = that.utils.rotatePoint(
            center,
            {
              x: d.target.x - d.source.x - n.x,
              y: d.target.y - d.source.y - n.y,
            },
            angle
          ),
          rotatedPointC = that.utils.rotatePoint(
            center,
            {
              x: d.target.x - d.source.x,
              y: d.target.y - d.source.y,
            },
            angle
          ),
          rotatedPointD = that.utils.rotatePoint(center, { x: 0, y: 0 }, angle);

          return (
          "M " +
          rotatedPointA.x +
          " " +
          rotatedPointA.y +
          " L " +
          rotatedPointB.x +
          " " +
          rotatedPointB.y +
          " L " +
          rotatedPointC.x +
          " " +
          rotatedPointC.y +
          " L " +
          rotatedPointD.x +
          " " +
          rotatedPointD.y +
          " Z"
        );
      });
    }

      renderLinkText(linkText) {
      const that = this;
      linkText.attr("transform", function (d) {
        var angle = (that.utils.rotation(d.source, d.target) + 360) % 360,
          mirror = angle > 90 && angle < 270,
          center = { x: 0, y: 0 },
          n = that.utils.unitaryNormalVector(d.source, d.target),
          nWeight = mirror ? 2 : -3,
          point = {
            x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight,
            y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight,
          },
          rotatedPoint = that.utils.rotatePoint(center, point, angle);

          return (
          "translate(" +
          rotatedPoint.x +
          ", " +
          rotatedPoint.y +
          ") rotate(" +
          (mirror ? 180 : 0) +
          ")"
        );
      });
    }
  }
const unique = (array) => array.filter((v, i, a) => a.indexOf(v) === i);

function renameItemDict(original, keys) {
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

class Utils {
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
