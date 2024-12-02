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



//data is loaded
//start drawing
  function ready(data) {

console.log(data[0]) //file0 geojson file
console.log(data[1]) //file1 csv long/lat

//geo json data
const countries = data[0]
console.log(countries)

//parliament data
const parliament = data[1];



//color scheme for fill
const color = d3.scaleSequential([0, 100], d3.interpolateOranges).unknown("#ccc");

//d3's index() method for parliament data to join it
//it creates a javascript-map in which the country code points to the object/data for that country
const parl_indexed = d3.index(parliament, d => d.countryIsoCode)
console.log(parl_indexed)




//joining the parliament data to the geojson data, using parl_indexed
//I am replacing the "properties" property for each country
//with the parliament data so it is intergrated
//the else deals with missing data
const joined_cn = countries.features.map(country => {
	if (parl_indexed.get(country.properties.iso_a3)) {
		return 	{ type: country.type, geometry: country.geometry, properties: parl_indexed.get(country.properties.iso_a3) }
	} else {
			return 	{ type: country.type, geometry: country.geometry, properties: {value: null, country: country.properties.name, indicator: "no data" } }

	}
	
	})



console.log(joined_cn)




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

console.log('dddddd')

// countries are shapes so we make PATHS
// since the data we are visualizing  is joined with the geojson data
//d.properties directly access that data
svg.selectAll("path")
  .data(joined_cn)
  .join('path')
  .attr("d",pathGenerator)
  .attr("fill", d => color(d.properties.value)) //do attr
  .attr("stroke","#999")
  .attr("stroke-weight",0.3)
	.on('mouseover', function (event, d){ 
			console.log(event) // event holds data for the hover
			d3.select('.tooltip') //updating tooltip
				.style("visibility","visible") // below dealing with Nan values
				.html(d.properties.country + ": " + (d.properties.value ? d.properties.value : " ") + " " + d.properties.indicator)
			d3.select(this) //fill the shape you are on
				.transition()
				.attr("fill","orange")
			})
	.on('mouseout', function (event, d){ 
			d3.select(this) //update the shape you just left
				.transition()
				.attr("fill",d => color(d.properties.value))
			d3.select(".tooltip") //hide tooltip
				.style("visibility","hidden")

			})
			

}

})()








