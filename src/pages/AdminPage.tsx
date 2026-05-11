import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMovies, createMovie, updateMovie, deleteMovie,
  getActors, createActor, updateActor, deleteActor,
  getDirectors, createDirector, updateDirector, deleteDirector,
  getGenres, createGenre, updateGenre, deleteGenre,
  getAllUsers, deleteUser, changeUserRole,
  addActorToMovie, removeActorFromMovie, addGenreToMovie, removeGenreFromMovie,
  getMovieActors, getMovieGenres,
  downloadSummaryReport, downloadMoviesByGenreReport, downloadMoviesByDirectorReport,
} from '../api';
import type { Movie, Actor, Director, Genre, User, MovieDTO, MovieActor, MovieGenre } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageUpload from '../components/ImageUpload';

type Tab = 'movies' | 'actors' | 'directors' | 'genres' | 'users' | 'reports';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg my-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Movies Tab ────────────────────────────────────────────────────────────────
function MoviesTab() {
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCast, setShowCast] = useState<Movie | null>(null);
  const [castActors, setCastActors] = useState<MovieActor[]>([]);
  const [castGenres, setCastGenres] = useState<MovieGenre[]>([]);
  const [form, setForm] = useState<MovieDTO>({ title: '', description: '', releaseYear: undefined, posterUrl: '', durationMinutes: undefined, language: '', directorId: undefined });
  const [actorForm, setActorForm] = useState({ actorId: '', characterName: '' });
  const [genreForm, setGenreForm] = useState('');

  const load = () => {
    getMovies().then(r => setMovies(r.data));
    getDirectors().then(r => setDirectors(r.data));
    getActors().then(r => setActors(r.data));
    getGenres().then(r => setGenres(r.data));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', releaseYear: undefined, posterUrl: '', durationMinutes: undefined, language: '', directorId: undefined });
    setShowForm(true);
  };

  const openEdit = (m: Movie) => {
    setEditing(m);
    setForm({
      title: m.title, description: m.description || '', releaseYear: m.releaseYear,
      posterUrl: m.posterUrl || '', durationMinutes: m.durationMinutes,
      language: m.language || '', directorId: m.director?.id,
    });
    setShowForm(true);
  };

  const openCast = async (m: Movie) => {
    setShowCast(m);
    const [a, g] = await Promise.all([getMovieActors(m.id), getMovieGenres(m.id)]);
    setCastActors(a.data);
    setCastGenres(g.data);
    setActorForm({ actorId: '', characterName: '' });
    setGenreForm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MovieDTO = {
      title: form.title,
      description: form.description || undefined,
      releaseYear: form.releaseYear || undefined,
      posterUrl: form.posterUrl || undefined,
      durationMinutes: form.durationMinutes || undefined,
      language: form.language || undefined,
      directorId: form.directorId || undefined,
    };
    try {
      if (editing) await updateMovie(editing.id, payload);
      else await createMovie(payload);
      setShowForm(false);
      load();
    } catch { showToast('Failed to save movie.', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this movie?')) return;
    try { await deleteMovie(id); load(); } catch { showToast('Failed to delete.', 'error'); }
  };

  const handleAddActor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCast || !actorForm.actorId) return;
    try {
      await addActorToMovie(showCast.id, { actorId: Number(actorForm.actorId), characterName: actorForm.characterName || undefined });
      const res = await getMovieActors(showCast.id);
      setCastActors(res.data);
      setActorForm({ actorId: '', characterName: '' });
    } catch { showToast('Failed to add actor.', 'error'); }
  };

  const handleRemoveActor = async (actorId: number) => {
    if (!showCast) return;
    try {
      await removeActorFromMovie(showCast.id, actorId);
      setCastActors(prev => prev.filter(a => a.id.actorId !== actorId));
    } catch { showToast('Failed to remove actor.', 'error'); }
  };

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCast || !genreForm) return;
    try {
      await addGenreToMovie(showCast.id, Number(genreForm));
      const res = await getMovieGenres(showCast.id);
      setCastGenres(res.data);
      setGenreForm('');
    } catch { showToast('Failed to add genre.', 'error'); }
  };

  const handleRemoveGenre = async (genreId: number) => {
    if (!showCast) return;
    try {
      await removeGenreFromMovie(showCast.id, genreId);
      setCastGenres(prev => prev.filter(g => g.id.genreId !== genreId));
    } catch { showToast('Failed to remove genre.', 'error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-400 text-sm">{movies.length} movies</span>
        <div className="flex gap-2">
          <button onClick={load} className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors">
            Refresh
          </button>
          <button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            + Add Movie
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {movies.map(m => (
          <div key={m.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            {m.posterUrl
              ? <img src={m.posterUrl} alt={m.title} className="w-10 h-14 object-cover rounded" />
              : <div className="w-10 h-14 bg-zinc-800 rounded" />}
            <div className="flex-1 min-w-0">
              <p className="text-zinc-100 text-sm font-medium truncate">{m.title}</p>
              <p className="text-zinc-500 text-xs">{m.releaseYear}{m.director ? ` · ${m.director.name}` : ''}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openCast(m)} className="text-zinc-400 hover:text-zinc-200 text-xs px-3 py-1.5 border border-zinc-700 rounded transition-colors">
                Cast/Genres
              </button>
              <button onClick={() => openEdit(m)} className="text-zinc-400 hover:text-zinc-200 text-xs px-3 py-1.5 border border-zinc-700 rounded transition-colors">
                Edit
              </button>
              <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-400 text-xs px-3 py-1.5 border border-red-900 rounded transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Movie Form Modal */}
      {showForm && (
        <Modal title={editing ? 'Edit Movie' : 'Add Movie'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Release Year</label>
                <input type="number" value={form.releaseYear || ''} onChange={e => setForm(f => ({ ...f, releaseYear: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="e.g. 2023" min="1900" max="2099"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Duration (min)</label>
                <input type="number" value={form.durationMinutes || ''} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Language</label>
                <input value={form.language || ''} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                  placeholder="e.g. English"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Director</label>
                <select value={form.directorId || ''} onChange={e => setForm(f => ({ ...f, directorId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600">
                  <option value="">None</option>
                  {directors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600 resize-none" />
            </div>
            <ImageUpload label="Poster" value={form.posterUrl} onChange={url => setForm(f => ({ ...f, posterUrl: url }))} />
            <div className="flex gap-3 pt-1">
              <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-700 text-zinc-400 hover:text-zinc-200 py-2 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cast/Genres Modal */}
      {showCast && (
        <Modal title={`${showCast.title} — Cast & Genres`} onClose={() => setShowCast(null)}>
          <div className="space-y-6">
            {/* Actors */}
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Cast</h4>
              <div className="space-y-2 mb-3">
                {castActors.map(ma => (
                  <div key={ma.id.actorId} className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-zinc-200 text-sm">{ma.actor.name}</span>
                      {ma.characterName && <span className="text-zinc-500 text-xs ml-2">as {ma.characterName}</span>}
                    </div>
                    <button onClick={() => handleRemoveActor(ma.id.actorId)} className="text-red-500 hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddActor} className="flex gap-2">
                <select value={actorForm.actorId} onChange={e => setActorForm(f => ({ ...f, actorId: e.target.value }))} required
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-red-600">
                  <option value="">Select actor</option>
                  {actors.filter(a => !castActors.some(ca => ca.id.actorId === a.id)).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <input value={actorForm.characterName} onChange={e => setActorForm(f => ({ ...f, characterName: e.target.value }))}
                  placeholder="Character name"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-red-600" />
                <button type="submit" className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm px-3 py-1.5 rounded-lg transition-colors">Add</button>
              </form>
            </div>

            {/* Genres */}
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Genres</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {castGenres.map(mg => (
                  <span key={mg.id.genreId} className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full border border-zinc-700">
                    {mg.genre.name}
                    <button onClick={() => handleRemoveGenre(mg.id.genreId)} className="text-zinc-500 hover:text-red-400">✕</button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddGenre} className="flex gap-2">
                <select value={genreForm} onChange={e => setGenreForm(e.target.value)} required
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-red-600">
                  <option value="">Select genre</option>
                  {genres.filter(g => !castGenres.some(cg => cg.id.genreId === g.id)).map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button type="submit" className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm px-3 py-1.5 rounded-lg transition-colors">Add</button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Actors Tab ────────────────────────────────────────────────────────────────
type PersonResponse<T> = { data: T[] };
type PersonItemResponse<T> = { data: T };

function PersonTab<T extends { id: number; name: string; pictureUrl?: string }>({
  label,
  fetchAll,
  create,
  update,
  remove,
}: {
  label: string;
  fetchAll: () => Promise<PersonResponse<T>>;
  create: (d: { name: string; pictureUrl?: string }) => Promise<PersonItemResponse<T>>;
  update: (id: number, d: { name: string; pictureUrl?: string }) => Promise<PersonItemResponse<T>>;
  remove: (id: number) => Promise<unknown>;
}) {
  const { showToast } = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', pictureUrl: '' });

  const load = () => fetchAll().then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', pictureUrl: '' }); setShowForm(true); };
  const openEdit = (item: T) => { setEditing(item); setForm({ name: item.name, pictureUrl: item.pictureUrl || '' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, pictureUrl: form.pictureUrl || undefined };
    try {
      if (editing) await update(editing.id, payload);
      else await create(payload);
      setShowForm(false);
      load();
    } catch { showToast('Failed to save.', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete this ${label.toLowerCase()}?`)) return;
    try { await remove(id); load(); } catch { showToast('Failed to delete.', 'error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-400 text-sm">{items.length} {label.toLowerCase()}s</span>
        <div className="flex gap-2">
          <button onClick={load} className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors">
            Refresh
          </button>
          <button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            + Add {label}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            {item.pictureUrl
              ? <img src={item.pictureUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
              : <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm font-bold">{item.name[0]}</div>}
            <span className="flex-1 text-zinc-100 text-sm">{item.name}</span>
            <button onClick={() => openEdit(item)} className="text-zinc-400 hover:text-zinc-200 text-xs px-3 py-1.5 border border-zinc-700 rounded transition-colors">Edit</button>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 text-xs px-3 py-1.5 border border-red-900 rounded transition-colors">Delete</button>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? `Edit ${label}` : `Add ${label}`} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600" />
            </div>
            <ImageUpload label="Photo" value={form.pictureUrl} onChange={url => setForm(f => ({ ...f, pictureUrl: url }))} />
            <div className="flex gap-3 pt-1">
              <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-700 text-zinc-400 hover:text-zinc-200 py-2 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Genres Tab ────────────────────────────────────────────────────────────────
function GenresTab() {
  const { showToast } = useToast();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Genre | null>(null);
  const [name, setName] = useState('');

  const load = () => getGenres().then(r => setGenres(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setName(''); setShowForm(true); };
  const openEdit = (g: Genre) => { setEditing(g); setName(g.name); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await updateGenre(editing.id, { name });
      else await createGenre({ name });
      setShowForm(false);
      load();
    } catch { showToast('Failed to save genre.', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this genre?')) return;
    try { await deleteGenre(id); load(); } catch { showToast('Failed to delete.', 'error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-400 text-sm">{genres.length} genres</span>
        <div className="flex gap-2">
          <button onClick={load} className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors">
            Refresh
          </button>
          <button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            + Add Genre
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {genres.map(g => (
          <div key={g.id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
            <span className="text-zinc-100 text-sm">{g.name}</span>
            <button onClick={() => openEdit(g)} className="text-zinc-500 hover:text-zinc-300 text-xs">Edit</button>
            <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:text-red-400 text-xs">✕</button>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Genre' : 'Add Genre'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-700 text-zinc-400 hover:text-zinc-200 py-2 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);

  const load = () => getAllUsers().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try { await deleteUser(id); load(); } catch { showToast('Failed to delete.', 'error'); }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try { await changeUserRole(id, role); load(); } catch { showToast('Failed to change role.', 'error'); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-400 text-sm">{users.length} users</span>
        <button onClick={load} className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors">
          Refresh
        </button>
      </div>
      <div className="space-y-2">
      {users.map(u => (
        <div key={u.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
          {u.profilePictureUrl
            ? <img src={u.profilePictureUrl} alt={u.username} className="w-9 h-9 rounded-full object-cover" />
            : <div className="w-9 h-9 rounded-full bg-red-800 flex items-center justify-center text-white text-sm font-bold">{u.username[0].toUpperCase()}</div>}
          <div className="flex-1 min-w-0">
            <p className="text-zinc-100 text-sm font-medium">{u.username}</p>
            <p className="text-zinc-500 text-xs truncate">{u.email}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded border ${u.role === 'ADMIN' ? 'text-red-400 border-red-800 bg-red-900/30' : 'text-zinc-400 border-zinc-700 bg-zinc-800'}`}>
            {u.role}
          </span>
          {currentUser && u.id !== currentUser.id && (
            <>
              <button
                onClick={() => handleRoleChange(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                className="text-zinc-400 hover:text-zinc-200 text-xs px-3 py-1.5 border border-zinc-700 rounded transition-colors"
              >
                {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
              </button>
              <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-400 text-xs px-3 py-1.5 border border-red-900 rounded transition-colors">
                Delete
              </button>
            </>
          )}
        </div>
      ))}
      </div>
    </>
  );
}

// ─── Reports Tab ───────────────────────────────────────────────────────────────
function ReportsTab() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (
    key: string,
    filename: string,
    fetcher: () => Promise<{ data: Blob }>,
  ) => {
    setLoading(key);
    try {
      const res = await fetcher();
      triggerDownload(res.data, filename);
    } catch {
      showToast('Failed to generate report.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const reports: {
    key: string;
    title: string;
    description: string;
    filename: string;
    fetcher: () => Promise<{ data: Blob }>;
  }[] = [
    {
      key: 'summary',
      title: 'Platform Summary',
      description: 'Total counts of movies, users, and reviews.',
      filename: 'summary_report.pdf',
      fetcher: downloadSummaryReport,
    },
    {
      key: 'genre',
      title: 'Movies by Genre',
      description: 'All movies grouped by genre, with per-genre totals.',
      filename: 'movies_by_genre.pdf',
      fetcher: downloadMoviesByGenreReport,
    },
    {
      key: 'director',
      title: 'Movies by Director',
      description: 'All movies grouped by director, with per-director totals.',
      filename: 'movies_by_director.pdf',
      fetcher: downloadMoviesByDirectorReport,
    },
  ];

  return (
    <div>
      <p className="text-zinc-400 text-sm mb-6">Download platform reports as PDF.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map(r => (
          <div key={r.key} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col">
            <h3 className="text-zinc-100 text-base font-semibold mb-1">{r.title}</h3>
            <p className="text-zinc-500 text-xs mb-5 flex-1">{r.description}</p>
            <button
              onClick={() => handleDownload(r.key, r.filename, r.fetcher)}
              disabled={loading === r.key}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {loading === r.key ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('movies');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') navigate('/');
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'movies', label: 'Movies' },
    { key: 'actors', label: 'Actors' },
    { key: 'directors', label: 'Directors' },
    { key: 'genres', label: 'Genres' },
    { key: 'users', label: 'Users' },
    { key: 'reports', label: 'Reports' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-100 mb-8">Admin Panel</h1>

      {/* Tab Nav */}
      <div className="flex border-b border-zinc-800 mb-8">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key
                ? 'border-red-600 text-red-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'movies' && <MoviesTab />}
      {tab === 'actors' && (
        <PersonTab<Actor>
          label="Actor"
          fetchAll={getActors}
          create={createActor}
          update={updateActor}
          remove={deleteActor}
        />
      )}
      {tab === 'directors' && (
        <PersonTab<Director>
          label="Director"
          fetchAll={getDirectors}
          create={createDirector}
          update={updateDirector}
          remove={deleteDirector}
        />
      )}
      {tab === 'genres' && <GenresTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  );
}
