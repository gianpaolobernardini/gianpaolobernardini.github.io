{
    const margin = { top: 30, right: 50, bottom: 50, left: 70 },
        width = 1200 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom,
        plotHeight = height - 100;

    // append the svg 
    const svg = d3.select("#parallelCoords")
        .append("svg")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    var countryPos;
    var hStatic = [];
    
    for (var i = 0; i < 20; i++) {
        hStatic.push(plotHeight + ((height - plotHeight) / 8 * i));
    };

    // Parse the Data
    life_expectancy_trends.then(function (data) {
        let countries = data.sort((a, b) => d3.ascending(a["Index"], b["Index"]))
            .map(d => d.Country);
        for (var j = 1; j <= countries.length; j++)
            countries[j - 1] = countries.length - j + 1 + ". " + countries[j - 1];

        countryPos = d3.scaleBand()
            .domain(countries)
            .range([height, plotHeight]);

        const color = d3.scaleLinear()
            .domain([0, 20, 50, 100])
            .range([
                getComputedStyle(document.body).getPropertyValue("--kombu-green"),
                getComputedStyle(document.body).getPropertyValue("--orange"),
                getComputedStyle(document.body).getPropertyValue("--khaki-web"),
                getComputedStyle(document.body).getPropertyValue("--dark-yellow"),
            ])

        var columns = data.columns.slice(2)
        
        // build a linear scale for each axis
        const y = {}
        for (var i in columns) {
            var name = columns[i]
            y[name] = d3.scaleLinear()
                .domain([40, 100]) // --> Same axis range for each group
                .range([plotHeight, 0])
        }

        // x scale
        x = d3.scalePoint()
            .range([0, width])
            .domain(columns);

        // given a country returns its total index score
        const getTotal = function (country) {
            var total = life_expectancy_trends.then(function (data) {
                for (var j = 0; j < data.length; j++) {
                    if (data[j].Country == country) {
                        return data[j]["Index"];
                    }
                }
            });
            return total;
        }

        // highlights the line of the hovered country
        const highlight = function (event, d) {
            var selectedCountry = d.split(".")[1].slice(1)
            var selectedClass = selectedCountry;

            // gray all the lines
            d3.selectAll(".line")
                .transition().duration(100)
                .style("stroke", "lightgrey")
                .style("opacity", "0.2");
            // color just the selected line
            getTotal(selectedCountry).then(function (total) {
                d3.selectAll("." + selectedClass)
                    .transition().duration(100)
                    .style("stroke", color(total))
                    .style("opacity", "1");
            })
        }

        // resets the colors
        const doNotHighlight = function (event, d) {
            d3.selectAll(".line")
                .transition().duration(200)
                .style("stroke", function (d) { return (color(d["Index"])) })
                .style("opacity", "1")
        }

        // Given csv row returns x and y positions for the line
        function path(d) {
            return d3.line()(columns.map(function (p) { return [x(p), y[p](d[p])]; }));
        }

        // draw the lines
        svg.selectAll("myPath")
            .data(data)
            .join("path")
            .attr("class", function (d) { return "line " + d.Country }) // 2 class for each line: 'line' and the group name
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", function (d) { return (color(d["Index"])) })
            .style("stroke-width", 3)
            .style("opacity", 0.5)

        var columnsAxis = columns;
        columnsAxis.unshift("Lines");

        // draw the axis
        svg.selectAll("myAxis")
            .data(columnsAxis)
            .enter()
            .append("g")
            .attr("class", function (d) {
                if (d == columnsAxis[0])
                    return "axisGrid";
                return "legend";
            })
            .attr("transform", function (d) {    // translation to the correct x pos
                if (d == columnsAxis[0])
                    return `translate(${x(columnsAxis[1])})`;
                return `translate(${x(d)})`;
            })
            .each(function (d) { // build axis
                if (d == columnsAxis[0]) {
                    d3.select(this)
                        .call(d3.axisLeft()
                            .tickFormat(" ")
                            .ticks(5)
                            .tickSize(-width)
                            .scale(y[columnsAxis[1]]));
                }
                else if (d == columnsAxis[1]) { // on first axis place the numbers (at idx 0 we have the country)
                    d3.select(this)
                        .call(d3.axisLeft()
                            .tickFormat(function (d) { return d })
                            .ticks(5)
                            .scale(y[d]));
                }
                else {
                    d3.select(this)
                        .call(d3.axisLeft()
                            .ticks(0)
                            .tickSizeOuter(0)
                            .scale(y[d]))
                        .style("path", 1.5);
                }
            })
            // axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function (d) { if (d != columnsAxis[0]) return d; })
            .style("fill", "black");

        // country name columns
        let col1 = 13;
        svg.selectAll("countryLabel")
            .data(countries)
            .enter()
            .append("text")
            .text(function (d) { return d; })
            .attr("class", "countryLabel")
            .attr("x", function (d) {
                let h = countryPos(d);
                let hRel = h - plotHeight;
                let hRef = height - plotHeight;
                if (hRel > hRef / 10 && hRel < hRef / 10 * 2)
                    return width / 10;
                return 0;
            })
            .attr("y", function (d) {
                // let h = countryPos(d);
                // let hRel = h - plotHeight;
                // let hRef = height - plotHeight;

                return hStatic[--col1];
            })
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight)
    })
