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
      // renderLinkGlowSimple(linkGlow);
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