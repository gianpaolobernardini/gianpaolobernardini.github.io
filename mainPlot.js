{
    function order(selected) {
        switch (selected) {
            case "score_asc":
                return (a, b) => d3.ascending(a.Avg_Life_expectancy, b.Avg_Life_expectancy);
            case "score_des":
                return (a, b) => d3.descending(a.Avg_Life_expectancy, b.Avg_Life_expectancy);
            case "alpha_asc":
                return (a, b) => d3.ascending(a.Country, b.Country);
            case "alpha_des":
                return (a, b) => d3.descending(a.Country, b.Country)
            default:
                console.log("Unexpected sorting key");
        };
    };

    function mainPlot_selectAll() {
        let checkboxes = document.getElementsByName("countries");
        for (let i = 0; i < checkboxes.length; ++i) {
            checkboxes[i].checked = true;
        }
        mainPlot_update();
    };

    function mainPlot_clearAll() {
        let checkboxes = document.getElementsByName("countries");
        for (let i = 0; i < checkboxes.length; ++i) {
            checkboxes[i].checked = false;
        }
        mainPlot_update();
    };

    d3.select(window)
        .on("resize.updatesvg", resizePlot);

    let margin = { top: 0, right: 30, bottom: 0, left: 125 };
    let width = 800 - margin.left - margin.right;
    let height = 800 - margin.top - margin.bottom;

    // append the svg object
    let svg = d3.select("#mainPlot")
        .append("svg")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let checklist = d3.select("#countries_checklist");
    let x, y, xAxis, yAxis, sorting, xAxisGrid;
    var fontScale, labelScale;

    // parse the Data
    countries_data.then(function (data) {
        let countries = data.map(function (d) { return d.Country; });

        let selected_countries = _.sample(countries, 30);

        sorting = document.getElementById("sorting_main").value;

        fontScale = d3.scaleLog()
            .domain([1, countries.length])
            .range([25, 2]);

        labelScale = d3.scaleLinear()
            .domain([1, countries.length])
            // .range([14,3]);
            .range([25, 3]);

        // dynamically generate the checkbox list
        let items = checklist.append("ul")
            .selectAll("li")
            .data(data)
            .enter()
            .append("li")
            .classed("item", true);

        items.append("input")
            .attr("type", "checkbox")
            .attr("name", 'countries')
            .attr("value", function (d) { return d.Country })
            .property("checked", function (d) { return selected_countries.includes(d.Country); })
            .attr("onclick", "mainPlot_update()");

        items.append("label")
            .attr("for", function (d) { return d.Country })
            .text(function (d) { return d.Country }
            );

        // filtering only the selected data
        data = data.filter(d => selected_countries.includes(d.Country))
            .sort(order(sorting));

        // add X axis
        x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, width]);

        xAxis = svg.append("g")
            .attr("class", "plotTextIndex")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(function (d) { return d })
            );

        // add the vertical grid
        xAxisGrid = d3.axisBottom(x).tickSize(height).tickFormat('');
        svg.append('g')
            .attr('class', 'axisGrid')
            .call(xAxisGrid);

        // add the x axis label
        svg.append("text")
            .attr("class", "legend")
            .attr("text-anchor", "end")
            .attr("x", width + 15)
            .attr("y", height + 40)
            .text("Life expectancy (AVG)");

        // add y axis
        y = d3.scaleBand()
            .range([0, height])
            .domain(data.map(d => d.Country))
            .padding(.1);

        yAxis = svg.append("g")
            .attr("class", "plotTextIndex")
            .style("font-size", Math.round(labelScale(selected_countries.length)) + "px")
            .call(d3.axisLeft(y).tickSize(0));

        // bars
        svg.selectAll("myRect")
            .data(data)
            .join("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.Country))
            .attr("width", d => x(d.Avg_Life_expectancy / 100))
            .attr("height", y.bandwidth())
            .attr("class", "bar");

        svg.selectAll(".plotText")
            .style("text-anchor", "end")
            .data(data)
            .join("text")
            .attr("class", "plotText")
            .attr("x", d => x(d.Avg_Life_expectancy / 100))
            .attr("y", d => y(d.Country) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("dx", function (d) {
                if (d.Avg_Life_expectancy >= 0.1)
                    return -Math.round(fontScale(selected_countries.length)) * 2;
                return Math.round(fontScale(selected_countries.length) / 2);
            })
            .text(d => Math.round(d.Avg_Life_expectancy / 100))
            .style("fill", function (d) {
                if (d.Avg_Life_expectancy / 100 >= 0.1)
                    return "white";
                return "black";
            })
            .style("font-size", Math.round(fontScale(selected_countries.length)) + "px");
        resizePlot();
    });

    function mainPlot_update() {
        let checkboxes = document.getElementsByName("countries");
        sorting = document.getElementById("sorting_main").value;
        let selected_countries = [];

        for (let i = 0; i < checkboxes.length; ++i) {
            if (checkboxes[i].checked)
                selected_countries.push(checkboxes[i].value);
        };

        countries_data.then(function (data) {
            data = data.filter(d => selected_countries.includes(d.Country))
                .sort(order(sorting));

            // y axis
            y = d3.scaleBand()
                .range([0, height])
                .domain(data.map(d => d.Country))
                .padding(.1);

            yAxis.transition()
                .duration(500)
                .style("font-size", Math.round(labelScale(selected_countries.length)) + "px")
                .call(d3.axisLeft(y).tickSize(0));

            svg.selectAll("rect")
                .data(data)
                .join("rect")
                .transition()
                .duration(500)
                .attr("x", x(0))
                .attr("y", d => y(d.Country))
                .attr("width", d => x(d.Avg_Life_expectancy / 100))
                .attr("height", y.bandwidth())
                .attr("class", function (d) {
                    if (d.Status == "Developing")
                        return "bar_developing";
                    else if (d.Status == "Developed")
                        return "bar_developed";;
                })

            svg.selectAll(".plotText")
                .data(data)
                .join("text")
                .transition()
                .duration(500)
                .style("text-align", "end")
                .attr("x", d => x(d.Avg_Life_expectancy / 100))
                .attr("y", d => y(d.Country) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("dx", function (d) {
                    if (d.Avg_Life_expectancy >= 0.1)
                        return -Math.round(fontScale(selected_countries.length) * 2);
                    return +Math.round(fontScale(selected_countries.length) / 2);
                })
                .attr("class", "plotText")
                .text(d => Math.round(d.Avg_Life_expectancy))
                .style("fill", function (d) {
                    if (d.Avg_Life_expectancy >= 0.1)
                        return "white";
                    return "black";
                })
                .style("font-size", Math.round(fontScale(selected_countries.length)) + "px")
        })
    };

    // dynamically resizes the plot depending on the parent div size
    function resizePlot() {

        // svg.attr("transform", `translate(${-margin.left}, ${-margin.top})`);

        // width = document.getElementById("mainPlot").clientWidth - margin.left - margin.right;
        // height = document.getElementById("mainPlot").clientHeight;

        // margin.top = 0.01 * height;
        // margin.bottom = 0.10 * height;
        // height = height - margin.top - margin.bottom;

        // console.log(width)
        // console.log(document.getElementById("mainPlot").clientWidth)

        let _width = document.getElementById("mainPlot").clientWidth

        d3.select("#mainPlot > svg").attr("width", _width);

        // svg.attr("width", width)
        //     .attr("height", height)
        //     .attr("transform", `translate(${margin.left}, ${margin.top})`);

        countries_data.then(function (data) {

            let checkboxes = document.getElementsByName("countries")
            let selected_countries = [];
            for (let i = 0; i < checkboxes.length; ++i) {
                if (checkboxes[i].checked)
                    selected_countries.push(checkboxes[i].value);
            };

            x = d3.scaleLinear()
                .domain([0, 1])
                .range([0, width]);

            xAxis.transition()
                .duration(500)
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x).tickFormat(function (d) { return d * 100 })
                );

            xAxisGrid = d3.axisBottom(x).tickSize(height).tickFormat('');
            svg.selectAll(".axisGrid")
                .call(xAxisGrid);

            svg.selectAll(".legend")
                .transition()
                .duration(500)
                .attr("x", width + 15)
                .attr("y", height + 40)

            y = d3.scaleBand()
                .range([0, height])
                .domain(data.map(d => d.Country))
                .padding(.1);

            yAxis.transition()
                .duration(500)
                .style("font-size", Math.round(labelScale(selected_countries.length)) + "px")
                .call(d3.axisLeft(y)
                    .tickSize(0));
        });
        mainPlot_update();
    }

}