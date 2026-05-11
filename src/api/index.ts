import axios, { type AxiosRequestConfig } from 'axios';
import type {
  MovieDTO, RatingDTO, ActorDTO, DirectorDTO, GenreDTO,
  UserRegisterDTO, UserLoginDTO, UserUpdateDTO, MovieActorDTO
} from '../types';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
//Cita JWT i stavi Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(err);
  }
);

type Cfg = AxiosRequestConfig | undefined;

// Movies
export const getMovies = (cfg?: Cfg) => api.get('/movies', cfg);
export const getMovie = (id: number, cfg?: Cfg) => api.get(`/movies/${id}`, cfg);
export const searchMovies = (params: { title?: string; year?: number; directorId?: number; genreId?: number }, cfg?: Cfg) =>
  api.get('/movies/search', { ...cfg, params });
export const getMovieActors = (id: number, cfg?: Cfg) => api.get(`/movies/${id}/actors`, cfg);
export const getMovieGenres = (id: number, cfg?: Cfg) => api.get(`/movies/${id}/genres`, cfg);
export const createMovie = (data: MovieDTO) => api.post('/movies', data);
export const updateMovie = (id: number, data: MovieDTO) => api.put(`/movies/${id}`, data);
export const deleteMovie = (id: number) => api.delete(`/movies/${id}`);
export const addActorToMovie = (movieId: number, data: MovieActorDTO) =>
  api.post(`/movies/${movieId}/actors`, data);
export const removeActorFromMovie = (movieId: number, actorId: number) =>
  api.delete(`/movies/${movieId}/actors/${actorId}`);
export const addGenreToMovie = (movieId: number, genreId: number) =>
  api.post(`/movies/${movieId}/genres/${genreId}`);
export const removeGenreFromMovie = (movieId: number, genreId: number) =>
  api.delete(`/movies/${movieId}/genres/${genreId}`);

// Users
export const register = (data: UserRegisterDTO) => api.post('/users/register', data);
export const login = (data: UserLoginDTO) => api.post('/users/login', data);
export const getUser = (id: number, cfg?: Cfg) => api.get(`/users/${id}`, cfg);
export const updateUser = (id: number, data: UserUpdateDTO) => api.put(`/users/${id}`, data);
export const getAllUsers = (cfg?: Cfg) => api.get('/users', cfg);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);
export const changeUserRole = (id: number, role: string) =>
  api.patch(`/users/${id}/role`, { role });

// Ratings
export const getMovieRatings = (movieId: number, cfg?: Cfg) => api.get(`/movies/${movieId}/ratings`, cfg);
export const getUserRatings = (userId: number, cfg?: Cfg) => api.get(`/users/${userId}/ratings`, cfg);
export const createRating = (movieId: number, data: RatingDTO) =>
  api.post(`/movies/${movieId}/ratings`, data);
export const updateRating = (id: number, data: RatingDTO) => api.put(`/ratings/${id}`, data);
export const deleteRating = (id: number) => api.delete(`/ratings/${id}`);

// Watchlist
export const getWatchlist = (cfg?: Cfg) => api.get('/watchlist', cfg);
export const addToWatchlist = (movieId: number) => api.post(`/watchlist/${movieId}`);
export const removeFromWatchlist = (movieId: number) => api.delete(`/watchlist/${movieId}`);

// Actors
export const getActors = (name?: string, cfg?: Cfg) =>
  api.get('/actors', { ...cfg, params: name ? { name } : {} });
export const getActor = (id: number, cfg?: Cfg) => api.get(`/actors/${id}`, cfg);
export const getActorMovies = (id: number, cfg?: Cfg) => api.get(`/actors/${id}/movies`, cfg);
export const createActor = (data: ActorDTO) => api.post('/actors', data);
export const updateActor = (id: number, data: ActorDTO) => api.put(`/actors/${id}`, data);
export const deleteActor = (id: number) => api.delete(`/actors/${id}`);

// Directors
export const getDirectors = (name?: string, cfg?: Cfg) =>
  api.get('/directors', { ...cfg, params: name ? { name } : {} });
export const getDirector = (id: number, cfg?: Cfg) => api.get(`/directors/${id}`, cfg);
export const getDirectorMovies = (id: number, cfg?: Cfg) => api.get(`/directors/${id}/movies`, cfg);
export const createDirector = (data: DirectorDTO) => api.post('/directors', data);
export const updateDirector = (id: number, data: DirectorDTO) =>
  api.put(`/directors/${id}`, data);
export const deleteDirector = (id: number) => api.delete(`/directors/${id}`);

// Genres
export const getGenres = (cfg?: Cfg) => api.get('/genres', cfg);
export const createGenre = (data: GenreDTO) => api.post('/genres', data);
export const updateGenre = (id: number, data: GenreDTO) => api.put(`/genres/${id}`, data);
export const deleteGenre = (id: number) => api.delete(`/genres/${id}`);

// Reports (admin only) — returns PDF blob
export const downloadSummaryReport = () =>
  api.get('/reports/summary', { responseType: 'blob' });
export const downloadMoviesByGenreReport = () =>
  api.get('/reports/movies-by-genre', { responseType: 'blob' });
export const downloadMoviesByDirectorReport = () =>
  api.get('/reports/movies-by-director', { responseType: 'blob' });

// Upload
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
