
var svgWidth = 960; 
var svgHeight = 500;
var margin = { 
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right; 
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty"; //decide where to start------<<
var chosenYAxis = "healthcare"; //decide where to start------<<


function xScale(povertyData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(povertyData, d => d[chosenXAxis]) * 0.8,
        d3.max(povertyData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

function yScale(povertyData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(povertyData, d => d[chosenYAxis]),
      d3.max(povertyData, d => d[chosenYAxis])
    ])
    .range([height, 0]);

  return yLinearScale;

}


function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
  
  
  function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  function renderText(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }
  
  function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
  
    var X_label = "";
    var Y_label = "";
    
   
    if (chosenXAxis === "poverty") {
      X_label = "poverty (%):";
    }
    else if (chosenXAxis === "age") {
      X_label = "Age (Median):";
    }
    else {
      X_label = "Household Income (Median):";
    }
    
   
    if (chosenYAxis === "healthcare") {
      Y_label = "Lacks Healthcare (%):";
    }
    else if (chosenYAxis === "smokes") {
      Y_label = "Smokes (%):";
    }
    else {
      Y_label = "Obese (%):";
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .style('background', 'gray')
      .style('color', 'white')
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${X_label} ${d[chosenXAxis]}<br>${Y_label} ${d[chosenYAxis]}`);
      });
      
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
  
  
  (async function(){
    var povertyData = await d3.csv("../assets/data/data.csv").catch(function(error) {
      console.log(error);
    });
    console.log(povertyData)
    
    povertyData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.healthcare = +data.healthcare;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes  = +data.smokes;
    });
  
    
    var xLinearScale = xScale(povertyData, chosenXAxis);
    var yLinearScale = yScale(povertyData, chosenYAxis);
  
  
    
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
   
   var yAxis = chartGroup.append("g")
    .call(leftAxis);
  
    
    var circlesGroup = chartGroup.selectAll("circle")
      .data(povertyData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "pink")
      .attr("opacity", ".5");

    var stateCircleText = chartGroup.selectAll('cirlce')
      .data(povertyData)
      .enter()
      .append("text")
      .text( d=> (d.abbr))
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .style("text-anchor", "middle")
      .style("font-size", "8px");

  
    
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") 
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") 
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
      .attr("x",0)
      .attr("y", 60)
      .attr("value", 'income')
      .classed('inactive', true)
      .text('Household Income (Median)')
  
    
    var healthcareLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")

      .attr("x", (margin.left)*2.5)
      .attr("y", 0 - height - 50)

      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokeLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")

      .attr("x", (margin.left)*2.5)
      .attr("y", 0 - height-70)

      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes (%)");

    var obeseLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      
      .attr("x", (margin.left)*2.5)
      .attr("y", 0 - height - 90)

      .attr("dy", "1em")
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obese (%)");
    
  
    
    var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
  
    
    labelsGroup.selectAll("text")

  
      .on("click", function() { 
        
        var value = d3.select(this).attr("value");

        if (value === "age" || value === "poverty" || value === "income") {
  
          
          chosenXAxis = value;
  
          console.log(chosenXAxis)
  
          
          xLinearScale = xScale(povertyData, chosenXAxis);
        
          xAxis = renderXAxes(xLinearScale, xAxis);   
  
          
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          stateCircleText = renderText(stateCircleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
  
          
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "poverty") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }

        else {
  
      
          chosenYAxis = value;
  
          console.log(chosenYAxis)
  
          yLinearScale = yScale(povertyData, chosenYAxis);
  
          yAxis = renderYAxes(yLinearScale, yAxis);
  
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          stateCircleText = renderText(stateCircleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
  
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis,chosenYAxis);
  
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", true)
              .classed("inactive", false);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  })()
  