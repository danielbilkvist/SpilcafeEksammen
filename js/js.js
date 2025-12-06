"use strict";

// Initialize app on DOM ready
document.addEventListener("DOMContentLoaded", initApp);

// All games data
let allGames = [];

// Weekly featured game ID
const INTRO_GAME_ID = 20; // <-- Weekly featured game ID here
// Badge text for weekly featured game
const INTRO_BADGE_TEXT = "Ugens<br>Spil!";

// Initialize application
function initApp() {
  getGames();

// map inputs to filter function (if present in HTML)
  const searchInput = document.querySelector("#search-input");
  if (searchInput) searchInput.addEventListener("input", filterGames);

  const genreSelect = document.querySelector("#genre-select");
  if (genreSelect) genreSelect.addEventListener("change", filterGames);

  const sortSelect = document.querySelector("#sort-select");
  if (sortSelect) sortSelect.addEventListener("change", filterGames);

// map players inputs to players/playtime filter (if present in HTML)
  const playFrom = document.querySelector("#players-min");
  const playTo = document.querySelector("#players-max");
  if (playFrom) playFrom.addEventListener("input", filterGames);
  if (playTo) playTo.addEventListener("input", filterGames);

  const ratingFrom = document.querySelector("#time-min");
  const ratingTo = document.querySelector("#time-max");
  if (ratingFrom) ratingFrom.addEventListener("input", filterGames);
  if (ratingTo) ratingTo.addEventListener("input", filterGames);

// clear filters button (if present)
  const clearBtn = document.querySelector("#clear-filters");
  if (clearBtn) clearBtn.addEventListener("click", clearAllFilters);

// filterbarbot toggle (if present)
  const filterToggle = document.querySelector(".filterbarbot-toggle");
  const filterContent = document.querySelector(".filterbarbot-content");
  if (filterToggle && filterContent) {
    filterToggle.addEventListener("click", () => {
      filterToggle.classList.toggle("active");
      filterContent.classList.toggle("active");
    });
  }
}

// Fetch games from provided JSON
async function getGames() {
  const url = "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";
  try {
    const res = await fetch(url);
    allGames = await res.json();
  } catch (err) {
    console.error("Could not load games:", err);
    allGames = [];
  }

  populateGenreDropdown();
  displayGames(allGames);

// Render the chosen game (by id) into #intro; fall back to first game if id not found
  const introGame = allGames.find(g => g.id === INTRO_GAME_ID) || allGames[0];
  if (introGame) renderIntroCard(introGame);
}

// render a small card into #intro
function renderIntroCard(game) {
  const intro = document.querySelector("#intro");
  if (!intro) return;
  // clear previous intro content so switching id is visible
  intro.innerHTML = '';
  const html = `
    <article class="gotw" tabindex="0">
      ${INTRO_BADGE_TEXT ? `<span class="corner-badge">${INTRO_BADGE_TEXT}</span>` : ''}
      <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster" />
      <div class="game-info">
        <h3>${game.title}  <p class="game-rating">⭐${game.rating}</p> <span class="game-shelf">${game.shelf ? '('+game.shelf+')' : ''}</span></h3>
      </div>
    </article>
  `;
  intro.insertAdjacentHTML('beforeend', html);

  // Interactive card
  const newCard = intro.lastElementChild;
  newCard.addEventListener('click', () => showGameModal(game));
  newCard.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showGameModal(game);
    }
  });
}



//Shortens long text with "..."
function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n-1) + '…' : str;
}
// Display games list from provided JSON
function displayGames(games) {
  const list = document.querySelector("#game-list");
  if (!list) return;
  list.innerHTML = "";
  if (games.length ===0) {
    list.innerHTML = '<p class="no-results">Ingen spil😢</p>';
    return;
  }

  for (const game of games) displayGame(game);
}

// Game card
function displayGame(game) {
  const list = document.querySelector("#game-list");
  if (!list) return;

  const html = `
    <article class="game-card" tabindex="0">
      <img src="${game.image}" alt="Poster of ${escapeHtml(game.title)}" class="game-poster" />
      <div class="game-info">
        <h3>${escapeHtml(game.title)} <span class="game-shelf">${game.shelf ? ''+escapeHtml(game.shelf)+'' : ''}</span></h3>
        <div class="game-properties">
        <p class="game-property">👤${game.players.min}-${game.players.max}</p>
        <p class="game-property">⏳${game.playtime}</p> 
        <p class="game-property">⭐${game.rating}</p>
        </div>
      </div>
    </article>
  `;
// Saved genre display
// <p class="game-genre">${escapeHtml(game.genre)}</p>

// Interactive card
  list.insertAdjacentHTML('beforeend', html);
  const newCard = list.lastElementChild;
  newCard.addEventListener('click', () => showGameModal(game));
  newCard.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showGameModal(game);
    }
  });
}

