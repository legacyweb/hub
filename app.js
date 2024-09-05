'use strict';

const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const LegacyPage = require('legacyweb-pages');
const ImageCache = require('./lib/imageCache');
// middleware
const location = require('./lib/location');
const weather = require('./lib/weather');
// Content generator
const report = require('./lib/report');
const calendar = require('./lib/calendar');
const recipes = require('./lib/recipes');
const {download, fileServer, fServerRecursive} = require('./lib/fileserver');

const HTML_PATH = path.join(__dirname, 'html');
const header = fs.readFileSync(path.join(HTML_PATH, 'header.html'), 'utf-8');

const home = require('./lib/home');

const imageCache = new ImageCache();

const HomePage = new LegacyPage(
    'leftpane', 'news', 'Home Page', {
      path: '/',
      gen: home
    }, true, [{webPath: '/images', filePath: path.join(__dirname, 'images')}]
);

HomePage.app.use([
  cookieParser(),
  location,
  weather
]);

HomePage.setHeader(header);

HomePage.addPage({
  title: 'Weather Forecast',
  path: '/forecast',
  gen: report
});

HomePage.addLink({
    url: '/forecast',
    text: 'Weather'
});

HomePage.addPage({
  title: 'Calendar',
  path: '/calendar',
  gen: calendar
})

HomePage.addLink({
  url: '/calendar',
  text: 'Calendar'
});

HomePage.addPage({
  title: 'Recipes',
  path: '/recipes',
  gen: recipes
});

HomePage.addLink({
  url: '/recipes',
  text: 'Recipes'
});

HomePage.addPage({
  title: 'Files',
  path: '/fileserver',
  gen: fileServer
});

HomePage.addPage({
  title: 'Files',
  path: '/fileserver/*',
  gen: fileServer
});

HomePage.addLink({
  url: '/fileserver/',
  text: 'Files'
});

HomePage.app.use('/icons/:icon', imageCache.icon());
HomePage.app.use('/download/*', download);
//HomePage.app.use('/fileserver/*', fServerRecursive);


HomePage.start();
