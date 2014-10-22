var width = 700,
  height = 700,
  padding = 15,
  num_axes = 8,
  tick_axis = 1,
  start = 0,
  end = 8;

var first = true;

var CHARCOUNT_TARGET = 380;
var MAX_TEXT_SIZE_TARGET = 70;
var MIN_TEXT_SIZE_TARGET = 15;
var SPACE = 5;
var SAMPLE_SIZE = 33;

// http://paletton.com/#uid=1000u0kllllaFw0g0qFqFg0w0aF
var COLORS = [
  '#550000',
  '#801515',
  '#AA3939',
  '#D46A6A'
];

var textPaths = [];

var svg;

var data;

var $refresh = $('#refresh');

function buildViz() {

  if (first) {
    data = _.sortBy(fullData, function(d) { return -d.weight; }).splice(0, SAMPLE_SIZE);
    first = false;
  } else {
    data = _.shuffle(fullData).splice(0, SAMPLE_SIZE);
  }

  textSizes = getTextSizes();

  var radius = d3.scale.pow().exponent(0.7)
    .domain([end, start])
    .range([0, d3.min([width,height])/2-20]);

  var angle = d3.scale.linear()
    .domain([0,num_axes])
    .range([0,360]);

  svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height);

  var g = svg.append("g")
      .attr("transform", "translate(" + width/2 + "," + (height/2+8) +")");

  var pieces = d3.range(start, end+0.001, (end-start)/1000);

  var spiral = d3.svg.line.radial()
    .interpolate("cardinal")
    .angle(theta)
    .radius(radius);

  var spiralPath = g.selectAll(".spiral")
      .data([pieces])
    .enter().append("path")
      .attr("class", "spiral")
      .attr("d", spiral)
      .attr("id", "path1")
      .attr("transform", function(d) { return "rotate(-" + 60 + ")"; });

  var spiralPathLength = spiralPath.node().getTotalLength();

  var text = g.append("text")
    .attr("id","textWrap");

  var colorFn = randomColor;

  data.forEach(function(d, i) {

    // console.log(d, i);

    var size = textSizes.max - (i / (SAMPLE_SIZE-1))*(textSizes.max-textSizes.min);
    var space = size / 2;
    space = SPACE;

    var offset, targetOffset, prevNode, prevNodeLen, prevNodeStart;

    if (textPaths.length) {
      prevNode = textPaths[i-1].node();
      prevNodeLen = prevNode.getComputedTextLength();
      prevNodeStart = parseFloat($(prevNode).data('offset'), 10);
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

  scaleViz();
  transitionIn();

}

function scaleViz() {

  var smallest = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerWidth;
  var minWidth = (width+(2*padding));
  var scale;

  if (smallest < minWidth) {
    scale = smallest / minWidth;
    $(svg.node()).css({'transform': 'translate(-50%, -50%) scale('+scale+')'});
  } else {
    $(svg.node()).css({'transform': 'translate(-50%, -50%)'});
  }

}

function getTextSizes() {

  var sizes = {};
  var allWords = '';
  var charCount;

  data.forEach(function(word) { allWords+=word.text; });

  charCount = allWords.length;

  return {
    max : (CHARCOUNT_TARGET / charCount) * MAX_TEXT_SIZE_TARGET,
    min : (CHARCOUNT_TARGET / charCount) * MIN_TEXT_SIZE_TARGET,
  };

}

function reset() {

  textPaths = [];
  svg.remove();

  buildViz();

}

function init() {

  buildViz();

  var onResize = _.debounce(reset, 300);
  $(window).on('resize', onResize);
  $refresh.on('click', onRefreshClick);

}

function theta(r) {
  // console.log(r);
  return 2*Math.PI*r;
}

function randomColor(i) {

  return COLORS[i % COLORS.length];

}

function progressiveColor(i) {

  return 'hsla(0, 72%, 29%, ' + (1-(i/SAMPLE_SIZE)) + ')';

}

function transitionIn() {

  var totalTime = 70 * data.length;
  var delay = totalTime / data.length;
  var singleDuration = 700;
  var showBtnDelay = 3000;

  textPaths.forEach(function(d, i) {

    // console.log(d, i);

    d
      .transition()
      // .delay(function(d, i) { return i * delay; })
      .delay(function(d) {
        // return (d.data.count/max)*totalTime;
        // return ((d.data.count/max)*totalTime)+(i*delay);
        return (i*delay);
        // return ((SAMPLE_SIZE-i)*delay);
        // return Math.random()*totalTime;
        // return ((i % SEGMENTS) * delay) + (Math.floor(i / SEGMENTS) * (delay * SEGMENTS));
        // return (i % SEGMENTS) * delay2;
      })
      .duration(singleDuration)
      .ease('cubic-in-out')
      // .ease('quad-out')
      // .attrTween("startOffset", animateTextOffset);
      .attr("startOffset", $(d.node()).data('offset'))
      .style({'font-size': $(d.node()).data('size')+'px', 'opacity': 1});

  });

  setTimeout(function() {
    $refresh.addClass('show');
  }, (((delay*data.length)+singleDuration)+showBtnDelay));

}

function transitionOut(cb) {

  var totalTime = 70 * data.length;
  var delay = totalTime / data.length;
  var singleDuration = 700;

  textPaths.forEach(function(d, i) {

    d
      .transition()
      .delay(function(d) {
        return (i*delay);
      })
      .duration(singleDuration)
      .ease('cubic-in-out')
      .attr("startOffset", $(d.node()).data('offset')-0.01)
      .style({'font-size': '0px', 'opacity': 0});

  });

  setTimeout(cb, ((delay*data.length)+singleDuration));

}

function onRefreshClick() {

  $refresh.removeClass('show');
  setTimeout(function(){
    transitionOut(reset);
  }, 1500);

}

// init();

try {
  Typekit.load({
    active: init
  });
} catch(e) {
  console.error('fonts didn\'t load? weird. init\'ing anyway...');
  init();
}