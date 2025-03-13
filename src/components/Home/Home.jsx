import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase.js';

function Home() {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      carouselRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      checkScrollButtons();
      
      return () => {
        carousel.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchLeaderboardData = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("totalScore", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      
      const leaderboard = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        leaderboard.push({
          id: doc.id,
          username: userData.username || 'Anonymous',
          score: userData.totalScore || 0
        });
      });
      
      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const gameCards = [
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      description: 'Classic 3×3 grid game. Take turns placing X or O. Get 3 in a row to win!',
      image: '/images/tictactoe-bg.jpg',
      category: 'Strategy',
      howToPlay: "Place X's on a 3x3 grid against the computer. Get three in a row to win!",
      pointsSystem: "Easy: Win +40, Loss -100 | Medium: Win +60, Loss -40 | Impossible: Win +1000, Loss -20, Draw +40"
    },
    {
      id: 'ultimatettt',
      title: 'Ultimate TTT',
      description: '9 boards in 1 grid. Your move decides opponent\'s board. Win boards to win the game!',
      image: '/images/ultimatettt-bg.jpg',
      category: 'Advanced',
      howToPlay: "Play on 9 mini-boards within a larger board. Win 3 mini-boards in a row to win the game!",
      pointsSystem: "Win: +70 points | Loss: -70 points | Draw: 0 points"
    },
    {
      id: 'threemove',
      title: '3-Move TTT',
      description: 'Like classic TTT but after every fourth move one of your marker disappears',
      image: '/images/threemove-bg.jpg',
      category: 'Challenge',
      howToPlay: "Play Tic-Tac-Toe but with a twist - your markers disappear every fourth move so strategize accordingly",
      pointsSystem: "Easy: Win +30, Loss -60 | Strategic: Win +60, Loss -30"
    },
    {
      id: 'pixelrush',
      title: 'Pixel Rush',
      description: 'Match colors quickly. Beat the clock. Earn points for speed!',
      image: '/images/pixelrush-bg.jpg',
      category: 'Speed',
      howToPlay: "Navigate through obstacles to reach the finish line. Don't crash!",
      pointsSystem: "Level 1: Win +30, Loss -70 | Level 2: Win +70, Loss -40 | Level 3: Win +130, Loss -30"
    }
  ];

  const navigate = useNavigate();

  return (
    <div className="night-sky-container">
      <div 
        className="moon" 
        style={{ 
          transform: `translate3d(0, ${Math.min(scrollY * 0.1, window.innerHeight * 0.03)}px, 0)`,
          transition: 'transform 0.3s linear'
        }}
      ></div>
      
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="twinkle" 
          style={{ 
            top: `${Math.random() * 80}%`, 
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-white cloud-4"></div>
      <div className="night-fog"></div>
      
      <div className="home-content">
        <h1 className="home-title">Welcome to MiniGames</h1>
        <p className="home-subtitle">Challenge yourself with fun brain games</p>
        
        <div className="carousel-container">
          <button 
            className={`carousel-button carousel-button-left ${!canScrollLeft ? 'disabled' : ''}`} 
            onClick={() => scrollCarousel('left')}
            disabled={!canScrollLeft}
          >
            &#10094;
          </button>
          
          <div className="carousel-wrapper" ref={carouselRef}>
            {gameCards.map((card) => (
              <div key={card.id} className="carousel-card-link">
                <div 
                  className="carousel-card" 
                  onClick={() => navigate('/games')}
                >
                  <div 
                    className="card-background"
                    style={{
                      backgroundImage: `url(${card.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                  <div className="card-overlay"></div>
                  <h2 className="card-title">{card.title}</h2>
                  
                  <div className="card-hover-content">
                    <div className="card-category">{card.category}</div>
                    <p className="card-description">{card.description}</p>
                    <button 
                      type="button"
                      className="play-now-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Navigating to games tab");
                        navigate('/games');
                      }}
                    >
                      Play Now
                    </button>
                  </div>
                  
                  <button 
                    type="button"
                    className="info-button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.closest('.carousel-card').classList.toggle('show-info');
                    }}
                  >
                    i
                  </button>
                  
                  <div className="info-panel">
                    <h3>How to Play</h3>
                    <p>{card.howToPlay || "Instructions coming soon!"}</p>
                    <h3>Points System</h3>
                    <p>{card.pointsSystem || "Score information coming soon!"}</p>
                    <button 
                      type="button"
                      className="close-info-panel" 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.currentTarget.closest('.carousel-card').classList.toggle('show-info');
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className={`carousel-button carousel-button-right ${!canScrollRight ? 'disabled' : ''}`}
            onClick={() => scrollCarousel('right')}
            disabled={!canScrollRight}
          >
            &#10095;
          </button>
        </div>
        
        <div className="featured-section">
          <h2>Featured Game</h2>
          <div className="featured-game">
            <div className="featured-image"></div>
            <div className="featured-content">
              <h3>Ultimate Tic-Tac-Toe</h3>
              <p>Take your strategy to the next level!</p>
              <Link to="/games" className="featured-button">Play Now</Link>
            </div>
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">4</div>
            <div className="stat-label">Fun Games</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">10+</div>
            <div className="stat-label">Challenge Levels</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">∞</div>
            <div className="stat-label">Hours of Fun</div>
          </div>
        </div>
      </div>
      <div className="additional-content">
        <div className="leaderboard-preview">
          <h2>Top Players</h2>
          {isLoadingLeaderboard ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="leaderboard-list">
              {leaderboardData.length > 0 ? (
                leaderboardData.map((player, index) => (
                  <div className="leaderboard-item" key={player.id}>
                    <span className="rank">{index + 1}</span>
                    <span className="name">{player.username}</span>
                    <span className="score">{player.score}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No players yet. Be the first!</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
