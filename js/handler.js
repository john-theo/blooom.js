const d3 = require("d3");

export class Handler {
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
    // node
    //   .transition()
    //   .ease(d3.easeCubicOut)
    //   .duration(500)
    //   .style("opacity", function (o) {
    //     return isNeighbor(d.index, o.index) ? 1 : unfocusOpacity;
    //   });

    // TODO: support hover control and control over hover
    // if (!d3.event.ctrlKey) return
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
    // node.transition().ease(d3.easeCubicOut).duration(500).style("opacity", 1);
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
        // Don't render text when the graph is too small
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
