const zipCodes = require('zipcodes');
const axios = require('axios');

function ipToLocation(ip) {
    return new Promise(function(resolve, reject) {
        axios(`https://freeipapi.com/api/json/${ip}`).then(res => {
            return resolve(res.data);
        }).catch(err => {
            return reject(err);
        });
    });
}

async function getMyLocation(req, res, next) {
    let location;
    try {
        if (req.query.zip) {
            location = zipCodes.lookup(req.query.zip);
            res.cookie('weatherInfo', location);
        } else if (req.cookies && req.cookies.weatherInfo) {
            location = req.cookies.weatherInfo;
        } else {
            const ipres = await axios('https://ifconfig.me/ip');
            const ip = ipres.data;
            location = await ipToLocation(ip);
            const stripped = {
                city: location.cityName	,
                state: location.regionName,
                zip: location.zipCode
            }
            res.cookie('weatherInfo', stripped);
            location = Object.assign(location, stripped)
        }
    } catch (err) {
        location = {
            city: 'Unknown',
            state: 'Unknown',
            zip: 'Unknown'
        }
    }

    req.location = location;
    next();
}

module.exports = getMyLocation;
