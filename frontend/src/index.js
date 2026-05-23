import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import AppRouter from './routes/approuter';
import reportWebVitals from './reportWebVitals';
import favicon from './assets/favicon.png';

const setFavicon = (href) => {
  try {
    const head = document.getElementsByTagName('head')[0];
    let link = head.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = href;
  } catch (e) {
    // Respaldo: ignorar
  }
};

setFavicon(favicon);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

// Si quieres medir el rendimiento de la app, pasa una funcion
// para registrar resultados (por ejemplo: reportWebVitals(console.log))
// o enviarlos a un endpoint de analitica. Mas informacion: https://bit.ly/CRA-vitals
reportWebVitals();
