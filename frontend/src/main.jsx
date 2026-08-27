import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import "./index.css";
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import store from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';



import { ThemeProvider } from './context/ThemeContext';
import { registerServiceWorker } from './utils/pushNotifications';

// Register service worker for push notifications
registerServiceWorker();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px 20px',
                minWidth: '300px',
                marginBottom: '20px',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'var(--color-surface)',
                },
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-success)',
                  border: '1px solid var(--color-border)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-danger)',
                  secondary: 'var(--color-surface)',
                },
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-danger)',
                  border: '1px solid var(--color-border)',
                },
              },
              loading: {
                iconTheme: {
                  primary: 'var(--color-primary)',
                  secondary: 'var(--color-surface)',
                },
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-border)',
                },
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
);


