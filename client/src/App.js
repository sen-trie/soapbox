import { Routes , Route } from 'react-router-dom';
import Home from "./components/Home";
import Create from "./components/Create";
import User from "./components/User";
import ChooseName from "./components/ChooseName";
import NotFound from "./components/NotFound";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route path="/user/:id" element={<User/>} />
        <Route exact path="/create" element={<Create/>} />
        <Route path="/choose-display-name" element={<ChooseName/>} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </div>
  );
}

export default App;
