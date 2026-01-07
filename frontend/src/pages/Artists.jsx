import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateSongModal, setShowCreateSongModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newArtist, setNewArtist] = useState({
    name: '',
    bio: '',
    image: '',
    pais: '',
    genero: '',
    genero_musical: '',
    fecha_de_nacimiento: '',
    discográfica: '',
    youtube: '',
    spotify: '',
    instagram: '',
    other_links: ''
  });
  const [newSong, setNewSong] = useState({
    title: '',
    duration: '',
    album: ''
  });
  const [newAlbumName, setNewAlbumName] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/artists');
      setArtists(response.data);
    } catch (error) {
      console.error('Error al cargar artistas:', error);
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        alert('Error al cargar los artistas: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistSongs = async (artistId) => {
    try {
      const response = await api.get(`/songs?artist_id=${artistId}`);
      setArtistSongs(response.data);
    } catch (error) {
      console.error('Error al cargar canciones:', error);
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        setArtistSongs([]);
      }
    }
  };

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
    fetchArtistSongs(artist.id);
  };

  const handleCreateArtist = async (e) => {
    e.preventDefault();
    try {
      await api.post('/artists', newArtist);
      alert('¡Artista creado exitosamente!');
      setShowCreateModal(false);
      setNewArtist({
        name: '',
        bio: '',
        image: '',
        pais: '',
        genero: '',
        genero_musical: '',
        fecha_de_nacimiento: '',
        discográfica: '',
        youtube: '',
        spotify: '',
        instagram: '',
        other_links: ''
      });
      fetchArtists();
    } catch (error) {
      console.error('Error al crear artista:', error);
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
        alert('Error al crear el artista: ' + errorMsg);
      }
    }
  };

  const handleCreateSong = async (e) => {
    e.preventDefault();
    try {
      // Si el álbum está en modo "__nuevo__", usar el valor de newAlbumName
      const albumValue = newSong.album === '__nuevo__' ? newAlbumName : newSong.album;
      
      await api.post('/songs/create', {
        title: newSong.title,
        artist_id: selectedArtist.id,
        duration: parseInt(newSong.duration),
        album: albumValue || null
      });
      alert('¡Canción creada exitosamente!');
      setShowCreateSongModal(false);
      setNewSong({
        title: '',
        duration: '',
        album: ''
      });
      setNewAlbumName('');
      fetchArtistSongs(selectedArtist.id);
    } catch (error) {
      console.error('Error al crear canción:', error);
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
        alert('Error al crear la canción: ' + errorMsg);
      }
    }
  };

  // Obtener lista única de álbumes del artista
  const getArtistAlbums = () => {
    const albums = [...new Set(artistSongs.map(song => song.album).filter(Boolean))];
    return albums.sort();
  };

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar canciones por álbum
  const groupSongsByAlbum = (songs) => {
    const grouped = {};
    songs.forEach(song => {
      const album = song.album || 'Sin álbum';
      if (!grouped[album]) {
        grouped[album] = [];
      }
      grouped[album].push(song);
    });
    return grouped;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1 style={{ margin: 0, color: '#2d5016', fontSize: '32px' }}>
          🎤 Explorar Artistas
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2d5016',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Crear Nuevo Artista
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div style={{ marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar artistas por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '10px',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#2d5016'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' }}>
          Cargando artistas...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedArtist ? '1fr 1.5fr' : '1fr',
          gap: '25px'
        }}>
          {/* Lista de artistas */}
          <div>
            <h2 style={{ marginTop: 0, color: '#2d5016', fontSize: '20px', marginBottom: '15px' }}>
              {filteredArtists.length} {filteredArtists.length === 1 ? 'Artista' : 'Artistas'}
            </h2>
            {filteredArtists.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                color: '#666'
              }}>
                No se encontraron artistas
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '10px',
                maxHeight: '75vh',
                overflowY: 'auto',
                paddingRight: '8px'
              }}>
                {filteredArtists.map(artist => (
                  <div
                    key={artist.id}
                    onClick={() => handleArtistClick(artist)}
                    style={{
                      padding: '12px 15px',
                      backgroundColor: selectedArtist?.id === artist.id ? '#d4edda' : 'white',
                      border: selectedArtist?.id === artist.id ? '3px solid #2d5016' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minHeight: '70px',
                      maxHeight: '70px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedArtist?.id !== artist.id) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedArtist?.id !== artist.id) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    {artist.image ? (
                      <img
                        src={artist.image}
                        alt={artist.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#2d5016',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {artist.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '15px',
                        color: '#2d5016',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '2px'
                      }}>
                        {artist.name}
                      </div>
                      {artist.bio && (
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.3'
                        }}>
                          {artist.bio}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '18px', flexShrink: 0 }}>▶</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalle del artista seleccionado */}
          {selectedArtist && (
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              maxHeight: '75vh',
              overflowY: 'auto'
            }}>
              {/* Header del artista */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', alignItems: 'flex-start' }}>
                {selectedArtist.image ? (
                  <img
                    src={selectedArtist.image}
                    alt={selectedArtist.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '15px',
                      objectFit: 'cover',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '15px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    {selectedArtist.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 8px 0', color: '#2d5016', fontSize: '28px' }}>
                    {selectedArtist.name}
                  </h2>
                  {selectedArtist.bio && (
                    <p style={{ margin: '0', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                      {selectedArtist.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Canciones agrupadas por álbum */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <h3 style={{ color: '#2d5016', margin: 0, fontSize: '20px' }}>
                    🎵 Canciones ({artistSongs.length})
                  </h3>
                  <button
                    onClick={() => setShowCreateSongModal(true)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2d5016',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#1f3a0f';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#2d5016';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ➕ Nueva Canción
                  </button>
                </div>
                {artistSongs.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '30px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    color: '#666'
                  }}>
                    Este artista aún no tiene canciones registradas
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.entries(groupSongsByAlbum(artistSongs)).map(([album, songs]) => (
                      <div key={album} style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '2px solid #e0e0e0'
                      }}>
                        <h4 style={{
                          margin: '0 0 15px 0',
                          color: '#2d5016',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          💿 {album}
                          <span style={{
                            fontSize: '12px',
                            color: '#666',
                            fontWeight: 'normal'
                          }}>
                            ({songs.length} {songs.length === 1 ? 'canción' : 'canciones'})
                          </span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {songs.map(song => (
                            <div
                              key={song.id}
                              style={{
                                padding: '12px 15px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'transform 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                <span style={{ fontSize: '18px' }}>🎵</span>
                                <span style={{ fontWeight: '500', color: '#333' }}>
                                  {song.title}
                                </span>
                              </div>
                              <span style={{
                                fontSize: '13px',
                                color: '#666',
                                backgroundColor: '#f0f0f0',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontWeight: '500'
                              }}>
                                {formatDuration(song.duration)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear artista */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div style={{
            padding: '10px 0'
          }}>
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '25px',
              color: 'white',
              fontSize: '26px',
              textAlign: 'center',
              borderBottom: '3px solid white',
              paddingBottom: '15px'
            }}>
              🎤 Crear Nuevo Artista
            </h2>
            <form onSubmit={handleCreateArtist} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Nombre del artista *
                </label>
                <input
                  type="text"
                  required
                  value={newArtist.name}
                  onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
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
                  Biografía
                </label>
                <textarea
                  value={newArtist.bio}
                  onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    País *
                  </label>
                  <input
                    type="text"
                    required
                    value={newArtist.pais}
                    onChange={(e) => setNewArtist({ ...newArtist, pais: e.target.value })}
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
                    Género *
                  </label>
                  <select
                    required
                    value={newArtist.genero}
                    onChange={(e) => setNewArtist({ ...newArtist, genero: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #9cb88d',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2d5016'}
                    onBlur={(e) => e.target.style.borderColor = '#9cb88d'}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Solista">Solista</option>
                    <option value="Banda">Banda</option>
                    <option value="Dúo">Dúo</option>
                    <option value="Grupo">Grupo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    Género Musical *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rock, Pop, Jazz..."
                    value={newArtist.genero_musical}
                    onChange={(e) => setNewArtist({ ...newArtist, genero_musical: e.target.value })}
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
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={newArtist.fecha_de_nacimiento}
                    onChange={(e) => setNewArtist({ ...newArtist, fecha_de_nacimiento: e.target.value })}
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
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Discográfica
                </label>
                <input
                  type="text"
                  value={newArtist.discográfica}
                  onChange={(e) => setNewArtist({ ...newArtist, discográfica: e.target.value })}
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
                  Imagen (URL)
                </label>
                <input
                  type="url"
                  value={newArtist.image}
                  onChange={(e) => setNewArtist({ ...newArtist, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
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
                  YouTube *
                </label>
                <input
                  type="url"
                  required
                  value={newArtist.youtube}
                  onChange={(e) => setNewArtist({ ...newArtist, youtube: e.target.value })}
                  placeholder="https://youtube.com/@artista"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    Spotify
                  </label>
                  <input
                    type="url"
                    value={newArtist.spotify}
                    onChange={(e) => setNewArtist({ ...newArtist, spotify: e.target.value })}
                    placeholder="https://open.spotify.com/artist/..."
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
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={newArtist.instagram}
                    onChange={(e) => setNewArtist({ ...newArtist, instagram: e.target.value })}
                    placeholder="https://instagram.com/artista"
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
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Otros Enlaces
                </label>
                <input
                  type="text"
                  value={newArtist.other_links}
                  onChange={(e) => setNewArtist({ ...newArtist, other_links: e.target.value })}
                  placeholder="Facebook, Twitter, sitio web oficial..."
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
                  onClick={() => setShowCreateModal(false)}
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
                  ✓ Crear Artista
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal para crear canción */}
      {showCreateSongModal && (
        <Modal onClose={() => setShowCreateSongModal(false)}>
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
              🎵 Nueva Canción para {selectedArtist?.name}
            </h2>
            <form onSubmit={handleCreateSong} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Título de la canción *
                </label>
                <input
                  type="text"
                  required
                  value={newSong.title}
                  onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                  placeholder="Nombre de la canción"
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
                  Duración (en segundos) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newSong.duration}
                  onChange={(e) => setNewSong({ ...newSong, duration: e.target.value })}
                  placeholder="180"
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
                {newSong.duration && (
                  <div style={{ 
                    marginTop: '6px', 
                    fontSize: '12px', 
                    color: '#9cb88d',
                    fontStyle: 'italic'
                  }}>
                    Duración: {Math.floor(newSong.duration / 60)}:{(newSong.duration % 60).toString().padStart(2, '0')} minutos
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  fontSize: '14px'
                }}>
                  Álbum
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <select
                      value={newSong.album === '__nuevo__' || (newSong.album && !getArtistAlbums().includes(newSong.album)) ? '__nuevo__' : newSong.album}
                      onChange={(e) => {
                        if (e.target.value === '__nuevo__') {
                          setNewSong({ ...newSong, album: '__nuevo__' });
                          setNewAlbumName('');
                        } else {
                          setNewSong({ ...newSong, album: e.target.value });
                          setNewAlbumName('');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #9cb88d',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2d5016'}
                      onBlur={(e) => e.target.style.borderColor = '#9cb88d'}
                    >
                      <option value="">Sin álbum</option>
                      <option value="__nuevo__">➕ Escribir nuevo álbum...</option>
                      {getArtistAlbums().map(album => (
                        <option key={album} value={album}>{album}</option>
                      ))}
                    </select>
                    {(newSong.album === '__nuevo__' || (newSong.album && !getArtistAlbums().includes(newSong.album) && newSong.album !== '')) && (
                      <input
                        type="text"
                        placeholder="Nombre del nuevo álbum"
                        value={newAlbumName}
                        onChange={(e) => {
                          setNewAlbumName(e.target.value);
                        }}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          padding: '12px',
                          border: '2px solid #2d5016',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s'
                        }}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: '#9cb88d',
                  fontStyle: 'italic'
                }}>
                  💡 Puedes seleccionar un álbum existente o crear uno nuevo escribiendo su nombre
                </div>
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
                    setShowCreateSongModal(false);
                    setNewSong({ title: '', duration: '', album: '' });
                    setNewAlbumName('');
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
                  ✓ Crear Canción
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

    </div>
  );
}