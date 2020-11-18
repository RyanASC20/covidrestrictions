            // svg
            //     .attr('viewBox', '0 0 980 610')
            //         .selectAll('.county')
            //         .data(counties)
            //     .enter().append('path')
            //         .attr('d', d3.geoPath())
            //         .attr('class', 'county')
            //         .style('fill',  function(d) {
            //             let c = d3.scaleLinear()
            //                 .domain(COLOR_DOMAIN)
            //                 .range(COLOR_RANGE)
            //             let match = covidData.find(e => e.fips == d.id);
            //             if (match)
            //                 return c(match.confirmed_cases)
            //             return DEFAULT_FILL;
            //         })
            //         .style('stroke', COUNTY_BORDER).style('stroke-width', 0.5)
            //         .on('mouseover', function() {
            //             d3.select(this).style('stroke', HIGHLIGHT).style('stroke-width', 2)
            //         })
            //         .on('mouseout', function() {
            //             d3.select(this).style('stroke', COUNTY_BORDER).style('stroke-width', 0.5)
            //         })
            //         // .on('click', function(d) {
            //         //     console.log(d3.select(this))
            //         // })

                        // svg 
            //     .selectAll('.state')
            //     .data(states)
            // .enter().append('path')
            //     .attr('d', d3.geoPath())
            //     .attr('class', 'state')
            //     .style('fill', 'none')
            //     .style('stroke', STATE_BORDER).style('stroke-width', 0.5)