const weekData = [{},{},{},{},{},{},{},{}];
const withinWeek = (current, target) => current - target.getTime() <= 7 * 24 * 60 * 60 * 1000;
const dayDifference = (current, target) => (current - target.getTime()) / (1000 * 60 * 60 * 24);

const cleanData = (res, currentDate) => {
    let resDate = new Date(res.date);
    if (withinWeek(currentDate, resDate)) {
        let difference = Math.ceil(dayDifference(currentDate, resDate));
        if (res.county == 'New York City') {
            res.fips = 'NYC';
        }
        let increase = '-';
        let weeklyIncrease = '-';
        if (difference != 7) {
            increase = res.cases - weekData[difference + 1][res.fips].cases;
        }
        if (difference == 0) {
            weeklyIncrease = res.cases - weekData[6][res.fips].cases;
        }
        weekData[difference][res.fips] = {
            date: res.date,
            state: res.state,
            countyName: res.county,
            fips: res.fips,
            cases: res.cases,
            deaths: res.deaths,
            increase,
            weeklyIncrease
        }
    }
}


const mapData = async guidelineData => {

    const DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
    const d = new Date();
    let CURRENT_DATE = new Date(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`).getTime() - (2 * 24 * 60 * 60 * 1000);

    await d3.csv(DATA_URL, (res) => cleanData(res, CURRENT_DATE));

    drawMap(weekData, guidelineData);
    handleSearch(weekData, guidelineData);
}


const drawMap = async (covidData, guidelineData) => {
    console.log(covidData);
    const WIDTH = 940; // 940
    const HEIGHT = 640;
    const svg = d3.select('svg').attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    const g = svg.append('g').attr('viewBox', '0 0 980 610')

    const zoom = d3.zoom()
            .scaleExtent([1, 4])
            .translateExtent([[0, 0], [WIDTH, HEIGHT]])
            .on('zoom', e => g.attr('transform', e.transform));
    g.call(zoom)

    const COUNTY_BORDER = 'white';
    const STATE_BORDER = 'grey';
    const HIGHLIGHT = 'grey';
    const COLOR_DOMAIN = [0, 3000];
    const COLOR_RANGE = ['#ffd6b3', '#ff0000'];

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
                   
        g 
            .append('path')
            .datum(county)
            .attr('class', 'county')
            .attr('d', d3.geoPath())
            .style('fill',  function(d) {
                let match = covidData[0][d.id]
                if (match)
                    return match.weeklyIncrease <= 0 ? '#64c25f' : c(match.weeklyIncrease);
            })
            .style('stroke', COUNTY_BORDER).style('stroke-width', 0.5)
            .on('mouseover', function() {
                d3.select(this).style('stroke', HIGHLIGHT).style('stroke-width', 2);
                toolTip
                    .style('visibility', 'visible')
                    .html(`
                        <p class="subheading">${selection.countyName}, ${selection.state}</p>
                        <p class="tooltip-cases">Cases: ${parseInt(selection.cases).toLocaleString()}</span></p>
                        <p class="tooltip-cases">Weekly Increase: +${parseInt(selection.weeklyIncrease).toLocaleString()}</span></p>
                        <p class="tooltip-cases">Daily Increase: +${parseInt(selection.increase).toLocaleString()}</span></p>
                    `)
            })
            .on('mouseout', function() {
                toolTip.style('visibility', 'hidden')
                d3.select(this).style('stroke', COUNTY_BORDER).style('stroke-width', 0.5)
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
                info(selection, covidData, stateGuidelines)
            })
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

    svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", `translate(${WIDTH-235},15)`);

    const legendLinear = d3.legendColor()
        .shapeWidth(30)
        .title("Increase in Cases over Past Week")
        .orient('vertical')
        .scale(c);

    svg.select(".legendLinear")
        .call(legendLinear);

    $('.loader').remove();
    $('form').css({'display':'block'});
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
    })
    mapData(d);
}

main();

