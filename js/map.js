//US COVID spread, from 1/22/20 till 4/10/20

var cases_g, deaths_g, day = "4/1/20", state_shapes_1, color_1, color_1_int;
var cases_g, deaths_g, state_shapes_2, color_2, color_3_int;
var cases_g, deaths_g, state_shapes_3, color_2, color_3_int;
var cases_sum, deaths_sum;
var usa_g;

var beds_all_gl;
var beds_us_gl;

var margin = {top: 20, right: 20, bottom: 20, left: 20};
	width = 500 - 40 - margin.left - margin.right,
	height = 290 - margin.top - margin.bottom,
    formatPercent = d3.format(".1%");

var parseDate = d3.time.format("%Y-%m-%d").parse

tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

color_1 = d3.scale.threshold()
	.domain([0, 10, 100, 1000, 5000, 10000, 15000, 20000])
	.range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);
	// .domain([1, 500000])
	// .range([0, 1])
// color_1_int = d3.interpolate("#FCD6CF", "#611405");

function lc_data_1(beds_all,beds_us,state,day){

			var state1 = beds_all.filter(function(d){return d["state"] == state;})
			
			var final1 = {
				"us":beds_us,
				"state": state1,
				"name": state
			};
			// console.log("Final1",final1);
			d3.selectAll("#linec").remove();
			lineChart1(final1);
			// console.log("Test",final.state[0].cases);
		}


function getColor1(d) {
	var dataRow = countryById1.get(d.properties.name);
	if (dataRow) {
		c = dataRow[day]*1000000/dataRow['Population'];
		return color_1(c);
	} else {
		// console.log("no dataRow", d);
		return "#ccc";
	}
}

color_2 = d3.scale.threshold()
	.domain([0, 1, 2, 3, 4, 5, 6])
	.range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);
	
function getColor2(d) {
	var dataRow1 = countryById1.get(d.properties.name);
	var dataRow2 = countryById2.get(d.properties.name);
	if (dataRow1 && dataRow2) {
		c = dataRow2[day]/dataRow1[day]*100;
		// console.log(day, dataRow1[day], dataRow2[day], d.properties.name)
		return color_2(c);
	} else {
		return "#fff7bc";
	}
}

color_3 = d3.scale.threshold()
	.domain([-3, -2, -1, 0, 1, 2, 3])
	.range(["#662506", "#cc4c02", "#fe9929", "#fee391", "#05ff05", "#00eb00", "#00cc00", "#00b300"]);
	
function getColor3(d) {
	var dataRow = countryById1.get(d.properties.name);
	if (dataRow) {
		c = dataRow["Beds"] - dataRow[day]/dataRow['Population']*1000;
		// console.log(c, color_3(c));
		return color_3(c);
	} else {
		return "#ccc";
	}
}

