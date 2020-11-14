import abbreviations from "./abbreviations.js";


let perNPeople = 100000;

d3.csv('statePopulations.csv', function(d) {
    return d
}, function(data) {
        let popData = data;
        d3.csv('https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv', function(d) {
            let pop = popData.find(e => e.state == d.state);
            if (pop) {
                return Object.assign(pop, { 
                    state: d.state, 
                    cases: d.cases 
                });
            }
        }, function(data) {
            
            const map = new Datamap({
                scope: 'usa',
                element: document.getElementById('map'),
                geographyConfig: {
                    borderColor: '#718699',
                    highlightBorderWidth: 3,
                    highlightFillColor: '#997bab',
                    popupTemplate: function(geography) {
                        let st = data.find(e => e.state == geography.properties.name)
                        let cases = st.cases;
                        let pop = st.population;
                        let percentage = Math.round((cases / pop) * 10000)/100;
                        st['percentage'] = percentage;
                        return `<div class="popup">
                                    <p class="state-name head">${geography.properties.name}<p>
                                    <p class="cases"><span class="cases-head head"> Cases:</span> <span class="case-val">${parseInt(cases).toLocaleString()}</span>
                                    <p class="cases"><span class="cases-head head"> Percentage of state pop.</span> <span class="case-val">${percentage}%</span>`;
                    },
                },
            });
            map.labels({fontSize: 16});

            let maxCases = 0;
            for (const state of data) {
                if (parseInt(state.cases) > maxCases) {
                    maxCases = state.cases 
                };
            }

            for (let i = 0; i < data.length; i++) {
                const selection = d3.select(`.${abbreviations[data[i].state]}`)
                var color = d3.scale.linear()
                    .domain([0, maxCases/2, maxCases])
                    .range(["#fcf3ae", "#ffa32b", "#ff7570"]);
                selection.style("fill", color(data[i].cases));
                selection.text("Hello");
            }
    });
})


