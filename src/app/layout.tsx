import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'KILAT BPN - Kanal Informasi & Layanan Administrasi Tanah | Badan Pertanahan Nasional',
  description:
    'KILAT BPN (Kanal Informasi & Layanan Administrasi Tanah) Badan Pertanahan Nasional. Layanan informasi permohonan pertanahan resmi, pengisian E-Formulir langsung, pendaftaran mandiri digital, dan pelacakan status berkas transparan.',
  icons: {
    icon: '/logo-bpn.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
