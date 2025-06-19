import login_box from '../images/login_box.png';

function CenteredLoginBoxImage() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100vw',
      height: '100vh',
      zIndex: 0,
    }}>
      <img 
        src= {login_box}
        alt="Login Box" 
        style={{ width: '100%',          
          height: 'auto', // 세로는 비율에 맞게 자동
          maxHeight: '100vh', // 세로 크기가 100vh를 넘지 않도록 제한
          objectFit: 'cover' }} 
      />
    </div>
  );
}

export default CenteredLoginBoxImage;