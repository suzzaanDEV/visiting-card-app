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
            gutter={14}
            maxVisible={4}
            containerStyle={{ margin: 20 }}
            toastOptions={{
              duration: 4000,
              className: 'cardly-toast',
              style: {
                color: 'var(--color-text)',
                borderRadius: '15px',
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '1.45',
                padding: '14px 18px',
                minWidth: '320px',
              },
              success: {
                duration: 4000,
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: '#FFFFFF',
                },
                style: {
                  color: 'var(--color-success)',
                  borderLeft: '4px solid var(--color-success)',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: 'var(--color-danger)',
                  secondary: '#FFFFFF',
                },
                style: {
                  color: 'var(--color-danger)',
                  borderLeft: '4px solid var(--color-danger)',
                },
              },
              loading: {
                iconTheme: {
                  primary: 'var(--color-primary)',
                  secondary: '#FFFFFF',
                },
                style: {
                  color: 'var(--color-primary)',
                  borderLeft: '4px solid var(--color-primary)',
                },
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
);


