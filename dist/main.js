"use strict";

const d3 = require('d3');



function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Blooom = /*#__PURE__*/function () {
  function Blooom(selector, data, customConfig) {
    _classCallCheck(this, Blooom);

    if (!data || !data.length) throw "ValueError: invalid `data`";
    var sourceConfig;

    var _this$transformData = this.transformData(data);

    var _this$transformData2 = _slicedToArray(_this$transformData, 2);

    data = _this$transformData2[0];
    sourceConfig = _this$transformData2[1];
    this.config = new Config(this, sourceConfig, customConfig);
    this.handler = new Handler(this);
    this.renderer = new Renderer();

    var _this$washData = this.washData(data),
        _this$washData2 = _slicedToArray(_this$washData, 2),
        dataNodes = _this$washData2[0],
        dataLinks = _this$washData2[1];

    this.container = this.initCanvas(selector);
    this.simulation = this.initSimulation(dataNodes, dataLinks);
    this.links = this.initLinks(dataLinks);
    this.nodes = this.initNodes(dataNodes);
    this.registerInteraction(dataLinks);
    this.renderTick();
  }

  _createClass(Blooom, [{
    key: "loadNeo4j",
    value: function loadNeo4j(json) {
      var nodes = [];
      var links = [];
      json.map(function (i) {
        return i.graph;
      }).forEach(function (i) {
        nodes = nodes.concat(i.nodes);
        links = links.concat(i.relationships);
      });
      return [{
        nodes: nodes,
        links: links
      }, {
        linkSourceKey: "startNode",
        linkTargetKey: "endNode",
        nodeGroupsKey: "labels"
      }];
    }
  }, {
    key: "transformData",
    value: function transformData(data) {
      var sourceConfig = {};
      if (typeof data === "string") data = JSON.parse(data);
      return data[0] && data[0].graph ? this.loadNeo4j(data) : data.results && data.results[0] ? this.loadNeo4j(data.results[0].data) : null;
    }
  }, {
    key: "washData",
    value: function washData(data) {
      var _this = this;

      var linkedNodes = [];
      var existedLinks = [];
      var dataLinks = renameItemDict(data.links, {
        source: this.config.linkSourceKey,
        target: this.config.linkTargetKey
      }).map(function (d) {
        var id = "".concat(d.source, "-").concat(d.target);
        if (existedLinks.indexOf(id) >= 0) return null;
        linkedNodes.push(d.source), linkedNodes.push(d.target);
        existedLinks.push(id);
        return Object.create(d);
      }).filter(Boolean);
      linkedNodes = unique(linkedNodes);
      var existedNodes = [];
      var existedGroups = [];
      var dataNodes = renameItemDict(data.nodes, {
        labels: this.config.nodeGroupsKey
      }).map(function (d) {
        if (existedNodes.indexOf(d.id) >= 0 || linkedNodes.indexOf(d.id) < 0) return null;
        existedNodes.push(d.id);
        existedGroups.push(d[_this.config.nodeGroupsKey]);
        return Object.create(d);
      }).filter(Boolean);
      this.existedGroups = existedGroups.length ? Object.assign.apply(Object, _toConsumableArray(unique(existedGroups.flat()).map(function (v, i) {
        return _defineProperty({}, v, i);
      }))) : [];
      return [dataNodes, dataLinks];
    }
  }, {
    key: "initCanvas",
    value: function initCanvas(selector) {
      this.svg = d3.select(selector).html("").append("svg").attr("class", "blooom").attr("width", "100%").attr("height", "100%");
      this.width = this.svg.node().clientWidth;
      this.height = this.svg.node().clientHeight;
      this.svg.attr("viewBox", [0, 0, this.width, this.height]);
      return this.svg.append("g");
    }
  }, {
    key: "initSimulation",
    value: function initSimulation(dataNodes, dataLinks) {
      return d3.forceSimulation(dataNodes).velocityDecay(0.1).force("link", d3.forceLink(dataLinks).id(function (d) {
        return d.id;
      })).force("charge", d3.forceManyBody().strength(-800)).force("center", d3.forceCenter(this.width / 2, this.height / 2)).force("collide", d3.forceCollide().radius(40).iterations(2));
    }
  }, {
    key: "initNodes",
    value: function initNodes(dataNodes) {
      var _this2 = this;

      var nodes = this.container.selectAll(".node").data(dataNodes).enter().append("g").attr("class", "node").call(this.handler.drag(this.simulation));
      this.nodeGroup = {
        circle: nodes.append("circle").attr("class", "glow").attr("r", 25),
        glow: nodes.append("circle").attr("class", "circle").attr("r", 25).attr("fill", function (d) {
          return _this2.config.colors[_this2.config.getNodeClassIndex(d.labels)];
        }).attr("stroke", function (d) {
          return _this2.config.borderColors[_this2.config.getNodeClassIndex(d.labels)];
        }),
        label: nodes.append("text").text(function (d) {
          return _this2.config.getNodeText(d);
        })
      };
      return nodes;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.svg.remove();
    }
  }, {
    key: "initLinks",
    value: function initLinks(dataLinks) {
      var _this3 = this;

      var links = this.container.selectAll(".link").data(dataLinks).enter().append("g").attr("class", "link");
      this.linkGroup = {
        glow: links.append("path").attr("class", "glow"),
        arrow: links.append("path").attr("class", "arrow"),
        text: links.append("text").text(function (d) {
          return d[_this3.config.linkLabelProperty];
        })
      };
      return links;
    }
  }, {
    key: "registerInteraction",
    value: function registerInteraction(dataLinks) {
      var that = this;
      this.nodesLinked = [];
      dataLinks.forEach(function (d) {
        that.nodesLinked[d.source.index + "-" + d.target.index] = true;
        that.nodesLinked[d.target.index + "-" + d.source.index] = true;
      });
      this.links.on("mouseenter", function (d) {
        that.handler.focusLink(d);
        that.config.linkMouseEnter && that.config.linkMouseEnter(d, that);
      }).on("mouseleave", function (d) {
        that.handler.removeFocus(that.nodes, that.links);
        that.config.linkMouseLeave && that.config.linkMouseLeave(d, that);
      });
      this.nodes.on("contextmenu", function (d) {
        that.handler.pinNode(that.nodes, d);
        d.fx = d.x;
        d.fy = d.y;
      }).on("mouseenter", function (d) {
        that.handler.focusNode(d);
        that.config.nodeMouseEnter && that.config.nodeMouseEnter(d, that);
      }).on("mouseleave", function (d) {
        that.handler.removeFocus(that.nodes, that.links);
        that.config.nodeMouseLeave && that.config.nodeMouseLeave(d, that);
      });
      this.svg.on("contextmenu", function () {
        return d3.event.preventDefault();
      }).call(this.handler.zoom());
      this.svg.on("dblclick.zoom", null);
    }
  }, {
    key: "renderTick",
    value: function renderTick() {
      var _this4 = this;

      this.simulation.on("tick", function () {
        _this4.renderer.renderLink(_this4.links, _this4.linkGroup.glow, _this4.linkGroup.text);

        _this4.nodes.attr("transform", function (d) {
          return "translate(".concat(d.x, ", ").concat(d.y, ")");
        });
      });
    }
  }]);

  return Blooom;
}();

