import config from './config.js';

export default class SearchEngine {
  constructor(searchId, containerId, paginationId) {
    this.form = document.querySelector(`form[name="${searchId}"]`);
    if (!this.form) return;
    this.input = this.form.querySelector('input[name="search"]');
    this.searchBtn = this.form.querySelector('button[type="submit"]');
    this.yearInput = this.form.querySelector('input[name="year"]');
    this.typeInput = this.form.querySelector('input[name="type"]');
    this.paginationContainer = document.getElementById(paginationId);
    this.container = document.getElementById(containerId);
    this.currentPage = 0;

    this.form.addEventListener('submit', this.searchMovies.bind(this));
  }

  searchMovies(event, page) {
    this.currentPage = page || 1;
    if (event) event.preventDefault();
    let searchQuery = this.input.value;
    if (!searchQuery.length) return;
    let self = this;
    let queryObj = {
      s: searchQuery,
      page: this.currentPage.toString(),
    };
    if (this.typeInput && this.typeInput.value.length) {
      queryObj.type = this.typeInput.value.toLowerCase();
    }
    if (this.typeInput && this.yearInput.value.length) {
      queryObj.y = this.yearInput.value.toLowerCase();
    }
    let queryString = this.convertToQueryString(queryObj);
    let promise = new Promise((resolve, reject) => {
      let httpRequest;
      if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+ ...
        httpRequest = new XMLHttpRequest();
      } else if (window.ActiveXObject) { // IE 6 and older
        httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
      }
      let updateMovies = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            let result = JSON.parse(httpRequest.responseText);
            resolve(result);
          } else {
            reject('There was a problem with the request.');
          }
        }
      };
      httpRequest.onreadystatechange = updateMovies.bind(this);
      httpRequest.open('GET', queryString);
      httpRequest.send();
    }).then(
      (data) => {
        // console.log(data);
        self.updateMoviesList(data);
        self.setPagination(data.totalResults);
      },
      (error) => {
        throw new Error(error);
      }
    );
    promise.catch(this.pushError.bind(this));
  }

  updateMoviesList(data) {
    // console.log(data);
    this.container.innerHTML = '';
    if (data.Response === 'False') {
      this.pushMessageToContainer('error', 'Sorry, movie not found');
      return;
    }
    data.Search.forEach((movie) => {
      this.pushMovieCardToContainer(movie);
    });
  }

  convertToQueryString(qObj) {
    if (typeof qObj !== 'object') return;
    let searchQuery = qObj.hasOwnProperty('s');
    let byId = qObj.hasOwnProperty('i');
    let byTitle = qObj.hasOwnProperty('t');
    if (!searchQuery && !byId && !byTitle) return;
    let result = `${config.domain}?apikey=${config.api}&`;
    for (let key in qObj) {
      if (!qObj.hasOwnProperty(key)) continue;
      result += `${key}=${qObj[key].replace(' ', '+')}&`;
    }
    // console.log(result);
    return result.slice(0, -1);
  }

  pushMovieCardToContainer(card) {
    let cardContainer = document.createElement('DIV');
    cardContainer.classList.add('movie-card');
    cardContainer.classList.add('col-sm-6');
    cardContainer.classList.add('col-md-4');
    cardContainer.classList.add('col-lg-3');
    let cardEl = document.createElement('DIV');
    cardEl.classList.add('thumbnail');
    if (card.imdbID) cardEl.setAttribute('data-id', card.imdbID);
    if (card.Poster) {
      let img = document.createElement('IMG');
      if (card.Poster === 'N/A') {
        img.setAttribute('src', 'http://placehold.it/280x390');
      } else {
        img.setAttribute('src', card.Poster);
      }
      if (card.Title) img.setAttribute('alt', card.Title);
      cardEl.appendChild(img);
    }
    let caption = document.createElement('DIV');
    caption.classList.add('caption');
    if (card.Title) {
      let title = document.createElement('H3');
      title.appendChild(document.createTextNode(card.Title));
      caption.appendChild(title);
    }
    if (card.Year) {
      let year = document.createElement('SPAN');
      year.appendChild(document.createTextNode(card.Year));
      year.classList.add('badge');
      caption.appendChild(year);
    }
    if (card.Type) {
      let type = document.createElement('SPAN');
      type.appendChild(document.createTextNode(card.Type));
      type.classList.add('badge');
      caption.appendChild(type);
    }
    cardEl.appendChild(caption);
    cardContainer.appendChild(cardEl);
    this.container.appendChild(cardContainer);
  }

  setPagination(totalCardsAmount) {
    // this.paginationContainer
    let list = this.paginationContainer.querySelector('ul.pagination');
    if (!list) {
      list = document.createElement('UL');
      list.classList.add('pagination');
      list.addEventListener('click', (event) => {
        this.searchMovies(event, parseInt(event.target.dataset.id, 10));
      });
      this.paginationContainer.appendChild(list);
    }
    list.innerHTML = '';
    let totalPagesAmount = Math.ceil(totalCardsAmount / config.cardsPerPage);
    if (totalPagesAmount < 2) return;
    for (let i = 1; i <= totalPagesAmount; i++) {
      if (Math.abs(i - 1) > 4 &&
          Math.abs(i - this.currentPage) > 4 &&
          Math.abs(i - totalPagesAmount) > 4) continue;
      let item = document.createElement('LI');
      if ((Math.abs(i - 1) === 4 && Math.abs(1 - this.currentPage) > 8) ||
      (Math.abs(i - totalPagesAmount) === 4 && Math.abs(totalPagesAmount - this.currentPage) > 8)) {
        item.classList.add('disabled');
        item.innerHTML = '<a href="#">...</a>';
        list.appendChild(item);
        continue;
      }
      if (i === this.currentPage) item.classList.add('active');
      item.innerHTML = `<a href="#" data-id="${i}">${i}</a>`;
      list.appendChild(item);
    }
  }

  pushMessageToContainer(type, message) {
    let alertBlock = document.createElement('DIV');
    alertBlock.classList.add('alert');
    alertBlock.classList.add('col-sm-6');
    alertBlock.classList.add('col-sm-push-3');
    if (type === 'error') alertBlock.classList.add('alert-danger');
    alertBlock.appendChild(document.createTextNode(message));
    this.container.appendChild(alertBlock);
  }

  pushError(error) {
    console.error(error);
    let alertContainer = document.getElementById('alert-block-container');
    let alertBlock = document.createElement('DIV');
    alertBlock.classList.add('alert');
    alertBlock.classList.add('alert-danger');
    alertBlock.classList.add('text-center');
    alertBlock.classList.add('col-sm-6');
    alertBlock.classList.add('col-sm-push-3');
    alertBlock.appendChild(document.createTextNode(error));
    alertContainer.appendChild(alertBlock);
  }
}
