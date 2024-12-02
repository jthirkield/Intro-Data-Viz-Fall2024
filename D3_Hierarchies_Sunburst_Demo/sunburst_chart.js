(function () {



d3.csv("jazz_data.csv").then(ready)
//randomizing value for these lowest level child data
function make_name(obj) {
	obj["name"] = obj["Song title"]
	obj["value"] = Math.floor(Math.random() * 10) + 4;
	return obj
}


function ready(dataIn) {

    // console.log(dataIn)
const nest_it = d3.groups(dataIn, d => d.Colour, d => d.Temp)

    //creating parent-child hierarchy
const data = {
  name: "Songs",
  children: nest_it.map(x => ({
    name: x[0], // continent
    children: x[1].map(x => ({
      name: x[0], // country
      children: x[1].map(x => make_name(x))
    }))
  }))
}
    

//https://observablehq.com/@d3/d3-group
//https://observablehq.com/@d3/d3-group-d3-hierarchy
//https://observablehq.com/@d3/d3-hierarchy

 			// console.log(data);


// const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
//ordinal colors
const color = d3.scaleOrdinal(["Crimson Red", "Midnight Blue", "Smoky Gray","Golden Yellow","Burnt Orange"],["Crimson", "DarkBlue", "DarkGray","GoldenRod","DarkOrange"]);

  const radius = 928 / 2;

  // Prepare the layout.
  const partition = data => d3.partition()
    .size([2 * Math.PI, radius])
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value));

  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 1);

  const root = partition(data);

  // Create the SVG container.
  const svg = d3.create("svg");

  // Add an arc for each element, with a title for tooltips.
  const format = d3.format(",d");
  svg.append("g")
      .attr("fill-opacity", 0.6)
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth))
    .join("path")
      // .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
      // controlling file by depth (sample colors)
          .attr("fill", d => {
          // console.log(d)
                if (d.depth === 1) {
                    return color(d.data.name);
                } else if (d.depth === 2) {
                    // console.log(d.parent.data.name + d.data.name)
                    return "LightSlateGrey";
                }  else {
                    return "LightSteelBlue";
                }
            })
      .attr("d", arc)
    .append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  // Add a label for each element.
  svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
    .selectAll("text")
    .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
    .join("text")
      .attr("transform", function(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.35em")
      .text(d => d.data.name);

  // The autoBox function adjusts the SVG’s viewBox to the dimensions of its contents.
   const final_chart = svg.attr("viewBox", autoBox).node();
  document.getElementById("demo").appendChild(final_chart);
}

})()

function autoBox() {
  document.body.appendChild(this);
  const {x, y, width, height} = this.getBBox();
  document.body.removeChild(this);
  return [x, y, width, height];
}



