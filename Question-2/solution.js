// Problem 2.1
// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 600;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#boxplot").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    

    // Add scales     
    const xScale = d3.scaleBand()
      .domain([...new Set(data.map(d => d.Platform))])  // List all platforms
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Likes)])  // Likes range
      .range([height, 0]);


    // Add x-axis label
    svg.append("g")
      .selectAll(".x-axis")
      .data(xScale.domain())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${xScale(d)},0)`)
      .each(function(d) {
        d3.select(this).append("line")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "black");

        d3.select(this).append("text")
            .attr("y", height + 20)
            .attr("text-anchor", "middle")
            .text(d);
      });

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .attr("text-anchor", "middle")
      .text("Social Media Platform");

    // Add y-axis label
    svg.append("g")
      .call(d3.axisLeft(yScale));

    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Likes");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.median(values)
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const max = d3.max(values);
        return {min, q1, median, q3, iqr};
    };

    // this line is aggregating the data by platform
    const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

    // these lines add lines to plot the box plot for every platform
    quartilesByPlatform.forEach((quartiles, platform) => {
        const x = xScale(platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
          .attr("x1", x + boxWidth / 2)
          .attr("x2", x + boxWidth / 2)
          .attr("y1", yScale(quartiles.min))
          .attr("y2", yScale(quartiles.max))
          .attr("stroke", "black");

        // Draw box from q1-q3
        svg.append("rect")
          .attr("x", x)
          .attr("y", yScale(quartiles.q3))
          .attr("width", boxWidth)
          .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
          .attr("fill", "lightblue");

        // Draw median line
        svg.append("line")
          .attr("x1", x)
          .attr("x2", x + boxWidth)
          .attr("y1", yScale(quartiles.median))
          .attr("y2", yScale(quartiles.median))
          .attr("stroke", "black")
          .attr("stroke-width", 2);

        // Add plot title
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", -margin.top / 2)
          .style("font-size", "16px")
          .attr("text-anchor", "middle")
          .text("Distribution of Likes Across Platforms");
        
    });
});

// Problem 2.2
// Prepare your data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 600;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#barplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type


     // Add scales x0 and y     
    
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.1);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))]) 
        .range([0, x0.bandwidth()])
        .padding(0.05);


    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)]) 
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add x-axis label
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    svg.append("text")
        .attr("x", width / 2)  
        .attr("y", height + 30) 
        .attr("text-anchor", "middle")  
        .style("font-size", "12px")  
        .text("Social Media Platform");  

    // Add y-axis label

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("x", -height / 2)  
        .attr("y", -margin.left + 10) 
        .attr("transform", "rotate(-90)") 
        .attr("text-anchor", "middle")  
        .style("font-size", "12px")  
        .text("Average Likes");  

    // Add plot title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .style("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Average Likes for Post Types by Platform");

  // Group container for bars
    const barGroups = svg.selectAll("bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
    barGroups.append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.Likes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.Likes))
        .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 10}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {
      legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});


// Problem 2.3
// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("SocialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 50, bottom: 80, left: 50 };
    const width = 600;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#lineplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set up scales for x and y axes  
    const x = d3.scaleBand()  // Time scale for the x-axis (Date)
        .domain(data.map(d => d.Date))  // Get the date range from the data
        .range([0, width]);

    const y = d3.scaleLinear()  // Linear scale for the y-axis (Likes)
        .domain([0, d3.max(data, d => d.AvgLikes)])  // Get the max number of AvgLikes
        .range([height, 0]);

    // Draw the axis, you can rotate the text in the x-axis here
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)) // Adjust tick marks
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Average Likes");

    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => x(d.Date) + x.bandwidth() / 2)
        .y(d => y(d.AvgLikes))
        .curve(d3.curveNatural);
    
    svg.append('path')
        .datum(data)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'purple')
        .attr('stroke-width', 2)

    // Add plot title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .style("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Average Likes per Day (Mar 1-7, 2024)");

        
});
