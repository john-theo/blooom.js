// TODO: Dynamic graph update (e.g. double click a node to expand it).
// TODO: Highlight nodes on init.

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

    // TODO: compatible with miserable
    return (data[0] && data[0].graph)
      ? this.loadNeo4j(data)
      : (data.results && data.results[0])
      ? this.loadNeo4j(data.results[0].data)
      : null
    ;
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
        // TODO: deal with single nodes
        if (existedNodes.indexOf(d.id) >= 0 || linkedNodes.indexOf(d.id) < 0)
          return null;
        existedNodes.push(d.id);
        existedGroups.push(d[this.config.nodeGroupsKey]);
        return Object.create(d);
      })
      .filter((x) => x);

    this.existedGroups = existedGroups.length ? Object.assign(
      ...unique(existedGroups.flat()).map((v, i) => ({ [v]: i }))
    ) : [];

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
        // TODO: cut the wobble
        .velocityDecay(0.1)
        .force(
          "link",
          d3.forceLink(dataLinks).id((d) => d.id)
        )
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force("collide", d3.forceCollide().radius(40).iterations(2))
      // .on("end", console.log("loaded"))
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
      // Don't need tooltip
      // node.append("title").text((d) => d.id);
    };

    return nodes;
  }

  clear() {
    this.svg.remove();
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
      // TODO: simplify this logic
      // var linkGlow = link.append("line").attr("class", "glow");
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
    // Cancel double click zoom
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
