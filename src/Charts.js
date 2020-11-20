import ApexCharts from 'apexcharts'
import _ from 'underscore';

export function updateChart(chart, circuit) {
  if (_.isEmpty(circuit))
    return;

  let state = circuit.stateAsString(false);
  if (_.isEmpty(state))
    return;

  let pairs = state.split("i");
  if (_.isEmpty(pairs))
    return;

  pairs.splice(0, 1);

  let values = [];
  let probs = [];
  pairs.forEach(function (item, index) {
    let pair = item.split('%')[0].split(" ");
    values.splice(index, 0, pair[0].trim() + " (" + index + ")");
    probs.splice(index, 0, pair.slice(-1)[0].trim());
  });

  if (_.isEmpty(values))
    return;
  
  chart.updateSeries([{
    name: 'probability (%)',
    data: probs
  }])
};

export function drawChart(circuit) {
  if (_.isEmpty(circuit))
    return;

  let state = circuit.stateAsString(false);
  if (_.isEmpty(state))
    return;

  let pairs = state.split("i");
  if (_.isEmpty(pairs))
    return;

  pairs.splice(0, 1);

  let values = [];
  let probs = [];
  pairs.forEach(function (item, index) {
    let pair = item.split('%')[0].split(" ");
    values.splice(index, 0, pair[0].trim() + " (" + index + ")");
    probs.splice(index, 0, pair.slice(-1)[0].trim());
  });

  if (_.isEmpty(values))
    return;

  let options = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    title: {
      text: "Score Probability",
      align: 'center',
      style: {
        color: "#FFFFFF"
      }
    },
    grid: {
      show: false,
    },
    yaxis: {
      show: false,
    },
    series: [{
      name: 'probability (%)',
      data: probs
    }],
    xaxis: {
      categories: values,
      labels: {
        style : {
          colors : "#FFFFFF"
        }
      }
    },
  }

  let chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();

  return chart;
}

export function drawBloch0(circuit, angle) {
  var canvas = document.querySelector('#bloch0');
  if (canvas.getContext && !_.isEmpty(circuit))
  {
    let prob = circuit.probability(0);

    var ctx = canvas.getContext('2d'); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var X = canvas.width / 2;
    var Y = canvas.height / 2;
    var R = 45;

    ctx.beginPath();
    ctx.arc(X, Y, R, 0, 2 * Math.PI, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#555555';
    ctx.stroke();

    let angleToDraw = angle;
    while(angleToDraw > Math.PI*2)
      angleToDraw -= Math.PI*2;

    let counterClockwise = false;
    let startAngle = -Math.PI/2;

    if(angleToDraw > Math.PI){
      counterClockwise = true;
      startAngle = -Math.PI/2;
      angleToDraw = angleToDraw + startAngle;
    }
    else{
      startAngle = -Math.PI/2;
      angleToDraw = angleToDraw + startAngle;
    }

    ctx.beginPath();
    ctx.arc(X, Y, R - 5, startAngle, angleToDraw, counterClockwise);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.fillText('|0>', canvas.width / 2 - 5, 20);
    ctx.fillText('|1>', canvas.width / 2 - 5, 90 + 40);
    ctx.fillText(Math.trunc(prob*100) + "%", X - 8, Y);
  }
}

export function drawBloch1(circuit, angle) {
  var canvas = document.querySelector('#bloch1');
  if (canvas.getContext && !_.isEmpty(circuit))
  {
    let prob = circuit.probability(1);

    var ctx = canvas.getContext('2d'); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var X = canvas.width / 2;
    var Y = canvas.height / 2;
    var R = 45;

    ctx.beginPath();
    ctx.arc(X, Y, R, 0, 2 * Math.PI, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#555555';
    ctx.stroke();

    let angleToDraw = angle;
    while(angleToDraw > Math.PI*2)
      angleToDraw -= Math.PI*2;

    let counterClockwise = false;
    let startAngle = -Math.PI/2;

    if(angleToDraw > Math.PI){
      counterClockwise = true;
      startAngle = -Math.PI/2;
      angleToDraw = angleToDraw + startAngle;
    }
    else{
      startAngle = -Math.PI/2;
      angleToDraw = angleToDraw + startAngle;
    }

    ctx.beginPath();
    ctx.arc(X, Y, R - 5, startAngle, angleToDraw, counterClockwise);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.fillText('|0>', canvas.width / 2 - 5, 20);
    ctx.fillText('|1>', canvas.width / 2 - 5, 90 + 40);
    ctx.fillText(Math.trunc(prob*100) + "%", X - 8, Y);

    ctx.stroke(); 
  }
}