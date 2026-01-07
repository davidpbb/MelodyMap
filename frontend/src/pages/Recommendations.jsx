import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState({
    recommended_songs: [],
    recommended_artists: [],
    recommended_playlists: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recommendations');
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
      alert('Error al cargar recomendaciones: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRegisterListen = async (songId, songTitle) => {
    if (!confirm(`¿Quieres registrar que escuchaste "${songTitle}"?`)) {
      return;
    }
    
    try {
      await api.post('/listens/create', {
        song_id: songId,
        listened_at: new Date().toISOString()
      });
      alert('¡Escucha registrada exitosamente!');
      // Recargar recomendaciones
      fetchRecommendations();
    } catch (error) {
      console.error('Error al registrar escucha:', error);
      alert('Error al registrar la escucha: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '18px', color: '#2d5016' }}>Cargando recomendaciones...</p>
      </div>
    );
  }

  const hasNoRecommendations = 
    recommendations.recommended_songs.length === 0 &&
    recommendations.recommended_artists.length === 0 &&
    recommendations.recommended_playlists.length === 0;

  if (hasNoRecommendations) {
    return (
      <div style={{ padding: '30px', minHeight: '100vh' }}>
        <h1 style={{ color: '#2d5016', marginBottom: '30px', fontSize: '32px' }}>
          💡 Recomendaciones para Ti
        </h1>
        <div style={{
          padding: '60px',
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>👥</div>
          <h2 style={{ color: '#2d5016', marginBottom: '15px' }}>¡Añade amigos para recibir recomendaciones!</h2>
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
            Las recomendaciones se basan en lo que tus amigos están escuchando.
          </p>
          <button
            onClick={() => navigate('/friends')}
            style={{
              padding: '12px 30px',
              backgroundColor: '#2d5016',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1f3a0f'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2d5016'}
          >
            Ir a Amigos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2d5016', margin: 0, fontSize: '32px', marginBottom: '5px' }}>
          💡 Recomendaciones para Ti
        </h1>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          Basadas en lo que tus amigos están escuchando
        </p>
      </div>

      {/* Canciones Recomendadas */}
      {recommendations.recommended_songs.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#2d5016', marginBottom: '20px', fontSize: '24px' }}>
            🎵 Canciones Populares entre tus Amigos
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {recommendations.recommended_songs.map((song) => (
              <div
                key={song.song_id}
                style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: '15px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              >
                <div>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: '#2d5016',
                    marginBottom: '5px'
                  }}>
                    {song.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    {song.artist_name}
                    {song.album && ` • ${song.album}`}
                    <span style={{ marginLeft: '10px', color: '#999' }}>
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#7d9d6f', fontStyle: 'italic' }}>
                    👥 {song.friend_count} {song.friend_count === 1 ? 'amigo lo' : 'amigos la'} {song.friend_count === 1 ? 'ha' : 'han'} escuchado ({song.total_listens} {song.total_listens === 1 ? 'vez' : 'veces'})
                  </div>
                </div>
                <button
                  onClick={() => handleRegisterListen(song.song_id, song.title)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap'
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
                  ✓ Registrar Escucha
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artistas Recomendados */}
      {recommendations.recommended_artists.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#2d5016', marginBottom: '20px', fontSize: '24px' }}>
            🎤 Artistas que Deberías Descubrir
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {recommendations.recommended_artists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => navigate('/artists')}
                style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '2px solid #e0e0e0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#2d5016';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      margin: '0 auto 15px'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    margin: '0 auto 15px'
                  }}>
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#2d5016',
                  marginBottom: '5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {artist.name}
                </div>
                {artist.genero_musical && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '10px'
                  }}>
                    {artist.genero_musical}
                  </div>
                )}
                <div style={{
                  fontSize: '12px',
                  color: '#7d9d6f',
                  fontStyle: 'italic'
                }}>
                  👥 {artist.friend_count} {artist.friend_count === 1 ? 'amigo' : 'amigos'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists Recomendadas */}
      {recommendations.recommended_playlists.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#2d5016', marginBottom: '20px', fontSize: '24px' }}>
            📝 Playlists de tus Amigos
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {recommendations.recommended_playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => navigate('/playlists')}
                style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#2d5016';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#2d5016',
                  marginBottom: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {playlist.name}
                </div>
                {playlist.description && (
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.4'
                  }}>
                    {playlist.description}
                  </div>
                )}
                <div style={{
                  fontSize: '13px',
                  color: '#999',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>🎵 {playlist.songs_count} canción{playlist.songs_count !== 1 ? 'es' : ''}</span>
                  <span style={{ fontSize: '12px', color: '#7d9d6f', fontStyle: 'italic' }}>
                    Por {playlist.creator_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;