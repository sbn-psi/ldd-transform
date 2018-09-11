app.factory('Visualizations', function() {
    return {

        new: function() {
            console.log('holla back, world');
        },

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
        }

    }
});
