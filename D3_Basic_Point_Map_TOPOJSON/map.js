(function () {


const margin = {top: 20, right: 10, bottom: 20, left: 30};
const width = 1100 - margin.left - margin.right,
   height = 500 - margin.top - margin.bottom;

// Creating the overall SVG container
// that is going into the <div id="chart"> tag
const svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//loading multiple files
//this is javascript, not D3, but it is what D3 recommends...
Promise.all([
    d3.json("topofiles/countries-50m.json"),
    d3.csv("museumsSM.csv"),
]).then(ready)


//data is loaded
//start drawing
  function ready(data) {

console.log(data[0]) //file0 topofile
console.log(data[1]) //file1 csv long/lat

//processing the topojson data
// this turns it into GeoJSON, so you might ask, why don't we just use GeoJSON?
// because topojson it's a LOT SMALLER TO LOAD...
const countries = topojson.feature(data[0], data[0].objects.countries)
console.log(countries)

//name that second layer so it's clear what it is.
var museums = data[1];




//SO MANY PROJECTIONS!!!
//SO MANY WAYS TO SET THEM UP
//for this project, let's stick with Cylindrical
//https://d3js.org/d3-geo/cylindrical

// const projection =d3.geoMercator().fitExtent([[-250,-250], [width+300, height+350]], {type: "Sphere"});
// 
// const projection =d3.geoNaturalEarth1().fitExtent([[-10, -30], [width, height+30]], countries);
const projection = d3.geoEquirectangular().scale(200).translate([width/2-130,height/2+50])
  
// const projection = d3.geoEqualEarth().fitSize([width,height],countries)

  const pathGenerator = d3.geoPath(projection);



// countries are shapes so we make PATHS
svg.selectAll("path")
  .data(countries.features)
  .join('path')
  .attr("class","country")
  .attr("d",pathGenerator)
  .attr("fill", "#cccccc") //do attr

// lng/lat are dots so we make CIRCLES on top of the shapes
svg.selectAll(".ms-circle")
  .data(museums)
  .enter().append("circle")
  .attr("r",2)
  .attr("cx", function(d){
    var coords = projection([d.long,d.lat])
    return coords[0]
  })
    .attr("cy", function(d){
    var coords = projection([d.long,d.lat])
    return coords[1]
  })

// put some text labels on there!
svg.selectAll(".ms-label")
  .data(museums)
  .enter().append("text")
  .attr("class","ms-label")
  .attr("x", function(d){
    var coords = projection([d.long,d.lat])
    return coords[0]
  })
    .attr("y", function(d){
    var coords = projection([d.long,d.lat])
    return coords[1]
  })
  .text(d => d.name)
  .attr("dx",5) //offset
  .attr("dy",5)  //offset

}

})()








