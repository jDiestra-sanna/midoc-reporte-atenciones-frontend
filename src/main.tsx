// Punto de entrada principal de la aplicación React
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Se importa Bootstrap para aplicar estilos de diseño responsive y componentes UI
import 'bootstrap/dist/css/bootstrap.min.css';

// 🚀Renderiza la aplicación en el elemento raíz con ID 'root'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* React.StrictMode ayuda a detectar errores potenciales en desarrollo */}
    <App />
  </React.StrictMode>
);
