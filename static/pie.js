var margin_pie = {top: 0, right: 0, bottom: 0, left: 0},
width_pie = 300 - margin_pie.left - margin_pie.right,
height_pie = 350 - margin_pie.top - margin_pie.bottom;

svg_pie1 = d3.select('vis41')
            .append('svg')
            .attr('width', width_pie)
            .attr('height', height_pie)
            .append("g")
            .attr("transform", "translate(" + width_pie/2 + "," + height_pie/2 + ")");

svg_pie2 = d3.select('vis42')
            .append('svg')
            .attr('width', width_pie)
            .attr('height', height_pie)
            .append("g")
            .attr("transform", "translate(" + width_pie/2 + "," + height_pie/2 + ")");

svg_pie3 = d3.select('vis43')
            .append('svg')
            .attr('width', width_pie)
            .attr('height', height_pie)
            .append("g")
            .attr("transform", "translate(" + width_pie/2 + "," + height_pie/2 + ")");

var radius = Math.min(width_pie, height_pie) / 2 ;

var pie_color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { if (d.value==0) return 0.1; return d.value; });

var pie_path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

// Load data
var pie_queue = d3.queue();
getPieUrls('1960').forEach(function(url) {pie_queue.defer(d3.json, url)});

// Draw pie charts
pie_queue.awaitAll(function(error, datasets) {
    if (error) throw error;

    var arc1 = svg_pie1.selectAll(".arc")
        .data(pie(datasets[0]))
        .enter().append("g")
        .attr("class", "arc");

    arc1.append("path")
        .attr("d", pie_path)
        .attr("fill", function(d) { return color_scatter(d.data.id); })
        .attr('opacity', 0.9)
        .attr("id", function(d) { return d.data.id; })
        .on('mouseover',function(d){ mouseOn(d.data.id) })
        .on('mouseout', function(d){ mouseOut(d.data.id)})
        .attr('data-toggle', 'tooltip')
        .attr('data-html', "true")
        .attr('title', function(d) { return "Country: " + d.data.name + "<br>Population: " + d.data.value; });

    var arc2 = svg_pie2.selectAll(".arc")
        .data(pie(datasets[1]))
        .enter().append("g")
        .attr("class", "arc");

    arc2.append("path")
        .attr("d", pie_path)
        .attr("fill", function(d) { return color_scatter(d.data.id); })
        .attr('opacity', 0.9)
        .attr("id", function(d) { return d.data.id; })
        .on('mouseover',function(d){ mouseOn(d.data.id) })
        .on('mouseout', function(d){ mouseOut(d.data.id)})
        .attr('data-toggle', 'tooltip')
        .attr('data-html', "true")
        .attr('title', function(d) { return "Country: " + d.data.name + "<br>Energy use: " + d.data.value; });

    var arc3 = svg_pie3.selectAll(".arc")
        .data(pie(datasets[2]))
        .enter().append("g")
        .attr("class", "arc");

    arc3.append("path")
        .attr("d", pie_path)
        .attr("fill", function(d) { return color_scatter(d.data.id); })
        .attr('opacity', 0.9)
        .attr("id", function(d) { return d.data.id; })
        .on('mouseover',function(d){ mouseOn(d.data.id) })
        .on('mouseout', function(d){ mouseOut(d.data.id)})
        .attr('data-toggle', 'tooltip')
        .attr('data-html', "true")
        .attr('title', function(d) { return "Country: " + d.data.name + "<br>GDP: " + d.data.value; });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

})

function getPieUrls(year) {
    return [ locator('population', 'all', year), locator('energy', 'all', year), locator('gdp', 'all', year) ];
}

// Change pie charts data
function pieChange(year) {
    pieSelChange(year);

    var pie_queue = d3.queue();
    getPieUrls(year).forEach(function(url) {pie_queue.defer(d3.json, url)});

    pie_queue.awaitAll(function(error, datasets) {
        if (error) throw error;

        svg_pie1.selectAll(".arc")
                .data(pie(datasets[0]))
                .select('path')
                .transition().duration(500)
                .attr('d', pie_path)
                .attr('data-original-title', function(d){ return "Country: " + d.data.name + "<br>Population: " + d.data.value; });
        svg_pie2.selectAll(".arc")
                .data(pie(datasets[1]))
                .select('path')
                .transition().duration(500)
                .attr('d', pie_path)
                .attr('data-original-title', function(d){ return "Country: " + d.data.name + "<br>Energy use: " + d.data.value; });
        svg_pie3.selectAll(".arc")
                .data(pie(datasets[2]))
                .select('path')
                .transition().duration(500)
                .attr('d', pie_path)
                .attr('data-original-title', function(d){ return "Country: " + d.data.name + "<br>GDP: " + d.data.value; });
    })
}

function mouseOn(name) {
    d3.select('div.container#pies').selectAll('#'+name)
        .style("stroke","black")
        .style("stroke-width",2)
        .attr('opacity', 1);
}

function mouseOut(name) {
    d3.select('div.container#pies').selectAll('#'+name)
        .style("stroke","black")
        .style("stroke-width",0)
        .attr('opacity', 0.9);
}

function pieSelChange(value) {
    var sel = document.getElementsByTagName('select')['pie'];
    var opts = sel.options;
    for (var opt, j = 0; opt = opts[j]; j++) {
        if (opt.value == value) {
          sel.selectedIndex = j;
          break;
        }
    }
}

// Animation
$('#playPie').on('click', function () {
  var $this = $(this);
  var loadingText = 'Playing...';
  if ($(this).html() !== loadingText) {
      $this.data('original-text', $(this).html());
      $this.html(loadingText);
      var promise = Promise.resolve();
      d3.json('/years', function(d) {
        d.forEach(function(year) {
          promise = promise.then(function () {
            pieChange(year);
            return new Promise(function (resolve) { setTimeout(resolve, 500); });
          });
        })
        promise.then(function () { $this.html($this.data('original-text'));})
      })
  }
})
