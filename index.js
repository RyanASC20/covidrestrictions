const handleSearch = data => {
    const search = $('.search');
    $('form').submit(e => {
        e.preventDefault()
    })
    search.keyup(() => {
        console.log(search.val().toLowerCase())
        console.log(data.filter(e => e.state.toLowerCase().indexOf(search.val().toLowerCase()) != -1))
    })
}


const handleUrls = url => `<a href=${url}>(View source)</a>`;
const handleDates = d => {
    let f = '<br><br>';
    for (let i = 0; i < d.length; i++) {
        f += d[i]
        if (i == 3 || i == 5) {
            f += '-'
        }
    }
    return `<span class='date'>${f}</span>`;
}

const handleFullDates = d => {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    return 
}

const addEmphasis = s => {
    return `<span class='highlight'>${s}</span>`;
}

const cleanGuidelines = gl => {
    let w = gl.split(' ');
    
    for (let i = 0; i < w.length; i++) {
        if (w[i].slice(0,4) == 'http') {
            w[i] = handleUrls(w[i]);
        } else if (w[i].slice(0,4) == '2020') {
            w[i] = handleDates(w[i]);
        } else if ( w[i] === 'covering'
            || w[i].indexOf('mask') !== -1
            || w[i].indexOf('travel') !== -1
            || w[i].indexOf('gather') !== -1) {
                w[i] = addEmphasis(w[i]);
            }
    }
    return w.join(' ');
}


const displayGuidelineData = data => {
    const guidelinesList = $('.state-guidelines')
    guidelinesList.html('');
    data.forEach(e => {
        let notes = e.notes;
        if (notes.indexOf('mask') != -1 || notes.indexOf('travel') != -1 || notes.indexOf('cover') != -1) {
            guidelinesList.append(`<li>${cleanGuidelines(notes)}</li>`);
        }   
    });
}




const info = (selection, guidelineData) => {
    $('#info-card').css({'display': 'block'});
    $('#info-county').text(`${selection.countyName}, `);
    $('#info-state').text(`${selection.state}`);
    let caseCounter = 0;
    let interval = setInterval(() => {
        if (caseCounter > selection.cases) {
            caseCounter = selection.cases
            clearInterval(interval);
        }
        $('#info-cases').text(`${parseInt(caseCounter).toLocaleString()}`);
        caseCounter += selection.cases/100;
    }, 2);
    $('#info-deaths').text(`${parseInt(selection.deaths).toLocaleString()}`);

    displayGuidelineData(guidelineData);
}


const mapData = guidelineData => {
    // const DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv';
    const DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
    const d = new Date();
    let PREVIOUS_DATE = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()-8}`;
    let CURRENT_DATE = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()-2}`;
    const previousDateData = {};
    d3.csv(DATA_URL, function(response) {

        if (response.date == PREVIOUS_DATE) {
            if (response.county == 'New York City') {
                previousDateData['NYC'] = response.cases;
            } else{
                previousDateData[response.fips] = response.cases;
            }
        }

        if (response.date == CURRENT_DATE) {
            if (response.county == 'New York City') {
                return {
                    state: response.state,
                    fips: 'NYC',
                    countyName: response.county,
                    cases: response.cases,
                    increase: response.cases - previousDateData['NYC'],
                    deaths: response.deaths
                }
            }
            return {
                state: response.state,
                fips: response.fips,
                countyName: response.county,
                cases: response.cases,
                increase: response.cases - previousDateData[response.fips],
                deaths: response.deaths
            }
        }
    }).then(data => {
        drawMap(data, guidelineData);
        handleSearch(data);
    })
}


const drawMap = (covidData, guidelineData) => {
    const WIDTH = 940; // 940
    const HEIGHT = 610;
    const svg = d3.select('#map').attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`).append('g').attr('viewBox', '0 0 980 610');
    const zoom = d3.zoom()
            .scaleExtent([1, 4])
            .translateExtent([[0, 0], [WIDTH, HEIGHT]])
            .on('zoom', e => {
                svg.attr('transform', e.transform);
            });
    svg.call(zoom)

    const DEFAULT_FILL = '#d6d6d6';
    const COUNTY_BORDER = 'white';
    const STATE_BORDER = 'grey';
    const HIGHLIGHT = 'grey';
    const COLOR_DOMAIN = [0, 500, 1000, 1500, 2000, 2500, 3000, 4500, 5000, 5500, 6000];
    const COLOR_RANGE = ['#yellow', '#f2dc94', '#f5d671', '#ffd13b', '#ffb60d', '#ff9e0d', '#ff8a0d', '#ff760d', '#ff620d', '#ff4a0d', '#ff350d']


    d3.json('https://d3js.org/us-10m.v1.json')
        .then(data => {

            const counties = topojson.feature(data, data.objects.counties).features
            const states = topojson.feature(data, data.objects.states).features
            
            counties.forEach(county => {

                if (county.id == '36061' 
                    || county.id == '36047' 
                    || county.id == '36005' 
                    || county.id == '36081' 
                    || county.id == '36085') county.id = 'NYC'

                let toolTip = d3.select('#tooltip');
                let selection = covidData.find(e => e.fips == county.id);
                

                svg 
                    .append('path')
                    .datum(county)
                    .attr('class', 'county')
                    .attr('d', d3.geoPath())
                    .style('fill',  function(d) {
                        let c = d3.scaleLinear()
                            .domain(COLOR_DOMAIN)
                            .range(COLOR_RANGE)
                        let match = covidData.find(e => e.fips == d.id);
                        if (match)
                            return c(match.increase)

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
                        toolTip.style('left', `${event.clientX}px`).style('top', `${event.clientY + 20}px`);
                    })
                    .on('click', function(event) {
                        let stateGuidelines = guidelineData.filter(e => e.state == selection.state);
                        info(selection, stateGuidelines)
                    })
            });

            states.forEach(state => {
                svg
                    .append('path')
                    .datum(state)
                    .attr('class','state')
                    .attr('d', d3.geoPath())
                    .style('fill', 'none')
                    .style('stroke', STATE_BORDER).style('stroke-width', 0.5);
            })
            $('.loader').remove();
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
