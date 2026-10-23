import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import ChatWidget from '../components/chatbot/ChatWidget';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export const metadata = {
  title: 'NISHKÈA — Handcrafted Jewellery & Refined Accessories',
  description: 'Artisanal jewellery, earrings, cocktail rings, necklaces, hair adornments, and nose rings. IT SUITS YOU !',
  icons: {
    icon: '/images/brand/logo.svg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StoreProvider>
          {children}
          <ChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
