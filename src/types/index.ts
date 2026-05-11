export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  profilePictureUrl?: string;
}

export interface Director {
  id: number;
  name: string;
  pictureUrl?: string;
}

export interface Actor {
  id: number;
  name: string;
  pictureUrl?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  description?: string;
  releaseYear?: number;
  posterUrl?: string;
  durationMinutes?: number;
  language?: string;
  director?: Director;
  avgScore?: number;
  avgStory?: number;
  avgScare?: number;
  avgGore?: number;
  reviewCount?: number;
}

export interface MovieActor {
  id: { movieId: number; actorId: number };
  actor: Actor;
  characterName?: string;
}

export interface MovieGenre {
  id: { movieId: number; genreId: number };
  genre: Genre;
}

export interface Rating {
  id: number;
  userId: number;
  username: string;
  userProfilePictureUrl?: string;
  movieId: number;
  movieTitle: string;
  moviePosterUrl?: string;
  storyScore: number;
  scareScore: number;
  goreScore: number;
  reviewText?: string;
}

export interface Watchlist {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePosterUrl?: string;
  releaseYear?: number;
}

export interface MovieDTO {
  title: string;
  description?: string;
  releaseYear?: number;
  posterUrl?: string;
  durationMinutes?: number;
  language?: string;
  directorId?: number;
}

export interface RatingDTO {
  storyScore: number;
  scareScore: number;
  goreScore: number;
  reviewText?: string;
}

export interface ActorDTO {
  name: string;
  pictureUrl?: string;
}

export interface DirectorDTO {
  name: string;
  pictureUrl?: string;
}

export interface GenreDTO {
  name: string;
}

export interface UserRegisterDTO {
  username: string;
  email: string;
  password: string;
  profilePictureUrl?: string;
}

export interface UserLoginDTO {
  username: string;
  password: string;
}

export interface UserUpdateDTO {
  username?: string;
  email?: string;
  password?: string;
  profilePictureUrl?: string;
}

export interface MovieActorDTO {
  actorId: number;
  characterName?: string;
}
