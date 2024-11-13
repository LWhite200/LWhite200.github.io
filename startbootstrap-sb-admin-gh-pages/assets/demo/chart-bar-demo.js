// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

//-_-=-=-=-=-=-=-=--=-=-=-=--=-=-=-=--=-=--=-=-=--=-=-=-
// Declare variables, then pull from the webstie into a json boob, then set these to be those



async function fetchData(tag) {
  try {
    const response = await fetch(`https://cataas.com/api/cats?tags=${tag}`); // Use the tag parameter here
    if (!response.ok) {
      throw new Error("Error happened!!!");
    }

    const data = await response.json();    // comes in as a JSON
   // alert(data.length);
    return data.length;                    // return the number of objects
  }
  catch (error) {
    alert("You screwed up: " + error.message);
  }
}



// since data retrival is async, so must this
async function initializeChart() {

  Cute = await fetchData("cute");
  Orange = await fetchData("orange");
  Fluffy = await fetchData("fluffy");
  Sleepy = await fetchData("sleepy");
  Silly = await fetchData("silly");
  Bread = await fetchData("bread");

  var ctx = document.getElementById("myBarChart");
  var myLineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [Cute, Orange, Fluffy, Sleepy, Silly, Bread],
      datasets: [{
        label: "Revenue",
        backgroundColor: "rgba(2,117,216,1)",
        borderColor: "rgba(2,117,216,1)",
        data: [Cute, Orange, Fluffy, Sleepy, Silly, Bread],
      }],
    },
    options: {
      scales: {
        xAxes: [{
          time: {
            unit: 'month'
          },
          gridLines: {
            display: false
          },
          ticks: {
            maxTicksLimit: 6
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: 50,
            maxTicksLimit: 5
          },
          gridLines: {
            display: true
          }
        }],
      },
      legend: {
        display: false
      }
    }
  });
}
initializeChart();