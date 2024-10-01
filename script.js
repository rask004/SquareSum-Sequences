"use strict";

// import * as d3 from "d3.js";

var maxNumber = 5;
const minNumber = 2;

const numberInput = document.querySelector("#maxNumber");

const createGraphData = () => {
  let nodes = [];
  let edges = [];

  for (let i = 1; i <= maxNumber; i++) {
    nodes.push({ "id": i, "name": i.toString() });
    for (let j = i + 1; j <= maxNumber; j++) {
      if (Number.isInteger(Math.sqrt(i + j))) {
        edges.push({ "source": i, "target": j });
      }
    }
  }

  let invert = [];
  for (let i = 1; i < Math.floor(Math.sqrt(maxNumber + 2) + 2); i++) {
    invert.push({ "source": i * (i + 1) / 2, "target": (i + 1) * (i + 2) / 2 })
  }

  for (const e of invert) {
    let f = { "source": e.source + 1, "target": e.target - 1 };
    while (f.target - f.source > 0) {
      if (edges.some(e => e.source === f.source && e.target === f.target)) {
        invert.push(f);
      }

      f = { "source": f.source + 1, "target": f.target - 1 };
    }
  }

  const data = {
    "nodes": nodes,
    "edges": edges,
    "invert": invert
  };

  return data;
};

const renderGraph = (data) => {
  document.querySelector("#container").innerHTML = "";

  const margin = { top: 32, right: 32, bottom: 32, left: 32 }
  const radius = 12;
  const width = document.querySelector("html").clientWidth - margin.left - margin.right;
  const height = 480;

  // append the svg object to the body of the page
  const svg = d3.select("#container")
    .append("svg")
    .attr("height", height)
    .append("g")
    .attr("transform",
      `translate(${2 * margin.left},${height / 2})`);

  const allNodes = data.nodes.map(function(d) { return d.name });
  const idToNode = {};
  data.nodes.forEach(function(n) {
    idToNode[n.id] = n;
  });

  const x = d3.scalePoint().range([0, width - 2 * margin.right]).domain(allNodes);

  svg.selectAll("mynodes").data(data.nodes)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.name))
    .attr("cy", 2 * margin.top)
    .attr("r", radius)
    .style("fill", "#0088ff");

  svg.selectAll("mylabels").data(data.nodes)
    .enter()
    .append("text")
    .attr("x", (d) => x(d.name))
    .attr("y", radius / 2 + 2 * margin.top)
    .text((d) => d.name)
    .style("text-anchor", "middle");

  svg.selectAll('mylinks')
    .data(data.edges)
    .enter()
    .append('path')
    .attr('d', (d) => {
      const start = x(idToNode[d.source].name);
      const end = x(idToNode[d.target].name);
      const anchor = data.invert.some(e => e.source === d.source && e.target === d.target) ? 1 : -1
      const orient = data.invert.some(e => e.source === d.source && e.target === d.target) ? 0 : 1

      return ['M', start, anchor * radius + 2 * margin.top, 'A',
        (start - end) / 2, ',', height / 2.94, 0, 0, ',', orient,
        end, ',', anchor * radius + 2 * margin.top]
        .join(' ');
    })
    .style("fill", "none")
    .attr("stroke", "grey");
};

const reRenderGraph = () => {
  const data = createGraphData();
  renderGraph(data);
}

const numberChangeCallback = () => {
  let number = parseInt(numberInput.value);
  if (number < minNumber || isNaN(number)) {
    number = minNumber;
    numberInput.value = number.toString();
  }
  maxNumber = number;

  reRenderGraph();
};

numberInput.addEventListener("change", numberChangeCallback);
numberInput.addEventListener("keyUp", numberChangeCallback);

window.onresize = () => reRenderGraph;
window.onload = reRenderGraph;