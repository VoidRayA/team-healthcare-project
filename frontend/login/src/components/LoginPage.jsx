import Login from './Login';
import image2 from '../images/image2.png';


const LoginPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <img
          src={image2}
          alt=" "
          style={{
            width: 800,
            height: 800,
            objectFit: 'contain',
          }}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;