
    // const svg = d3.select('svg').attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    // svg.html("");
    // const g = svg.append('g').attr('viewBox', '0 0 980 610')

    // const zoom = d3.zoom()
    //         .scaleExtent([1, 7])
    //         .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    //         .on('zoom', e => g.attr('transform', e.transform));
    // svg.call(zoom)


    // const topojsonData = await d3.json('https://d3js.org/us-10m.v1.json');
    // const counties = topojson.feature(topojsonData, topojsonData.objects.counties).features
    // const states = topojson.feature(topojsonData, topojsonData.objects.states).features

    // const c = d3.scaleLinear()
    //             .domain(COLOR_DOMAIN)
    //             .range(COLOR_RANGE)

    // counties.forEach(county => {
    //     if (county.id == '36061' || county.id == '36047' || county.id == '36005' || county.id == '36081' || county.id == '36085') {county.id = 'NYC'}

    //     let toolTip = d3.select('#tooltip');
    //     let selection = covidData[0][county.id];  
    //     if (selection) {
    //         let population = cleanPopulation(selection, populationData);

    //         const mainData = computeData(selection, population)[type];
    //         const {casesPerCapita, weeklyIncreasePerCapita, dailyIncrease100k} = computeData(selection, population);
            
    //         g 
    //             .append('path')
    //             .datum(county)
    //             .attr('class', 'county')
    //             .attr('d', d3.geoPath())
    //             .style('fill',  function(d) {
    //                 let match = covidData[0][d.id]
    //                 if (match)
    //                     return mainData <= 0 ? '#64c25f' : c(mainData);
    //             })
    //             .style('stroke', COUNTY_BORDER).style('stroke-width', COUNTY_BORDER_WIDTH)
    //             .on('mouseover', function() {
    //                 d3.select(this).style('stroke', HIGHLIGHT).style('stroke-width', 2);
    //                 if ($(document).width() > 1050) {
    //                     toolTip
    //                         .style('visibility', 'visible')
    //                         .html(`
    //                             <p class="subheading">${selection.countyName}, ${selection.state}</p>
    //                             <p class="tooltip-cases">Cases: ${parseInt(selection.cases).toLocaleString()}</p>
    //                             <p class="tooltip-cases">Weekly Increase: <span class="red">+${parseInt(selection.weeklyIncrease).toLocaleString()}</span></p>
    //                             <p class="tooltip-cases">Daily Increase: <span class="red">+${parseInt(selection.increase).toLocaleString()}</span></p>
    //                             <p class="tooltip-cases">Cases Per Capita: ${casesPerCapita}</p>
    //                             <p class="tooltip-cases">Weekly Increase Per Capita: ${weeklyIncreasePerCapita}</span></p>
    //                             <p class="tooltip-cases">Daily Increase/100k: ${dailyIncrease100k}</span></p>
                            
    //                             `)
    //                 }
    //             })
    //             .on('mouseout', function() {
    //                 toolTip.style('visibility', 'hidden')
    //                 d3.select(this).style('stroke', COUNTY_BORDER).style('stroke-width', COUNTY_BORDER_WIDTH)
    //             })
    //             .on('mousemove', function(event) {
    //                 if (event.clientX > $(window).width() / 2) {
    //                     toolTip.style('left', `${event.clientX-200}px`).style('top', `${event.clientY + 20}px`);
    //                 } else {
    //                     toolTip.style('left', `${event.clientX}px`).style('top', `${event.clientY + 20}px`);
    //                 }
    //             })
    //             .on('click', function(d) {
    //                 d3.select(this).attr('class', 'active');
    //                 // d3.select(this).style('fill', 'aquamarine');
    //                 let stateGuidelines = guidelineData.filter(e => e.state == selection.state);
    //                 info(selection, covidData, casesPerCapita, dailyIncrease100k, weeklyIncreasePerCapita, population, stateGuidelines)
    //             })
    //     }  
    // });

    // states.forEach(state => {
    //     g
    //         .append('path')
    //         .datum(state)
    //         .attr('class','state')
    //         .attr('d', d3.geoPath())
    //         .style('fill', 'none')
    //         .style('stroke', STATE_BORDER).style('stroke-width', 0.5);
    // });

    // svg.append("g")
    //     .attr("class", "legendLinear")
    //     .attr("transform", `translate(${WIDTH-135},425)`);

    // const legendLinear = d3.legendColor()
    //     .shapeWidth(30)
    //     .title("County Cases Per Capita")
    //     .orient('vertical')
    //     .scale(c);

    // svg.select(".legendLinear")
    //     .call(legendLinear);