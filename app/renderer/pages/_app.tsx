import { NextUIProvider } from '@nextui-org/react';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: any) {
  return (
    <NextUIProvider>
      <Component {...pageProps} />
      <Toaster position={'bottom-center'} />
    </NextUIProvider>
  );
}

export default MyApp;
