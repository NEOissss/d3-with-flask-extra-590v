var margin_scatter = {top: 20, right: 50, bottom: 60, left: 50},
width_scatter = 960 - margin_scatter.left - margin_scatter.right,
height_scatter = 500 - margin_scatter.top - margin_scatter.bottom;

// X, Y axis length
var scatter_x = d3.scaleLinear()
    .range([0, width_scatter]);
var scatter_y = d3.scaleLinear()
    .range([height_scatter, 0]);

// Color
var color_scatter = d3.scaleOrdinal(d3.schemeCategory20);

// Set SVG area
var svg_scatter = d3.select("vis3")
          .append('svg')
          .attr("width", width_scatter + margin_scatter.left + margin_scatter.right)
          .attr("height", height_scatter + margin_scatter.top + margin_scatter.bottom)
          .append("g")
          .attr("transform", "translate(" + margin_scatter.left + "," + margin_scatter.top + ")");

// X, Y axis and radius
var xCat = "Life Expectancy",
    yCat = "Fertility Rate",
    rCat = "Population";

// Opacity
var Opac = {"X": false, "Y": false, "R": false};

//  Load data
var scatter_queue = d3.queue();
getScatterUrls('1960').forEach(function(url) {scatter_queue.defer(d3.json, url)});

// Draw scatter
scatter_queue.awaitAll(function(error, datasets) {
    if (error) throw error;

    scatter_x.domain(d3.extent(datasets[0], function(d) { return d.value * 1.1; })).nice();
    scatter_y.domain(d3.extent(datasets[1], function(d) { return d.value * 1.05; })).nice();

    // X axis
    svg_scatter.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height_scatter + ")")
        .call(d3.axisBottom(scatter_x))

    svg_scatter.append("text")
        .attr("class", "x_label")
        .attr("x", width_scatter / 2 + margin_scatter.left)
        .attr("y", height_scatter + margin_scatter.top + 25)
        .style("text-anchor", "end")
        .text(xCat);

    // Y axis
    svg_scatter.append("g")
        .attr("class", "y_axis")
        .call(d3.axisLeft(scatter_y));

    // Y axis label
    svg_scatter.append("text")
        .attr("class", "y_label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_scatter.left)
        .attr("x", 0 - (height_scatter / 2) + margin_scatter.top)
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text(yCat);

    // Radius label
    svg_scatter.append("text")
        .attr("class", "r_label")
        .attr("x", width_scatter / 2 + margin_scatter.left)
        .attr("y", 0)
        .style("text-anchor", "end")
        .text(rCat);

    // Append scatters
    svg_scatter.selectAll(".dot")
        .data(datasets[0])
        .enter().append("circle")
        .attr("class", "dot")
        .attr("opacity", 0.75)
        .attr("cx", function(d) { return scatter_x(d.value); })
        .attr("cy", function(d, i) { return scatter_y(datasets[1][i].value); })
        .attr("r", function(d, i) { return 0.0025 * Math.sqrt(datasets[2][i].value); })
        .attr("idx", function(d, i) { return i; })
        .attr("name", function(d) { return d.name; })
        .style("fill", function(d) { return color_scatter(d.id); })
        .style("stroke", "black")
        .attr('data-toggle', 'tooltip')
        .attr('data-html', "true")
        .attr('title', function(d, i) { return "Country: " + d.name + "<br>Life Expectancy: " + d.value + "<br>Fertility Rate: " + datasets[1][i].value + "<br>Population: " + datasets[2][i].value; })
        .on('mouseover',function(d){
          d3.select(this)
            .style("opacity", 1)
            .style("stroke","red")
        })
        .on('mouseout', function(d){
          d3.select(this)
            .style("opacity", 0.75)
            .style("stroke","black")
        })
});

function getScatterUrls(year) {
    return [ locator('life', 'all', year), locator('birth', 'all', year), locator('population', 'all', year) ];
}

// Change scatter data
function scatterChange(year){
    scatterSelChange(year);
    var scatter_queue = d3.queue();
    getScatterUrls(year).forEach(function(url) {scatter_queue.defer(d3.json, url)});
    scatter_queue.awaitAll(function(error, datasets) {
        if (error) throw error;
        d3.select('vis3').selectAll('circle')
          .transition()
          .duration(500)
          .attr("cx", function(d, i) { return scatter_x(datasets[0][i].value); })
          .attr("cy", function(d, i) { return scatter_y(datasets[1][i].value); })
          .attr("r", function(d, i) { return 0.0025 * Math.sqrt(datasets[2][i].value); })
          .attr('data-original-title', function(d, i) { return "Country: " + d.name + "<br>Life Expectancy: " + datasets[0][i].value + "<br>Fertility Rate: " + datasets[1][i].value + "<br>Population: " + datasets[2][i].value; })
    })
}

function scatterSelChange(value) {
    var sel = document.getElementsByTagName('select')['scatter'];
    var opts = sel.options;
    for (var opt, j = 0; opt = opts[j]; j++) {
        if (opt.value == value) {
          sel.selectedIndex = j;
          break;
        }
    }
}

// Animation
$('#playScatter').on('click', function () {
  var $this = $(this);
  var loadingText = 'Playing...';
  if ($(this).html() !== loadingText) {
      $this.data('original-text', $(this).html());
      $this.html(loadingText);
      var promise = Promise.resolve();
      d3.json('/years', function(d) {
        d.forEach(function(year) {
          promise = promise.then(function () {
            scatterChange(year);
            return new Promise(function (resolve) { setTimeout(resolve, 500); });
          });
        })
        promise.then(function () { $this.html($this.data('original-text'));})
      })
  }
})