function map1() {
	var margin = {top: 20, right: 20, bottom: 20, left: 20};
	var	width = document.getElementById('map1').clientWidth - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		formatPercent = d3.format(".1%");
	
	var legendText = [0, 1, 10, 100, "1K", "5K", "10K", "15K", "20K"];
	var legendColors = ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"];

	var svg = d3.select("#map1").append("svg")
		.attr("width", width)
		.attr("height", height)
		// .call(d3.behavior.zoom().on("zoom", function () {
		//     svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
		//   }))
		// .append("g")
		// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-5, 0])
		.html(function(d) {
		var dataRow = countryById1.get(d.properties.name);
			if (dataRow) {
				// console.log(day);
				return dataRow.State + ": " + parseInt(dataRow[day]/+dataRow['Population']*1000000);
			} else {
				// console.log("no dataRow", d);
				return d.properties.name + ": No data.";
			}
		})
	
	svg.call(tip);
	
	var projection = d3.geo.albersUsa()
		.scale(500) // mess with this if you want
		.translate([width / 2, height / 2]);
	
	var path = d3.geo.path()
		.projection(projection);
	
	countryById1 = d3.map();
	
	// we use queue because we have 2 data files to load.
	queue()
		.defer(d3.json, "data/us-states.json")
		.defer(d3.csv, "data/cases.csv", typeAndSet) // process
		// .defer(d3.csv, "js/covid_data_processed.csv")
		.defer(d3.csv, "js/beds.csv")
		.defer(d3.csv, "js/beds_all.csv")
		.defer(d3.csv, "js/beds_us.csv")

		.await(loaded);
	
	function typeAndSet(d) {
		if (d.State == "Cases Sum") {
			cases_sum = d;
		}
		countryById1.set(d.State, d);
		return d;
	}
	
	
	function loaded(error, usa, cases, beds, beds_all, beds_us) {
		// console.log("Data", usa);
		beds_all_gl = beds_all;
		beds_us_gl = beds_us;
		beds.forEach(function(d) {
		// console.log("Rows",Object.keys(d));
			d.BEDS = +d.BEDS;
			d.cases = +d.cases;
			d.deaths = +d.deaths;
			d.POPULATION = +d.POPULATION;
		});

		beds_all.forEach(function(d) {
			// console.log("Rows",Object.keys(d));
			d.date = parseDate(d.date);
			d.days = +d.days;
			d.cases = +d.cases;
			d.deaths = +d.deaths;
			d.casespm = +d.casespm;
			d.casespt = +d.casespt;
		});
		beds_us.forEach(function(d) {
			// console.log("Rows",Object.keys(d));
			d.date = parseDate(d.date);
			d.days = +d.days;
			d.cases = +d.cases;
			d.deaths = +d.deaths;
			d.Total = +d.Total;
			d.Pop = +d.Pop;
			d.casespm = +d.casespm;
			d.casespt = +d.casespt;
		});


		cases_g = cases;
	
		var states = topojson.feature(usa, usa.features);
		usa_g = usa;

		// console.log(states)
		state_shapes_1 = svg.selectAll('path.states')
			.data(usa.features)
			.enter()
			.append('path');
			state_shapes_1
			.attr('class', 'states')
			.attr('d', path)
			.on('mouseover', function(d){tip.show(d)
				select_state_pc(beds_all,day,d.properties.name);
			})
			// .on('mouseover', console.log("Lel"))
			.on('mouseout', function(d){tip.hide(d)
				select_state_pc(beds_all,day);
			})
			.on("click", function(d) {
				// console.log("Click",d);
				// console.log("Day",day);
				// select_state(data, d.properties.name);
				// lc_data(data_us,data_counties,data_states,d.properties.date[0]["Province_State"],d.properties.date[0]["Admin2"]);
				lc_data_1(beds_all,beds_us,d.properties.name,day);
			})
			.attr('fill', function(d,i) {
				// console.log(d.properties.name);
				return getColor1(d);
			})
			.append("title");
		select_state_pc(beds_all,day);
		

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
			.attr("y", 10)
			.attr("width", 30)
			.attr("height", 6)
			.attr("class", "rect")
			.style("fill", function(d, i) { return legendColors[i]; });

		legenditem.append("text")
			.attr("x", width - 240)
			.attr("y", 30)
			.style("text-anchor", "middle")
			.text(function(d, i) { return legendText[i]; });
		map3();
		document.getElementById("cases").innerHTML = "Cases: " + cases_sum[day]; 
	
	}	
}

