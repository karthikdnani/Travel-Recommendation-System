import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

export const metadata = {
  title: 'Travel Recommendation System – Get Smart Trip Recommendations',
  description: 'Get personalized trip recommendations for any destination worldwide.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
