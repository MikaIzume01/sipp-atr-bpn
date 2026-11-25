import { redirect } from 'next/navigation';

export default function SimulasiBiayaPage() {
  // Tarif dihilangkan sesuai permintaan revisi, diarahkan ke E-Formulir
  redirect('/formulir');
}
