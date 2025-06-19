import loginBoxImage from './login_image/login_box.png';

function CenteredLoginBoxImage() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
    }}>
      <img 
        src={loginBoxImage} 
        alt="Login Box" 
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
      />
    </div>
  );
}

export default CenteredLoginBoxImage;