//Define Color Scale
var colorScale = d3.scale.linear()
	.domain([1, 2, 3, 4, 5, 6, 7, 8])
    .range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"]);

	
//Using the queue.js library
queue()
	//.defer(d3.json, "filteredArpeggio.json")
	.defer(d3.json, "stems/bass_test.json")
	.defer(d3.json, "stems/chords_and_synth.json")
	.defer(d3.json, "stems/groove_perc.json")
	.defer(d3.json, "stems/guitar.json")
	.defer(d3.json, "stems/kick.json")
	.defer(d3.json, "stems/risers_drop_noises.json")
	.defer(d3.json, "stems/snarez.json")
	.defer(d3.json, "stems/whistles_vox_arps.json")

	.awaitAll(function(error, results){ 
		generateChart(results, results[1], results[2], results[3], results[4], results[5], results[6], results[7], results[8]);
		//generateGooey(results[0]);
	}); 
	//CTPS.demoApp.generateViz);

generateChart = function(all, bass, chords, perc, guitar, kick, drops, snare, whistles) {	
//Create chart comparing interstate roads by coordinates
	//append town names

	var w = 1300,
		h = 600,
		padding = 20;

	var chartContainer = d3.select("#chart").append("svg")
		.attr("width", w)
		.attr("height", h)
		.style("overflow", "visible")

	var indexLength = 360/bass.left.length*1000; 
	//Assign scales and axes 
	xScale = d3.scale.linear().domain([0, bass.left.length]).range([padding, w-padding]);
	yScale = d3.scale.linear().domain([0, .45]).range([h-padding, padding]);

	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
	var yAxis = d3.svg.axis().scale(yScale).orient("right").tickSize(15);

	chartContainer.append("g").attr("class", "axis")
		.attr("transform", "translate(0, 850)")
		.call(xAxis).selectAll("text").remove();
	
	chartContainer.append("g").attr("class", "axis")
		.attr("transform", "translate(50, 0)")
		.style("font-size", "14px")
		.call(yAxis).selectAll("text").remove();

	var canvas = document.querySelector("canvas"),
			    context = canvas.getContext("2d"),
			    width = canvas.width,
			    height = canvas.height;

	var n = 20,
	    tau = 2 * Math.PI,
	    nodes = d3.range(n).map(function() { return {radius: Math.random() * 20 + 2}; });

	//Start visualization
	d3.select("#start").on("click", function(){
		var audio = document.getElementById("song");
       	audio.play();

		var index = 1; 

		chartContainer.selectAll("bass") 
			.data(bass.left)
			.enter()
			.append("circle")
				.attr("class", function(d, i) { return "t" + i + " bass"})
				.attr("cx", w/2)
				.attr("cy", h/2)
				.attr("r", 0)
				.style("stroke", colorScale(1))
				.style("stroke-width", 1)
				.style("fill", "none")
				.style("opacity", .5)

		chartContainer.selectAll("kick") 
			.data(kick.left)
			.enter()
			.append("circle")
				.attr("class", function(d, i) { return "t" + i + " kick"})
				.attr("cx", w/2)
				.attr("cy", h/2)
				.attr("r", 0)
				.style("fill", colorScale(5))
				.style("opacity", .2)

		/*chartContainer.selectAll("chords") 
			.data(chords.left)
			.enter()
			.append("line")
				.attr("class", function(d, i) { return "t" + i + " chords"})
				.attr("x1", 0)
				.attr("x2", 1300)
				.attr("y1", h/2)
				.attr("y2", h/2)
				.style("stroke", colorScale(3))
				.style("stroke-width", 1)
				.style("fill", "none")
				.style("opacity", .2)*/

		d3.selectAll(".kick")
			.transition()
			.delay(function(d) { 
				var time = this.getAttribute("class").split(' ')[0].substring(1);
				return time * indexLength - 500; 
			})
			.duration(1000)
			.ease("bounce")
			.attr("r", function(d) { return Math.sqrt(d * 100000) })
			.transition()
			.attr("r", 0)

		d3.selectAll(".bass")
			.transition()
			.delay(function(d) { 
				var time = this.getAttribute("class").split(' ')[0].substring(1);
				return time * indexLength - 500; 
			})
			.duration(1000)
			.ease("bounce")
			.attr("r", function(d) { return Math.sqrt(d * 1000000) })
			.transition()
			.attr("r", 0)
		
		all.forEach(function(stem){
			chartContainer.selectAll("beats")
				.data(stem.left)
				.enter()
				.append("circle")
					.attr("class", function(d, i) { return "t" + i + " beats stem" + index})
					.attr("cx", function(d, i) { return xScale(i);})
					.attr("cy", function(d) { 
						if (index == 8) { return yScale(.3 + d ) }
						else if (index == 6 || index == 4 ) { return yScale(d)}
						else if ( d < .2) { return yScale(0)}
						else { return yScale(.45)}
					})
					//.attr("r", function(d) { return d.velocity;})
					.attr("r", function(d) { 
						if (index == 6 ) { return 2}
						else { return 0 }
					})
					.style("stroke", colorScale(index))
					.style("fill", function(d) {
					 	if (index == 8) { return "pink" }
					 	else { return colorScale(index);}
					})
					.style("stroke-width", .5)
					.style("fill-opacity", 0)
					.style("opacity", .5)
			index++;
			
			//force diagram
			var force = d3.layout.force()
			    .charge(1)
			    .gravity(0)
			    .friction(.99)
			    .nodes(nodes)
			    .size([width, height])
			    .start();

			var stroke = d3.scale.linear()
			    .domain([0, 1])
			    .range([colorScale(1), colorScale(8)]);

			/*force.on("tick", function(e) {
			  var q = d3.geom.quadtree(nodes), node, i, vx, vy;
			  context.clearRect(0, 0, width, height);
			  context.lineWidth = 1.5;

			  for (i = 0; i < n; ++i) {
			    q.visit(collide(nodes[i]));
			  }

			  for (i = 0; i < n; ++i) {
			    node = nodes[i];
			    context.beginPath();
			    context.arc(node.x, node.y, node.radius - 0.75, 0, tau);
			    context.strokeStyle = colorScale((vx = node.x - node.px) * vx + (vy = node.y - node.py) * vy);
			    context.stroke();
			  }

			});*/

			d3.selectAll(".beats")
			.transition()
				.delay(function(d) { 
					var time = this.getAttribute("class").split(' ')[0].substring(1);
					return time * indexLength - 500; 
				})
				.duration(function(d){ 
					var stem = this.getAttribute("class").split(' ')[2];
					if (stem == "stem4") { return d * 2000; }
					else if (stem == "stem6" && d > .1) { return d * 2000}
					else { return d*20000; }
				})
				.ease("bounce")
				.attr("r", function(d) { 
					var time = this.getAttribute("class").split(' ')[0].substring(1);
					var stem = this.getAttribute("class").split(' ')[2];

					if (stem == "stem8" && d > 0) { return 2}
					else if (stem == "stem6" && d > .1) { return 30 * d}
					else if (d == 0) { return 0 }
					else if ( d < .2) { return 15 * d}
					else { return 10 - (20 * d)}})

				.attr("cy", function(d) { 
					var stem = this.getAttribute("class").split(' ')[2];
					if (stem == "stem8") { return yScale(.3 + d) }
					else if (stem == "stem6" && d > .1) { return yScale(.25 + d)}
					else { return yScale(d);}
				})
				.style("fill-opacity", function(d) { return 1 - (2*d);})
			//rotate away
			.transition()
				.delay(function(d) { 
					var time = this.getAttribute("class").split(' ')[0].substring(1);
					return time * indexLength + 3600; 
				})
				.duration(10000)
				.style("opacity", .2)

			 //end repeat
			/*function collide(node) {
			  var r = node.radius + 16,
			      nx1 = node.x - r,
			      nx2 = node.x + r,
			      ny1 = node.y - r,
			      ny2 = node.y + r;
			  return function(quad, x1, y1, x2, y2) {
			    if (quad.point && (quad.point !== node)) {
			      var x = node.x - quad.point.x,
			          y = node.y - quad.point.y,
			          l = Math.sqrt(x * x + y * y),
			          r = node.radius + quad.point.radius;
			      if (l < r) {
			        l = (l - r) / (l * 2);
			        node.x -= x *= l;
			        node.y -= y *= l;
			        quad.point.x += x;
			        quad.point.y += y;
			      }
			    }
			    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			  }
			}*/

		})//end forEach loop
	}) //end click funtion
	



	
			//Normalize ROUTEFROM for display (flip westbounds and southbounds to match eastbound and north bound)
	/*chartContainer.selectAll("beats")
		.data(filteredArpeggio.tracks[1])
		.enter()
		.append("circle")
			.attr("class", "beats")
			.attr("cx", function(d) { return xScale(d.deltaTime);})
			.attr("cy", function(d) { return yScale(d.noteNumber);})
			//.attr("r", function(d) { return d.velocity;})
			.attr("r", 0)
			.style("fill", function(d) { 
				if (d.subtype == "noteOff") {return colors[3];}
				else { return colors[1]}
			})
			.style("opacity", .1)

	d3.selectAll(".beats")
		.transition()
		.delay(function(d) { return filteredArpeggio.tracks[1].indexOf(d)*100;})
		.duration(function(d) { return filteredArpeggio.tracks[1].indexOf(d)*100;})
		.attr("r", function(d) { return d.velocity;})
		.each(slide);

function slide() {
  var circle = d3.select(this);
  (function repeat() {
    circle = circle.transition()
        .attr("cx", w/2 + (Math.random()*(-400)) + 200)
        .attr("cy", function(d) { return yScale(d.noteNumber);})
        .attr("r", 5 )
      .transition()
        .attr("cx", w/2 + (Math.random()*(-400)) + 200)
        .attr("cy", function(d) { return yScale(d.noteNumber) + (Math.random()*(-100)) + 100;})
        .attr("r", function(d) { return d.velocity + (Math.random()*(-d.velocity)) })
        .each("end", repeat);
  })();
 }*/

}
