import login_box from '../images/login_box.png';
import './styles.css';

function CenteredLoginBoxImage() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '80vh',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <img
        src={login_box}
        alt="Login Box"
        style={{
          maxWidth: '80%',
          maxHeight: '80%',
          objectFit: 'contain',
          alignItems: 'center'
        }}
      />
    </div>
  );
}

export default CenteredLoginBoxImage;