function lineChart1(data){
	console.log(data)
	var legendText = ["US", data.name];
	var legendColors = ["steelblue", "red"];

	
	// Set the dimensions of the canvas / graph
	var margin = {top: 30, right: 20, bottom: 30, left: 50},
	    width = 400 - margin.left - margin.right,
	    height = 290 - margin.top - margin.bottom;

	// Parse the date / time
	var parseDate = d3.time.format("%Y-%m-%d").parse,
	    formatDate = d3.time.format("%d-%b"),
	    bisectDate = d3.bisector(function(d) { return d.date; }).left;

	// Set the ranges
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(5);

	// Define the line
	var valueline = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.casespt); });
	    
	// Adds the svg canvas
	var svg = d3.select("#ts")
	    .append("svg")
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.top + margin.bottom)
	        .attr("id","linec")
	    .append("g")
	        .attr("transform", 
	              "translate(" + margin.left + "," + margin.top + ")");

	var lineSvg = svg.append("g"); 

	var focus_us = svg.append("g") 
	    .style("display", "none");

	var focus_state = svg.append("g") 
	    .style("display", "none");
	        	    
    // Scale the range of the data
    x.domain(d3.extent(data.us, function(d) { return d.date; }));
    y.domain([0, d3.max(data.us, function(d) { return d.casespt; })]);

    // Add the valueline path.
    lineSvg.append("path")
        .attr("class", "line")
        .attr("id","line_us")
        .attr("d", valueline(data.us));

    lineSvg.append("path")
        .attr("class", "line")
        .attr("id","line_state")
        .attr("d", valueline(data.state));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (-30) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Cases per million");

    svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (width/2) +","+(height+30)+")")  // centre below axis
            .text("Month");

    var legend = svg.append("g")
		.attr("id", "legend");

		var legenditem = legend.selectAll(".legenditem")
			.data(d3.range(2))
			.enter()
			.append("g")
				.attr("class", "legenditem")
				.attr("transform", function(d, i) { return "translate(" + i * 31 + ",0)"; });

		legenditem.append("rect")
			.attr("x", width - 300)
			.attr("y", 10)
			.attr("width", 30)
			.attr("height", 6)
			.attr("class", "rect")
			.style("fill", function(d, i) { return legendColors[i]; });

		legenditem.append("text")
			.attr("x", width - 290)
			.attr("y", 30)
			.style("text-anchor", "middle")
			.text(function(d, i) { return legendText[i]; });


}

