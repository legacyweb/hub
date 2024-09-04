const axios = require('axios');
const {LRUCache} = require('lru-cache');

const lru = new LRUCache({
  ttl: 60 * 60 * 1000,
  ttlAutopurge: true
});  

async function getToday() {
    const key = Date().split(' ').slice(1,4).join(' ');
    let res = lru.get(key);
    if (!res) {
        res = (await axios('http://calapi.inadiutorium.cz/api/v0/en/calendars/default/today')).data;
        lru.set(key, res);
    }
    return res;
};

async function populateEvents(month, year, days) {
    const key = `${year}-${month}`;
    let res = lru.get(key);
    if (!res) {
      res = (await axios(`http://calapi.inadiutorium.cz/api/v0/en/calendars/default/${year}/${month}`)).data;
      lru.set(key, res);
    }
    days.forEach(d => {
        const litDay = res.find(ld => ld.date === d.date);
        let celebration = litDay.celebrations[0];
        litDay.celebrations.forEach(c => {
          if (celebration.rank_num < c.rank_num) {
            celebration = c;
          }
        });
        d.events.push(celebration.title);
        d.color = celebration.colour;
        d.color = (d.color === 'violet') ? 'purple' : d.color;
    });
}

module.exports.getToday = getToday;
module.exports.populateEvents = populateEvents;
