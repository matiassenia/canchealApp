import '../styles/globals.css'; 
import Head from 'next/head';
import Footer from '../components/Footer';


export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>CanchealApp | Reserva de canchas de fútbol</title>
        <meta name="description" content="Plataforma moderna para descubrir y reservar canchas de fútbol." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
