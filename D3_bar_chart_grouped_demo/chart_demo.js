//csv to json with: https://www.convertcsv.com/csv-to-json.htm
(function () {

// making the margins, this is standard
const margin = {top: 20, right: 10, bottom: 20, left: 30};
const width = 900 - margin.left - margin.right,
   height = 500 - margin.top - margin.bottom;

   
   
// Creating the overall SVG container
// that is going into the <div id="chart"> tag
const svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//not using this because we are using the json_data.js file
d3.csv("sample_data.csv").then(ready)
   function ready(datapoints) {


    // console.log(datapoints)
    

//DATA PROCESSING

//dealing with the year
const parseTime = d3.timeParse("%m/%d/%Y");


// this is my own specific JavaScript adding 20 to each year
 datapoints.forEach((d) => d['Scheduled Date'] = fixyear(d['Scheduled Date']));

// this is the important D3 method of transforming a date into an actual date object
datapoints.forEach((d) => d.date = parseTime(d['Scheduled Date']));

// creating a separate property with just the year
datapoints.forEach((d) => d.year  = d.date.getFullYear());

//D3's Group method, this group by one category
  // const groupClass = d3.group(datapoints, d => d.Class)
  //   console.log(groupClass)

//D3's Rollup method, this group by two categories

//  const groupSum = d3.rollup(
//       datapoints,
//       (v) => d3.sum(v, (d) => +d['Payment Amount']),
//       (d) => d.Class,
//       (d) => d.year
//     );
    
//D3's flatRollup method, this group by two categories
// but it will give us just in array with individual elements
// which is much more easy to work with

  const groupSum2 = d3.flatRollup(
      datapoints,
      (v) => d3.sum(v, (d) => +d['Payment Amount']),
      (d) => d.Class,
      (d) => d.year
    );
    
    
// taking the flatRollup results which is an array of array
// and making an array of objects which is easier to work with 
//because I can see which category is which
// this is a JavaScript thing not D3
  const groupObject = groupSum2
  .map(([cat, year, total]) => ({ cat, year, total }));

 //console.log(groupObject)


// SETTING UP THE VISUALIZATION


// this is making an array of each category
//(Set is the same thing as an array but with unique values no repeats)
// do you need us to get our DOMAIN for the xScale

const xloc = new Set(groupObject.map((x) => x.cat));

// creating the xScale (scaleBand() for bars)
const xScale = d3
  .scaleBand()
  .domain(xloc)
  .range([margin.left, width - margin.right - margin.left])
  .padding(0.1)
  

// Setting up our xAxis from that xScale  
const xAxis = d3.axisBottom(xScale).tickSizeOuter(0)

// an array of our sub group, years
const keys = [2022,2023,2024,2025]

// creating the xSubScale for the group (scaleBand() for bars)
const xSubScale = d3
  .scaleBand()
  .domain(keys)
  .rangeRound([0, xScale.bandwidth()]) // here we use rangeRound instead of range because we're using values computed by xScale, which may not be whole numbers, and we need whole numbers to avoid errors.
  .padding(0.05)
  
// creating our yScale based on the "total" category
const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(groupObject, d => d.total)]) // in each key, look for the maximum number
  .rangeRound([height - margin.bottom, margin.top])

// Setting up our our yAxis from that yScale
yAxis = d3.axisLeft(yScale).tickSizeOuter(0)

// making our color scale
color = d3.scaleOrdinal(keys,["#ccc", "#aaa","#888","#666"])

// this draws the chart
// note that it does youth group() because our flatRollup() flattened the data

//https://observablehq.com/@d3/grouped-bar-chart/2
  svg.append("g")
    .selectAll()
    .data(d3.group(groupObject, d => d.cat))
    .join("g")
      .attr("transform", ([cat]) => `translate(${xScale(cat)},0)`)
    .selectAll()
    .data(([, d]) => d)
    .join("rect")
      .attr("x", d => xSubScale(d.year))
      .attr("y", d => yScale(d.total))
      .attr("width", xSubScale.bandwidth())
      .attr("height", d => yScale(0) - yScale(d.total))
      .attr("fill", d => color(d.year));

// draw the x-axis
  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .attr("font-size", 8)

//    draw the y axis
 svg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis)


}



})()

// this is my homemade JavaScript function that fixes the date that doesn't contain a century.
function fixyear(datestring) {
  // console.log(datestring)
  dateArray = datestring.split("/")
  return dateArray[0] + "/" + dateArray[1] + "/" + "20"+dateArray[2];
}



