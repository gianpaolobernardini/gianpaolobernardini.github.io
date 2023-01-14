{
    function order(selected){
        switch(selected){
            case "aid_asc":
                return (a, b) => d3.ascending(parseFloat(a.Avg_Infant_Deaths), parseFloat(b.Avg_Infant_Deaths));
            case "aid_des":
                return (a, b) => d3.descending(parseFloat(a.Avg_Infant_Deaths), parseFloat(b.Avg_Infant_Deaths));
            case "ale_asc":
                return (a, b) => d3.ascending(parseFloat(a.Avg_Life_expectancy), parseFloat(b.Avg_Life_expectancy));
            case "ale_des":
                return (a, b) => d3.descending(parseFloat(a.Avg_Life_expectancy), parseFloat(b.Avg_Life_expectancy));
            default:
                console.log("Unexpected sorting key");
        };
    };

    let margin = {top: 20, right: 20, bottom: 50, left: 50},
        width = 800 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // append the svg object
    let svg = d3.select("#divergent")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let xLeft, xRight, y, yAxis, sorting;

    infant_deaths.then(function(data){
        sorting = document.getElementById("sorting_divergent").value;

        svg.append("rect")
            .attr("x", width / 2 + 10)
            .attr("y",-15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legendSquare")
            .style("fill", getComputedStyle(document.body).getPropertyValue("--kombu-green"))

        svg.append("rect")
            .attr("x", width / 2 - 20)
            .attr("y",-15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legendSquare")
            .style("fill", getComputedStyle(document.body).getPropertyValue("--khaki-web"))

        svg.append("text")
            .attr("x", width / 2 + 30)
            .attr("y", -5)
            .text("Life expectancy")
            .attr("class", "legend")

        svg.append("text")
            .attr("x", width / 2 - 30)
            .attr("y", -5)
            .attr("text-anchor", "end")
            .text("Infant death")
            .attr("class", "legend")

        // add the two  axes
        let max_infant_death = d3.max(data.map(d => parseInt(d.Avg_Infant_Deaths)));
        
        xLeft = d3.scaleLinear()
            .domain([max_infant_death/2, 0])
            .range([ 0, width/2]);    

        xRight = d3.scaleLinear()
            .domain([0, 100])
            .range([width/2, width]);

        svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xLeft).tickFormat(function(d) {
                return parseFloat(d);
            })
        );

        svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xRight)
                .tickFormat(function(d){
                    return parseFloat(d)
                })    
            );

        // add the labels
        svg.append("text")
            .attr("class", "legend")
            .attr("text-anchor", "end")
            .attr("x", width + 10)
            .attr("y", height + 45)
            .text("(Years)");

        svg.append("text")
            .attr("class", "legend")
            .attr("x", 0)
            .attr("y", height + 45)
            .text("(%)");

        data = data.sort(order(sorting));

        // y axis
        y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(d => d.Country))
            .padding(.1);
        
        // bars sx
        svg.selectAll(".myRectAvg_Infant_Deaths")
            .data(data)
            .join("rect")
            .attr("x", d => xLeft(d.Avg_Infant_Deaths))
            .attr("y", d => y(d.Country))
            .attr("width", d => xLeft(0) - xLeft(d.Avg_Infant_Deaths))
            .attr("height", y.bandwidth())
            .attr("class", "barAvg_Infant_Deaths");

        // bars dx
        svg.selectAll(".myRectAvg_Life_expectancy")
            .data(data)
            .join("rect")
            .attr("x", xRight(0))
            .attr("y", d => y(d.Country))
            .attr("width", d => xRight(d.Avg_Life_expectancy) - xRight(0))
            .attr("height", y.bandwidth())
            .attr("class", "barAvg_Life_expectancy");
        
        // generate y axis
        yAxis = svg.append("g")
            .attr("class", "legendDivergent")
            .attr("transform", `translate(${width/2}, 0)`)
            .call(d3.axisRight(y).tickSize(0))
            .style("path", 1.5);

        // add the detail texts
        svg.selectAll(".plotTextIndex")
            .data(data)
            .join("text")
            .attr("class", "plotTextIndex")
            .attr("x", d => xRight(d.Avg_Life_expectancy))
            .attr("y", d => y(d.Country) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("dx", "5px")
            .text(d => parseFloat(d.Avg_Life_expectancy).toFixed(1))
        
            svg.selectAll(".plotTextIncome")
            .data(data)
            .join("text")
            .attr("class", "plotTextIncome")
            .attr("x", d => xLeft(d.Avg_Infant_Deaths))
            .attr("y", d => y(d.Country) + y.bandwidth() / 2)
            .attr("dy", "0.5em")
            .attr("dx", "-20px")
            .text(d => (d.Avg_Infant_Deaths))
    });

    function divergent_update(){
        sorting = document.getElementById("sorting_divergent").value;

        infant_deaths.then(function(data){
            data = data.sort(order(sorting));

            y = d3.scaleBand()
                .range([ 0, height ])
                .domain(data.map(d => d.Country))
                .padding(.1);
            
            svg.selectAll(".barAvg_Infant_Deaths")
                .data(data)
                .join("rect")
                .transition()
                .duration(500)
                .attr("x", d => xLeft(d.Avg_Infant_Deaths))
                .attr("y", d => y(d.Country))
                .attr("width", d => xLeft(0) - xLeft(d.Avg_Infant_Deaths))
                .attr("height", y.bandwidth())
                .attr("class", "barAvg_Infant_Deaths");

            svg.selectAll(".barAvg_Life_expectancy")
                .data(data)
                .join("rect")
                .transition()
                .duration(500)
                .attr("x", xRight(0))
                .attr("y", d => y(d.Country))
                .attr("width", d => xRight(d.Avg_Life_expectancy) - xRight(0))
                .attr("height", y.bandwidth())
                .attr("class", "barAvg_Life_expectancy");
            
            yAxis.transition()
                .duration(500)
                .call(d3.axisRight(y).tickSize(0))
                .style("path", 1.5);

            svg.selectAll(".plotTextIndex")
                .data(data)
                .join("text")
                .transition()
                .duration(500)
                .attr("class", "plotTextIndex")
                .attr("x", d => xRight(d.Avg_Life_expectancy))
                .attr("y", d => y(d.Country) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("dx", "5px")
                .text(d => parseFloat(d.Avg_Life_expectancy).toFixed(1))
            
            svg.selectAll(".plotTextIncome")
                .data(data)
                .join("text")
                .transition()
                .duration(500)
                .attr("class", "plotTextIncome")
                .attr("x", d => xLeft(d.Avg_Infant_Deaths))
                .attr("y", d => y(d.Country) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("dx", "-20px")
                .text(d => (d.Avg_Infant_Deaths))
        });
    }

    // updates the colors of the legend
    function divergent_update_legend(){
        svg.selectAll(".legendSquare")
            .remove();
        svg.append("rect")
            .attr("x", width / 2 + 10)
            .attr("y",-15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legendSquare")
            .style("fill", getComputedStyle(document.body).getPropertyValue("--kombu-green"))
            
        svg.append("rect")
            .attr("x", width / 2 - 20)
            .attr("y",-15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legendSquare")
            .style("fill", getComputedStyle(document.body).getPropertyValue("--khaki-web"))
    }
}