const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const currentTemplate = fs.readFileSync(path.join(__dirname, '..', 'html', 'report.ejs'), 'utf-8');
const dayTemplate = fs.readFileSync(path.join(__dirname, '..', 'html', 'report-day.ejs'), 'utf-8');

function report(req) {
  try {

    if (req.query.day) {
      const dayWeather = req.weather.forecast.forecastday.find(d => {
        return d.date === req.query.day;
      });
      return ejs.render(dayTemplate, {
        day: req.query.day,
        location: req.location,
        weatherInfo: dayWeather,
        url: req.url
      });
    } else {
      
      return ejs.render(currentTemplate, {
        day: req.day,
        location: req.location,
        weatherInfo: req.weather,
        url: req.url,
        forecast: (req.url.match(/^\/forecast.*$/) !== null)
      });
    }
  } catch (err) {
    return 'Unable to fetch weather data';
  }
}

module.exports = report;