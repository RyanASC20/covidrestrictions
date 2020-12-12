const handleUrls = url => `<a href=${url} target="_blank">(View source)</a>`;
const handleDates = d => {
    let f = '';
    for (let i = 0; i < d.length; i++) {
        f += d[i]
        if (i == 3 || i == 5) {
            f += '-'
        }
    }
    return `<span class='red'>${f}</span>`;
}


const addEmphasis = s => {
    return `<span class='highlight'>${s}</span>`;
}

const cleanGuidelines = gl => {
    let w = gl.split(' ');
    for (let i = 0; i < w.length; i++) {
        if (w[i].slice(0, 4) == 'http') {
            w[i] = handleUrls(w[i]);
        } else if (w[i].indexOf('2020') != -1) {
            w[i] = handleDates(w[i]);
            if (w[i - 1] == 'On') {
                w[i - 2] += '<br><br>';
            }
        } else if (w[i] === 'covering' ||
            w[i].indexOf('mask') !== -1 ||
            w[i].indexOf('travel') !== -1 ||
            w[i].indexOf('gather') !== -1) {
            w[i] = addEmphasis(w[i]);
        }
    }
    return w.join(' ');
}


const displayGuidelineData = data => {
    const guidelinesList = $('.state-guidelines').html('');
    data.forEach(e => {
        let notes = e.notes;
        if (notes.indexOf('mask') != -1 || notes.indexOf('travel') != -1 || notes.indexOf('cover') != -1) {
            guidelinesList.append(`<li>${cleanGuidelines(notes)}</li>`);
        }
    });
}


const hideInfo = () => {
    $('.info-container').css({
        'display': 'none'
    });
    $('#modal-mask').css({
        'display': 'none'
    });
}


const dataTable = (fips, covidData) => {

    $('#weekly-data')
        .text('')
        .append('<tr><th>Date (yyyy/mm/dd)</th><th>Cases (+Daily Increase)</th><th>Deaths</th></tr>');
    for (let i = covidData.length-1; i >= 0; i--) {
        let data = covidData[i][fips];
        $('#weekly-data')
            .append(
                `<tr>
                    <td>${data.date}</td>
                    <td>${parseInt(data.cases).toLocaleString()} <span class=${data.increase > 0 ? 'red' : 'green'}>(+${data.increase})</span></td>
                    <td>${parseInt(data.deaths).toLocaleString()}</td>
                </tr>`
            )
    }
}


const generalInfo = (selection, casesPerCapita, dailyIncrease100k, weeklyIncreasePerCapita, population) => {
    $('#info-county').text(`${selection.countyName}, `);
        $('#info-state').text(`${selection.state}`);
        let caseCounter = 0;
        let interval = setInterval(() => {
            if (caseCounter > selection.cases) {
                caseCounter = selection.cases
                clearInterval(interval);
            }
            $('#info-cases').text(`${parseInt(caseCounter).toLocaleString()}`);
            caseCounter += selection.cases / 100;
        }, 2);
        $('#source').attr('href', sources[selection.state]).text('View Current Travel Advisories Here');
        $('#info-deaths').text(`${parseInt(selection.deaths).toLocaleString()}`);
    
    $('.info-general')
        .html(
            `<p>Population: <span class="quick-info">${parseInt(population).toLocaleString()}</span></p>
            <p>Cases Per Capita: <span class="quick-info">${casesPerCapita}</span></p>
            <p>Daily Increase/100k: <span class="quick-info">${dailyIncrease100k}</span></p>
            <p>Weekly Increase Per Capita: <span class="quick-info">${weeklyIncreasePerCapita}</span></p>`
        )
    
}

const info = (selection, covidData, casesPerCapita, dailyIncrease100k, weeklyIncreasePerCapita, population, guidelineData) => {
    if (selection.cases) {
        hideAbout();
        $('.info-container').css({
            'display': 'block'
        });
        
        generalInfo(selection, casesPerCapita, dailyIncrease100k, weeklyIncreasePerCapita, population);
        dataTable(selection.fips, covidData);

        displayGuidelineData(guidelineData);
        $('.exit').click(hideInfo);
    } else {
        alert('County not found. Please enter in form "county, state"');
    }
}


const showAbout = () => {
    $('.about-container').css({'display': 'block'});
    $('.exit').click(hideAbout);
}


const hideAbout = () => {
    $('.about-container').css({'display': 'none'});
}

showAbout();
$('#nav-about').click(() => {
    showAbout();
    hideInfo()
});