"use strict";

document.addEventListener("DOMContentLoaded", initApp);

let allMovies = [];

function initApp() {
  document
    .querySelector("#search-input")
    .addEventListener("input", applyFiltersAndSort);

  document
    .querySelector("#genre-select")
    .addEventListener("change", applyFiltersAndSort);

  document
    .querySelector("#sort-select")
    .addEventListener("change", applyFiltersAndSort);

  getMovies();
}

async function getMovies() {
  try {
    const response = await fetch("./app.json");
    const data = await response.json();

    console.log("DATA:", data);

    allMovies = data;

    populateGenreSelect();
    applyFiltersAndSort();
  } catch (error) {
    console.error("FEJL:", error);
  }
}

function populateGenreSelect() {
  const genreSelect = document.querySelector("#genre-select");
  const genres = new Set();

  for (const movie of allMovies) {
    const movieGenres = Array.isArray(movie.genre)
      ? movie.genre
      : [movie.genre];

    for (const genre of movieGenres) {
      genres.add(genre);
    }
  }

  const genreArray = Array.from(genres);

  genreArray.sort((a, b) => a.localeCompare(b));

  for (const genre of genreArray) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`,
    );
  }
}

function applyFiltersAndSort() {
  const searchValue = document
    .querySelector("#search-input")
    .value.trim()
    .toLowerCase();

  const selectedGenre = document.querySelector("#genre-select").value;
  const sortOption = document.querySelector("#sort-select").value;

  let filteredMovies = allMovies.filter(function (movie) {
    const matchesTitle = movie.title.toLowerCase().includes(searchValue);

    const movieGenres = Array.isArray(movie.genre)
      ? movie.genre
      : [movie.genre];

    const matchesGenre =
      selectedGenre === "all" || movieGenres.includes(selectedGenre);

    return matchesTitle && matchesGenre;
  });

  if (sortOption === "title") {
    filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "year") {
    filteredMovies.sort((a, b) => b.year - a.year);
  } else if (sortOption === "rating") {
    filteredMovies.sort((a, b) => b.rating - a.rating);
  }

  showMovies(filteredMovies);
}

function showMovies(movies) {
  const movieList = document.querySelector("#movie-list");
  const movieCount = document.querySelector("#movie-count");

  movieList.innerHTML = "";
  movieCount.textContent = `Viser ${movies.length} ud af ${allMovies.length} spil`;

  if (movies.length === 0) {
    movieList.innerHTML =
      '<p class="empty">Ingen spil matcher din søgning eller genre.</p>';
    return;
  }

  for (const movie of movies) {
    showMovie(movie);
  }
}

function showMovie(movie) {
  const genres = Array.isArray(movie.genre)
    ? movie.genre.join(", ")
    : movie.genre;

  const movieCard = `
    <article class="movie-card" tabindex="0">
      <img src="${movie.image}" alt="Poster af ${movie.title}" class="movie-poster" />
      <div class="movie-info">
        <div class="title-row">
          <h2>${movie.title}</h2>
        </div>
        <p class="genre">${genres}</p>
        <p class="director-line"><strong> 2-4 personer </strong> ${movie.players}</p>
        <p class="director-line"><strong>Spilletid:</strong> ${movie.playtime} min</p>
        <p class="movie-location"><strong>Placering:</strong> ${movie.shelf}</p>
        <p class="movie-age"><strong>Anbefalet alder:</strong> ${movie.age} år</p>
        <p class="movie-availability"><strong>Tilgængelig:</strong> ${movie.available ? "Ja" : "Nej"}</p>

      </div>
    </article>
  `;

  const movieList = document.querySelector("#movie-list");
  movieList.insertAdjacentHTML("beforeend", movieCard);

  const newCard = movieList.lastElementChild;

  newCard.addEventListener("click", function () {
    showMovieDialog(movie);
  });
}

function showMovieDialog(movie) {
  const dialog = document.querySelector("#movie-dialog");
  const dialogContent = document.querySelector("#dialog-content");

  const genres = Array.isArray(movie.genre)
    ? movie.genre.join(", ")
    : movie.genre;

  const actors = Array.isArray(movie.actors)
    ? movie.actors.join(", ")
    : movie.actors;

  dialogContent.innerHTML = `
    <img src="${movie.image}" alt="Poster af ${movie.title}" class="movie-poster">
    <div class="dialog-details">
      <h2>${movie.title} <span class="movie-year">(${movie.year})</span></h2>
      <p class="movie-genre">${genres}</p>
      <p class="movie-rating">⭐ ${movie.rating}</p>
      <p><strong>Beskrivelse:</strong> ${movie.description}</p>
      <p><strong>Spilletsregler:</strong> ${movie.rules}</p>
      <p class="movie-description">${movie.description}</p>
    </div>
  `;

  dialog.showModal();
}
