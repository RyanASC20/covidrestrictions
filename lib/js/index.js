const withinWeek = (current, target) => current.getTime() - target.getTime() <= 6 * 24 * 60 * 60 * 1000;
const dayDifference = (current, target) => (current.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);

const mapData = guidelineData => {
    const DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';

    const d = new Date();
    let CURRENT_DATE = new Date(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate() - 1}`);
    
    const weekData = [{},{},{},{},{},{},{}];

    d3.csv(DATA_URL, function(response) {

        let resDate = new Date(response.date);
        if (withinWeek(CURRENT_DATE, resDate)) {
            let difference = dayDifference(CURRENT_DATE, resDate);
            if (response.county == 'New York City') {
                response.fips = 'NYC';
            }
            weekData[difference][response.fips] = {
                date: response.date,
                state: response.state,
                countyName: response.county,
                cases: response.cases,
                deaths: response.deaths,
            }
            return {
                date: response.date,
                state: response.state,
                countyName: response.county,
                cases: response.cases,
                deaths: response.deaths,
            }
        }

        // if (response.date == `${CURRENT_DATE.getFullYear()}-${CURRENT_DATE.getMonth() + 1}-${CURRENT_DATE.getDate()}`) {
        //     if (response.county == 'New York City') {
        //         response.fips = 'NYC';
        //     }
        //     return {
        //         state: response.state,
        //         fips: response.fips,
        //         countyName: response.county,
        //         cases: response.cases,
        //         increase: response.cases - weekData[6][response.fips].cases,
        //         deaths: response.deaths
        //     }
        // }
    }).then(data => {
        console.log(weekData)
        drawMap(data, guidelineData);
        handleSearch(data, guidelineData);
    })
}


const drawMap = (covidData, guidelineData) => {
    const WIDTH = 940; // 940
    const HEIGHT = 640;
    const svg = d3.select('#map').attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    const g = svg.append('g').attr('viewBox', '0 0 980 610')

    const zoom = d3.zoom()
            .scaleExtent([1, 4])
            .translateExtent([[0, 0], [WIDTH, HEIGHT]])
            .on('zoom', e => {
                g.attr('transform', e.transform);
            });
    g.call(zoom)

    const DEFAULT_FILL = '#d6d6d6';
    const COUNTY_BORDER = 'white';
    const STATE_BORDER = 'grey';
    const HIGHLIGHT = 'grey';
    const COLOR_DOMAIN = [0, 3000];
    const COLOR_RANGE = ['#ffd6b3', '#ff0000'];

    d3.json('https://d3js.org/us-10m.v1.json')
        .then(data => {

            const counties = topojson.feature(data, data.objects.counties).features
            const states = topojson.feature(data, data.objects.states).features
            let c = d3.scaleLinear()
                            .domain(COLOR_DOMAIN)
                            .range(COLOR_RANGE)

            counties.forEach(county => {

                if (county.id == '36061' 
                    || county.id == '36047' 
                    || county.id == '36005' 
                    || county.id == '36081' 
                    || county.id == '36085') county.id = 'NYC'

                let toolTip = d3.select('#tooltip');
                let selection = covidData.find(e => e.fips == county.id);
                
                g 
                    .append('path')
                    .datum(county)
                    .attr('class', 'county')
                    .attr('d', d3.geoPath())
                    .style('fill',  function(d) {
                        
                        // let match = covidData.find(e => e.fips == d.id);
                        // let population = populationData.find(e => e.county)
                        if (match)
                            if (match.increase <= 0) {
                                return '#64c25f';
                            }
                            else {
                                return c(match.increase)
                            }

                        return DEFAULT_FILL;
                    })
                    .style('stroke', COUNTY_BORDER).style('stroke-width', 0.5)
                    .on('mouseover', function(event) {
                        d3.select(this).style('stroke', HIGHLIGHT).style('stroke-width', 2);
                        let ct = selection.countyName;
                        let st = selection.state; 
                        let cases = selection.cases;
                        let increase = selection.increase;
                        toolTip
                            .style('visibility', 'visible')
                            .html(`
                                <p class="subheading">${ct}, ${st}</p>
                                <p class="tooltip-cases">Cases: ${parseInt(cases).toLocaleString()} <span>(+${parseInt(increase).toLocaleString()})</span></p>
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
                        info(selection, stateGuidelines)
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
            })

            svg.append("g")
                .attr("class", "legendLinear")
                .attr("transform", `translate(${WIDTH-235},15)`);

            var legendLinear = d3.legendColor()
                .shapeWidth(30)
                .title("Increase in Cases over Past Week")
                .orient('vertical')
                .scale(c);

            svg.select(".legendLinear")
                .call(legendLinear);

            $('.loader').remove();
            $('form').css({'display':'block'});
        })
        .catch(err => console.log(err));
}



const GUIDELINE_DATA = 'https://raw.githubusercontent.com/COVID19StatePolicy/SocialDistancing/master/data/USstatesCov19distancingpolicy.csv';
d3.csv(GUIDELINE_DATA, function(response) { 
    if (response.DateEased == '' && response.DateEnded == '') {
        return {
            state: response.StateName,
            dateEnacted: response.DateEnacted,
            dateEnded: response.DateEnded,
            dateEasedd: response.DateEased,
            notes: response.PolicyCodingNotes,
            source: response.PolicySource,
            maskLevel: response.PublicMaskLevel,
        }
    }
})
.then(guidelineData => {
    mapData(guidelineData)
})
.catch(err => console.log(err))


