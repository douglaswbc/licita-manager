// Dentro do seu App.tsx
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas (Só entra se logado) */}
        <Route element={<ProtectedRoute />}>
           <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="bids" element={<Bids />} />
              {/* outras rotas... */}
           </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}