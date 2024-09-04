// Middleware for weather info

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const Report = require('weather-api-client');
const {LRUCache} = require('lru-cache');

const weekday = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday", "Sunday"];

const lru = new LRUCache({
  ttl: 60 * 60 * 1000,
  ttlAutopurge: true
});

const weather = new Report(process.env.WEATHER_API_KEY);

function convertIconUrl(url) {
    const parts = url.split('/')
    const fileName = parts[parts.length-1].replace('png', 'jpg');
    return `/icons/${fileName}?orig=http:${url}`;
}

async function getWeatherInfo(req, res, next) {
    try {
        let weatherInfo = lru.get(req.location.zip);
        if (!weatherInfo) {
          weatherInfo = await weather.getForecast(req.location.zip, 8, true);
          weatherInfo.current.condition.icon = convertIconUrl(weatherInfo.current.condition.icon);
          weatherInfo.forecast.forecastday.forEach(day => {
            day.day.condition.icon = convertIconUrl(day.day.condition.icon);
            day.dayOfWeek = weekday[(new Date(day.date)).getDay()];
            day.hour.forEach(h => {
              h.condition.icon = convertIconUrl(h.condition.icon);
              // parse out time of day
              const t = h.time;
              const parts = t.split(' ');
              const mTime = parts[parts.length - 1];
              let hour = parseInt(mTime.split(':')[0]);
              let m = (hour < 12) ? 'AM' : 'PM';
              if (hour === 0) {
                hour = 12
              } else if (hour > 12) {
                hour = hour - 12;
              }
              h.timeText = `${hour}:00 ${m}`;
            });
          });
          lru.set(req.location.zip, weatherInfo);
        }
        req.weather = weatherInfo;
    } catch (err) {
        req.weather = {
            error: err.message
        };
    }
    next();
};

module.exports = getWeatherInfo;
