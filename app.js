// MovieLand API Logic

// API configuration
const API_URL = 'https://www.omdbapi.com/?apikey=b6003d8a';

// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const moviesContainer = document.getElementById('movies-container');

// Fetch movies from OMDb API
async function searchMovies(title) {
  const status = document.getElementById('search-status');
  if (status) status.style.display = 'flex';
  
  try {
    const response = await fetch(`${API_URL}&s=${encodeURIComponent(title)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.Response === 'True') {
      renderMovies(data.Search);
    } else {
      renderEmptyState(data.Error || "No movies found");
    }
  } catch (error) {
    console.error('Error fetching data from OMDb:', error);
    renderEmptyState(`Network Error: ${error.message || 'Failed to fetch data'}`);
  }
}

// Render movies to container
function renderMovies(movies) {
  moviesContainer.innerHTML = '';
  
  movies.forEach(movie => {
    // Create movie card
    const movieDiv = document.createElement('div');
    movieDiv.className = 'movie';
    movieDiv.style.cursor = 'pointer'; // Visual indicator that it's clickable
    
    movieDiv.addEventListener('click', () => {
      openMovieDetails(movie.imdbID);
    });

    // Year overlay (div 1)
    const yearDiv = document.createElement('div');
    const yearPara = document.createElement('p');
    yearPara.textContent = movie.Year;
    yearDiv.appendChild(yearPara);

    // Poster image (div 2)
    const posterDiv = document.createElement('div');
    const posterImg = document.createElement('img');
    posterImg.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400';
    posterImg.alt = movie.Title;
    posterDiv.appendChild(posterImg);

    // Meta details (div 3)
    const detailDiv = document.createElement('div');
    const typeSpan = document.createElement('span');
    typeSpan.textContent = `${movie.Type} • ${movie.Year}`;
    const titleH3 = document.createElement('h3');
    titleH3.textContent = movie.Title;
    detailDiv.appendChild(typeSpan);
    detailDiv.appendChild(titleH3);

    // Assemble components
    movieDiv.appendChild(yearDiv);
    movieDiv.appendChild(posterDiv);
    movieDiv.appendChild(detailDiv);

    moviesContainer.appendChild(movieDiv);
  });
}

// Render empty state
function renderEmptyState(errorMsg = "No movies found") {
  moviesContainer.innerHTML = `
    <div class="empty">
      <h2>${errorMsg}</h2>
    </div>
  `;
}

// Details Modal Logic
// Fetch elements safely (handles cached index.html without throwing errors)
const detailsModal = document.getElementById('details-modal');
const closeModalBtn = document.getElementById('close-modal');

// Close details modal
if (closeModalBtn && detailsModal) {
  closeModalBtn.addEventListener('click', () => {
    detailsModal.classList.remove('active');
  });
}

// Close details modal when clicking outside content box
window.addEventListener('click', (e) => {
  const modal = document.getElementById('details-modal');
  if (modal && e.target === modal) {
    modal.classList.remove('active');
  }
});

// Fetch detailed metadata from OMDb by IMDb ID
async function openMovieDetails(imdbID) {
  const modal = document.getElementById('details-modal');
  const modalBody = document.getElementById('modal-details-body');
  
  if (!modal || !modalBody) {
    console.warn("Modal elements not found. Please clear browser cache and refresh.");
    alert("Please perform a hard refresh (Ctrl + F5 or Cmd + Shift + R) to load the new card details overlay.");
    return;
  }
  
  // Show spinner
  modalBody.innerHTML = `
    <div class="spinner-wrapper">
      <div class="spinner"></div>
      <p>Loading cinema specifications...</p>
    </div>
  `;
  
  modal.classList.add('active');
  
  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=b6003d8a&i=${imdbID}&plot=full`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const movie = await response.json();
    
    if (movie.Response === 'True') {
      renderMovieDetails(movie);
    } else {
      modalBody.innerHTML = `
        <div class="spinner-wrapper">
          <h2>Error: ${movie.Error || 'Could not fetch details'}</h2>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    modalBody.innerHTML = `
      <div class="spinner-wrapper">
        <h2>Network Error</h2>
        <p>${error.message || 'Failed to connect to movie database'}</p>
      </div>
    `;
  }
}

// Render detailed info inside modal body
function renderMovieDetails(movie) {
  const modalBody = document.getElementById('modal-details-body');
  
  const posterSrc = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400';
  const ratingVal = movie.imdbRating !== 'N/A' ? `★ ${movie.imdbRating}/10` : 'No rating';
  
  modalBody.innerHTML = `
    <div class="modal-details-container">
      <div class="modal-poster-wrapper">
        <img class="modal-poster" src="${posterSrc}" alt="${movie.Title}">
      </div>
      <div class="modal-info">
        <h2>${movie.Title}</h2>
        <div class="modal-meta">
          <span class="modal-tag">${movie.Type}</span>
          <span>•</span>
          <span>${movie.Released}</span>
          <span>•</span>
          <span>${movie.Runtime}</span>
          <span>•</span>
          <span class="modal-rating-badge">${ratingVal}</span>
        </div>
        
        <p class="modal-plot">${movie.Plot !== 'N/A' ? movie.Plot : 'No description plot detail available.'}</p>
        
        <div class="modal-metadata">
          <p><strong>Genre</strong> ${movie.Genre}</p>
          <p><strong>Director</strong> ${movie.Director}</p>
          <p><strong>Writers</strong> ${movie.Writer}</p>
          <p><strong>Actors</strong> ${movie.Actors}</p>
          <p><strong>Language</strong> ${movie.Language}</p>
          <p><strong>Awards</strong> ${movie.Awards !== 'N/A' ? movie.Awards : 'None'}</p>
        </div>
        
        <div>
          <button class="back-modal-btn" id="back-modal-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top:-2px"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Movies
          </button>
        </div>
      </div>
    </div>
  `;

  // Bind close action to back button
  document.getElementById('back-modal-btn').addEventListener('click', () => {
    const modal = document.getElementById('details-modal');
    if (modal) modal.classList.remove('active');
  });
}

// Predefined list of featured blockbuster movies (English)
const FEATURED_MOVIE_IDS = [
  'tt14381048', // Deadpool & Wolverine (2024)
  'tt15398776', // Oppenheimer (2023)
  'tt9362722',  // Spider-Man: Across the Spider-Verse (2023)
  'tt1517268',  // Barbie (2023)
  'tt6791350',  // Guardians of the Galaxy Vol. 3 (2023)
  'tt12037194', // Furiosa: A Mad Max Saga (2024)
  'tt1877830',  // The Batman (2022)
  'tt1630029'   // Avatar: The Way of Water (2022)
];

// Fetch and display featured English movies
async function loadFeaturedMovies() {
  const status = document.getElementById('search-status');
  if (status) status.style.display = 'none';
  if (searchInput) searchInput.value = '';

  moviesContainer.innerHTML = `
    <div class="empty">
      <h2>Loading featured cinemas...</h2>
    </div>
  `;
  
  try {
    const promises = FEATURED_MOVIE_IDS.map(async (id) => {
      const response = await fetch(`https://www.omdbapi.com/?apikey=b6003d8a&i=${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error fetching ${id}`);
      }
      return response.json();
    });
    
    const movies = await Promise.all(promises);
    const validMovies = movies.filter(m => m.Response === 'True');
    
    if (validMovies.length > 0) {
      renderMovies(validMovies);
    } else {
      renderEmptyState("Failed to load featured movies");
    }
  } catch (error) {
    console.error('Error loading featured movies:', error);
    renderEmptyState(`Network Error: ${error.message || 'Failed to load featured movies'}`);
  }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    searchMovies(query);
  } else {
    loadFeaturedMovies();
  }
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    } else {
      loadFeaturedMovies();
    }
  }
});

// Load default movie set on start and bind back button
window.addEventListener('DOMContentLoaded', () => {
  loadFeaturedMovies();
  
  const backHomeBtn = document.getElementById('back-home-btn');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
      loadFeaturedMovies();
    });
  }
});
