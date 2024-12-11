import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css"

class Child1 extends Component {
  state = {
    colorMetric: "Sentiment", 
    selectedTweets: [],
  };

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.json_data !== this.props.json_data || prevState.colorMetric !== this.state.colorMetric) {
      this.renderChart();
    }
  }

  renderChart = () => {
    const { json_data } = this.props; 
    const { colorMetric } = this.state;

    const data = json_data.slice(0,300);

    if (!data || data.length === 0) return;

    d3.select("#chart").selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 },
      width = 800,
      height = 600,
      radius = 6;

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const months = Array.from(new Set(data.map((d) => d.Month)));

    const yScale = d3
      .scaleBand()
      .domain(months)
      .range([0, height - margin.top - margin.bottom])
      .padding(0.1);

    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0,1]).range(["#ECECEC","#4467C4"]);

    const colorScale =
      colorMetric === "Sentiment"
        ? sentimentColorScale
        : subjectivityColorScale;

    const simulation = d3
      .forceSimulation(data)
      .force("x", d3.forceX(300).strength(.1))
      .force("y", d3.forceY((d) => yScale(d.Month) + yScale.bandwidth() / 2).strength(3))
      .force("collide", d3.forceCollide(radius + 2))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    const nodes = svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", radius)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) => colorScale(d[colorMetric]))
      .attr("stroke", "none")
      .on("click", this.handleTweetClick);

    svg
      .append("g")
      .attr("text-anchor", "start")
      .attr("transform", `translate(50, 0)`)
      .call(d3.axisLeft(yScale).tickFormat((d) => d).tickSize(0))
      .selectAll("text")
      .style("font-weight", "bold")
      .style("font-size", "14px");

    const legendWidth = 20; 
    const legendHeight = 200; 
    const numRectangles = 20; 

    d3.select("#chart-legend").remove();

    const legendGroup = svg
      .append("g")
      .attr("id", "chart-legend")
      .attr("transform", `translate(600, 150)`);

    const legendSentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["green", "#ECECEC", "red"]);
    const legendSubjectivityColorScale = d3.scaleLinear().domain([0,1]).range(["#4467C4","#ECECEC"]);

    const legendColorScale =
      colorMetric === "Sentiment"
        ? legendSentimentColorScale
        : legendSubjectivityColorScale;

    const stepSize = (colorMetric === "Sentiment" ? 2 : 1) / numRectangles;
    const legendData = d3.range(
      colorMetric === "Sentiment" ? -1 : 0,
      colorMetric === "Sentiment" ? 1 + stepSize : 1 + stepSize,
      stepSize
    );

    legendGroup
      .selectAll("rect")
      .data(legendData)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d, i) => (legendHeight / numRectangles) * i)
      .attr("width", legendWidth)
      .attr("height", legendHeight / numRectangles)
      .attr("fill", (d) => legendColorScale(d));

    legendGroup
      .append("text")
      .attr("x", legendWidth + 5)
      .attr("y", 5)
      .text(colorMetric === "Sentiment" ? "Positive" : "High")
      .style("font-size", "12px")
      .style("text-anchor", "start");

    legendGroup
      .append("text")
      .attr("x", legendWidth + 5)
      .attr("y", legendHeight + 20)
      .text(colorMetric === "Sentiment" ? "Negative" : "Low")
      .style("font-size", "12px")
      .style("text-anchor", "start");

    svg.select(".domain").remove();
  };

  handleMetricChange = (event) => {
    this.setState({ colorMetric: event.target.value });
  };

  handleTweetClick = (event, d) => {
    const circle = d3.select(event.target); 
    const isAlreadySelected = circle.attr("stroke") === "black";
  
    if (isAlreadySelected) {
      circle.attr("stroke", "none");
      this.setState((prevState) => ({
        selectedTweets: prevState.selectedTweets.filter((tweet) => tweet !== d),
      }));
    } else {
      circle.attr("stroke", "black").attr("stroke-width", 2);
      this.setState((prevState) => ({
        selectedTweets: [d, ...prevState.selectedTweets],
      }));
    }
  };
  

  renderSelectedTweets = () => {
    const { selectedTweets } = this.state;
    return selectedTweets.map((tweet, index) => (
      <div key={index} className="tweet">
        {tweet.RawTweet}
      </div>
    ));
  };

  render() {
    return (
      <div className="child1">
        <div className="controls">
          <label>
            Color By:&nbsp;
            <select
              value={this.state.colorMetric}
              onChange={this.handleMetricChange}
            >
              <option value="Sentiment">Sentiment</option>
              <option value="Subjectivity">Subjectivity</option>
            </select>
          </label>
        </div>
        <div id="chart"></div>
        <div className="selected-tweets">
          {this.renderSelectedTweets()}
        </div>
      </div>
    );
  }
}

export default Child1;
