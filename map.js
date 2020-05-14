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
	.defer(d3.csv, "beds.csv")
	.defer(d3.json, "us-counties.topojson")
	.await(ready);

var legendText = ["0", "", "10", "", "1000", "", "5000", ""];
var legendColors = ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"];



function ready(error, data, beds, us) {
	console.log("Data",data);

	// d3.csv("beds.csv", function(data) {
 //    		beds = data;
 //    		beds.forEach(function(d) {
	// 		// console.log("Rows",Object.keys(d));
	// 		d.fips = +d.fips;
	// 	});
	// });
	console.log("Beds",beds);
	
	var counties = topojson.feature(us, us.objects.counties);

	data.forEach(function(d) {
		// console.log("Rows",Object.keys(d));
		d.fips = +d.fips;
	});
	beds.forEach(function(d) {
		// console.log("Rows",Object.keys(d));
		d.BEDS = +d.BEDS;
		d.cases = +d.cases;
		d.deaths = +d.deaths;
		d.POPULATION = +d.POPULATION;
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
		})
		.on("click", function(d) {
			console.log("Click",d);
			select_state(data, d.properties.date[0]["Province_State"]);
			select_state_pc(beds,d.properties.date[0]["Province_State"]);
		});
	var f = 0
	function select_state(data, state){
		// console.log("State1",data);
		f = 1
		statewise = data.filter(function(d){return d["Province_State"] == state;})
		console.log("State",statewise);
		d3.selectAll("#donut").remove();
		update(day);
		donutchart(statewise);
		if(section == "t1"){
			d3.selectAll("#parc").remove();
			parc(statewise);
		}		
	}
	function select_state_pc(data, state){
		// console.log("State1",data);
		statewise = data.filter(function(d){return d["state"] == state;})
		console.log("StatePC",statewise);
		if (section == "t2"){
			d3.selectAll("#parcpc").remove();
			parcpc(statewise);
		}
		// update(day);
		// donutchart(statewise);
		// parc(statewise);		
	}

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
			// console.log(d.properties);
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
			.attr("id", "slide")
			.on("input", function() {
				day = this.value;
				console.log("Hello");
				update(day);
			});

	update(1);
	donutchart(data);
	function donutchart(data){
		var margin = {top: 20, right: 20, bottom: 20, left: 20};
	width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom,
    formatPercent = d3.format(".1%");
		var
	    radius = Math.min(width, height) / 2;

		var color1 = d3.scale.category20();

		var pie = d3.layout.pie()
		    .value(function(d) { return d["1"]; })
		    .sort(null);

		var arc = d3.svg.arc()
		    .innerRadius(radius - 100)
		    .outerRadius(radius - 20);

		var svgpie = d3.select("body").append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .attr("id","donut")
		  .append("g")
		    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		d3.csv("covid_data_processed.csv", type, function(error, data) {});
			var slide = d3.select("#slide")
				.on("input", function() {
						day = this.value;
						// console.log(day);
						update(day);
						change(data,day);
					});

		  var path = svgpie.datum(data).selectAll("path")
		      .data(pie)
		    .enter().append("path")
		      .attr("fill", function(d, i) { return color1(i); })
		      .attr("d", arc)
		      .each(function(d) { this._current = d; }); // store the initial angles

		path
			.on("mouseover", function(d) {
				// console.log("D",d);
					tooltip.transition()
					.duration(250)
					.style("opacity", 1);
					tooltip.html(
					"<p><strong>" + d.data["Admin2"] + "</strong></p>" +
					"<table><tbody><tr><td class='wide'>Cases on Day " + day +":</td><td>" + d.data[day] + "</td></tr>" +
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

		  function change(data,day) {
		    pie.value(function(d) {return d[day]; }); // change the value function
		    path = path.data(pie); // compute the new angles
		    path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
		  }
		// });

		function type(d) {
			for (i = 1; i < 81; i++) {
			  d[i] = +d[i];
			}
		  return d;
		}


		function arcTween(a) {
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) {
		    return arc(i(t));
		  };
		}
	}//end of donut chart
	var section = "t1";
	d3.select('#type')
			.on("change", function () {
				var sect = document.getElementById("type");
				section = sect.options[sect.selectedIndex].value;
				d3.selectAll("#parcpc").remove();
				d3.selectAll("#parc").remove();
				console.log(section);
				if(f == 0){
					if(section == "t1"){
						d3.selectAll("#parcpc").remove();
						parc(data);
					}
					else {
						d3.selectAll("#parc").remove();
						parcpc(beds);
					}
				}
			});

	parc(data);
	function parc(cars){
		d3.selectAll("#parc").remove();
		var x = d3.scale.ordinal().rangePoints([0, width], 1),
		    y = {},
		    dragging = {};

		var line = d3.svg.line(),
		    axis = d3.svg.axis().orient("left"),
		    background,
		    foreground;

		var svg = d3.select("body").append("svg")
			.attr("id","parc")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		  // Extract the list of dimensions and create a scale for each.
		  x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
		    return (d != "Admin2" && d != "Combined_Key"&& d != "Country_Region"&& d != "Lat"&& d != "Long_"&& d != "Province_State"&& d != "UID"&& d != "code3"&& d != "fips"&& d != "iso2"&& d != "iso3"&& d != "1"&& d != "2"&& d != "3"&& d != "4"&& d != "5"&& d != "6"&& d != "7"&& d != "8"&& d != "9"&& d != "11"&& d != "12"&& d != "13"&& d != "14"&& d != "15"&& d != "16"&& d != "17"&& d != "18"&& d != "19"&& d != "21"&& d != "22"&& d != "23" && d != "24" && d != "25" && d != "26" && d != "27" && d != "28" && d != "29" && d != "31" && d != "32" && d != "33" && d != "34" && d != "35" && d != "36" && d != "37" && d != "38" && d != "39" && d != "41" && d != "42" && d != "43" && d != "44" && d != "45" && d != "46" && d != "47" && d != "48" && d != "49" && d != "51" && d != "52" && d != "53" && d != "54" && d != "55" && d != "56" && d != "57" && d != "58" && d != "59" && d != "61" && d != "62" && d != "63" && d != "64" && d != "65" && d != "66" && d != "67" && d != "68" && d != "69" && d != "71" && d != "72" && d != "73" && d != "74" && d != "75" && d != "76" && d != "77" && d != "78" && d != "79") && (y[d] = d3.scale.linear()
		    // return (d == "1" && d == "10" && d == "20" && d == "40" && d == "60" && d == "80") && (y[d] = d3.scale.linear()
		        .domain(d3.extent(cars, function(p) { return +p[d]; }))
		        .range([height, 0]));
		  }));

		  // Add grey background lines for context.
		  background = svg.append("g")
		      .attr("class", "background")
		    .selectAll("path")
		      .data(cars)
		    .enter().append("path")
		      .attr("d", path);

		  // Add blue foreground lines for focus.
		  foreground = svg.append("g")
		      .attr("class", "foreground")
		    .selectAll("path")
		      .data(cars)
		    .enter().append("path")
		      .attr("d", path)
	      		.on("mouseover", function(d) {
			// console.log("D",d);
				tooltip.transition()
				.duration(250)
				.style("opacity", 1);
				tooltip.html(
				"<p><strong>" + d["Admin2"] + "</strong></p>" +
				"<table><tbody><tr><td class='wide'>Cases on Day " + day +":</td><td>" + d[day] + "</td></tr>" +
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

		  // Add a group element for each dimension.
		  var g = svg.selectAll(".dimension")
		      .data(dimensions)
		    .enter().append("g")
		      .attr("class", "dimension")
		      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
		      .call(d3.behavior.drag()
		        .origin(function(d) { return {x: x(d)}; })
		        .on("dragstart", function(d) {
		          dragging[d] = x(d);
		          background.attr("visibility", "hidden");
		        })
		        .on("drag", function(d) {
		          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
		          foreground.attr("d", path);
		          dimensions.sort(function(a, b) { return position(a) - position(b); });
		          x.domain(dimensions);
		          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
		        })
		        .on("dragend", function(d) {
		          delete dragging[d];
		          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
		          transition(foreground).attr("d", path);
		          background
		              .attr("d", path)
		            .transition()
		              .delay(500)
		              .duration(0)
		              .attr("visibility", null);
		        }));

		  // Add an axis and title.
		  g.append("g")
		      .attr("class", "axis")
		      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
		    .append("text")
		      .style("text-anchor", "middle")
		      .attr("y", -9)
		      .text(function(d) { return d; });

		  // Add and store a brush for each axis.
		  g.append("g")
		      .attr("class", "brush")
		      .each(function(d) {
		        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
		      })
		    .selectAll("rect")
		      .attr("x", -8)
		      .attr("width", 16);

		function position(d) {
		  var v = dragging[d];
		  return v == null ? x(d) : v;
		}

		function transition(g) {
		  return g.transition().duration(500);
		}

		// Returns the path for a given data point.
		function path(d) {
			// console.log("D",d);
			li = line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
		  return li;
		}

		function brushstart() {
		  d3.event.sourceEvent.stopPropagation();
		}

		// Handles a brush event, toggling the display of foreground lines.
		function brush() {
		  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
		      extents = actives.map(function(p) { return y[p].brush.extent(); });
		  foreground.style("display", function(d) {
		    return actives.every(function(p, i) {
		      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
		    }) ? null : "none";
		  });
		}
	}
	function parcpc(cars){
		d3.selectAll("#parpc").remove();
		var x = d3.scale.ordinal().rangePoints([0, width], 1),
		    y = {},
		    dragging = {};

		var line = d3.svg.line(),
		    axis = d3.svg.axis().orient("left"),
		    background,
		    foreground;

		var svg = d3.select("body").append("svg")
			.attr("id","parcpc")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		  // Extract the list of dimensions and create a scale for each.
		  x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
		    return (d != "county" && d != "state" && d != "date" && d != "Combined_Key"&& d != "COUNTYFIPS"&& d != "fips") && (y[d] = d3.scale.linear()
		    // return (d == "1" && d == "10" && d == "20" && d == "40" && d == "60" && d == "80") && (y[d] = d3.scale.linear()
		        .domain(d3.extent(cars, function(p) { return +p[d]; }))
		        .range([height, 0]));
		  }));

		  // Add grey background lines for context.
		  background = svg.append("g")
		      .attr("class", "background")
		    .selectAll("path")
		      .data(cars)
		    .enter().append("path")
		      .attr("d", path);

		  // Add blue foreground lines for focus.
		  foreground = svg.append("g")
		      .attr("class", "foreground")
		    .selectAll("path")
		      .data(cars)
		    .enter().append("path")
		      .attr("d", path)
	      		.on("mouseover", function(d) {
			// console.log("D",d);
				tooltip.transition()
				.duration(250)
				.style("opacity", 1);
				tooltip.html(
				"<p><strong>" + d["state"] + " : " + d['county']+ "</strong></p>" +
				"<table><tbody><tr><td class='wide'>Cases on Day " +"80:</td><td>" + d['cases'] + "</td></tr>" +
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

		  // Add a group element for each dimension.
		  var g = svg.selectAll(".dimension")
		      .data(dimensions)
		    .enter().append("g")
		      .attr("class", "dimension")
		      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
		      .call(d3.behavior.drag()
		        .origin(function(d) { return {x: x(d)}; })
		        .on("dragstart", function(d) {
		          dragging[d] = x(d);
		          background.attr("visibility", "hidden");
		        })
		        .on("drag", function(d) {
		          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
		          foreground.attr("d", path);
		          dimensions.sort(function(a, b) { return position(a) - position(b); });
		          x.domain(dimensions);
		          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
		        })
		        .on("dragend", function(d) {
		          delete dragging[d];
		          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
		          transition(foreground).attr("d", path);
		          background
		              .attr("d", path)
		            .transition()
		              .delay(500)
		              .duration(0)
		              .attr("visibility", null);
		        }));

		  // Add an axis and title.
		  g.append("g")
		      .attr("class", "axis")
		      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
		    .append("text")
		      .style("text-anchor", "middle")
		      .attr("y", -9)
		      .text(function(d) { return d; });

		  // Add and store a brush for each axis.
		  g.append("g")
		      .attr("class", "brush")
		      .each(function(d) {
		        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
		      })
		    .selectAll("rect")
		      .attr("x", -8)
		      .attr("width", 16);

		function position(d) {
		  var v = dragging[d];
		  return v == null ? x(d) : v;
		}

		function transition(g) {
		  return g.transition().duration(500);
		}

		// Returns the path for a given data point.
		function path(d) {
			// console.log("D",d);
			li = line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
		  return li;
		}

		function brushstart() {
		  d3.event.sourceEvent.stopPropagation();
		}

		// Handles a brush event, toggling the display of foreground lines.
		function brush() {
		  var actives = dimensions.filter(function(p) { console.log(y);return !y[p].brush.empty(); }),
		      extents = actives.map(function(p) { return y[p].brush.extent(); });
		  foreground.style("display", function(d) {
		    return actives.every(function(p, i) {
		      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
		    }) ? null : "none";
		  });
		}
	}
	// parcpc(beds);
}


d3.select(self.frameElement).style("height", "685px");