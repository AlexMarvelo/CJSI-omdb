import SearchEngine from './search.js';

const movieSearch = new SearchEngine({
  searchBlockId: 'search-group',
  moviesContainerId: 'movies-container',
  favMoviesContainerId: 'movies-container-favourite',
  paginationId: 'pagination-container',
});
