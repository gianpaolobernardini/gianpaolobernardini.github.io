{
    var margin = { top: 120, right: 120, bottom: 120, left: 120 },
        width = 750 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    let country1_spider = d3.select("#country1_spider");
    let country2_spider = d3.select("#country2_spider");
    let country3_spider = d3.select("#country3_spider");

    let spider_buttons = [country1_spider, country2_spider, country3_spider];
    let selectedCountries;
    let colsPerSpider = [2, 5, 8, 11];
    // let colsPerSpider = [2, 4, 5, 7];

    let color = d3.scaleOrdinal()
        .range([
            getComputedStyle(document.body).getPropertyValue("--kombu-green"),
            getComputedStyle(document.body).getPropertyValue("--laurel-green"),
            getComputedStyle(document.body).getPropertyValue("--dark-yellow")
        ]);

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 7,
        levels: 6,
        roundStrokes: true,
        color: color
    };

    for (var i = 1; i <= 2; ++i) {
        d3.select("#spider" + i)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip tooltipSpider" + i);
    }

    spider_data.then(function (data) {
        let idx = 0;
        spider_buttons.forEach(function (d) { // generate the selects
            d.selectAll("option")
                .data(data)
                .enter()
                .append("option")
                .attr("value", function (d) {
                    return d.Index
                })
                .property("selected", function (d) {
                    return ["Norway", "Singapore", "Oman"][idx] == d.Country;    // preselect three countries
                })
                .text(function (d) {
                    return d.Country
                });
            idx++;
        })
        return data;
    }).then(function (data) {
        selectedCountries = [  // get the selected countrys form the selects
            document.getElementById("country1_spider").value,
            document.getElementById("country2_spider").value,
            document.getElementById("country3_spider").value
        ];
        return data;
    }).then(function (data) {     // collect and push together the needed data for each spider
        var spiderData = [];

        for (var sp = 1; sp <= 2; ++sp) {

            var values = [];
            var cols = data.columns;

            selectedCountries.forEach(function (d) {
                var l = [];

                for (var i = colsPerSpider[sp - 1]; i < colsPerSpider[sp]; ++i) {
                    l.push({ axis: cols[i], value: parseFloat(data[d][cols[i]]) });
                    // console.log("d: ", d)
                    // console.log("i: ", i)
                    // console.log("val: ", data[d][cols[i]])
                }
                values.push(l);

            });
            spiderData[sp] = values;
        }
        return (spiderData);
    }).then(function (spiderData) {
        for (var sp = 1; sp <= 2; ++sp) {
            RadarChart(".radarChart" + sp, spiderData[sp], radarChartOptions)
        }
    });

    function spider_update() {
        let selectedCountries = [
            document.getElementById("country1_spider").value,
            document.getElementById("country2_spider").value,
            document.getElementById("country3_spider").value
        ];

        let color = d3.scaleOrdinal()
            .range([
                getComputedStyle(document.body).getPropertyValue("--kombu-green"),
                getComputedStyle(document.body).getPropertyValue("--laurel-green"),
                getComputedStyle(document.body).getPropertyValue("--dark-yellow")
            ]);
        radarChartOptions.color = color;

        spider_data.then(function (data) {
            var spiderData = [];

            for (var sp = 1; sp <= 2; ++sp) {

                var values = [];
                var cols = data.columns;

                selectedCountries.forEach(function (d) {
                    var l = [];
                    for (var i = colsPerSpider[sp - 1]; i < colsPerSpider[sp]; ++i) {
                        l.push({ axis: cols[i], value: parseFloat(data[d][cols[i]]) });
                    }
                    values.push(l);
                });
                spiderData[sp] = values;
            }
            return (spiderData);
        }).then(function (spiderData) {
            for (var sp = 1; sp <= 2; ++sp) {
                RadarChart(".radarChart" + sp, spiderData[sp], radarChartOptions)
            }
        });
    }
}