var Config = /*#__PURE__*/function () {
  function Config(graph) {
    _classCallCheck(this, Config);

    _defineProperty(this, "nodeMouseEnter", null);

    _defineProperty(this, "nodeMouseLeave", null);

    _defineProperty(this, "linkMouseEnter", null);

    _defineProperty(this, "linkMouseLeave", null);

    _defineProperty(this, "colors", ["#68bdf6", "#6dce9e", "#faafc2", "#f2baf6", "#ff928c", "#fcea7e", "#ffc766", "#405f9e", "#a5abb6", "#78cecb", "#b88cbb", "#ced2d9", "#e84646", "#fa5f86", "#ffab1a", "#fcda19", "#797b80", "#c9d96f", "#47991f", "#70edee", "#ff75ea"]);

    _defineProperty(this, "linkSourceKey", "source");

    _defineProperty(this, "linkTargetKey", "target");

    _defineProperty(this, "nodeGroupsKey", "group");

    _defineProperty(this, "linkLabelProperty", "type");

    _defineProperty(this, "nodeLabelProperties", null);

    var that = this;

    for (var _len = arguments.length, configs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      configs[_key - 1] = arguments[_key];
    }

    if (configs) {
      var _iterator = _createForOfIteratorHelper(configs),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var config = _step.value;
          Object.entries(config).forEach(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                k = _ref3[0],
                v = _ref3[1];

            return that[k] = v;
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    this.graph = graph;
    this.borderColors = this.colors.map(function (c) {
      return d3.rgb(c).darker(0.5);
    });
  }

  _createClass(Config, [{
    key: "getNodeLabel",
    value: function getNodeLabel(labels) {
      return labels.constructor === Array ? labels[0] : labels;
    }
  }, {
    key: "getNodeClassIndex",
    value: function getNodeClassIndex(labels) {
      return this.graph.existedGroups[this.getNodeLabel(labels)];
    }
  }, {
    key: "_isFunction",
    value: function _isFunction(func) {
      return func && {}.toString.call(func) === '[object Function]';
    }
  }, {
    key: "getNodeText",
    value: function getNodeText(d) {
      var propertyKey = this.nodeLabelProperties[this.getNodeLabel(d.labels)];

      if (this._isFunction(propertyKey)) {
        return propertyKey(d);
      } else {
        return d.properties[propertyKey];
      }
    }
  }]);

  return Config;
}();

var Handler = /*#__PURE__*/function () {
  function Handler(graph) {
    _classCallCheck(this, Handler);

    this.graph = graph;
  }

  _createClass(Handler, [{
    key: "focusLink",
    value: function focusLink(d) {
      this.graph.nodes.each(function (i) {
        if (i.index == d.source.index || i.index == d.target.index) return;
        this.classList.add("faded");
      });
      this.graph.links.each(function (i) {
        if (i.source.index == d.source.index && i.target.index == d.target.index) return;
        this.classList.add("faded");
      });
    }
  }, {
    key: "focusNode",
    value: function focusNode(d) {
      var that = this;
      this.graph.nodes.each(function (i) {
        if (i.index == d.index || that.graph.nodesLinked[i.index + "-" + d.index]) return;
        this.classList.add("faded");
      });
      this.graph.links.each(function (i) {
        if (i.source.index == d.index || i.target.index == d.index) return;
        this.classList.add("faded");
      });
    }
  }, {
    key: "removeFocus",
    value: function removeFocus() {
      this.graph.nodes.each(function () {
        this.classList.remove("faded");
      });
      this.graph.links.each(function () {
        this.classList.remove("faded");
      });
    }
  }, {
    key: "pinNode",
    value: function pinNode(node, d) {
      this.graph.nodes.each(function (i) {
        if (i.index !== d.index) return;
        this.classList.add("pinned");
      });
    }
  }, {
    key: "removeNodePin",
    value: function removeNodePin(d) {
      this.graph.nodes.each(function (i) {
        if (i.index !== d.index) return;
        this.classList.remove("pinned");
      });
    }
  }, {
    key: "zoom",
    value: function zoom() {
      var that = this;
      return d3.zoom().scaleExtent([0.1, 2]).on("zoom", function () {
        var scale = +d3.event.transform.k;
        that.graph.nodeGroup.label.attr("opacity", scale > 0.5 ? 1 : scale < 0.4 ? 0 : (scale - 0.4) * 10);
        that.graph.linkGroup.text.attr("opacity", scale > 0.5 ? 1 : scale < 0.4 ? 0 : (scale - 0.4) * 10);
        that.graph.container.attr("transform", d3.event.transform);
      });
    }
  }, {
    key: "drag",
    value: function drag(simulation) {
      var that = this;

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

      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }
  }]);

  return Handler;
}();

var Renderer = /*#__PURE__*/function () {
  function Renderer() {
    _classCallCheck(this, Renderer);

    _defineProperty(this, "utils", new Utils());
  }

  _createClass(Renderer, [{
    key: "renderLink",
    value: function renderLink(link, linkGlow, linkText) {
      var that = this;
      link.attr("transform", function (d) {
        var angle = that.utils.rotation(d.source, d.target);
        return "translate(" + d.source.x + ", " + d.source.y + ") rotate(" + angle + ")";
      });
      var options = {
        nodeRadius: 25,
        arrowSize: 4
      };
      this.renderLinkText(linkText);
      this.renderLinkGlow(linkGlow);
      this.renderLinkArrow(link, options);
    }
  }, {
    key: "renderLinkArrow",
    value: function renderLinkArrow(link, options) {
      var that = this;
      link.each(function () {
        var rel = d3.select(this),
            outline = rel.select(".arrow"),
            text = rel.select("text");
        outline.attr("d", function (d) {
          var center = {
            x: 0,
            y: 0
          },
              angle = that.utils.rotation(d.source, d.target),
              textBoundingBox = text.node().getBBox(),
              textPadding = 5,
              u = that.utils.unitaryVector(d.source, d.target),
              textMargin = {
            x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5,
            y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5
          },
              n = that.utils.unitaryNormalVector(d.source, d.target),
              rotatedPointA1 = that.utils.rotatePoint(center, {
            x: 0 + (options.nodeRadius + 1) * u.x - n.x,
            y: 0 + (options.nodeRadius + 1) * u.y - n.y
          }, angle),
              rotatedPointB1 = that.utils.rotatePoint(center, {
            x: textMargin.x - n.x,
            y: textMargin.y - n.y
          }, angle),
              rotatedPointC1 = that.utils.rotatePoint(center, {
            x: textMargin.x,
            y: textMargin.y
          }, angle),
              rotatedPointD1 = that.utils.rotatePoint(center, {
            x: 0 + (options.nodeRadius + 1) * u.x,
            y: 0 + (options.nodeRadius + 1) * u.y
          }, angle),
              rotatedPointA2 = that.utils.rotatePoint(center, {
            x: d.target.x - d.source.x - textMargin.x - n.x,
            y: d.target.y - d.source.y - textMargin.y - n.y
          }, angle),
              rotatedPointB2 = that.utils.rotatePoint(center, {
            x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x - u.x * options.arrowSize,
            y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y - u.y * options.arrowSize
          }, angle),
              rotatedPointC2 = that.utils.rotatePoint(center, {
            x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * options.arrowSize,
            y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * options.arrowSize
          }, angle),
              rotatedPointD2 = that.utils.rotatePoint(center, {
            x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x,
            y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y
          }, angle),
              rotatedPointE2 = that.utils.rotatePoint(center, {
            x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x + (-n.x - u.x) * options.arrowSize,
            y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y + (-n.y - u.y) * options.arrowSize
          }, angle),
              rotatedPointF2 = that.utils.rotatePoint(center, {
            x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - u.x * options.arrowSize,
            y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - u.y * options.arrowSize
          }, angle),
              rotatedPointG2 = that.utils.rotatePoint(center, {
            x: d.target.x - d.source.x - textMargin.x,
            y: d.target.y - d.source.y - textMargin.y
          }, angle);
          return "M " + rotatedPointA1.x + " " + rotatedPointA1.y + " L " + rotatedPointB1.x + " " + rotatedPointB1.y + " L " + rotatedPointC1.x + " " + rotatedPointC1.y + " L " + rotatedPointD1.x + " " + rotatedPointD1.y + " Z M " + rotatedPointA2.x + " " + rotatedPointA2.y + " L " + rotatedPointB2.x + " " + rotatedPointB2.y + " L " + rotatedPointC2.x + " " + rotatedPointC2.y + " L " + rotatedPointD2.x + " " + rotatedPointD2.y + " L " + rotatedPointE2.x + " " + rotatedPointE2.y + " L " + rotatedPointF2.x + " " + rotatedPointF2.y + " L " + rotatedPointG2.x + " " + rotatedPointG2.y + " Z";
        });
      });
    }
  }, {
    key: "renderLinkGlow",
    value: function renderLinkGlow(linkGlow) {
      var that = this;
      linkGlow.attr("d", function (d) {
        var center = {
          x: 0,
          y: 0
        },
            angle = that.utils.rotation(d.source, d.target),
            n = that.utils.unitaryNormalVector(d.source, d.target),
            rotatedPointA = that.utils.rotatePoint(center, {
          x: 0 - n.x,
          y: 0 - n.y
        }, angle),
            rotatedPointB = that.utils.rotatePoint(center, {
          x: d.target.x - d.source.x - n.x,
          y: d.target.y - d.source.y - n.y
        }, angle),
            rotatedPointC = that.utils.rotatePoint(center, {
          x: d.target.x - d.source.x,
          y: d.target.y - d.source.y
        }, angle),
            rotatedPointD = that.utils.rotatePoint(center, {
          x: 0,
          y: 0
        }, angle);
        return "M " + rotatedPointA.x + " " + rotatedPointA.y + " L " + rotatedPointB.x + " " + rotatedPointB.y + " L " + rotatedPointC.x + " " + rotatedPointC.y + " L " + rotatedPointD.x + " " + rotatedPointD.y + " Z";
      });
    }
  }, {
    key: "renderLinkText",
    value: function renderLinkText(linkText) {
      var that = this;
      linkText.attr("transform", function (d) {
        var angle = (that.utils.rotation(d.source, d.target) + 360) % 360,
            mirror = angle > 90 && angle < 270,
            center = {
          x: 0,
          y: 0
        },
            n = that.utils.unitaryNormalVector(d.source, d.target),
            nWeight = mirror ? 2 : -3,
            point = {
          x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight,
          y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight
        },
            rotatedPoint = that.utils.rotatePoint(center, point, angle);
        return "translate(" + rotatedPoint.x + ", " + rotatedPoint.y + ") rotate(" + (mirror ? 180 : 0) + ")";
      });
    }
  }]);

  return Renderer;
}();

var unique = function unique(array) {
  return array.filter(function (v, i, a) {
    return a.indexOf(v) === i;
  });
};

function renameItemDict(original, keys) {
  return original.map(function (i) {
    return Object.entries(keys).map(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          k = _ref5[0],
          v = _ref5[1];

      if (k === v) return i;
      Object.defineProperty(i, k, Object.getOwnPropertyDescriptor(i, v));
      delete i[v];
      return i;
    })[0];
  });
}

var Utils = /*#__PURE__*/function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, [{
    key: "rotation",
    value: function rotation(source, target) {
      return Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI;
    }
  }, {
    key: "unitaryVector",
    value: function unitaryVector(source, target, newLength) {
      var length = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / Math.sqrt(newLength || 1);
      return {
        x: (target.x - source.x) / length,
        y: (target.y - source.y) / length
      };
    }
  }, {
    key: "unitaryNormalVector",
    value: function unitaryNormalVector(source, target, newLength) {
      var center = {
        x: 0,
        y: 0
      },
          vector = this.unitaryVector(source, target, newLength);
      return this.rotatePoint(center, vector, 90);
    }
  }, {
    key: "rotate",
    value: function rotate(cx, cy, x, y, angle) {
      var radians = Math.PI / 180 * angle,
          cos = Math.cos(radians),
          sin = Math.sin(radians),
          nx = cos * (x - cx) + sin * (y - cy) + cx,
          ny = cos * (y - cy) - sin * (x - cx) + cy;
      return {
        x: nx,
        y: ny
      };
    }
  }, {
    key: "rotatePoint",
    value: function rotatePoint(c, p, angle) {
      return this.rotate(c.x, c.y, p.x, p.y, angle);
    }
  }]);

  return Utils;
}();

module.exports = Blooom;