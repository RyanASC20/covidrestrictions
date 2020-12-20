let centered;
const weekData = [{},{},{},{},{},{},{},{},{},{},{},{},{},{}];
// const withinWeek = (current, target) => current.getTime() - target.getTime() <= 14 * 24 * 60 * 60 * 1000;
const dayDifference = (current, target) => (current.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);

const cleanData = (res, currentDate) => {
    if (res.county == 'New York City') {res.fips = 'NYC'}
    let difference = Math.floor(dayDifference(currentDate, new Date(res.date))); 
    if (difference < 14) {
        let weeklyIncrease = '-';
        let increase = '-';
        if (difference == 0 && weekData[13][res.fips]) {weeklyIncrease = res.cases - weekData[6][res.fips].cases;}
        if (difference < 13 && weekData[difference + 1][res.fips]) {increase = res.cases - weekData[difference + 1][res.fips].cases;}
        weekData[difference][res.fips] = {
            date: res.date,
            state: res.state,
            countyName: res.county,
            fips: res.fips,
            cases: res.cases,
            deaths: res.deaths,
            increase,
            weeklyIncrease
        };
    }
}


const selectMapType = (weekData, guidelineData, populationData) => {
    $('#map-title-form').on('change', async () => {
        $('.loader').css("visibility","visible");
        if ($('select').val() == 'casesPerCapitaPrev') {
            await drawMap(weekData, guidelineData, populationData, 'casesPerCapita', day=13);
        }
        else await drawMap(weekData, guidelineData, populationData, $('select').val());
        centered = null;
    }); 
}


const mapData = async guidelineData => {

    // const DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
    const DATA_URL = '../../assets/covidData.csv';

    let START_DATE = new Date(new Date().getTime() - (36 * 60 * 60 * 1000));

    await d3.csv(DATA_URL, res => cleanData(res, START_DATE));
    const populationData = await d3.csv('../../../assets/pop_est_2019.csv');

    console.log(weekData);

    selectMapType(weekData, guidelineData, populationData);
    let {WIDTH, HEIGHT, g, path, geometries} = await drawMap(weekData, guidelineData, populationData);
    handleSearch(weekData, guidelineData, WIDTH, HEIGHT, g, path, geometries);
}


const computeData = (selection, population) => {
    return {
        casesPerCapita: Math.floor(selection.cases / population * 1000) / 1000,
        dailyIncrease100k: Math.floor(selection.increase / population * 100000),
        weeklyIncreasePerCapita: Math.floor(selection.weeklyIncrease / population * 1000) / 1000,
        deathsPerCase: Math.floor(selection.deaths / selection.cases * 1000) / 1000
    }
}


const cleanPopulation = (selection, popData) => {
    let match = popData.filter(e => selection.fips == e.fips);
    if (match.length == 0) {return NaN}
    else return match[0].population
}


const configureNYCBoroughs = counties => {
    return counties.map(county => {
        if (county.id == '36061' || county.id == '36047' || county.id == '36005' || county.id == '36081' || county.id == '36085') {county.id = 'NYC'}
        return county;
    })
}


const countyConfig = counties => {
  return configureNYCBoroughs(counties);
}


const mouseOver = (sel,tooltip) => {
    if ($(document).width() > 1050) {
        tooltip
            .style('visibility', 'visible')
            .html(`
                <p class="subheading">${sel.countyName}, ${sel.state}</p>
                <p class="tooltip-cases">Cases: ${parseInt(sel.cases).toLocaleString()}</p>
                <p class="tooltip-cases">Weekly Increase: <span class="red">+${parseInt(sel.weeklyIncrease).toLocaleString()}</span></p>
                <p class="tooltip-cases">Daily Increase: <span class="red">+${parseInt(sel.increase).toLocaleString()}</span></p>
                <p class="tooltip-cases">Cases Per Capita: ${sel.casesPerCapita}</p>
                <p class="tooltip-cases">Weekly Increase Per Capita: ${sel.weeklyIncreasePerCapita}</span></p>
                <p class="tooltip-cases">Daily Increase/100k: ${sel.dailyIncrease100k}</span></p>
            `)
    }
}


const mousemove = (e, tooltip) => {
    if (e.clientX > $(window).width() / 2) {
        tooltip.style('left', `${e.clientX-200}px`).style('top', `${e.clientY + 20}px`);
    } else {
        tooltip.style('left', `${e.clientX}px`).style('top', `${e.clientY + 20}px`);
    }
}


const arrayEqual = (a, b) => {
    if (a.length !== b.length) {return false}
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < 2; j++)
            if (a[i][j] !== b[i][j]) {return false}
    }
    return true;
}


function select(d, path, width, height) {
    let g = d3.select('#g-map');
    var x, y, k;
    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }
    
    g.select('#counties')
        .selectAll('path')
        .classed("active", d => {
            return centered && arrayEqual(centered.coordinates[0],d.geometry.coordinates[0])
        })

  
    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px")
}


