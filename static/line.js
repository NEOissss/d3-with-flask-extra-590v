var margin_line = {top: 20, right: 0, bottom: 40, left: 50},
width_line = 900 - margin_line.left - margin_line.right,
height_line = 500 - margin_line.top - margin_line.bottom;

var color_line = d3.scaleOrdinal(d3.schemeCategory10);

var parseTime = d3.timeParse("%Y");

var svg_line = d3.select('vis2')
    .append('svg')
    .attr("width", width_line + margin_line.left + margin_line.right)
    .attr("height", height_line + margin_line.top + margin_line.bottom)
    .append("g")
    .attr("transform", "translate(" + margin_line.left + "," + margin_line.top + ")");

// set the ranges
var line_x = d3.scaleTime().range([0, width_line]),
    line_y = d3.scaleLinear().range([height_line, 0]);

// define the line
var line = d3.line()
    .x(function(d) { return line_x(d.k); })
    .y(function(d) { return line_y(d.v); });

var tooltip = d3.select('#tooltip');
var tooltipLine = svg_line.append('line');

var name_idx = {1: "Growth Rate", 4: "Mortality Rate", 5: "HIV Prevalence"};

// Set line opacity
var Opac = {"Growth Rate": false, "Mortality Rate": false, "HIV Rate": false};

// Load data from server
var line_queue = d3.queue();
getLineUrls('AFG').forEach(function(url) {line_queue.defer(d3.json, url)});

// Draw lines
line_queue.awaitAll(function(error, datasets) {
    if (error) throw error;
    // format the data
    datasets.forEach(function(data) { data.value.forEach(function(d) { d.k = parseTime(d.k); }) })

    global_datasets = datasets;

    // Visualization #1
    var y_max = d3.max(datasets, function(data) { return d3.max(data.value, function(d) {return d.v; }) });
    var y_min = d3.min(datasets, function(data) { return d3.min(data.value, function(d) {return d.v; }) });

    line_x.domain(d3.extent(datasets[0].value, function(d, i) { if(i==56) return parseTime('2017');return d.k; }));
    line_y.domain([y_min, y_max]);

    // Add the X Axis
    svg_line.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height_line + ")")
        .call(d3.axisBottom(line_x));

    // X axis label
    svg_line.append("text")
        .attr("class", "x_label")
        .attr("x", width_line / 2)
        .attr("y", height_line + margin_line.bottom)
        .style("text-anchor", "end")
        .text("Year");

    // Add the Y Axis
    svg_line.append("g")
        .attr("class", "y_axis")
        .call(d3.axisLeft(line_y));

    // Y axis label
    svg_line.append("text")
        .attr("class", "y_label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_line.left)
        .attr("x", 0 - (height_line / 2))
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("Rate(%)");

    datasets.forEach(function(data) {
        var col = data.col;
        // Add the line path.
        svg_line.append("path")
            .data([data.value])
            .attr("id", 'col'+col)
            .attr("d", line)
            .attr("stroke", color_line(col))
            .attr("stroke-width", 2)
            .attr("fill", "none");

        // Add legend
        var legend = svg_line.selectAll(".legend")
        .data(color_line.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        // Legend color squate with interaction
        legend.append("rect")
        .attr("x", width_line + margin_line.right - 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("id", 'col'+col)
        .style("fill", color_line)
        .on("click", function(d){
            // Determine if current line is visible
            var active = Opac[d] ? false : true ,
                newExist = active ? "None" : "Initial",
                newColor = active ? "#929292" : color_line(d);
            //console.log(d);
            // Hide or show the elements
            d3.select('vis2').selectAll('path').filter("#"+'col'+col).style("display", newExist);
            d3.select('vis2').selectAll('rect').filter("#"+'col'+col).style("fill", newColor);
            // Update whether or not the elements are active
            Opac[d] = active;
        });

        // Legend text
        legend.append("text")
        .attr("x", width_line + margin_line.right - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(name_idx[col]);
    });

})

// Tooltip
tipBox = svg_line.append('rect')
  .attr('width', width_line)
  .attr('height', height_line)
  .attr('opacity', 0)
  .on('mousemove', drawTooltip)
  .on('mouseout', removeTooltip);

function removeTooltip() {
    if (tooltip) tooltip.style('display', 'none');
    if (tooltipLine) tooltipLine.attr('stroke', 'none');
}

function drawTooltip() {
    var date = line_x.invert(d3.mouse(tipBox.node())[0]);
    var idx = Math.floor(d3.timeDay.count(new Date(1960, 0, 0), date) / 365);
    var value = [];
    global_datasets.forEach(function(data) {
        value.push({
            'name': name_idx[data.col],
            'col' : data.col,
            'value': data.value[idx].v
        });
    })

  tooltipLine.attr('stroke', 'black')
    .attr('x1', line_x(date))
    .attr('x2', line_x(date))
    .attr('y1', 0)
    .attr('y2', height_line);

  tooltip.html('Year: ' + date.toLocaleDateString().split('/')[2])
    .style('display', 'block')
    .style('left', d3.event.pageX + 20 + 'px')
    .style('top', d3.event.pageY - 20 + 'px')
    .selectAll()
    .data(value).enter()
    .append('div')
    .style('color', (d) => {return color_line(d.col);})
    .html((d)=>{return d.name + ': ' + d.value;});
}

function getLineUrls(name) {
    return [ locator('growth', name, 'all'), locator('death', name, 'all'), locator('hiv', name, 'all') ]
}

// Change line data
function lineChange(value) {
    lineSelChange(value);
    var line_queue = d3.queue();
    getLineUrls(value).forEach(function(url) {line_queue.defer(d3.json, url)});
    line_queue.awaitAll(function(error, datasets) {
        if (error) throw error;
        // format the data
        datasets.forEach(function(data) { data.value.forEach(function(d) { d.k = parseTime(d.k); }) })
        global_datasets = datasets;
        y_max = d3.max(datasets, function(data) { return d3.max(data.value, function(d) {return d.v; }) });
        y_min = d3.min(datasets, function(data) { return d3.min(data.value, function(d) {return d.v; }) });
        line_y.domain([y_min, y_max]);
        d3.select('vis2').select(".y_axis").transition().duration(500).call(d3.axisLeft(line_y));
        [1,4,5].forEach(function(d, k) {
            d3.select('vis2').selectAll("path#col"+d).data([datasets[k].value]).transition().duration(500).attr("d", line);
        })
    })
}

function lineSelChange(value) {
    var sel = document.getElementsByTagName('select')['line'];
    var opts = sel.options;
    for (var opt, j = 0; opt = opts[j]; j++) {
        if (opt.value == value) {
          sel.selectedIndex = j;
          break;
        }
    }
}
