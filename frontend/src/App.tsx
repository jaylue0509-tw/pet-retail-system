
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import StoreList from './pages/StoreList';
import PetList from './pages/PetList';
import PetDetail from './pages/PetDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/" className="nav-brand">東寵活體媒合平台</Link>
        <div className="nav-links">
          <Link to="/">全台門市</Link>
          <Link to="/pets?category=犬">犬隻查詢</Link>
          <Link to="/pets?category=貓">貓咪查詢</Link>
          <Link to="/admin">門市後台</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<main className="container"><StoreList /></main>} />
        <Route path="/pets" element={<main className="container"><PetList /></main>} />
        <Route path="/pets/:pet_code" element={<main className="container"><PetDetail /></main>} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