/*
    function parallelCoords_update() {
        // cleanup before drawing again using a different palette
        svg.selectAll("*")
            .remove();

        life_expectancy_trends.then(function (data) {
            let countries = data.sort((a, b) => d3.ascending(a["Index"], b["Index"]))
                .map(d => d.Country);
            for (var j = 1; j <= countries.length; j++)
                countries[j - 1] = countries.length - j + 1 + ". " + countries[j - 1];

            countryPos = d3.scaleBand()
                .domain(countries)
                .range([height, plotHeight]);

            const color = d3.scaleLinear()
                .domain([0, 20, 50, 100])
                .range([
                    getComputedStyle(document.body).getPropertyValue("--kombu-green"),
                    getComputedStyle(document.body).getPropertyValue("--orange"),
                    getComputedStyle(document.body).getPropertyValue("--khaki-web"),
                    getComputedStyle(document.body).getPropertyValue("--dark-yellow"),
                ])

            var columns = data.columns.slice(2)

            const y = {}
            for (var i in columns) {
                var name = columns[i]
                y[name] = d3.scaleLinear()
                    .domain([0, 1])
                    .range([plotHeight, 0])
            }

            x = d3.scalePoint()
                .range([0, width])
                .domain(columns);

            const getTotal = function (country) {
                var total = life_expectancy_trends.then(function (data) {
                    for (var j = 0; j < data.length; j++) {
                        if (data[j].Country == country) {
                            return data[j]["Index"];
                        }
                    }
                });
                return total;
            }

            const highlight = function (event, d) {
                var selectedCountry = d.split(".")[1].slice(1)
                var selectedClass = selectedCountry.replaceAll("&", "").replaceAll("'", "").replaceAll(" ", "");

                d3.selectAll(".line")
                    .transition().duration(100)
                    .style("stroke", "lightgrey")
                    .style("opacity", "0.2");
                getTotal(selectedCountry).then(function (total) {
                    d3.selectAll("." + selectedClass)
                        .transition().duration(100)
                        .style("stroke", color(total))
                        .style("opacity", "1");
                })
            }

            const doNotHighlight = function (event, d) {
                d3.selectAll(".line")
                    .transition().duration(200)
                    .style("stroke", function (d) { return (color(d["Index"])) })
                    .style("opacity", "1")
            }

            function path(d) {
                return d3.line().columns.map(function (p) { return [x(p), y[p](d[p])]; });
            }

            svg.selectAll("myPath")
                .data(data)
                .join("path")
                .attr("class", function (d) { return "line " + d.Country }) // 2 class for each line: 'line' and the group name
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", function (d) { return (color(d["Index"])) })
                .style("stroke-width", 3)
                .style("opacity", 0.5)

            var columnsAxis = columns;
            columnsAxis.unshift("Lines");

            svg.selectAll("myAxis")
                .data(columnsAxis)
                .enter()
                .append("g")
                .attr("class", function (d) {
                    if (d == columnsAxis[0])
                        return "axisGrid";
                    return "legend";
                })
                .attr("transform", function (d) {
                    if (d == columnsAxis[0])
                        return `translate(${x(columnsAxis[1])})`;
                    return `translate(${x(d)})`;
                })
                .each(function (d) {
                    if (d == columnsAxis[0]) {
                        d3.select(this)
                            .call(d3.axisLeft()
                                .tickFormat(" ")
                                .ticks(5)
                                .tickSize(-width)
                                .scale(y[columnsAxis[1]]));
                    }
                    else if (d == columnsAxis[1]) {
                        d3.select(this)
                            .call(d3.axisLeft()
                                .tickFormat(function (d) { return d * 100 })
                                .ticks(5)
                                .scale(y[d]));
                    }
                    else {
                        d3.select(this)
                            .call(d3.axisLeft()
                                .ticks(0)
                                .tickSizeOuter(0)
                                .scale(y[d]))
                            .style("path", 1.5);
                    }
                })
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .text(function (d) { if (d != columnsAxis[0]) return d; })
                .style("fill", "black");

            let col1 = 35, col2 = 35, col3 = 35, col4 = 34, col5 = 35, col6 = 35, col7 = 34;
            svg.selectAll("countryLabel")
                .data(countries)
                .enter()
                .append("text")
                .text(function (d) { return d; })
                .attr("class", "countryLabel")
                .attr("x", function (d) {
                    let h = countryPos(d);
                    let hRel = h - plotHeight;
                    let hRef = height - plotHeight;
                    if (hRel > hRef / 7 && hRel < hRef / 7 * 2)
                        return width / 7;
                    else if (hRel > hRef / 7 * 2 && hRel < hRef / 7 * 3)
                        return width / 7 * 2;
                    else if (hRel > hRef / 7 * 3 && hRel < hRef / 7 * 4)
                        return width / 7 * 3;
                    else if (hRel > hRef / 7 * 4 && hRel < hRef / 7 * 5)
                        return width / 7 * 4;
                    else if (hRel > hRef / 7 * 5 && hRel < hRef / 7 * 6)
                        return width / 7 * 5;
                    else if (hRel > hRef / 7 * 6)
                        return width / 7 * 6;
                    return 0;
                })
                .attr("y", function (d) {
                    let h = countryPos(d);
                    let hRel = h - plotHeight;
                    let hRef = height - plotHeight;
                    if (hRel > hRef / 7 && hRel < hRef / 7 * 2)
                        return hStatic[col2--];
                    else if (hRel > hRef / 7 * 2 && hRel < hRef / 7 * 3)
                        return hStatic[col3--];
                    else if (hRel > hRef / 7 * 3 && hRel < hRef / 7 * 4)
                        return hStatic[col4--];
                    else if (hRel > hRef / 7 * 4 && hRel < hRef / 7 * 5)
                        return hStatic[col5--];
                    else if (hRel > hRef / 7 * 4 && hRel < hRef / 7 * 6)
                        return hStatic[col6--];
                    else if (hRel > hRef / 7 * 6)
                        return hStatic[col7--];
                    return hStatic[col1--];
                })
                .on("mouseover", highlight)
                .on("mouseleave", doNotHighlight)
        })
    }
    */
}