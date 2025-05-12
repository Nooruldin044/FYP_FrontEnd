import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { IdeaProvider } from './contexts/IdeaContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IdeaDetailPage from './pages/IdeaDetailPage';
import CreateIdeaPage from './pages/CreateIdeaPage';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <IdeaProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/ideas/:id" element={<IdeaDetailPage />} />
                <Route path="/create" element={<CreateIdeaPage />} />
                <Route path="/profile/:username" element={<UserProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </IdeaProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;