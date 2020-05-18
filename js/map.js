//US COVID spread, from 1/22/20 till 4/10/20

var cases_g, deaths_g, day = "4/1/20", state_shapes_1, color_1, color_1_int;
var cases_g, deaths_g, state_shapes_2, color_2, color_3_int;
var cases_g, deaths_g, state_shapes_3, color_2, color_3_int;
var cases_sum, deaths_sum;
var usa_g;

color_1 = d3.scale.threshold()
	.domain([0, 10, 100, 1000, 5000, 10000, 15000, 20000])
	.range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);
	// .domain([1, 500000])
	// .range([0, 1])
// color_1_int = d3.interpolate("#FCD6CF", "#611405");
	
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
		.await(loaded);
	
	function typeAndSet(d) {
		if (d.State == "Cases Sum") {
			cases_sum = d;
		}
		countryById1.set(d.State, d);
		return d;
	}
	
	
	function loaded(error, usa, cases) {

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
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.attr('fill', function(d,i) {
				// console.log(d.properties.name);
				return getColor1(d);
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
			.attr("x", width - 240)
			.attr("y", 30)
			.style("text-anchor", "middle")
			.text(function(d, i) { return legendText[i]; });
		map3();
		document.getElementById("cases").innerHTML = "Cases: " + cases_sum[day]; 
	
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
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.attr('fill', function(d,i) {
				// console.log(d.properties.name);
				return getColor2(d);
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
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.attr('fill', function(d,i) {
			// console.log(d.properties.name);
			return getColor3(d);
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

	console.log(cases_g);

	document.getElementById("cases").innerHTML = "Cases: " + cases_sum[day]; 
	document.getElementById("deaths").innerHTML = "Deaths: " + deaths_sum[day]; 
}
map1();
map2();