var width = 700,
  height = 700,
  num_axes = 8,
  tick_axis = 1,
  start = 0,
  end = 8;

var MAX_TEXT_SIZE = 70;
var MIN_TEXT_SIZE = 15;
var SPACE = 5;

// http://paletton.com/#uid=1000u0kllllaFw0g0qFqFg0w0aF
var COLORS = [
  '#550000',
  '#801515',
  '#AA3939',
  '#D46A6A'
];

var len = data.length;
var textPaths = [];

function init() {

  var radius = d3.scale.pow().exponent(0.7)
    .domain([end, start])
    .range([0, d3.min([width,height])/2-20]);

  var angle = d3.scale.linear()
    .domain([0,num_axes])
    .range([0,360]);

  var svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width/2 + "," + (height/2+8) +")");

  var pieces = d3.range(start, end+0.001, (end-start)/1000);

  var spiral = d3.svg.line.radial()
    .interpolate("cardinal")
    .angle(theta)
    .radius(radius);

  var spiralPath = svg.selectAll(".spiral")
      .data([pieces])
    .enter().append("path")
      .attr("class", "spiral")
      .attr("d", spiral)
      .attr("id", "path1")
      .attr("transform", function(d) { return "rotate(-" + 60 + ")"; });

  var spiralPathLength = spiralPath.node().getTotalLength();

  var text = svg.append("text")
    .attr("id","textWrap");

  var colorFn = randomColor;

  data = _.sortBy(data, function(d) { return -d.weight; });
  // data = _.shuffle(data);
  data.forEach(function(d, i) {

    // console.log(d, i);

    var size = MAX_TEXT_SIZE - (i / (len-1))*(MAX_TEXT_SIZE-MIN_TEXT_SIZE);
    var space = size / 2;
    space = SPACE;

    var offset, targetOffset, prevNode, prevNodeLen, prevNodeStart;

    if (textPaths.length) {
      prevNode = textPaths[i-1].node();
      prevNodeLen = prevNode.getComputedTextLength();
      prevNodeStart = parseFloat(prevNode.dataset.offset, 10);
      // console.log(prevNode, prevNodeLen, prevNodeStart);
      targetOffset = ((prevNodeLen + space) / spiralPathLength) + prevNodeStart;
    } else {
      targetOffset = 0;
    }

    var textPath = text.append("textPath")
      .attr("id","text1")
      .attr("xlink:href","#path1")
      .text(d.text.toLowerCase())
      .attr("text-anchor", "start")
      .attr("startOffset", targetOffset-0.01)
      .attr("data-offset", targetOffset)
      .attr("data-size", size)
      .style({'font-size': size+'px', 'fill': colorFn(i), 'opacity': 0});

    textPaths.push(textPath);

  });

  data.forEach(function(d, i) {

    textPaths[i].style({'font-size': '0px'});

  });

  transitionIn();

}

function theta(r) {
  // console.log(r);
  return 2*Math.PI*r;
}

function randomColor(i) {

  return COLORS[i % COLORS.length];

}

function progressiveColor(i) {

  return 'hsla(0, 72%, 29%, ' + (1-(i/len)) + ')';

}

function transitionIn() {

  var totalTime = 3000;
  var delay = totalTime / data.length;

  textPaths.forEach(function(d, i) {

    console.log(d, i);

    console.log(d.node().dataset.offset);

    d
      .transition()
      // .delay(function(d, i) { return i * delay; })
      .delay(function(d) {
        // return (d.data.count/max)*totalTime;
        // return ((d.data.count/max)*totalTime)+(i*delay);
        return (i*delay);
        // return ((len-i)*delay);
        // return Math.random()*totalTime;
        // return ((i % SEGMENTS) * delay) + (Math.floor(i / SEGMENTS) * (delay * SEGMENTS));
        // return (i % SEGMENTS) * delay2;
      })
      .duration(700)
      .ease('cubic-in-out')
      // .ease('quad-out')
      // .attrTween("startOffset", animateTextOffset);
      .attr("startOffset", d.node().dataset.offset)
      .style({'font-size': d.node().dataset.size+'px', 'opacity': 1});

  });

} 

try {
  Typekit.load({
    active: init
  });
} catch(e) {
  console.error('fonts didn\'t load? weird. init\'ing anyway...');
  init();
}