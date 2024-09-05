const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// current selected source
let source;

const recipeTemplate = fs.readFileSync(path.join(__dirname, '..', 'html', 'recipes.ejs'), 'utf-8');

function report(req) {
  try {

    source = req.query.source || 'myrecipes';

    return ejs.render(recipeTemplate, {
        source,
        sources: [
            {id: 'myrecipes', text: 'My Recipes'}, 
            {id: 'allrecipes', text: 'allrecipes.com'}
        ]
    });

    // TODO: get and display search results

  } catch (err) {
    return 'Unable to load recipes';
  }
}

module.exports = report;