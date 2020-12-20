const path = require('path');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const d3 = require('d3-fetch');
// const fetch = require('node-fetch');
if (typeof fetch !== 'function') {
    global.fetch = require('node-fetch').default;
}

console.log('=========================================;=',__filename);
let records = [];

const dayDifference = (current, target) => (current.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
let currentDate = new Date(new Date().getTime() - (36 * 60 * 60 * 1000));

const getData = async () => {
    const DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
    await d3.csv(DATA_URL, res => {
        let difference = Math.floor(dayDifference(currentDate, new Date(res.date))); 
        if (difference < 14) records.push(Object.values(res));
    }); 
}

const updateCsv = async() => {
    await getData();
    console.log(path.resolve('.', '/assets'));
    const csvWriter = createCsvWriter({
        path: path.resolve(__dirname, 'Users/Ryan/Desktop/covidrestrictions/assets/covidData.csv'),
        header: ['date', 'county', 'state', 'fips', 'cases', 'deaths']
    });
    await csvWriter.writeRecords(records);
}


export async function handler(event, context) {
    await updateCsv();
    return {
      statusCode: 200,
      body: 'hello'
    };
}


