app.factory('Visualizations', function() {
    return {

        new: function() {
            return {
                svg: null,

                initGrid: function() {
                    const toolbarWidth = '400'; // px
                    const width = $(document).width() - toolbarWidth;
                    const height = $(document).height();
                    const zoomScale = [0.1, 10];
                    const zoomBounds = [
                        [-20 * width, -10 * height],
                        [10 * width, 40 * height]
                    ]; // [[-x,y],[x,-y]]

                    var sim = d3.select('svg')
                    .attr('width', width)
                    .attr('height', height);

                    var zoom = d3.zoom()
                    .scaleExtent(zoomScale)
                    .translateExtent(zoomBounds)
                    .on('zoom', zoomed);

                    var x = d3.scaleLinear()
                    .domain([-1, width + 1])
                    .range([-1, width + 1]);

                    var y = d3.scaleLinear()
                    .domain([-1, height + 1])
                    .range([-1, height + 1]);

                    var xAxis = d3.axisBottom(x)
                    .ticks((width + 2) / (height + 2) * 10)
                    .tickSize(height)
                    .tickPadding(8 - height);

                    var yAxis = d3.axisRight(y)
                    .ticks(10)
                    .tickSize(width)
                    .tickPadding(8 - width);

                    var gX = sim.append('g')
                    .attr('class', 'axis axis--x')
                    .call(xAxis);

                    var gY = sim.append('g')
                    .attr('class', 'axis axis--y')
                    .call(yAxis);

                    sim.call(zoom)
                    .on('dblclick.zoom', null);

                    const that = this;

                    function zoomed() {
                        sim.selectAll('.tick text').remove();
                        gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
                        gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
                        that.svg.attr('transform', d3.event.transform);
                    };

                    sim.selectAll('.tick text').remove();
                },
                update: function(data) {
                    // remove old tree
                    d3.select('.tree').remove();

                    this.svg = d3.select('.main')
                        .append('g')
                        .attr('class','tree');

                    var tIn = d3.transition()
                        .duration(1000);

                    var tOut = d3.transition()
                        .duration(1000);

                    console.log(JSON.parse(data));

                    var link = this.svg.selectAll('.link')
                        .data($scope.data.links,function(l,idx) {
                            return l.id;
                        })
                        .datum(function(l,i,nodes) {
                            // update link values to reflect new data indices
                            let st = l.id.split(':');
                            let s = $scope.data.getNode(st[0],true);
                            let t = $scope.data.getNode(st[1],true);

                            l.source = s;
                            l.target = t;

                            return l;
                        });

                    var node = this.svg.selectAll('g')
                        .data($scope.data.nodes,function(d,idx) {
                            // this is update because:
                            // on enter(), these nodes don't actually exist yet
                            let lidId;

                            try {
                                lidId = d['local_identifier'][0];
                            } catch (err) {
                                lidId = d['identifier_reference'][0];
                            }

                            // configure horiontal (x) position

                            if (d.rootNode) d.x = colWidth - xOffset;
                            else d.x = d.col * colWidth - xOffset;

                            // configure vertical (y) position
                            d.y = verticalOffset + idx * verticalSpacing;

                            d.lid = lidId;

                            return d.lid;
                        });

                    var title = this.svg.selectAll('.node-title')
                        .text(function(d) {
                            return d.name[0];
                        });

                    var linkEnter = link
                        .enter().append('path')
                        .attr('class', 'link')
                        .style('opacity',1e-6);

                    linkEnter.transition(tIn)
                        .delay(100)
                        .style('opacity', linkOpacity);

                    var nodeEnter = node
                        .enter().append('g')
                        .classed('node', true)
                        .on('click', toggleHighlights)
                        .attr('id', function(d) {
                            let _id;

                            try {
                                _id = d['local_identifier'][0].replace('.', '-');
                            } catch (err) {
                                _id = d['identifier_reference'][0].replace('.', '-');
                            }

                            return _id;
                        })
                        .style('opacity',1e-6)
                        .attr('transform', function(d,idx) {
                            return `translate(${d.x,d.y})`;
                        });

                    nodeEnter.transition(tIn)
                        .style('opacity',1)

                    // configure behavior when nodes enter
                    // append ellipse to each node group
                    nodeEnter
                        .append('ellipse')
                        .attr('class', 'circle')
                        .style('stroke', nodeStroke)
                        .style('fill', highlightNode)
                        .attr('rx',1e-6)
                        .attr('ry',1e-6)
                        .transition(tIn)
                        .attr('rx', rx)
                        .attr('ry', ry)

                    // append text to each node group
                    nodeEnter
                        .append('text')
                        .attr('class','node-title')
                        .text(function(d) {
                            return d.name[0];
                        })
                        .style('font-size', function(d) {
                            let maths = Math.min(2 * ry, (2 * ry) / this.getComputedTextLength() * 40);
                            return `${maths}px`;
                        })
                        .attr('dx', () => rx * -.8)
                        .attr('dy', () => ry / 4)
                        .style('opacity',1e-6)
                        .transition(tIn)
                        .delay(750)
                        .style('opacity',1);
                    nodeEnter
                        .attr('transform', function(d, idx) {
                            // configure horiontal (x) position

                            if (d.rootNode) d.x = colWidth - xOffset;
                            else d.x = d.col * colWidth - xOffset;

                            // configure vertical (y) position
                            d.y = verticalOffset + idx * verticalSpacing;
                            return `translate(${d.x},${d.y})`;
                        });

                    // configure behavior when links enter
                    linkEnter
                        .attr('d', d3.linkHorizontal()
                            .x(function(d) {
                                return $scope.data.nodes[d].x;
                            })
                            .y(function(d) {
                                return $scope.data.nodes[d].y;
                            })
                        )
                        .attr('fill', 'none')
                        .attr('stroke', linkStroke)
                        .attr('stroke-width', linkStrokeWidth);

                    // // // REMOVE // // //
                    var nodeExit = node.exit()
                        .transition(tOut)
                        .style('opacity',1e-6)
                        .remove();

                    var linkExit = link.exit()
                        .transition(tOut)
                        .style('opacity',1e-6)
                        .remove();

                    // TODO transition on update here:
                    link
                        .transition()
                        .duration(750)
                        .delay(1000)
                        .attr('d', d3.linkHorizontal()
                            .x(function(l,idx) {
                                return $scope.data.nodes[l].x;
                            })
                            .y(function(l,idx) {
                                return $scope.data.nodes[l].y;
                            })
                        );

                    node
                        .transition()
                        .duration(750)
                        .delay(1000)
                        .attr('transform',function(d) {
                            return `translate(${d.x},${d.y})`;
                        });

                }
            }
        }

    }
});
