import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { DemoProvider } from './context/DemoContext';
import { DonorProvider } from './context/DonorContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DemoProvider>
        <DonorProvider>
          <App />
        </DonorProvider>
      </DemoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
