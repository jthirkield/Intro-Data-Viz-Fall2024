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

// loading in the CSV
// to work you need to run a server
//.then() is a callback it will run the ready() function
// once all of the data is loaded
d3.csv("sample_data.csv").then(ready)


function ready(datapoints) {

//DATA PROCESSING

//dealing with the year
  const parseTime = d3.timeParse("%m/%d/%Y");

// this is my own specific JavaScript adding 20 to each year
datapoints.forEach((d) => d['Scheduled Date'] = fixyear(d['Scheduled Date']));

// this is the IMPORTANT: D3 method of transforming a date into an actual date object
datapoints.forEach((d) => d.date = parseTime(d['Scheduled Date']));

// creating a separate property with just the year
datapoints.forEach((d) => d.year  = d.date.getFullYear());

//D3's Group method, this group by one category
// const groupClass = d3.group(datapoints, d => d.Class)

//D3's Rollup method, this group by two categories

const groupClassYear  = d3.rollup(datapoints, v => v.length, d => d.Class, d => d.year)

    
//D3's flatRollup method, this group by two categories
// but it will give us just in array with individual elements
// which is much more easy to work with
 const groupSum2 = d3.flatRollup(
      datapoints,
      (v) => d3.sum(v, (d) => +d['Payment Amount']),
      (d) => d.Class,
      (d) => d.year
    );



// taking the flatRollup results which is an array of arrays
// and making an array of objects which is easier to work with 
//because I can see which category is which
// this is a JavaScript thing not D3

const groupObject = groupSum2
  .map(([cat, year, total]) => ({ cat, year, total }));

// creating separate arrays (really Sets which are arrays that don't repeat any values)
// for the scales, see below
const cats = new Set(groupObject.map((x) => x.cat));
const years = new Set(groupObject.map((x) => x.year));

// a stacked chart needs information for every category even if it is 0
// This is plain JavaScript in which I am making new objects for the missing 0 category and year
for(let i of cats) {
	for (let j of years) {
	let result = groupObject.filter(element => element.cat === i && element.year === j)
	if (!result.length) {
		// console.log(i + " " + j)
		groupObject.push({cat: i, year: j, total: 0})
		}
	}
}

// console.log(groupObject)

// SETTING UP THE VISUALIZATION

//https://observablehq.com/@d3/stacked-bar-chart/2

// my main scale uses d3.stack() method
 const series = d3.stack()
      .keys(d3.union(groupObject.map(d => d.year))) // distinct series keys, in input order
      .value(([, D], key) => D.get(key).total) // get value for each series key and stack
    (d3.index(groupObject, d => d.cat, d => d.year)); // group by stack then series key

// creating the xScale (scaleBand() for bars)
  const x = d3.scaleBand()
      .domain(d3.groupSort(groupObject, D => -d3.sum(D, d => d.total), d => d.cat))
      .range([margin.left, width - margin.right])
      .padding(0.1);

// creating our yScale based on the "total" category
// this is using the series that was created with d3.stack()
// honestly, stacked bar charts are quite advance for what we're doing right now!
  const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .rangeRound([height - margin.bottom, margin.top]);

// making our color scale
// this is a little complex in a stacked context
     const color = d3.scaleOrdinal()
      .domain([2022,2023,2024,2025])
//       .range(d3.schemeSpectral[series.length])
      .range(d3.schemeCategory10)
      //schemeCategory10 
      .unknown("#ccc");
    
 // Append a group for each series, and a rect for each element in the series.
  svg.append("g")
    .selectAll()
    .data(series)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(D => D.map(d => (d.key = D.key, d)))
    .join("rect")
      .attr("x", d => x(d.data[0]))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
    .append("title")

// draw the x-axis
  svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll(".domain").remove());

//    draw the y axis
  svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.selectAll(".domain").remove());





}



})()

function fixyear(datestring) {
	dateArray = datestring.split("/")
	return dateArray[0] + "/" + dateArray[1] + "/" + "20"+dateArray[2];
}





