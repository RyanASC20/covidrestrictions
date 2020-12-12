const weekData = [{},{},{},{},{},{},{}];
const withinWeek = (current, target) => current.getTime() - target.getTime() <= 7 * 24 * 60 * 60 * 1000;
const dayDifference = (current, target) => (current.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);

const cleanData = (res, currentDate) => {
    if (res.county == 'New York City') {res.fips = 'NYC'}
    let difference = Math.floor(dayDifference(currentDate, new Date(res.date))); 
    if (difference < 7) {
        let weeklyIncrease = '-';
        let increase = '-';
        if (difference == 0 && weekData[6][res.fips]) {weeklyIncrease = res.cases - weekData[6][res.fips].cases;}
        if (difference < 6 && weekData[difference + 1][res.fips]) {increase = res.cases - weekData[difference + 1][res.fips].cases;}
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
    $('#map-title-form').on('change', () => {
        drawMap(weekData, guidelineData, populationData, type=$('select').val());
    }); 
}


const mapData = async guidelineData => {

    const DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
    let START_DATE = new Date(new Date().getTime() - (36 * 60 * 60 * 1000));
    console.log(START_DATE);

    await d3.csv(DATA_URL, res => cleanData(res, START_DATE));
    const populationData = await d3.csv('../lib/pop_est_2019.csv');

    selectMapType(weekData, guidelineData, populationData);
    drawMap(weekData, guidelineData, populationData);
    handleSearch(weekData, guidelineData, populationData);
}


const computeData = (selection, population) => {
    return {
        casesPerCapita: Math.floor(selection.cases / population * 1000) / 1000,
        dailyIncrease100k: Math.floor(selection.increase / population * 100000),
        weeklyIncreasePerCapita: Math.floor(selection.weeklyIncrease / population * 1000) / 1000
    }
}


const cleanPopulation = (selection, popData) => {
    let match = popData.filter(e => selection.fips == e.fips);
    if (match.length == 0) {return NaN}
    else return match[0].population
}


const drawMap = async (covidData, guidelineData, populationData, type='casesPerCapita') => {

    //Settings
    const WIDTH = 940; // 940
    const HEIGHT = 640;
    const COUNTY_BORDER = 'white';
    const COUNTY_BORDER_WIDTH = 0;
    const STATE_BORDER = 'white';
    const HIGHLIGHT = 'grey';
    const COLOR_OPTIONS = {
        casesPerCapita: [0, 0.025, 0.05, 0.1, 0.125, 0.15],
        weeklyIncreasePerCapita: [0, 0.002, 0.005, 0.01, 0.015, 0.02],
        dailyIncrease100k: [0, 10, 70, 160, 210, 260, 310]
    }
    const COLOR_DOMAIN = COLOR_OPTIONS[type];
    const COLOR_RANGE = ['#F2DF91', '#FFA83E', '#FD6A0B', '#D8382E', '#AF1C43', '#701547'];

    const svg = d3.select('svg').attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    svg.html("");
    const g = svg.append('g').attr('viewBox', '0 0 980 610')

    const zoom = d3.zoom()
            .scaleExtent([1, 7])
            .translateExtent([[0, 0], [WIDTH, HEIGHT]])
            .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom)


    const topojsonData = await d3.json('https://d3js.org/us-10m.v1.json');
    const counties = topojson.feature(topojsonData, topojsonData.objects.counties).features
    const states = topojson.feature(topojsonData, topojsonData.objects.states).features

    const c = d3.scaleLinear()
                .domain(COLOR_DOMAIN)
                .range(COLOR_RANGE)

    counties.forEach(county => {
        if (county.id == '36061' || county.id == '36047' || county.id == '36005' || county.id == '36081' || county.id == '36085') {county.id = 'NYC'}

        let toolTip = d3.select('#tooltip');
        let selection = covidData[0][county.id];  
        if (selection) {
            let population = cleanPopulation(selection, populationData);

            const mainData = computeData(selection, population)[type];
            const casesPerCapita = computeData(selection, population).casesPerCapita;
            const weeklyIncreasePerCapita = computeData(selection, population).weeklyIncreasePerCapita;
            const dailyIncrease100k = computeData(selection, population).dailyIncrease100k;

            g 
                .append('path')
                .datum(county)
                .attr('class', 'county')
                .attr('d', d3.geoPath())
                .style('fill',  function(d) {
                    let match = covidData[0][d.id]
                    if (match)
                        return mainData <= 0 ? '#64c25f' : c(mainData);
                })
                .style('stroke', COUNTY_BORDER).style('stroke-width', COUNTY_BORDER_WIDTH)
                .on('mouseover', function() {
                    d3.select(this).style('stroke', HIGHLIGHT).style('stroke-width', 2);
                    if ($(document).width() > 1050) {
                        toolTip
                            .style('visibility', 'visible')
                            .html(`
                                <p class="subheading">${selection.countyName}, ${selection.state}</p>
                                <p class="tooltip-cases">Cases: ${parseInt(selection.cases).toLocaleString()}</p>
                                <p class="tooltip-cases">Weekly Increase: <span class="red">+${parseInt(selection.weeklyIncrease).toLocaleString()}</span></p>
                                <p class="tooltip-cases">Daily Increase: <span class="red">+${parseInt(selection.increase).toLocaleString()}</span></p>
                                <p class="tooltip-cases">Cases Per Capita: ${casesPerCapita}</p>
                                <p class="tooltip-cases">Weekly Increase Per Capita: ${weeklyIncreasePerCapita}</span></p>
                                <p class="tooltip-cases">Daily Increase/100k: ${dailyIncrease100k}</span></p>
                            
                                `)
                    }
                })
                .on('mouseout', function() {
                    toolTip.style('visibility', 'hidden')
                    d3.select(this).style('stroke', COUNTY_BORDER).style('stroke-width', COUNTY_BORDER_WIDTH)
                })
                .on('mousemove', function(event) {
                    if (event.clientX > $(window).width() / 2) {
                        toolTip.style('left', `${event.clientX-200}px`).style('top', `${event.clientY + 20}px`);
                    } else {
                        toolTip.style('left', `${event.clientX}px`).style('top', `${event.clientY + 20}px`);
                    }
                })
                .on('click', function() {
                    let stateGuidelines = guidelineData.filter(e => e.state == selection.state);
                    info(selection, covidData, casesPerCapita, dailyIncrease100k, weeklyIncreasePerCapita, population, stateGuidelines)
                })
        }  
    });

    states.forEach(state => {
        g
            .append('path')
            .datum(state)
            .attr('class','state')
            .attr('d', d3.geoPath())
            .style('fill', 'none')
            .style('stroke', STATE_BORDER).style('stroke-width', 0.5);
    });

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

    $('.loader').remove();
}



const main = async() => {
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

