var margin = {top: 20, right: 20, bottom: 20, left: 20};
	width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom,
    formatPercent = d3.format(".1%");
var day = 1;

var svg = d3.select("#map").append("svg")
	.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(d3.behavior.zoom().on("zoom", function () {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
      }))
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

queue()
	.defer(d3.csv, "covid_data_processed.csv")
	.defer(d3.json, "us-counties.topojson")
	.await(ready);

var legendText = ["0", "", "10", "", "1000", "", "5000", ""];
var legendColors = ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"];


function ready(error, data, us) {

	var counties = topojson.feature(us, us.objects.counties);

	data.forEach(function(d) {
		d.fips = +d.fips;
	});

	var dataByCountyByYear = d3.nest()
		.key(function(d) { return d.fips; })
		.map(data);

	counties.features.forEach(function(county) {
		// console.log(dataByCountyByYear[county.id]);
        county.properties.date = dataByCountyByYear[+county.id]
        // console.log(county.properties)
	});

	var color = d3.scale.threshold()
		.domain([0, 1, 10, 100, 1000, 5000, 10000])
		.range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);

	var projection = d3.geo.albersUsa()
		.translate([width / 2, height / 2]);

	var path = d3.geo.path()
		.projection(projection);

	var countyShapes = svg.selectAll(".county")
		.data(counties.features)
		.enter()
		.append("path")
			.attr("class", "county")
			.attr("d", path);

	countyShapes
		.on("mouseover", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 1);
			tooltip.html(
			"<p><strong>" + d.properties.date[0]["Admin2"] + "</strong></p>" +
			"<table><tbody><tr><td class='wide'>Cases on Day " + day +":</td><td>" + d.properties.date[0][day] + "</td></tr>" +
			"</tbody></table>"
			)
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 0);
		});

	svg.append("path")
		.datum(topojson.feature(us, us.objects.states, function(a, b) { return a !== b; }))
			.attr("class", "states")
			.attr("d", path);

	var legend = svg.append("g")
		.attr("id", "legend");

	var legenditem = legend.selectAll(".legenditem")
		.data(d3.range(8))
		.enter()
		.append("g")
			.attr("class", "legenditem")
			.attr("transform", function(d, i) { return "translate(" + i * 31 + ",0)"; });

	legenditem.append("rect")
		.attr("x", width - 240)
		.attr("y", -7)
		.attr("width", 30)
		.attr("height", 6)
		.attr("class", "rect")
		.style("fill", function(d, i) { return legendColors[i]; });

	legenditem.append("text")
		.attr("x", width - 240)
		.attr("y", -10)
		.style("text-anchor", "middle")
		.text(function(d, i) { return legendText[i]; });

	function update(day){
		slider.property("value", day);
		d3.select(".year").text("Day: " +day);
		countyShapes.style("fill", function(d) {
            if ( typeof d.properties.date != "undefined" ) {
                return color(d.properties.date[0][day]);
            } else {
                return color(0);
            }
		});
	}

	var slider = d3.select(".slider")
		.append("input")
			.attr("type", "range")
			.attr("min", 1)
			.attr("max", 80)
			.attr("step", 1)
			.on("input", function() {
				day = this.value;
				update(day);
			});

update(1);

}

d3.select(self.frameElement).style("height", "685px");