import gearGif from './Assets/Gear.gif';
import spike from './Assets/Spike.png';
import swing from './Assets/Swing.png';

function Obstacle({ obstacle, level }) {

  if ((level === 1 || level === 2) && obstacle.movementType === 'horizontal') {
    return <img src={gearGif} alt="Gear" style={{width: '100%', height: '100%'}} />;
  }
  

  if ((level === 1 || level === 2 || level===3) && obstacle.movementType === 'vertical') {
    return <div className="vertical-obstacle" style={{backgroundImage: `url(${spike})`, backgroundSize: 'contain', backgroundRepeat: 'repeat-y', width: '100%', height: '100%'}} />;
  }
  

  if (obstacle.movementType === 'compound') {
    return (
      <img 
        src={gearGif}
        alt="Gear obstacle"
        style={{
          width: '100%', 
          height: '100%',
          objectFit: 'contain',
          imageRendering: 'high-quality'
        }}
      />
    );
  }
  
 
  if (obstacle.movementType === 'circular') {
    return (
      <div className="circular-obstacle" style={{
        width: '100%',
        height: '100%', 
        position: 'relative'
      }}>
        <img 
          src={swing}
          alt="Swing obstacle"
          style={{
            position: 'absolute',
            top: '0',          
            left: '50%',        
            transform: 'translateX(-50%)',
            width: 'auto',     
            height: '100%',
            transformOrigin: 'top center',
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  return <div style={{backgroundColor: '#e74c3c', width: '100%', height: '100%'}} />;
}

export default Obstacle;