import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorPage from '@/components/ErrorBoundary/ErrorPage';
import { ThemeProvider } from '@/context/ThemeContext';
import { wrapper } from '@/store';
import Head from 'next/head';
import { Suspense } from 'react';
import { Provider } from 'react-redux';

import '@/styles/main.scss';
import '@/styles/global.scss';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Performance components - temporarily disabled for better HMR
// import dynamic from 'next/dynamic';

// const PerformanceMonitor = dynamic(
//   () => import('@/components/PerformanceMonitor'),
//   { ssr: false }
// );

// const PerformanceOptimizer = dynamic(
//   () => import('@/components/PerformanceOptimizer'),
//   { ssr: false }
// );

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;


function MyApp({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider>
        <Provider store={store}>
          <ErrorBoundary fallback={<ErrorPage />}>
            <Suspense fallback={<div>Loading...</div>}>
              <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#000000" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
              </Head>
              {/* <PerformanceMonitor /> */}
              <Component {...props.pageProps} />
            </Suspense>
          </ErrorBoundary>
        </Provider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
export default MyApp;