function parcpc(cars,day,sel){
	// console.log("ParcPC")
	var format = d3.time.format("%m/%d/%Y")

	d3.selectAll("#parcpc").remove();
	var x = d3.scale.ordinal().rangePoints([0, width], 1),
	    y = {},
	    dragging = {};

	var line = d3.svg.line(),
	    axis = d3.svg.axis().orient("left"),
	    background,
	    foreground;

	var svg = d3.select("#pc").append("svg")
		.attr("id","parcpc")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  // Extract the list of dimensions and create a scale for each.
	  x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
	    return (d != "days" && d != "state" && d != "date" && d != "Combined_Key"&& d != "casespm"&& d != "fips") && (y[d] = d3.scale.linear()
	    // return (d == "1" && d == "10" && d == "20" && d == "40" && d == "60" && d == "80") && (y[d] = d3.scale.linear()
	        .domain(d3.extent(cars, function(p) { return +p[d]; }))
	        .range([height, 0]));
	  }));

	  var focus_line = cars.filter(function (d){ return d['state'] == sel})
	 

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
			"<p><strong>" + d["state"] + "</strong></p>" +
			"<table><tbody><tr><td class='wide'>Cases on " + format(day) + ":</td><td>" + d['cases'] + "</td></tr>" +
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

		 focus = svg.append("g")
	      .attr("class", "focus")
	    .selectAll("path")
	      .data(focus_line)
	    .enter().append("path")
	      .attr("d", path);

	    if(sel != null)
	    {
	    	console.log(sel);
	    	foreground.style("display","none");
	    }
	     else
	    {
	    	console.log(sel);
	    	foreground.style("display",null);
	    }
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
	          focus.attr("display", "none");
	        })
	        .on("drag", function(d) {
	          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
	          foreground.attr("d", path);
	          dimensions.sort(function(a, b) { return position(a) - position(b); });
	          x.domain(dimensions);
	          focus.attr("display", "none");
	          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
	        })
	        .on("dragend", function(d) {
	          delete dragging[d];
	          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
	          transition(foreground).attr("d", path);
	          focus.attr("display", "none");
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
	      .text(function(d) {
	       if(d == "cases") return "Total Cases";
	       if(d == "deaths") return "Total Deaths";
	       if(d == "Total") return "Beds Per 1000";
	       if(d == "Pop") return "Population";
	       if(d == "casespt") return "Cases Per 1000";
	       else return d;
	       });

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

function map2() {
	var margin = {top: 20, right: 20, bottom: 20, left: 20};
	var	width = document.getElementById('map2').clientWidth - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		formatPercent = d3.format(".1%");
	
	var legendText = [0, 1, 2, 3, 4, 5, 6];
	var legendColors = ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"];

	var svg = d3.select("#map2").append("svg")
		.attr("width", width)
		.attr("height", height)
		// .call(d3.behavior.zoom().on("zoom", function () {
		//     svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
		//   }))
		// .append("g")
		// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-5, 0])
		.html(function(d) {
		var dataRow1 = countryById1.get(d.properties.name);
		var dataRow2 = countryById2.get(d.properties.name);
			if (dataRow1 && dataRow2) {
				// console.log(day, (dataRow2[day]/dataRow1[day]*100));
				return dataRow1.State + ": " + (dataRow2[day]/dataRow1[day]*100).toFixed(2);
			} else {
				// console.log("no dataRow", d);
				return d.properties.name + ": No data.";
			}
		})
	
	svg.call(tip);
	
	var projection = d3.geo.albersUsa()
		.scale(500) // mess with this if you want
		.translate([width / 2, height / 2]);
	
	var path = d3.geo.path()
		.projection(projection);
	
	countryById2 = d3.map();
	
	// we use queue because we have 2 data files to load.
	queue()
		.defer(d3.json, "data/us-states.json")
		.defer(d3.csv, "data/deaths.csv", typeAndSet1) // process
		.await(loaded2);
	
	function typeAndSet1(d) {
		if (d.State == "Deaths Sum") {
			deaths_sum = d;
		}
		countryById2.set(d.State, d);
		return d;
	}
	
	
	function loaded2(error, usa, deaths) {

		deaths_g = deaths;
	
		var states = topojson.feature(usa, usa.features);

		// console.log(states)
		state_shapes_2 = svg.selectAll('path.states')
			.data(usa.features)
			.enter()
			.append('path');
			state_shapes_2
			.attr('class', 'states')
			.attr('d', path)
			.on('mouseover', function(d){tip.show(d)
				select_state_pc(beds_all_gl,day,d.properties.name);
			})
			// .on('mouseover', console.log("Lel"))
			.on('mouseout', function(d){tip.hide(d)
				select_state_pc(beds_all_gl,day);
			})
			.attr('fill', function(d,i) {
				// console.log(d.properties.name);
				return getColor2(d);
			})
			.on("click", function(d) {
				// console.log("Click",d);
				// console.log("Day",day);
				// select_state(data, d.properties.name);
				// lc_data(data_us,data_counties,data_states,d.properties.date[0]["Province_State"],d.properties.date[0]["Admin2"]);
				lc_data_1(beds_all_gl,beds_us_gl,d.properties.name,day);
			})
			.append("title");
	
		var legend = svg.append("g")
		.attr("id", "legend");

		var legenditem = legend.selectAll(".legenditem")
			.data(d3.range(7))
			.enter()
			.append("g")
				.attr("class", "legenditem")
				.attr("transform", function(d, i) { return "translate(" + i * 31 + ",0)"; });

		legenditem.append("rect")
			.attr("x", width - 240)
			.attr("y", 10)
			.attr("width", 30)
			.attr("height", 6)
			.attr("class", "rect")
			.style("fill", function(d, i) { return legendColors[i]; });

		legenditem.append("text")
			.attr("x", width - 240)
			.attr("y", 30)
			.style("text-anchor", "middle")
			.text(function(d, i) { return legendText[i]; });
		document.getElementById("deaths").innerHTML = "Deaths: " + deaths_sum[day]; 
	
	}	
}


function select_state_pc(data, day){
			var parseD = d3.time.format("%-m/%-d/%y").parse
			var format = d3.time.format("%m/%d/%Y")
			day = parseD(day);
			// console.log("Day",format(day));
			statewise = data.filter(function(d){return format(d["date"]) == format(day);})
			// console.log("StatePC",statewise);
			// d3.selectAll("#parcpc").remove();
			parcpc(statewise,day,"None");
			// update(day);
			// donutchart(statewise);
			// parc(statewise);		
		}
function select_state_pc(data, day,sel){
			var parseD = d3.time.format("%-m/%-d/%y").parse
			var format = d3.time.format("%m/%d/%Y")
			day = parseD(day);
			// console.log("Day",format(day));
			statewise = data.filter(function(d){return format(d["date"]) == format(day);})
			// console.log("StatePC",statewise);
			// d3.selectAll("#parcpc").remove();
			parcpc(statewise,day,sel);
			// update(day);
			// donutchart(statewise);
			// parc(statewise);		
		}
function map3() {
	var margin = {top: 20, right: 20, bottom: 20, left: 20};
	var	width = document.getElementById('map3').clientWidth - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		formatPercent = d3.format(".1%");
	
	var legendText = [-3, -2, -1, 0, 1, 2, 3];
	var legendColors = ["#662506", "#cc4c02", "#fe9929", "#fee391", "#05ff05", "#00eb00", "#00cc00", "#00b300"];

	var svg = d3.select("#map3").append("svg")
		.attr("width", width)
		.attr("height", height)
		// .call(d3.behavior.zoom().on("zoom", function () {
		//     svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
		//   }))
		// .append("g")
		// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-5, 0])
		.html(function(d) {
		var dataRow = countryById1.get(d.properties.name);
			if (dataRow) {
				return dataRow.State + ": (Cases, beds)/1000: " + (dataRow[day]/dataRow["Population"]*1000).toFixed(2) + ", " + dataRow["Beds"];
			} else {
				// console.log("no dataRow", d);
				return d.properties.name + ": No data.";
			}
		})
	
	svg.call(tip);
	
	var projection = d3.geo.albersUsa()
		.scale(500) // mess with this if you want
		.translate([width / 2, height / 2]);
	
	var path = d3.geo.path()
		.projection(projection);
	var usa = usa_g;
	
	var states = topojson.feature(usa, usa.features);

	// console.log(states)
	state_shapes_3 = svg.selectAll('path.states')
		.data(usa.features)
		.enter()
		.append('path');
		state_shapes_3
		.attr('class', 'states')
		.attr('d', path)
		.on('mouseover', function(d){tip.show(d)
				select_state_pc(beds_all_gl,day,d.properties.name);
			})
			// .on('mouseover', console.log("Lel"))
			.on('mouseout', function(d){tip.hide(d)
				select_state_pc(beds_all_gl,day);
			})
		.attr('fill', function(d,i) {
			// console.log(d.properties.name);
			return getColor3(d);
		})
		.on("click", function(d) {
				// console.log("Click",d);
				// console.log("Day",day);
				// select_state(data, d.properties.name);
				// lc_data(data_us,data_counties,data_states,d.properties.date[0]["Province_State"],d.properties.date[0]["Admin2"]);
				lc_data_1(beds_all_gl,beds_us_gl,d.properties.name,day);
			})
			.append("title");
	
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
		.attr("y", 10)
		.attr("width", 30)
		.attr("height", 6)
		.attr("class", "rect")
		.style("fill", function(d, i) { return legendColors[i]; });

	legenditem.append("text")
		.attr("x", width - 210)
		.attr("y", 30)
		.style("text-anchor", "middle")
		.text(function(d, i) { return legendText[i]; });
		document.getElementById("cases").innerHTML = "Cases: " + cases_sum[day]; 
		document.getElementById("deaths").innerHTML = "Deaths: " + deaths_sum[day]; 
}


function updateSlider(elt) {

	day = elt;
	// console.log(elt);

	state_shapes_1.style("fill", function(d) {
		// console.log(d.properties);
		return getColor1(d);
	});

	state_shapes_2.style("fill", function(d) {
		// console.log(d.properties);
		return getColor2(d);
	});

	state_shapes_3.style("fill", function(d) {
		// console.log(d.properties);
		return getColor3(d);
	});

	// console.log(cases_g);

	document.getElementById("cases").innerHTML = "Cases: " + cases_sum[day]; 
	document.getElementById("deaths").innerHTML = "Deaths: " + deaths_sum[day];
	select_state_pc(beds_all_gl,day); 
}
map1();
map2();