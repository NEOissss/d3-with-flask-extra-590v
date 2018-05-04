var margin_map = {top: 0, right: 0, bottom: 0, left: 0},
            width_map = 960 - margin_map.left - margin_map.right,
            height_map = 560 - margin_map.top - margin_map.bottom;

var color_map = d3.scaleThreshold()
    .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

var path = d3.geoPath();

var svg_map = d3.select("vis1")
            .append("svg")
            .attr("width", width_map)
            .attr("height", height_map)
            .append('g')
            .attr('class', 'map');

var projection = d3.geoMercator()
                   .scale(130)
                  .translate( [width_map / 2, height_map / 1.5]);

var path = d3.geoPath().projection(projection);

// Load data
d3.queue()
    .defer(d3.json, "static/world_countries.json")
    .defer(d3.json, locator("population", "all", "2016"))
    .await(ready);

// Draw map
function ready(error, data, population) {
  if (error) throw error;
  var populationById = {};

  population.forEach(function(d) { populationById[d.id] = +d.value; });
  data.features.forEach(function(d) { d.population = populationById[d.id] });

  svg_map.append("g")
      .attr("class", "countries")
    .selectAll("path")
      .data(data.features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) { return color_map(populationById[d.id]); })
      .style('stroke', 'white')
      .style('stroke-width', 1.5)
      .style("opacity",0.8)
      .attr('data-toggle', 'tooltip')
      .attr('data-html', "true")
      .attr('title', function(d) { return "Country: " + d.properties.name + "<br>Population: " + d.population; })
      .style("stroke","white")
      .style('stroke-width', 0.1)
    .on('mouseover',function(d){
      d3.select(this)
        .style("opacity", 1)
        .style("stroke","white")
        .style("stroke-width",1);
    })
    .on('mouseout', function(d){
      d3.select(this)
        .style("opacity", 0.9)
        .style("stroke","white")
        .style("stroke-width",0.1)
        .style("fill", function(d) { return color_map(populationById[d.id]); });
    })
    .on('mousedown', function(d){
      d3.select(this)
        .style("fill", "red");
      lineChange(d.id);
    })
    .on('mouseup', function(d){
      d3.select(this)
        .style("fill", function(d) { return color_map(populationById[d.id]); });
    });

  svg_map.append("path")
      .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
       // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
      .attr("class", "names")
      .attr("d", path);

  $(function () {
      $('[data-toggle="tooltip"]').tooltip()
  })
}

// Change map data
function mapChange(year) {
    d3.json(locator('population', 'all', year), function(population) {
        var populationById = {};
        population.forEach(function(d) { populationById[d.id] = +d.value; });
        d3.select('vis1').selectAll('path')
          .style("fill", function(d) { d.population = populationById[d.id]; return color_map(populationById[d.id]); })
          .attr('data-original-title', function(d) { return "Country: " + d.properties.name + "<br>Population: " + d.population})
    })
}
