(function () {


const margin = {top: 20, right: 10, bottom: 20, left: 30};
const width = 500 - margin.left - margin.right,
   height = 800 - margin.top - margin.bottom;

// Creating the overall SVG container
// that is going into the <div id="chart"> tag
const svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//loading multiple files
//this is javascript, not D3, but it is what D3 recommends...
//csv from: https://hdr.undp.org/data-center/documentation-and-downloads
Promise.all([
    d3.json("geo_files/africa.geo.json"),
    d3.csv("hdr-data.csv"),
]).then(ready)


//takes the country code and country name from the geojson data
//and returns info from the parliament data 
//to make html text for the tooltip

function get_info (code,name,data) {
	const result = data.find(({ countryIsoCode }) => countryIsoCode === code);
	let html_text = "No data for " + name;
	if(result) {html_text = result.country + ": <B>" + Math.round(result.value) + "%</B> " + result.indicator}
	return html_text
}

//data is loaded
//start drawing
  function ready(data) {

// console.log(data[0]) //file0 geojson flie
// console.log(data[1]) //file1 csv parliament info


const countries = data[0]

//name that second layer so it's clear what it is.
const parliament = data[1];
 console.log(parliament)

//https://observablehq.com/@d3/world-choropleth/2
//making a valuemap to use the a key (IsoCode) from the geojson data
//to retrive data from the parliament data
//this is NOT super efficient!! (see function get_info above)
//I recommend using d3 index() and joining!! See my JOINED map demo

const valuemap = new Map(parliament.map(d => [d.countryIsoCode, d.value]));
console.log(valuemap)

const color = d3.scaleSequential([0, 100], d3.interpolateOranges).unknown("#ccc");


//SO MANY PROJECTIONS!!!
//SO MANY WAYS TO SET THEM UP
//for this project, let's stick with Cylindrical
//https://d3js.org/d3-geo/cylindrical
//  const projection =d3.geoMercator().fitExtent([[-250,-250], [width+300, height+350]], {type: "Sphere"});
// 
const projection =d3.geoNaturalEarth1().fitExtent([[-5, -5], [width, height]], countries);
// const projection = d3.geoEquirectangular().scale(300).translate([width/2,height/2+50])
  
// const projection = d3.geoEqualEarth().fitSize([width,height],countries)

  const pathGenerator = d3.geoPath(projection);


// countries are shapes so we make PATHS
svg.selectAll("path")
  .data(countries.features)
  .join('path')
  .attr("d",pathGenerator) //below: geting value for the color from the valuemap
  .attr("fill", d => color(valuemap.get(d.properties.iso_a3)))
  .attr("stroke","#999")
  .attr("stroke-weight",0.3) //building tooltip
	.on('mouseover', function (event, d){ 
			console.log(get_info(d.properties.iso_a3,d.properties.name, parliament))
			d3.select('#tooltip')
				.style("visibility","visible")
				.html(get_info(d.properties.iso_a3, d.properties.name, parliament))

			d3.select(this)
				.transition()
				.attr("fill","orange")

			})
	.on('mouseout', function (event, d){ 
			d3.select(this)
				.transition()
				.attr("fill",d => color(valuemap.get(d.properties.iso_a3)))
			d3.select("#tooltip")
				.style("visibility","hidden")

			})
			

}

})()








