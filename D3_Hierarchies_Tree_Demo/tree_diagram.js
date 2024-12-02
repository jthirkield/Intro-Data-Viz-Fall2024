(function () {


d3.csv("jazz_data.csv").then(ready)


//function for building display text
function make_name(obj) {
  obj["name"] = obj["Song title"]
  return obj
}


function ready(data) {

//using "d3.graoups" to get the nested hierarchies in array format

//console.log(data)
const nest_it = d3.groups(data, d => d.Colour, d => d.Temp)
//console.log(nest_it)

//now transforming groups of arrays
//into groups of objects in "name","children" format

const final_data = {
  name: "Songs",
  children: nest_it.map(x => ({
    name: x[0], //category
    children: x[1].map(x => ({
      name: x[0], // category2
      children: x[1].map(x => make_name(x))
    }))
  }))
}
    
// console.log(final_data)















//this is adapted from observable
//https://observablehq.com/@d3/tree-component
//https://observablehq.com/@d3/d3-group

chart = Tree(final_data, {
  label: d => d.name,
  // title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`, // hover text
  // link: (d, n) => `https://github.com/prefuse/Flare/${n.children ? "tree" : "blob"}/master/flare/src/${n.ancestors().reverse().map(d => d.data.name).join("/")}${n.children ? "" : ".as"}`,
  width: 400
})

//Super important!!
//When adapting from observable you need to place the chart into an HTML container
  document.getElementById("demo").appendChild(chart);

}
})()

// Copyright 2021-2023 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/tree
// Copyright 2021-2023 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/tree
function Tree(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
  path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
  id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
  parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
  children, // if hierarchical data, given a d in data, returns its children
  tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
  sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
  label, // given a node d, returns the display name
  title, // given a node d, returns its hover text
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links (if any)
  width = 800, // outer width, in pixels
  height, // outer height, in pixels
  r = 3, // radius of nodes
  padding = 1, // horizontal padding for first and last column
  fill = "#999", // fill for nodes
  fillOpacity, // fill opacity for nodes
  stroke = "#f00", // stroke for links
  strokeWidth = 1.5, // stroke width for links
  strokeOpacity = 0.4, // stroke opacity for links
  strokeLinejoin, // stroke line join for links
  strokeLinecap, // stroke line cap for links
  halo = "#efeae2", // color of label halo 
  haloWidth = 3, // padding around the labels
  curve = d3.curveBumpX, // curve for the link
} = {}) {

  // If id and parentId options are specified, or the path option, use d3.stratify
  // to convert tabular data to a hierarchy; otherwise we assume that the data is
  // specified as an object {children} with nested objects (a.k.a. the “flare.json”
  // format), and use d3.hierarchy.
   const color1 = d3.scaleOrdinal(["Crimson Red", "Midnight Blue", "Smoky Gray","Golden Yellow","Burnt Orange"],["Crimson", "DarkBlue", "DarkGray","GoldenRod","DarkOrange"]);

  const root = path != null ? d3.stratify().path(path)(data)
      : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);

  // Sort the nodes.
  if (sort != null) root.sort(sort);

  // Compute labels and titles.
  const descendants = root.descendants();
  const L = label == null ? null : descendants.map(d => label(d.data, d));

  // Compute the layout.
  const dx = 10;
  const dy = width / (root.height + padding);
  tree().nodeSize([dx, dy])(root);

  // Center the tree.
  let x0 = Infinity;
  let x1 = -x0;
  root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
  });

  // Compute the default height.
  if (height === undefined) height = x1 - x0 + dx * 2;

  // Use the required curve
  if (typeof curve !== "function") throw new Error(`Unsupported curve`);

  const svg = d3.create("svg")
      .attr("viewBox", [-dy * padding / 2, x0 - dx, width+150, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-linecap", strokeLinecap)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-width", strokeWidth)
    .selectAll("path")
      .data(root.links())
      .join("path")
        .attr("d", d3.link(curve)
            .x(d => d.y)
            .y(d => d.x))
            .attr("stroke", function(d,i) {
                // console.log(d)
                if (d.source.depth === 1) {
                    return color1(d.source.data.name);
                } else if (d.source.depth === 2) {
                    return "DarkSlateGrey";
                }  else {
                    return "BlueViolet";
                }
            })

  const node = svg.append("g")
    .selectAll("a")
    .data(root.descendants())
    .join("a")
      .attr("xlink:href", link == null ? null : d => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle")
      .attr("fill", d => d.children ? stroke : fill)
      .attr("r", r);

  if (title != null) node.append("title")
      .text(d => title(d.data, d));

  if (L) node.append("text")
      .attr("dy", "0.32em")
      .attr("x", d => d.children ? -6 : 6)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .attr("paint-order", "stroke")
      .attr("stroke", halo)
      .attr("stroke-width", haloWidth)
      .text((d, i) => L[i]);

  return svg.node();
}




