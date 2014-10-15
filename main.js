function init() {

  // a spiral for john hunter, creator of matplotlib

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

  var theta = function(r) {
    // console.log(r);
    return 2*Math.PI*r;
  };

  // var arc = d3.svg.arc()
  //   .startAngle(0)
  //   .endAngle(2*Math.PI);

  // var radius = d3.scale.linear()
  //   .domain([start, end])
  //   .range([0, d3.min([width,height])/2-20]);

  var radius2 = d3.scale.pow().exponent(0.7)
    .domain([end, start])
    .range([0, d3.min([width,height])/2-20]);

  // var radius3 = d3.scale.log()
  //   .domain([start, end])
  //   .range([0, d3.min([width,height])/2-20]);

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
    .radius(radius2);

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
    // .attr("x", 0)
    // .attr("y", -height/2+16);

  var textPaths = [];
  var len = data.length;

  var colorFn = randomColor;

  data = _.sortBy(data, function(d) { return -d.weight; });
  // data = _.shuffle(data);
  data.forEach(function(d, i) {

    // console.log(d, i);

    var size = MAX_TEXT_SIZE - (i / (len-1))*(MAX_TEXT_SIZE-MIN_TEXT_SIZE);
    var space = size / 2;
    space = SPACE;

    var offset, prevNode, prevNodeLen, prevNodeStart;

    if (textPaths.length) {
      prevNode = textPaths[i-1].node();
      prevNodeLen = prevNode.getComputedTextLength();
      prevNodeStart = parseFloat(prevNode.getAttribute('startOffset'), 10);
      // console.log(prevNode, prevNodeLen, prevNodeStart);
      offset = ((prevNodeLen + space) / spiralPathLength) + prevNodeStart;
    } else {
      offset = 0;
    }

    var textPath = text.append("textPath")
      .attr("id","text1")
      .attr("xlink:href","#path1")
      .text(d.text.toLowerCase())
      .attr("text-anchor", "start")
      .attr("startOffset", offset)
      .style({'font-size': size+'px', 'fill': colorFn(i)});

    textPaths.push(textPath);

  });

  function randomColor(i) {

    return COLORS[i % COLORS.length];

  }

  function progressiveColor(i) {

    return 'hsla(0, 72%, 29%, ' + (1-(i/len)) + ')';

  }

  // text.append("textPath")
  //   .attr("id","text2")
  //   .attr("xlink:href","#path1")
  //   .text("what what WHHATT IS DISSS")
  //   .attr("text-anchor", "start")
  //   .attr("startOffset", 0.7)
  //   .style({'font-size': '20px'});

  // svg.selectAll("circle.tick")
  //     .data(d3.range(end,start,(start-end)/4))
  //   .enter().append("circle")
  //     .attr("class", "tick")
  //     .attr("cx", 0)
  //     .attr("cy", 0)
  //     .attr("r", function(d) { return radius(d); })

  // svg.selectAll(".axis")
  //     .data(d3.range(num_axes))
  //   .enter().append("g")
  //     .attr("class", "axis")
  //     .attr("transform", function(d) { return "rotate(" + -angle(d) + ")"; })
  //   .call(radial_tick)
  //   .append("text")
  //     .attr("y", radius(end)+13)
  //     .text(function(d) { return angle(d) + "°"; })
  //     .attr("text-anchor", "middle")
  //     .attr("transform", function(d) { return "rotate(" + -90 + ")" })

  // function radial_tick(selection) {
  //   selection.each(function(axis_num) {
  //     d3.svg.axis()
  //       .scale(radius)
  //       .ticks(5)
  //       .tickValues( axis_num == tick_axis ? null : [])
  //       .orient("bottom")(d3.select(this));

  //     d3.select(this)
  //       .selectAll("text")
  //       .attr("text-anchor", "bottom")
  //       .attr("transform", "rotate(" + angle(axis_num) + ")");
  //   });
  // }

  // document.querySelector('#save').addEventListener('click', function() { save(false); }, false);
  // document.querySelector('#save-highres').addEventListener('click', function() { save(true); }, false);

}

// function save(highRes) {

//   var btn = this;
//   var getDownload = document.querySelector('#download');
//   var container = document.querySelector('#chart');

//   btn.innerHTML = 'loading...';
//   if (highRes) {
//     $(container).css({'transform': 'scale(2)', 'transform-origin': 'top left'});
//   }

//   html2canvas(container).then(function(canvas) {

//     imageData = canvas.toDataURL("image/png");
//     imageData = imageData.replace(/^data:image\/png;base64,/, '');

//     var imageBinaryString = atob(imageData);
//     var imageBinaryData = new Uint8Array(imageBinaryString.length);

//     for (var i = 0; i < imageBinaryString.length; i++) {
//       imageBinaryData[i] = imageBinaryString.charCodeAt(i);
//     }

//     var blob = new Blob([imageBinaryData.buffer],{'type': 'image/png'});

//     getDownload.setAttribute('href', window.URL.createObjectURL(blob));
//     getDownload.setAttribute('download', 'image.png');
//     getDownload.style.display = 'block';

//     btn.innerHTML = 'save';
//     $(container).css({'transform': 'none'});

//   });

// }

try {
  Typekit.load({
    active: init
  });
} catch(e) {
  console.error('fonts didn\'t load? weird. init\'ing anyway...');
  init();
}