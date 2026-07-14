// src/App.jsx
import { useState } from 'react';
import './App.css';

const API_KEY = '23f6f755'; // Remember to use your key!
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state to hold the specific movie we want to see details for
  const [selectedMovie, setSelectedMovie] = useState(null);

  // 1. Fetch the list of movies
  const searchMovies = async (title) => {
    if (!title.trim()) return;
    
    setLoading(true);
    setError(null);
    setMovies([]);
    setSelectedMovie(null); // Clear any selected movie when searching again

    try {
      const response = await fetch(`${API_URL}&s=${encodeURIComponent(title)}`);
      const data = await response.json();

      if (data.Response === 'True') {
        setMovies(data.Search);
      } else {
        setError(data.Error);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch the detailed info for a single movie using its ID
  const fetchMovieDetails = async (id) => {
    setLoading(true);
    setError(null);

    try {
      // The &i= parameter fetches by ID, and &plot=full gives us the long summary
      const response = await fetch(`${API_URL}&i=${id}&plot=full`);
      const data = await response.json();

      if (data.Response === 'True') {
        setSelectedMovie(data);
      } else {
        setError(data.Error);
      }
    } catch (err) {
      console.error("Error fetching details:", err);
      setError("Could not load movie details.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchMovies(searchTerm);
    }
  };

  return (
    <div className="app">
      <h1>Movie Library Search</h1>
      
      <div className="search">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => searchMovies(searchTerm)}>Search</button>
      </div>

      {loading && <p className="status-message">Loading...</p>}
      {error && <p className="status-message error">{error}</p>}

      {/* Conditionally render either the Details View OR the Search Results Grid */}
      {selectedMovie ? (
        
        /* --- MOVIE DETAILS VIEW --- */
        <div className="movie-details-container">
          <button className="back-btn" onClick={() => setSelectedMovie(null)}>
            &larr; Back to Results
          </button>
          
          <div className="movie-details">
            <img 
              src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
              alt={selectedMovie.Title} 
            />
            <div className="details-text">
              <h2>{selectedMovie.Title} <span>({selectedMovie.Year})</span></h2>
              <p className="genre"><strong>Genre:</strong> {selectedMovie.Genre}</p>
              <p><strong>IMDb Rating:</strong> ⭐ {selectedMovie.imdbRating}</p>
              <p><strong>Director:</strong> {selectedMovie.Director}</p>
              <p><strong>Cast:</strong> {selectedMovie.Actors}</p>
              <p><strong>Runtime:</strong> {selectedMovie.Runtime}</p>
              <hr />
              <h3>Plot Summary</h3>
              <p className="plot">{selectedMovie.Plot}</p>
            </div>
          </div>
        </div>

      ) : (

        /* --- SEARCH RESULTS GRID --- */
        movies?.length > 0 && (
          <div className="container">
            {movies.map((movie) => (
              // Added onClick to the card to trigger fetchMovieDetails
              <div 
                className="movie" 
                key={movie.imdbID} 
                onClick={() => fetchMovieDetails(movie.imdbID)}
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                  alt={`${movie.Title} Poster`} 
                />
                <div className="movie-info">
                  <span>{movie.Type}</span>
                  <h3>{movie.Title}</h3>
                  <p>{movie.Year}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default App;