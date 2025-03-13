import { useEffect, useRef } from 'react';
import { useGameContext } from './GameContext';
import { gsap } from 'gsap';

export default function useObstacleAnimation() {
    const { obstacles, gameStatus } = useGameContext();
  const obstacleRefs = useRef({});
  const animationsRef = useRef({});
  
  useEffect(() => {

    // Clean up existing animations
    Object.values(animationsRef.current).forEach(anim => anim?.kill());
    animationsRef.current = {};
    
    // Create new animations
    obstacles.forEach((obstacle, index) => {
      const element = obstacleRefs.current[index];
      if (!element) return;
      
      let animation;
      
      if (obstacle.movementType === 'horizontal') {
        let moveDistance;
      if (obstacle.x === obstacle.maxBound) {
        // Moving left to right
        moveDistance = obstacle.minBound - obstacle.maxBound;
        } else {
          // Moving right to left or other cases
          moveDistance = obstacle.maxBound - obstacle.minBound;
        }
        animation = gsap.to(element, {
          x: moveDistance,
          duration: 4/obstacle.speed,
          delay: obstacle.delay || 0,
          yoyo: true,
          repeat: -1,
          ease: "none"
        });
      } 
      else if (obstacle.movementType === 'vertical') 
      {
        animation = gsap.to(element, {
          y: obstacle.maxBound - obstacle.y,
          duration: 1/obstacle.speed,
          yoyo: true,
          repeat: -1,
          ease: "none"
        });
      }
      else if (obstacle.movementType === 'circular') 
      {
        if (!element) {
          console.warn("Missing element for circular obstacle");
          return;
        }
        
        gsap.killTweensOf(element);
        
        try {
          // Set initial position
          gsap.set(element, {
            x: obstacle.x,
            y: obstacle.y,
            rotation: 0,
            transformOrigin: "top center"
          });
          
          // Create rotation animation
          animation = gsap.to(element, {
            rotation: 360 * obstacle.direction,
            duration: 4/obstacle.speed,
            repeat: -1,
            ease: "none",
            onError: (err) => console.error("GSAP animation error:", err)
          });
        } catch (error) {
          console.error("Animation setup error:", error);
        }
      }
      else if (obstacle.movementType === 'compound') 
      {
        animation = gsap.timeline({repeat: -1});
        
        // Initial position
        const startX = obstacle.x;
        const startY = obstacle.y;
        gsap.set(element, { x: startX, y: startY });
        // Move right to rightBound
        animation.to(element, {
          x: obstacle.rightBound,
          duration: Math.abs(obstacle.rightBound - startX) / (100 * obstacle.speed),
          ease: "none"
        });
        
        // Move down to bottomBound
        animation.to(element, {
          y: obstacle.bottomBound,
          duration: Math.abs(obstacle.bottomBound - startY) / (100 * obstacle.speed),
          ease: "none"
        });
        
        //Move left to leftBound
        animation.to(element, {
          x: obstacle.leftBound,
          duration: Math.abs(obstacle.rightBound - obstacle.leftBound) / (100 * obstacle.speed),
          ease: "none"
        });
        
        //Move up to topBound
        animation.to(element, {
          y: obstacle.topBound,
          duration: Math.abs(obstacle.bottomBound - obstacle.topBound) / (100 * obstacle.speed),
          ease: "none"
        });
        animation.to(element, {
          x: startX,
          duration: Math.abs(obstacle.leftBound - startX) / (100 * obstacle.speed),
          ease: "none"
        });
        
        if (obstacle.delay) {
          animation.delay(obstacle.delay);
        }
      }
      
      if (animation) {
        animationsRef.current[index] = animation;
      }
    });
    
    return () => {
      Object.values(animationsRef.current).forEach(anim => anim?.kill());
      animationsRef.current = {};
    };
  }, [obstacles]); 

  useEffect(() => {
    Object.values(animationsRef.current).forEach(anim => {
      if (gameStatus === 'playing') {
        anim?.play();
      } else {
        anim?.pause();
      }
    });
  }, [gameStatus]); 
  
  return (index, node) => {
    obstacleRefs.current[index] = node;
  };
}