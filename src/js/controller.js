import * as bookmarksModel from './models/bookmarksModel.js';
import * as recipeModel from './models/recipeModel.js';
import * as searchResultsModel from './models/searchResultsModel.js';
import { state } from './models/appStateModel.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    //show spinner
    recipeView.renderSpinner();

    //update results to show active recipe
    resultsView.update(searchResultsModel.getSearchResultsPage());
    bookmarksView.update(state.bookmarks);

    //Loading recipe
    await recipeModel.loadRecipe(id);

    //Render recipe
    recipeView.render(state.recipe);
  } catch (error) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results
    await searchResultsModel.loadSearchResults(query);

    // Render results
    resultsView.render(searchResultsModel.getSearchResultsPage(1));

    //Show pagination
    paginationView.render(state.search);
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {
  // Render new results
  resultsView.render(searchResultsModel.getSearchResultsPage(goToPage));

  //Show new pagination buttons
  paginationView.render(state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings (in state)
  recipeModel.updateServings(newServings);

  //update the recipe view
  //Render recipe
  //recipeView.render(state.recipe);
  recipeView.update(state.recipe);
};

const controlAddBookmark = function () {
  // add or remove bookmark
  if (!state.recipe.bookmarked) {
    bookmarksModel.addBookmark(state.recipe);
  } else {
    bookmarksModel.deleteBookmark(state.recipe.id);
  }
  // update recipe view
  recipeView.update(state.recipe);

  // render bookmarks
  bookmarksView.render(state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //upload recipe data
    await recipeModel.uploadRecipe(newRecipe);

    //Render recipe
    recipeView.render(state.recipe);

    //Display success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(state.bookmarks);

    //Change ID in URL
    window.history.pushState(null, '', `#${state.recipe.id}`);

    //Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    addRecipeView.renderError(error.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
