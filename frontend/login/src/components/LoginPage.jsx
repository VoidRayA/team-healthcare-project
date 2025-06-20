import Login from './Login';
import image3 from '../images/image3.png';


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
          src={image3}
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