const drawMap = async (covidData, guidelineData, populationData, type='casesPerCapita', day=0) => {
    //Settings
    const WIDTH = 940; // 940
    const HEIGHT = 640;
    const COUNTY_BORDER = 'white';
    const COUNTY_BORDER_WIDTH = 0.1;
    const HIGHLIGHT = 'aquamarine';
    const COLOR_OPTIONS = {
        casesPerCapita: [0, 0.025, 0.05, 0.1, 0.125, 0.15],
        weeklyIncreasePerCapita: [0, 0.002, 0.005, 0.01, 0.015, 0.02],
        dailyIncrease100k: [0, 10, 70, 160, 210, 260, 310],
        deathsPerCase: [0, 0.002, 0.005, 0.02, 0.03, 0.04]
        // casesPerCapita: [0, 0.15],
        // weeklyIncreasePerCapita: [0,0.02],
        // dailyIncrease100k: [0, 310],
        // deathsPerCase: [0, 0.04]
    }
    const COLOR_DOMAIN = COLOR_OPTIONS[type];
    console.log(day, type)
    console.log(type)
    const COLOR_RANGE = ['#F2DF91', '#FFA83E', '#FD6A0B', '#D8382E', '#AF1C43', '#701547'];
    // const COLOR_RANGE = ['#F2DF91', '#D8382E']
    let geometries = {};

    const c = d3.scaleLinear()
        .domain(COLOR_DOMAIN)
        .range(COLOR_RANGE)
    
    const svg = d3.select('svg')
        .html('')
        .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

    const zoom = d3.zoom()
            .scaleExtent([1, 7])
            .translateExtent([[0, 0], [WIDTH, HEIGHT]])
            .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom)

    const g = svg.append('g')
        .attr('viewBox', '0 0 980 610')
        .attr('id', 'g-map')

    const path = d3.geoPath();

    const us = await d3.json('https://d3js.org/us-10m.v1.json');
    const counties = countyConfig(topojson.feature(us, us.objects.counties).features);
    const states = topojson.feature(us, us.objects.states).features;

    let selection;
    let tooltip = d3.select('#tooltip')

    g.append('g')
        .attr('id', 'counties')
      .selectAll('path')
        .data(counties)
      .enter().append('path')
        .attr('d', path)
        .each(function(d) {
            selection = covidData[day][d.id];
            if (selection) {
                geometries[selection.fips] = d.geometry;
                let population = cleanPopulation(selection, populationData);
                let computed = computeData(selection, population);

                selection['population'] = population;
                selection['mainData'] = computed[type];
                selection = Object.assign(selection, computed)

                d.selection = selection;
            }
        })
        .attr('class', 'county')
        .style('fill', function(d) {
            let match = covidData[day][d.id];
            if (match) {
                let mainData = d.selection.mainData;
                return mainData <= 0 ? '#64c25f' : c(mainData)
            }
        })
        .on('mouseover', function() {
            const sel = d3.select(this).data()[0].selection;
            d3.select(this).style('stroke', HIGHLIGHT).style('stroke-width', 2);
            mouseOver(sel, tooltip);
        })
        .on('mouseout', function() {
            tooltip.style('visibility', 'hidden')
            if (!d3.select(this).classed('active')) {
                d3.select(this)
                    .style('stroke', COUNTY_BORDER)
                    .style('stroke-width', COUNTY_BORDER_WIDTH)
            }
        }) 
        .on('mousemove', function(e) {mousemove(e, tooltip)})
        .on('click', function() {
            let a = d3.select(this).data()[0]
            let d = a.geometry;
            let sel = a.selection;
            select(d, path, WIDTH, HEIGHT);
            info(sel, covidData, guidelineData) 
        })


    g.append('g')
        .attr('id', 'states')
      .selectAll(path)
        .data(states)
      .enter().append('path')
        .attr('d', path)
        .attr('class', 'state')


    $('.loader').css("visibility", "hidden")
    return {WIDTH, HEIGHT, g, path, geometries}
}


const main = async() => {
    await fetch('/.netlify/functions/update');
    const GUIDELINE_DATA = 'https://raw.githubusercontent.com/COVID19StatePolicy/SocialDistancing/master/data/USstatesCov19distancingpolicy.csv';
    const d = await d3.csv(GUIDELINE_DATA, function(res) { 
        if (res.DateEased == '' && res.DateEnded == '') {
            return {
                state: res.StateName,
                dateEnacted: res.DateEnacted,
                dateEnded: res.DateEnded,
                dateEasedd: res.DateEased,
                notes: res.PolicyCodingNotes,
                source: res.PolicySource,
                maskLevel: res.PublicMaskLevel,
            }
        }
    });
    mapData(d);
}

main();

