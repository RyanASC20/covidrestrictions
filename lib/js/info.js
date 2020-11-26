const handleUrls = url => `<a href=${url}>(View source)</a>`;
const handleDates = d => {
    let f = '';
    for (let i = 0; i < d.length; i++) {
        f += d[i]
        if (i == 3 || i == 5) {
            f += '-'
        }
    }
    return `<span class='date'>${f}</span>`;
}


const addEmphasis = s => {
    return `<span class='highlight'>${s}</span>`;
}

const cleanGuidelines = gl => {
    let w = gl.split(' ');
    for (let i = 0; i < w.length; i++) {
        if (w[i].slice(0,4) == 'http') {
            w[i] = handleUrls(w[i]);
        } else if (w[i].indexOf('2020') != -1) {
            w[i] = handleDates(w[i]);
            if (w[i-1] == 'On') {
                w[i-2] += '<br><br>';
            }
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


const hideInfo = () => {
    $('.info-container').css({'display': 'none'});
    $('#modal-mask').css({'display': 'none'});
}


const info = (selection, guidelineData) => {
    if (selection.cases) {
        hideAbout();
        $('.info-container').css({'display': 'block'});
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
        $('#source').attr('href', sources[selection.state]).text('View Current Travel Advisories Here');
        $('#info-deaths').text(`${parseInt(selection.deaths).toLocaleString()}`);

        displayGuidelineData(guidelineData);
        $('.exit').click(hideInfo);
    } else {
        alert('County not found. Please enter in form "county, state"');
    }
}


const showAbout = () => {
    $('.about-container').css({'display':'block'});

    $('#about')
        .html("This website was made to assist those travelling during the Covid-19 pandemic. The map shows every county in the United States, color coded based on the number of new cases in the past week. The green counties have an increase of less than or equal to 0 cases in the past week. By clicking on a county, the cases and deaths in that county are displayed, as well as a link to the state's travel guidelines. Below, there are general notes from that state.");
    $('#about')
        .append('<p>Covid-19 data is pulled from the <a href="https://github.com/nytimes/covid-19-data" target="_blank">NY Times</a>, and notes are pulled from <a href="https://github.com/COVID19StatePolicy/SocialDistancing" target="_blank">Covid19StatePolicy</a></p>')
        .append('<p>Click on a county to begin!</p>')
    $('.exit').click(hideAbout);
}


const hideAbout = () => {
    $('.about-container').css({'display':'none'});
}

showAbout();
$('#nav-about').click(() => {showAbout(); hideInfo()});