import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [songSearchTerm, setSongSearchTerm] = useState('');
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: ''
  });
  const [editPlaylist, setEditPlaylist] = useState({
    id: null,
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchPlaylists();
    fetchAllSongs();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/profile');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/playlists');
      setPlaylists(response.data);
    } catch (error) {
      console.error('Error al cargar playlists:', error);
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        alert('Error al cargar las playlists: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSongs = async () => {
    try {
      const response = await api.get('/songs');
      setAllSongs(response.data);
    } catch (error) {
      console.error('Error al cargar canciones:', error);
    }
  };

  const fetchPlaylistDetails = async (playlistId) => {
    try {
      const response = await api.get(`/playlists/${playlistId}`);
      setPlaylistSongs(response.data.songs || []);
    } catch (error) {
      console.error('Error al cargar detalles de playlist:', error);
      setPlaylistSongs([]);
    }
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    fetchPlaylistDetails(playlist.id);
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      await api.post('/playlists/create', newPlaylist);
      alert('¡Playlist creada exitosamente!');
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '' });
      fetchPlaylists();
    } catch (error) {
      console.error('Error al crear playlist:', error);
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
        alert('Error al crear la playlist: ' + errorMsg);
      }
    }
  };

  const handleEditPlaylist = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/playlists/${editPlaylist.id}`, {
        name: editPlaylist.name,
        description: editPlaylist.description
      });
      alert('¡Playlist actualizada exitosamente!');
      setShowEditModal(false);
      setEditPlaylist({ id: null, name: '', description: '' });
      fetchPlaylists();
      if (selectedPlaylist?.id === editPlaylist.id) {
        setSelectedPlaylist({ ...selectedPlaylist, name: editPlaylist.name, description: editPlaylist.description });
      }
    } catch (error) {
      console.error('Error al editar playlist:', error);
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
        alert('Error al editar la playlist: ' + errorMsg);
      }
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta playlist?')) {
      return;
    }
    try {
      await api.delete(`/playlists/${playlistId}`);
      alert('Playlist eliminada exitosamente');
      fetchPlaylists();
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
        setPlaylistSongs([]);
      }
    } catch (error) {
      console.error('Error al eliminar playlist:', error);
      alert('Error al eliminar la playlist: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddSong = async (songId) => {
    try {
      await api.post(`/playlists/${selectedPlaylist.id}/songs`, { song_id: songId });
      alert('¡Canción añadida a la playlist!');
      fetchPlaylistDetails(selectedPlaylist.id);
      fetchPlaylists(); // Actualizar el contador
    } catch (error) {
      console.error('Error al añadir canción:', error);
      if (error.response?.status === 409) {
        alert('Esta canción ya está en la playlist');
      } else {
        alert('Error al añadir la canción: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleRemoveSong = async (songId) => {
    if (!confirm('¿Quieres quitar esta canción de la playlist?')) {
      return;
    }
    try {
      await api.delete(`/playlists/${selectedPlaylist.id}/songs`, { data: { song_id: songId } });
      alert('Canción eliminada de la playlist');
      fetchPlaylistDetails(selectedPlaylist.id);
      fetchPlaylists(); // Actualizar el contador
    } catch (error) {
      console.error('Error al eliminar canción:', error);
      alert('Error al eliminar la canción: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = (playlist) => {
    setEditPlaylist({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || ''
    });
    setShowEditModal(true);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Verificar si el usuario actual es el creador de la playlist
  const isPlaylistOwner = (playlist) => {
    return currentUser && playlist && playlist.user_id === currentUser.id;
  };

  const getTotalDuration = () => {
    const total = playlistSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSongs = allSongs.filter(song =>
    song.title.toLowerCase().includes(songSearchTerm.toLowerCase()) ||
    song.artist?.name.toLowerCase().includes(songSearchTerm.toLowerCase())
  );

  // Filtrar canciones que ya no están en la playlist
  const availableSongs = filteredSongs.filter(song =>
    !playlistSongs.some(ps => ps.id === song.id)
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '18px', color: '#2d5016' }}>Cargando playlists...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ color: '#2d5016', margin: 0, fontSize: '32px', marginBottom: '5px' }}>
            🎵 Playlists Públicas
          </h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Todas las playlists son visibles para todos los usuarios
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2d5016',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1f3a0f';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#2d5016';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
        >
          ➕ Crear Nueva Playlist
        </button>
      </div>

      {/* Layout de 2 columnas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedPlaylist ? '1fr 1.5fr' : '1fr',
        gap: '25px'
      }}>
        {/* Columna izquierda - Lista de playlists */}
        <div>
          {/* Buscador */}
          <input
            type="text"
            placeholder="🔍 Buscar playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '20px',
              border: '2px solid #9cb88d',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2d5016'}
            onBlur={(e) => e.target.style.borderColor = '#9cb88d'}
          />

          {/* Lista de playlists */}
          {filteredPlaylists.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <p style={{ color: '#666', fontSize: '16px' }}>
                {searchTerm ? 'No se encontraron playlists' : 'No tienes playlists aún'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Crear tu primera playlist
                </button>
              )}
            </div>
          ) : (
            <>
              <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
                {filteredPlaylists.length} Playlist{filteredPlaylists.length !== 1 ? 's' : ''}
              </p>
              <div style={{
                display: 'grid',
                gap: '10px',
                maxHeight: '75vh',
                overflowY: 'auto',
                paddingRight: '8px'
              }}>
                {filteredPlaylists.map(playlist => (
                  <div
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist)}
                    style={{
                      padding: '15px',
                      backgroundColor: selectedPlaylist?.id === playlist.id ? '#d4edda' : 'white',
                      border: selectedPlaylist?.id === playlist.id ? '3px solid #2d5016' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPlaylist?.id !== playlist.id) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPlaylist?.id !== playlist.id) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#2d5016',
                      marginBottom: '5px'
                    }}>
                      {playlist.name}
                    </div>
                    {playlist.description && (
                      <div style={{
                        fontSize: '13px',
                        color: '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        marginBottom: '8px'
                      }}>
                        {playlist.description}
                      </div>
                    )}
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      🎵 {playlist.songs_count || 0} canción{playlist.songs_count !== 1 ? 'es' : ''}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      👤 {playlist.user?.name || 'Usuario desconocido'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Columna derecha - Detalles de playlist */}
        {selectedPlaylist && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            maxHeight: '75vh',
            overflowY: 'auto'
          }}>
            {/* Header de la playlist */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ color: '#2d5016', margin: 0, fontSize: '28px' }}>
                    {selectedPlaylist.name}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#999', marginTop: '5px' }}>
                    Creada por: <b>{selectedPlaylist.user?.name || 'Usuario desconocido'}</b>
                  </div>
                </div>
                {isPlaylistOwner(selectedPlaylist) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(selectedPlaylist)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#7d9d6f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#6b8b5e'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#7d9d6f'}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
              
              {selectedPlaylist.description && (
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px', lineHeight: '1.5' }}>
                  {selectedPlaylist.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#999' }}>
                <span>🎵 {playlistSongs.length} canción{playlistSongs.length !== 1 ? 'es' : ''}</span>
                {playlistSongs.length > 0 && <span>⏱️ {getTotalDuration()}</span>}
              </div>
            </div>

            {/* Botón añadir canción - solo para el creador */}
            {isPlaylistOwner(selectedPlaylist) && (
              <button
                onClick={() => setShowAddSongModal(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2d5016',
                  color: 'white',
                  border: '2px dashed white',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1f3a0f';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2d5016';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ➕ Añadir Canciones
              </button>
            )}

            {/* Lista de canciones */}
            {playlistSongs.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px'
              }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Esta playlist está vacía. ¡Añade algunas canciones!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {playlistSongs.map((song, index) => (
                  <div
                    key={song.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ color: '#999', fontSize: '14px', minWidth: '25px' }}>
                        {index + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#2d5016', fontSize: '14px' }}>
                          {song.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {song.artist?.name || 'Artista desconocido'}
                          {song.album && ` • ${song.album}`}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        minWidth: '45px',
                        textAlign: 'right'
                      }}>
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                    {isPlaylistOwner(selectedPlaylist) && (
                      <button
                        onClick={() => handleRemoveSong(song.id)}
                        style={{
                          marginLeft: '10px',
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear playlist */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div style={{ padding: '10px 0' }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: '25px',
              color: 'white',
              fontSize: '26px',
              textAlign: 'center',
              borderBottom: '3px solid white',
              paddingBottom: '15px'
            }}>
              🎵 Nueva Playlist
            </h2>
            <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Nombre de la playlist *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  placeholder="Mi playlist favorita"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #9cb88d',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2d5016'}
                  onBlur={(e) => e.target.style.borderColor = '#9cb88d'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Descripción
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  placeholder="Describe tu playlist..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #9cb88d',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2d5016'}
                  onBlur={(e) => e.target.style.borderColor = '#9cb88d'}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid rgba(255,255,255,0.3)'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylist({ name: '', description: '' });
                  }}
                  style={{
                    padding: '12px 28px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5a6268';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1f3a0f';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2d5016';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  ✓ Crear Playlist
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal para editar playlist */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <div style={{ padding: '10px 0' }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: '25px',
              color: 'white',
              fontSize: '26px',
              textAlign: 'center',
              borderBottom: '3px solid white',
              paddingBottom: '15px'
            }}>
              ✏️ Editar Playlist
            </h2>
            <form onSubmit={handleEditPlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Nombre de la playlist *
                </label>
                <input
                  type="text"
                  required
                  value={editPlaylist.name}
                  onChange={(e) => setEditPlaylist({ ...editPlaylist, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #9cb88d',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2d5016'}
                  onBlur={(e) => e.target.style.borderColor = '#9cb88d'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Descripción
                </label>
                <textarea
                  value={editPlaylist.description}
                  onChange={(e) => setEditPlaylist({ ...editPlaylist, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #9cb88d',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2d5016'}
                  onBlur={(e) => e.target.style.borderColor = '#9cb88d'}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid rgba(255,255,255,0.3)'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditPlaylist({ id: null, name: '', description: '' });
                  }}
                  style={{
                    padding: '12px 28px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5a6268';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1f3a0f';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2d5016';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  ✓ Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal para añadir canciones */}
      {showAddSongModal && (
        <Modal onClose={() => {
          setShowAddSongModal(false);
          setSongSearchTerm('');
        }}>
          <div style={{ padding: '10px 0' }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: '25px',
              color: 'white',
              fontSize: '26px',
              textAlign: 'center',
              borderBottom: '3px solid white',
              paddingBottom: '15px'
            }}>
              ➕ Añadir Canciones
            </h2>

            {/* Buscador de canciones */}
            <input
              type="text"
              placeholder="🔍 Buscar canción o artista..."
              value={songSearchTerm}
              onChange={(e) => setSongSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '20px',
                border: '2px solid #9cb88d',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2d5016'}
              onBlur={(e) => e.target.style.borderColor = '#9cb88d'}
            />

            {/* Lista de canciones disponibles */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'grid',
              gap: '10px'
            }}>
              {availableSongs.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'white'
                }}>
                  {songSearchTerm ? 'No se encontraron canciones' : 'Todas las canciones ya están en la playlist'}
                </div>
              ) : (
                availableSongs.map(song => (
                  <div
                    key={song.id}
                    style={{
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: 'white', fontSize: '14px' }}>
                        {song.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9cb88d' }}>
                        {song.artist?.name || 'Artista desconocido'}
                        {song.album && ` • ${song.album}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddSong(song.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2d5016',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1f3a0f'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#2d5016'}
                    >
                      ➕ Añadir
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '2px solid rgba(255,255,255,0.3)'
            }}>
              <button
                onClick={() => {
                  setShowAddSongModal(false);
                  setSongSearchTerm('');
                }}
                style={{
                  padding: '12px 28px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Playlists;