'use strict';
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const lit = require('./litcal');

const homeTemplate = fs.readFileSync(path.join(__dirname, '..', 'html', 'home.ejs'), 'utf-8');

async function home(req) {
    let liturgical = await lit.getToday();
    if (liturgical.celebrations.length > 0) {
        let celebration = liturgical.celebrations[0];
        liturgical.celebrations.forEach(c => {
            if (c.rank > celebration.rank) {
                celebration = c;
            }
        });
        liturgical.colour = celebration.colour;
        liturgical.title = celebration.title;
        liturgical.rank = celebration.rank;
    } else {
        switch(liturgical.season) {
            case 'ordinary':
                liturgical.colour = 'green';
                break;
            case 'lent':
                liturgical.colour = 'purple';
                break;
            case 'advent':
                liturgical.co.our = 'purple';
                break;
        }
        liturgical.title = `${liturgical.weekday}, week ${liturgical.season_week} of ${liturgical.season}`;
    }
    return ejs.render(homeTemplate, {
        location: req.location,
        weatherInfo: req.weather,
        liturgical
    });
}

module.exports = home;