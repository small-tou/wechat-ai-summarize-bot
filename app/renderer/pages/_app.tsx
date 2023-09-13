import { NextUIProvider } from '@nextui-org/react';
import '../styles/globals.css';
import toast, { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <Component {...pageProps} />
      <Toaster />
    </NextUIProvider>
  );
}

export default MyApp;
