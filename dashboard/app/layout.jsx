import './globals.css';

export const metadata = {
  title: 'Arthilles - Painel',
  description: 'Painel de atendimento WhatsApp'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
