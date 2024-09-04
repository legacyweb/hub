'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const calTemplate = fs.readFileSync(path.join(__dirname, '..', 'html', 'calendar.ejs'), 'utf-8');
const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

// liturgical calendar
const {populateEvents} = require('./litcal');

// calendar selections
const selections = {
    liturgical: populateEvents
};

async function calendar(req) {
    const today = new Date();
    const month = parseInt(req.query.month) || (today.getMonth() + 1);
    const mF = Number(month).toString().padStart(2, '0');
    const year = parseInt(req.query.year) || today.getFullYear();
    const monthName = (new Date(year, month, 0)).toLocaleString('default', { month: 'long' });
    const nDays = daysInMonth(year, month);
    let days = [];
    for (let d = 1; d <= nDays; d++) {
        const dF = Number(d).toString().padStart(2, '0');
        days.push({
            date: `${year}-${mF}-${dF}`,
            events: []
        });
    }
    let lMonth = (month === 1) ? 12 : (month - 1);
    let lYear = (month === 1) ? (year-1) : year;
    let nMonth = (month === 12) ? 1 : (month + 1);
    let nYear = (month === 12) ? (year+1) : year;
    const lastParams = new URLSearchParams(Object.assign({}, req.query, {
        month: lMonth,
        year: lYear
    })).toString();
    const nextParams = new URLSearchParams(Object.assign({}, req.query, {
        month: nMonth,
        year: nYear
    })).toString();

    if (req.query.selection && Object.keys(selections).indexOf(req.query.selection) >= 0) {
        const populate = selections[req.query.selection];
        await populate(month, year, days);
    }

    // TODO: fill this in with useful info
    return ejs.render(calTemplate, {
        lastMonth: `/calendar?${lastParams}`,
        nextMonth: `/calendar?${nextParams}`,
        month: monthName,
        year,
        days,
        selections
    });
};

module.exports = calendar;