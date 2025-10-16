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
              </Head>
              <Component {...props.pageProps} />
            </Suspense>
          </ErrorBoundary>
        </Provider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
export default MyApp;