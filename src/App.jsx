import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Game from './pages/Game';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Game />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
      <Toaster />
    </Router>
  )
}

export default App
