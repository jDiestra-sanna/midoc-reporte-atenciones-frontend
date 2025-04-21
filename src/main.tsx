// Punto de entrada principal de la aplicación.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Se importa el CSS de Bootstrap para usar sus clases en toda la app.
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* StrictMode ayuda a identificar problemas comunes en la app */}
    <App />
  </React.StrictMode>
);