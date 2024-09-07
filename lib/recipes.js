const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

let categories = [];

const recipeFile = process.env.RECIPE_FILE || path.join(process.env.HOME, '.recipes', 'recipes.json');
let recipes = JSON.parse(fs.readFileSync(recipeFile));
const recipesBrowse = fs.readFileSync(path.join(__dirname, '..', 'html', 'recipes-browse.ejs'), 'utf-8');
const recipeView = fs.readFileSync(path.join(__dirname, '..', 'html', 'recipes-view.ejs'), 'utf-8');

function report(req) {
  try {

    const action = req.query.action || 'browse';
    const id = req.query.id || 0;
    let begin = parseInt(req.query.begin) || 0;
    let limit = parseInt(req.query.limit) || 20;

    let filtered = [];
    if (action === 'search') {
      const query = req.query.q;
      // ignore normal filters, just do a title search
      recipes.forEach(r => {
        if (r.title.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          filtered.push(r);
        }
      });
    } else {
      if (categories.length > 0) {
        recipes.forEach(r => {
          const intersection = (r.categories.filter(c => categories.includes(c)));
          if (intersection.length !== 0) {
            filtered.push(r);
          }
        });
      } else {
        filtered = recipes;
        // Limit filtered results
        filtered = filtered.slice(begin, begin + limit);
      }
    }

    let content = '';

    switch(action) {
      case 'browse':
        content = ejs.render(recipesBrowse, {
          begin,
          limit,
          recipes: filtered,
          total: recipes.length,
          action
        });
        break;
      case 'view':
        content = ejs.render(recipeView, {
          recipe: recipes[id]
        });
        break;
      case 'search':
        content = ejs.render(recipesBrowse, {
          begin,
          limit,
          recipes: filtered,
          total: recipes.length,
          action
        });
        break;
    };

    return content

  } catch (err) {
    return 'Unable to load recipes';
  }
}

module.exports = report;