import Login from "./components/Login";
import CenteredLoginBoxImage from './components/CenteredLoginBoxImage';
import './App.css';


const App = () => {
  return (
    <div className="App">
      <img src="/images/image2.png" alt="image" />
      <Login/>
      <CenteredLoginBoxImage/>
    </div>
  );
};

export default App;