import './css/index.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ChattsProvider from './context/ChattsProvider.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import ThemeProvider from './context/ThemeProvider.jsx';

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <ChattsProvider>
        <App />
      </ChattsProvider>
    </AuthProvider>
  </ThemeProvider>
);

