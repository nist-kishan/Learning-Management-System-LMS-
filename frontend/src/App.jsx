import { BrowserRouter as Router } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen bg-[#0b0f19] flex flex-col">
        {isAuthenticated && <Navbar />}
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
          {isAuthenticated && <Sidebar />}
          <main className={`flex-1 overflow-y-auto ${isAuthenticated ? 'p-6 lg:p-8' : ''}`}>
            <AppRoutes />
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