// Escape HTML special characters
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
}

// Populate genre dropdown dynamically
function populateGenreDropdown() {
  const genreSelect = document.querySelector('#genre-select');
  if (!genreSelect) return;
  const genres = new Set();
  for (const g of allGames) {
    if (g.genre) genres.add(g.genre);
  }
  genreSelect.innerHTML = `<option value="all">Alle genrer</option>`;
  [...genres].sort().forEach(g => genreSelect.insertAdjacentHTML('beforeend', `<option value="${g}">${g}</option>`));
}

// Back to top button
const backToTopBtn = document.querySelector("#top-btn");

if (backToTopBtn) {
  // Show when scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  // Scroll to top when clicked
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// Overlay card in modal dialog
function showGameModal(game) {
  const dialogContent = document.querySelector('#dialog-content');
  if (!dialogContent) return;
  dialogContent.innerHTML = `
    <img src="${game.image}" alt="Poster af ${escapeHtml(game.title)}" class="game-poster">
    <div class="dialog-details">
      <h2>${escapeHtml(game.title)}</h2>
      <p><strong>Players:</strong> ${game.players.min} - ${game.players.max}</p>
      <p><strong>Playtime:</strong> ${game.playtime} minutes</p>
      <p class="game-rating">⭐ ${game.rating}</p>
      <p><strong>Shelf:</strong> ${escapeHtml(game.shelf || '-')}</p>
      <p><strong>Difficulty:</strong> ${escapeHtml(game.difficulty || '-')}</p>
      <p><strong>Genre:</strong> ${escapeHtml(game.genre || '-')}</p>
       <p class="game-description">${truncate(escapeHtml(game.description), 140)}</p>
      <div class="game-description">${escapeHtml(game.rules || game.description || '')}</div>
    </div>
  `;
  const dlg = document.querySelector('#game-dialog');
  if (dlg && typeof dlg.showModal === 'function') dlg.showModal();
}


// Clear all filters function
function clearAllFilters() {
  const search = document.querySelector('#search-input'); if (search) search.value = '';
  const genre = document.querySelector('#genre-select'); if (genre) genre.value = 'all';
  const sort = document.querySelector('#sort-select'); if (sort) sort.value = 'none';
  const y1 = document.querySelector('#players-min'); if (y1) y1.value = '';
  const y2 = document.querySelector('#players-max'); if (y2) y2.value = '';
  const r1 = document.querySelector('#time-min'); if (r1) r1.value = '';
  const r2 = document.querySelector('#time-max'); if (r2) r2.value = '';
  filterGames();
}

// Filter games based on current filter values
function filterGames() {
  let filtered = allGames.slice();
  const searchValue = (document.querySelector('#search-input')?.value || '').toLowerCase();
  const genreValue = document.querySelector('#genre-select')?.value || 'all';
  const sortValue = document.querySelector('#sort-select')?.value || 'none';

  // players-min -> players-max
  const playersFrom = Number(document.querySelector('#players-min')?.value) || 0;
  const playersTo = Number(document.querySelector('#players-max')?.value) || Infinity;
  
  // playtime-min -> playtime-max
  const playtimeFrom = Number(document.querySelector('#time-min')?.value) || 0;
  const playtimeTo = Number(document.querySelector('#time-max')?.value) || Infinity;


// Filter by search text in title or description + convert to lowercase
  if (searchValue) {
    filtered = filtered.filter(g => (g.title || '').toLowerCase().includes(searchValue) || (g.description || '').toLowerCase().includes(searchValue));
  }

// Genre Filter
  if (genreValue && genreValue !== 'all') {
    filtered = filtered.filter(g => g.genre === genreValue);
  }

// Filter by players min to max
  if (playersFrom || playersTo !== Infinity) {
    filtered = filtered.filter(g => {
      const minPlayers = g.players?.min || 0;
      const maxPlayers = g.players?.max || 0;
      // game overlaps with requested range if: game's max >= requested min AND game's min <= requested max
      return maxPlayers >= playersFrom && minPlayers <= playersTo;
    });
  }

  // Filter by playtime min to max
  if (playtimeFrom || playtimeTo !== Infinity) {
    filtered = filtered.filter(g => (typeof g.playtime === 'number') && g.playtime >= playtimeFrom && g.playtime <= playtimeTo);
  }

// Sorting order
  if (sortValue === 'title') filtered.sort((a,b) => a.title.localeCompare(b.title));
  else if (sortValue === 'playtime') filtered.sort((a,b) => (b.playtime||0) - (a.playtime||0));
  else if (sortValue === 'rating') filtered.sort((a,b) => (b.rating||0) - (a.rating||0));

// Final display of filtered games
  displayGames(filtered);
}

