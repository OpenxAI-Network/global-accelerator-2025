import './globals.css';

export const metadata = {
  title: 'Email Summarizer',
  description: 'AI Email Summarizer App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}
