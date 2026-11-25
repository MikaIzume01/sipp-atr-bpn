import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'salt_pemerintah_2026').digest('hex');
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.applicationLog.deleteMany();
  await prisma.applicationDocument.deleteMany();
  await prisma.application.deleteMany();
  await prisma.serviceRequirement.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users (Petugas & Administrator Kantor Pertanahan)...');
  await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        namaLengkap: 'Drs. H. Mulyadi, M.Si.',
        role: 'ADMIN',
        passwordHash: hashPassword('admin123'),
        nip: '197508191999031002',
      },
      {
        username: 'petugas_loket',
        namaLengkap: 'Rina Kusuma Wardhani, S.H.',
        role: 'VERIFIKATOR',
        passwordHash: hashPassword('petugas123'),
        nip: '199304152019022004',
      },
      {
        username: 'kepala_kantor',
        namaLengkap: 'Dr. Ir. Taufik Hidayat, M.Eng., M.H.',
        role: 'KEPALA_KANTOR',
        passwordHash: hashPassword('kepala123'),
        nip: '197103121996031001',
      },
    ],
  });

  console.log('Seeding Services based on Google Drive categories & forms...');

  const servicesData = [
    // 1. Peralihan Hak - Jual Beli
    {
      kode: 'jualb',
      nama: 'Peralihan Hak - Jual Beli',
      kategori: 'Peralihan Hak',
      deskripsi: 'Pelayanan pendaftaran peralihan hak atas tanah dan/atau satuan rumah susun berdasarkan Akta Jual Beli (AJB) yang dibuat di hadapan PPAT.',
      dasarHukum: '1. UU No. 5 Tahun 1960 (UUPA)\n2. PP No. 24 Tahun 1997 tentang Pendaftaran Tanah\n3. PP No. 128 Tahun 2015 tentang Jenis dan Tarif atas PNBP ATR/BPN',
      estimasiHari: 5,
      rumusBiaya: '(Nilai Tanah per m² × Luas Tanah m²) / 1.000',
      biayaTetap: 50000,
      isBiayaRumus: true,
      keterangan: '1. Formulir permohonan bermeterai dari arsip Google Drive.\n2. Sertifikat Asli dan Akta Jual Beli Asli PPAT.\n3. Bukti setor BPHTB dan PPh Final 2.5%.\n4. KTP & KK penjual dan pembeli.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Unggah Berkas', hari: 'Hari 1', keterangan: 'Pemohon mengunduh form resmi Google Drive, mengisi data, dan mendaftar.' },
        { tahap: 2, nama: 'Verifikasi Warkah & Buku Tanah', hari: 'Hari 2-3', keterangan: 'Validasi kesesuaian berkas AJB, BPHTB, PPh dengan arsip buku tanah.' },
        { tahap: 3, nama: 'Penerbitan Billing PNBP & Pembukuan', hari: 'Hari 4', keterangan: 'Pembayaran PNBP SIMPONI dan pencatatan nama pemegang hak baru.' },
        { tahap: 4, nama: 'Penyerahan Sertifikat Selesai', hari: 'Hari 5', keterangan: 'Sertifikat diserahkan ke pemohon / kuasanya.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Peralihan Hak Bermeterai', deskripsi: 'Formulir resmi peralihan hak (Jual Beli, Hibah, Waris, Lelang) bertanda tangan pemohon di atas meterai Rp 10.000.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/12nOxPtjaW9NGT8luIwuAQjGB1b2Q8QZI/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Hak Atas Tanah Asli', deskripsi: 'Scan Sertifikat Asli (SHM / SHGB / SHP / HMSRS).', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Akta Jual Beli (AJB) dari PPAT', deskripsi: 'Salinan resmi / lembar asli AJB yang ditandatangani PPAT.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
        { namaDokumen: 'Identitas Para Pihak (KTP & KK)', deskripsi: 'Scan KTP dan KK pihak penjual dan pembeli.', isWajib: true, allowedTypes: 'pdf,jpg,png', maxSizeMB: 5, urutan: 4 },
        { namaDokumen: 'Bukti Validasi BPHTB & PPh Final', deskripsi: 'Surat Setoran BPHTB yang divalidasi Bapenda dan Surat Setoran Pajak (SSP PPh).', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 5 },
      ],
    },

    // 2. Peralihan Hak - Waris
    {
      kode: 'waris',
      nama: 'Peralihan Hak - Pewarisan',
      kategori: 'Peralihan Hak',
      deskripsi: 'Pelayanan pendaftaran peralihan hak atas tanah karena pewarisan kepada para ahli waris berdasarkan surat keterangan waris sah.',
      dasarHukum: '1. UU No. 5 Tahun 1960 (UUPA)\n2. PP No. 24 Tahun 1997 tentang Pendaftaran Tanah\n3. PP No. 128 Tahun 2015',
      estimasiHari: 5,
      rumusBiaya: '(Nilai Tanah per m² × Luas Tanah m²) / 1.000',
      biayaTetap: 50000,
      isBiayaRumus: true,
      keterangan: 'Surat Tanda Bukti Ahli Waris yang sah (Keterangan Waris Lurah/Camat atau Akta Notaris atau Penetapan Pengadilan).',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pengajuan & Verifikasi Dokumen Waris', hari: 'Hari 1-2', keterangan: 'Pemeriksaan keabsahan surat tanda bukti ahli waris.' },
        { tahap: 2, nama: 'Pembukuan Nama Ahli Waris', hari: 'Hari 3-4', keterangan: 'Pencatatan nama seluruh ahli waris pada buku tanah dan sertifikat.' },
        { tahap: 3, nama: 'Penyerahan Sertifikat', hari: 'Hari 5', keterangan: 'Sertifikat diserahkan ke perwakilan ahli waris.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Peralihan Hak Waris Bermeterai', deskripsi: 'Formulir resmi dari Google Drive yang diisi dan ditandatangani ahli waris.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/12nOxPtjaW9NGT8luIwuAQjGB1b2Q8QZI/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Tanah Asli', deskripsi: 'Sertifikat hak atas tanah atas nama pewaris.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Surat Keterangan Kematian Pewaris', deskripsi: 'Akta kematian dari Disdukcapil atau surat keterangan kematian dari kelurahan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
        { namaDokumen: 'Surat Keterangan Ahli Waris', deskripsi: 'Surat tanda bukti sebagai ahli waris sah sesuai hukum yang berlaku.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 4 },
        { namaDokumen: 'KTP & KK Seluruh Ahli Waris', deskripsi: 'Identitas lengkap para ahli waris.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 5 },
      ],
    },

    // 3. Peralihan Hak - Hibah
    {
      kode: 'hibah',
      nama: 'Peralihan Hak - Hibah',
      kategori: 'Peralihan Hak',
      deskripsi: 'Pendaftaran peralihan hak atas tanah karena hibah sukarela berdasarkan Akta Hibah yang dibuat oleh PPAT.',
      dasarHukum: '1. UU No. 5 Tahun 1960\n2. PP No. 24 Tahun 1997\n3. PP No. 128 Tahun 2015',
      estimasiHari: 5,
      rumusBiaya: '(Nilai Tanah per m² × Luas Tanah m²) / 1.000',
      biayaTetap: 50000,
      isBiayaRumus: true,
      keterangan: 'Melampirkan Akta Hibah PPAT dan bukti pelunasan BPHTB hibah.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran Berkas Hibah', hari: 'Hari 1', keterangan: 'Penerimaan dan verifikasi dokumen akta hibah.' },
        { tahap: 2, nama: 'Pembukuan Hak', hari: 'Hari 2-4', keterangan: 'Pencatatan balik nama penerima hibah.' },
        { tahap: 3, nama: 'Penyerahan Sertifikat', hari: 'Hari 5', keterangan: 'Sertifikat selesai diserahkan.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Peralihan Hak Hibah', deskripsi: 'Formulir permohonan peralihan hak dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/12nOxPtjaW9NGT8luIwuAQjGB1b2Q8QZI/view?usp=sharing' },
        { namaDokumen: 'Akta Hibah Asli dari PPAT', deskripsi: 'Akta Hibah resmi yang dibuat di hadapan PPAT.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Sertifikat Asli', deskripsi: 'Sertifikat tanah yang dihibahkan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
        { namaDokumen: 'KTP & KK Pemberi & Penerima Hibah', deskripsi: 'Scan identitas para pihak.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
      ],
    },

    // 4. Pelayanan Roya
    {
      kode: 'roya',
      nama: 'Pelayanan Roya (Penghapusan Hak Tanggungan)',
      kategori: 'Roya & Jaminan',
      deskripsi: 'Pencoretan catatan beban Hak Tanggungan pada buku tanah dan sertifikat tanah karena kredit / utang piutang telah lunas.',
      dasarHukum: '1. UU No. 4 Tahun 1996 tentang Hak Tanggungan\n2. PP No. 128 Tahun 2015 (PNBP Rp 50.000 per sertifikat)',
      estimasiHari: 1,
      rumusBiaya: 'Rp 50.000 (Tarif Flat per Hak Tanggungan)',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Layanan cepat (dapat selesai dalam 1 hari kerja jika berkas lengkap dan lunas bayar PNBP).',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Validasi Berkas Pelunasan', hari: 'Hari 1 Pagi', keterangan: 'Pemeriksaan surat roya/keterangan lunas dari Bank/Kreditur.' },
        { tahap: 2, nama: 'Pencoretan Catatan Hak Tanggungan', hari: 'Hari 1 Siang', keterangan: 'Pencoretan stempel beban Hak Tanggungan di lembar buku tanah & sertifikat.' },
        { tahap: 3, nama: 'Penyerahan Sertifikat Bersih', hari: 'Hari 1 Sore', keterangan: 'Sertifikat tanpa beban utang diserahkan kembali ke pemilik.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Permohonan Roya Bermeterai', deskripsi: 'Formulir resmi permohonan Roya dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1p8107FX7IgPfa3gptO0N_2gRHkTfdbeJ/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Tanah Asli', deskripsi: 'Sertifikat hak atas tanah asli (SHM/SHGB/SHP/HMSRS).', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Sertifikat Hak Tanggungan (SHT) Asli', deskripsi: 'Sertifikat Hak Tanggungan lembar asli yang diterbitkan Kantor Pertanahan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
        { namaDokumen: 'Surat Keterangan Lunas (Surat Roya) dari Kreditur/Bank', deskripsi: 'Surat pernyataan pelunasan utang dari Bank/Lembaga Keuangan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
        { namaDokumen: 'KTP Pemilik Sertifikat', deskripsi: 'Scan identitas pemegang hak.', isWajib: true, allowedTypes: 'pdf,jpg,png', maxSizeMB: 5, urutan: 5 },
      ],
    },

    // 5. Sertifikat Hilang
    {
      kode: 'sertifikat-hilang',
      nama: 'Penggantian Sertifikat Karena Hilang',
      kategori: 'Pemeliharaan Sertifikat',
      deskripsi: 'Penerbitan sertifikat pengganti karena sertifikat hak atas tanah asli hilang, didukung surat tanda lapor kehilangan kepolisian dan pengumuman media surat kabar.',
      dasarHukum: '1. PP No. 24 Tahun 1997 Pasal 57-60\n2. Permen ATR/BPN No. 16 Tahun 2021\n3. PP No. 128 Tahun 2015',
      estimasiHari: 40,
      rumusBiaya: 'Rp 50.000 (Pendaftaran) + Rp 200.000 (Sumpah) + Biaya Pengumuman Koran',
      biayaTetap: 250000,
      isBiayaRumus: false,
      keterangan: 'Wajib melalui tahapan pengambilan sumpah oleh Kepala Kantor dan pengumuman di surat kabar harian selama 30 hari kalender tanpa ada sanggahan.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Laporan Kepolisian', hari: 'Hari 1-3', keterangan: 'Pemeriksaan laporan kehilangan dan buku tanah warkah arsip.' },
        { tahap: 2, nama: 'Berita Acara Sumpah Pemohon', hari: 'Hari 4-7', keterangan: 'Pengambilan sumpah pemohon di hadapan pejabat berwenang.' },
        { tahap: 3, nama: 'Pengumuman Media Koran (30 Hari)', hari: 'Hari 8-38', keterangan: 'Pengumuman kehilangan di surat kabar harian dan papan pengumuman resmi.' },
        { tahap: 4, nama: 'Penerbitan Sertifikat Pengganti', hari: 'Hari 39-40', keterangan: 'Pencetakan sertifikat pengganti karena hilang dan penyerahan.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Permohonan Sertifikat Hilang', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon di atas meterai.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1QOX7Jy1JNSMmMCGCPyjFeXZuhR332M1S/view?usp=sharing' },
        { namaDokumen: 'Form Permohonan Pengumuman Koran', deskripsi: 'Formulir permohonan pengumuman sertifikat hilang di media surat kabar harian.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 2, templateUrl: 'https://drive.google.com/file/d/1KLUtsycJrwyxc5dKmKakvsgFTcJKzZYC/view?usp=sharing' },
        { namaDokumen: 'Surat Tanda Penerimaan Laporan Kehilangan (STPLK)', deskripsi: 'Surat kehilangan resmi dari Kepolisian Resor (Polres) setempat.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
        { namaDokumen: 'Fotokopi Sertifikat (Jika Ada)', deskripsi: 'Fotokopi sertifikat yang hilang atau nomor sertifikat dan NIB.', isWajib: false, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
        { namaDokumen: 'KTP & KK Pemohon', deskripsi: 'Scan KTP dan KK pemegang hak.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 5 },
      ],
    },

    // 6. Ganti Blanko Sertifikat
    {
      kode: 'ganti-blanko',
      nama: 'Penggantian Sertifikat Blanko Lama / Rusak',
      kategori: 'Pemeliharaan Sertifikat',
      deskripsi: 'Penggantian blangko sertifikat tanah model lama atau yang telah rusak/robek ke blangko sertifikat terbaru / elektronik demi keamanan arsip dan kepastian hukum.',
      dasarHukum: '1. PP No. 24 Tahun 1997\n2. Permen ATR/BPN No. 3 Tahun 2023 tentang Penerbitan Dokumen Elektronik\n3. PP No. 128 Tahun 2015',
      estimasiHari: 7,
      rumusBiaya: 'Rp 50.000 per sertifikat',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Sertifikat asli yang lama atau rusak wajib diserahkan ke loket untuk ditarik dan digantikan dengan blangko baru.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Penyerahan Berkas & Sertifikat Fisik', hari: 'Hari 1-2', keterangan: 'Verifikasi keaslian fisik sertifikat lama/rusak.' },
        { tahap: 2, nama: 'Pencocokan Buku Tanah & Validasi NIB', hari: 'Hari 3-5', keterangan: 'Sinkronisasi data spasial dan tekstual pada sistem KKP.' },
        { tahap: 3, nama: 'Penerbitan Sertifikat Baru', hari: 'Hari 6-7', keterangan: 'Pencetakan blangko sertifikat baru dan penyerahan.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Ganti Blanko Lama Bermeterai', deskripsi: 'Formulir permohonan sertifikat pengganti karena blanko lama dari Google Drive.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1t7HPGsnIlXm62mc6m9wW-mLzI1yTKVed/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Asli yang Rusak / Blanko Lama', deskripsi: 'Fisik sertifikat tanah yang hendak diganti.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'KTP & KK Pemohon', deskripsi: 'Identitas pemegang hak atas tanah.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },

    // 7. Ganti Nama Sertifikat / Hak Tanggungan / Merger
    {
      kode: 'ganti-nama',
      nama: 'Ganti Nama Pemegang Sertifikat & Hak Tanggungan / Merger',
      kategori: 'Perubahan Data',
      deskripsi: 'Pencatatan perubahan nama pemegang hak perorangan atau badan hukum pada buku tanah dan sertifikat (termasuk ganti nama kreditur & merger perseroan).',
      dasarHukum: '1. PP No. 24 Tahun 1997\n2. UU No. 40 Tahun 2007 tentang Perseroan Terbatas\n3. PP No. 128 Tahun 2015',
      estimasiHari: 5,
      rumusBiaya: 'Rp 50.000 per sertifikat',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Melampirkan bukti penetapan pengadilan atau akta notaris perubahan nama / akta penggabungan (merger).',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Uji Bukti Hukum', hari: 'Hari 1-2', keterangan: 'Validasi dokumen pengadilan atau akta notaris perubahan nama.' },
        { tahap: 2, nama: 'Catatan Perubahan pada Buku Tanah', hari: 'Hari 3-4', keterangan: 'Pencatatan perubahan nama pada lembar sertifikat.' },
        { tahap: 3, nama: 'Penyerahan Sertifikat Selesai', hari: 'Hari 5', keterangan: 'Penyerahan sertifikat dengan nama baru.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pendaftaran Ganti Nama', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1zECI44ie8Vnf8sIQC7ICQOsONl34tB-B/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Hak Atas Tanah Asli', deskripsi: 'Sertifikat tanah yang akan diubah namanya.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Penetapan Pengadilan / Akta Perubahan Nama', deskripsi: 'Dokumen dasar hukum perubahan nama dari pengadilan/notaris/Kemenkumham.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
        { namaDokumen: 'Identitas Pemohon (KTP / Paspor / Akta Badan)', deskripsi: 'Identitas terbaru pemegang hak.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
      ],
    },

    // 8. Pemecahan, Pemisahan dan Penggabungan
    {
      kode: 'pemecahan',
      nama: 'Pemecahan, Pemisahan dan Penggabungan Sertifikat',
      kategori: 'Pemisahan & Penggabungan',
      deskripsi: 'Pelayanan pendaftaran pemecahan satu bidang tanah menjadi beberapa bidang baru, pemisahan sebagian luasan tanah, atau penggabungan beberapa sertifikat yang letaknya berdampingan.',
      dasarHukum: '1. PP No. 24 Tahun 1997 Pasal 48-50\n2. Permen Agraria/BPN No. 3 Tahun 1997\n3. PP No. 128 Tahun 2015',
      estimasiHari: 15,
      rumusBiaya: 'Tarif Pengukuran Bidang Baru + Rp 50.000 per sertifikat baru yang terbit',
      biayaTetap: 100000,
      isBiayaRumus: false,
      keterangan: 'Wajib melampirkan site plan / denah rencana pemecahan tanah dan persetujuan tanda batas para pihak.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Rencana Tapak', hari: 'Hari 1-3', keterangan: 'Verifikasi proposal tapak pecahan / pemisahan / penggabungan.' },
        { tahap: 2, nama: 'Pengukuran Lapangan & NIB Baru', hari: 'Hari 4-9', keterangan: 'Petugas ukur memetakan batas dan menerbitkan Surat Ukur baru.' },
        { tahap: 3, nama: 'Pembukuan & Pencetakan Sertifikat Baru', hari: 'Hari 10-14', keterangan: 'Penerbitan buku tanah baru dan nomor hak baru.' },
        { tahap: 4, nama: 'Penyerahan Sertifikat Hasil', hari: 'Hari 15', keterangan: 'Sertifikat baru diserahkan kepada pemohon.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Permohonan Pemecahan / Pemisahan / Penggabungan', deskripsi: 'Formulir permohonan dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/drive/folders/1xJMggAGzhU11vn2mSxUmDgNtQA7T1l0s' },
        { namaDokumen: 'Sertifikat Tanah Asli', deskripsi: 'Sertifikat induk yang akan dipecah / digabung.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Gambar Rencana Tapak / Sketsa Pemecahan', deskripsi: 'Peta rencana pembagian bidang tanah dengan ukuran rinci.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
        { namaDokumen: 'KTP & KK Pemilik Tanah', deskripsi: 'Identitas pemohon pemegang hak.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
      ],
    },

    // 9. Pengukuran dan Pemetaan Kadastral
    {
      kode: 'pengukuran-kadastral',
      nama: 'Pengukuran dan Pemetaan Kadastral',
      kategori: 'Pengukuran & Pemetaan',
      deskripsi: 'Pelayanan teknis pengukuran batas bidang tanah dan pemetaan kadastral menggunakan alat survei GNSS/Total Station untuk keperluan pendaftaran atau verifikasi batas.',
      dasarHukum: '1. PP No. 24 Tahun 1997\n2. Permen ATR/BPN No. 1 Tahun 2021 tentang Sertifikat Elektronik\n3. PP No. 128 Tahun 2015',
      estimasiHari: 12,
      rumusBiaya: 'Tarif Pengukuran: (Luas / 500) × Rp 80.000 + Biaya Transport & Konsumsi',
      biayaTetap: 100000,
      isBiayaRumus: false,
      keterangan: 'Pemohon wajib memasang patok tanda batas di lokasi dan menghadirkan pemilik tanah yang berbatasan.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Jadwal Survei', hari: 'Hari 1-3', keterangan: 'Penetapan Surat Tugas Pengukuran dan konfirmasi jadwal juru ukur.' },
        { tahap: 2, nama: 'Pengukuran Lapangan', hari: 'Hari 4-6', keterangan: 'Pengambilan koordinat batas bersama tetangga batas.' },
        { tahap: 3, nama: 'Pengolahan Data Spasial & Surat Ukur', hari: 'Hari 7-11', keterangan: 'Penggambaran peta bidang dan penerbitan Surat Ukur (SU).' },
        { tahap: 4, nama: 'Penyerahan Surat Ukur', hari: 'Hari 12', keterangan: 'Surat Ukur selesai disahkan pejabat berwenang.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pengukuran Pemetaan Kadastral 2025', deskripsi: 'Formulir resmi permohonan pengukuran dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1B3JlocHdZHTyReS5N2Zg-MlUi7SdLYmr/view?usp=sharing' },
        { namaDokumen: 'Fotokopi Bukti Kepemilikan Tanah / Sertifikat', deskripsi: 'Bukti alas hak atau sertifikat tanah yang dimohonkan pengukuran.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Surat Pernyataan Pemasangan Tanda Batas', deskripsi: 'Pernyataan patok batas telah terpasang dan disetujui tetangga berbatasan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
        { namaDokumen: 'KTP Pemohon / Kuasa', deskripsi: 'Identitas pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
      ],
    },

    // 10. Pengukuran Pertama Kali
    {
      kode: 'pengukuran-pertama',
      nama: 'Pengukuran Bidang Tanah Pertama Kali',
      kategori: 'Pengukuran & Pemetaan',
      deskripsi: 'Pengukuran bidang tanah yang belum terdaftar (tanah milik adat, girik, bekas hak barat) dalam rangka pendaftaran hak pertama kali.',
      dasarHukum: '1. UU No. 5 Tahun 1960\n2. PP No. 24 Tahun 1997\n3. PP No. 128 Tahun 2015',
      estimasiHari: 14,
      rumusBiaya: 'Tarif PNBP Pengukuran sesuai PP 128/2015',
      biayaTetap: 100000,
      isBiayaRumus: false,
      keterangan: 'Didampingi aparat kelurahan / RT / RW setempat saat penunjukan batas fisik di lokasi.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Telaah Alas Hak', hari: 'Hari 1-4', keterangan: 'Pemeriksaan alas hak girik/letter C dan identifikasi bidang.' },
        { tahap: 2, nama: 'Survei dan Pengukuran Lapangan', hari: 'Hari 5-8', keterangan: 'Pengukuran koordinat batas bidang tanah.' },
        { tahap: 3, nama: 'Peta Bidang Tanah (PBT)', hari: 'Hari 9-14', keterangan: 'Penerbitan Peta Bidang Tanah dan Surat Ukur.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pengukuran Pertama Kali', deskripsi: 'Formulir resmi pengukuran dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/15aWclVQmmIjjGVZTMLigFxlaaq41tzLe/view?usp=sharing' },
        { namaDokumen: 'Fotokopi Girik / Letter C / Alas Hak Lama', deskripsi: 'Bukti riwayat perolehan tanah.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Surat Keterangan Riwayat Tanah dari Kelurahan', deskripsi: 'Surat keterangan lurah tentang riwayat penguasaan tanah.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
        { namaDokumen: 'KTP & KK Pemohon', deskripsi: 'Identitas pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
      ],
    },

    // 11. Pengukuran Ulang
    {
      kode: 'pengukuran-ulang',
      nama: 'Pengukuran Ulang Bidang Tanah',
      kategori: 'Pengukuran & Pemetaan',
      deskripsi: 'Pengukuran kembali bidang tanah bersertifikat untuk memastikan luasan dan letak batas fisik tanah terkini.',
      dasarHukum: '1. PP No. 24 Tahun 1997\n2. PP No. 128 Tahun 2015',
      estimasiHari: 12,
      rumusBiaya: 'Tarif Pengukuran PP 128/2015',
      biayaTetap: 100000,
      isBiayaRumus: false,
      keterangan: 'Jika terdapat selisih atau kelebihan luas, pemohon wajib mengisi Surat Pernyataan Kelebihan Luas dari Google Drive.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Verifikasi Sertifikat', hari: 'Hari 1-3', keterangan: 'Pemeriksaan surat ukur lama pada warkah arsip.' },
        { tahap: 2, nama: 'Pengukuran Ulang Lapangan', hari: 'Hari 4-7', keterangan: 'Pencocokan fisik batas tanah di lapangan.' },
        { tahap: 3, nama: 'Berita Acara & Surat Ukur Baru', hari: 'Hari 8-12', keterangan: 'Penerbitan berita acara hasil pengukuran ulang.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pengukuran Ulang', deskripsi: 'Formulir permohonan dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/16uGeatq7ofFLcdbCD-Jqkmkx2cKlz7iM/view?usp=sharing' },
        { namaDokumen: 'Surat Pernyataan Kelebihan Luas', deskripsi: 'Surat pernyataan bermeterai apabila terjadi kelebihan luasan tanah.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 2, templateUrl: 'https://drive.google.com/file/d/19xwuK2XnGPeXG_lTTtUENDeCRqRcqZ5b/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Tanah Asli', deskripsi: 'Sertifikat yang dimohonkan pengukuran ulang.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
        { namaDokumen: 'KTP Pemohon', deskripsi: 'Identitas pemegang hak.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
      ],
    },

    // 12. Penataan Batas
    {
      kode: 'penataan-batas',
      nama: 'Penataan Batas Bidang Tanah',
      kategori: 'Pengukuran & Pemetaan',
      deskripsi: 'Penataan kembali letak dan bentuk batas-batas bidang tanah yang berbatasan untuk kesesuaian tertib administrasi pertanahan.',
      dasarHukum: '1. PP No. 24 Tahun 1997\n2. PP No. 128 Tahun 2015',
      estimasiHari: 12,
      rumusBiaya: 'Tarif Pengukuran PP 128/2015',
      biayaTetap: 100000,
      isBiayaRumus: false,
      keterangan: 'Memerlukan kesepakatan tertulis bersama dengan seluruh tetangga yang berbatasan langsung.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Kesepakatan Batas', hari: 'Hari 1-3', keterangan: 'Verifikasi berkas persetujuan tetangga batas.' },
        { tahap: 2, nama: 'Penetapan Tanda Batas di Lokasi', hari: 'Hari 4-8', keterangan: 'Pemasangan patok batas definitif bersama juru ukur.' },
        { tahap: 3, nama: 'Pengesahan Gambar Ukur Baru', hari: 'Hari 9-12', keterangan: 'Pengesahan dan pembukuan perubahan batas tanah.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Penataan Batas 2025', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1HuvrUFvLP2xb3GIWWQMnFmj5ICVuir7k/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Tanah Asli', deskripsi: 'Sertifikat tanah yang bersangkutan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Surat Persetujuan Tetangga Berbatasan', deskripsi: 'Surat persetujuan batas yang ditandatangani para pemilik tanah perbatasan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },

    // 13. Pengembalian Batas
    {
      kode: 'pengembalian-batas',
      nama: 'Pengembalian Batas Bidang Tanah',
      kategori: 'Pengukuran & Pemetaan',
      deskripsi: 'Rekonstruksi dan pengembalian titik patok batas tanah yang hilang atau bergeser berdasarkan data koordinat Surat Ukur resmi terdahulu.',
      dasarHukum: '1. PP No. 24 Tahun 1997\n2. PP No. 128 Tahun 2015',
      estimasiHari: 10,
      rumusBiaya: 'Tarif Pengembalian Batas PP 128/2015',
      biayaTetap: 100000,
      isBiayaRumus: false,
      keterangan: 'Sangat dianjurkan untuk menyelesaikan keraguan batas dengan tetangga secara resmi dan transparan.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pengecekan Arsip Surat Ukur', hari: 'Hari 1-2', keterangan: 'Penarikan data koordinat awal dari warkah ukur.' },
        { tahap: 2, nama: 'Rekonstruksi Titik Batas di Lapangan', hari: 'Hari 3-6', keterangan: 'Penentuan titik koordinat dengan GNSS Geodetik.' },
        { tahap: 3, nama: 'Berita Acara Pengembalian Batas', hari: 'Hari 7-10', keterangan: 'Penerbitan Berita Acara resmi pengembalian patok batas.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pengembalian Batas 2025', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1kqbdzcG4ifhJ4nzXvv7FrNZPtbbvN2uE/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Tanah Asli', deskripsi: 'Sertifikat yang dimohonkan pengembalian batas.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'KTP Pemohon', deskripsi: 'Scan identitas pemegang hak.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },

    // 14. Kesesuaian Letak Bidang Tanah
    {
      kode: 'kesesuaian-letak',
      nama: 'Pemeriksaan Kesesuaian Letak Bidang Tanah',
      kategori: 'Pengukuran & Pemetaan',
      deskripsi: 'Verifikasi kesesuaian letak spasial bidang tanah bersertifikat terhadap rencana tata ruang (RTRW / RDTR) dan batas administrasi kewilayahan.',
      dasarHukum: '1. PP No. 24 Tahun 1997\n2. UU No. 26 Tahun 2007 tentang Penataan Ruang',
      estimasiHari: 7,
      rumusBiaya: 'Rp 50.000 per permohonan',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Menggunakan FORM 1 dan FORM 2 Kesesuaian Letak dari Google Drive.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Penerimaan Berkas Form 1 & 2', hari: 'Hari 1-2', keterangan: 'Pemeriksaan koordinat letak tanah dan sertifikat.' },
        { tahap: 2, nama: 'Plotting Spasial GIS', hari: 'Hari 3-5', keterangan: 'Tumpang susun bidang tanah pada peta digital tata ruang.' },
        { tahap: 3, nama: 'Surat Keterangan Kesesuaian Letak', hari: 'Hari 6-7', keterangan: 'Penerbitan surat hasil pemeriksaan kesesuaian letak.' },
      ]),
      persyaratan: [
        { namaDokumen: 'FORM 1 Kesesuaian Letak', deskripsi: 'Formulir 1 Kesesuaian Letak Bidang Tanah dari Google Drive.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/15TDDUV58oXGzjjrzADKHd9W1zThvqcJN/view?usp=sharing' },
        { namaDokumen: 'FORM 2 Kesesuaian Letak', deskripsi: 'Formulir 2 Kesesuaian Letak Bidang Tanah dari Google Drive.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 2, templateUrl: 'https://drive.google.com/file/d/1nIj23C3jrUXqKKbNaHnX90nyGXZDdLDj/view?usp=sharing' },
        { namaDokumen: 'Fotokopi Sertifikat Tanah', deskripsi: 'Scan lembar sertifikat dan surat ukur.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
      ],
    },

    // 15. Permohonan SK Pemberian Hak
    {
      kode: 'permohonan-sk',
      nama: 'Permohonan SK Pemberian Hak Atas Tanah',
      kategori: 'Pemberian Hak',
      deskripsi: 'Permohonan penerbitan Surat Keputusan (SK) Pemberian Hak atas tanah negara (Hak Milik, Hak Guna Bangunan, atau Hak Pakai).',
      dasarHukum: '1. Permen ATR/BPN No. 18 Tahun 2021 tentang Tata Cara Penetapan Hak Pengelolaan dan Hak Atas Tanah\n2. PP No. 128 Tahun 2015',
      estimasiHari: 30,
      rumusBiaya: 'Tarif Pelayanan Panitia Pemeriksaan Tanah A / B sesuai PP 128/2015',
      biayaTetap: 200000,
      isBiayaRumus: false,
      keterangan: 'Melalui pemeriksaan sidang Panitia Pemeriksaan Tanah (Panitia A / Panitia B) di lapangan.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Telaah Yuridis', hari: 'Hari 1-7', keterangan: 'Pemeriksaan status penguasaan fisik tanah negara.' },
        { tahap: 2, nama: 'Sidang Pemeriksaan Lapangan (Panitia A)', hari: 'Hari 8-20', keterangan: 'Pemeriksaan lapangan dan penandatanganan risalah panitia.' },
        { tahap: 3, nama: 'Penerbitan SK Pemberian Hak', hari: 'Hari 21-30', keterangan: 'Penandatanganan SK Pemberian Hak oleh Kepala Kantor.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pemberian Hak Terbaru', deskripsi: 'Formulir resmi permohonan pemberian hak dari Google Drive bermeterai.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1Jjo-6IKIFVnn_r235z8ZVq1lOYRssEwe/view?usp=sharing' },
        { namaDokumen: 'Surat Pernyataan Permohonan SK 2026', deskripsi: 'Surat pernyataan permohonan SK terbaru tahun 2026 dari Google Drive.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 2, templateUrl: 'https://drive.google.com/file/d/1nBNjMzxFiliNCj29ZjX8S0CxyVoes_h1/view?usp=sharing' },
        { namaDokumen: 'Peta Bidang Tanah (PBT)', deskripsi: 'Peta Bidang Tanah hasil pengukuran kadastral yang masih berlaku.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
        { namaDokumen: 'Bukti Perolehan / Penguasaan Fisik Tanah', deskripsi: 'Surat pelepasan hak / alas hak penguasaan tanah negara.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 4 },
        { namaDokumen: 'KTP & KK Pemohon', deskripsi: 'Identitas pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 5 },
      ],
    },

    // 16. Pendaftaran SK Hak
    {
      kode: 'pendaftaran-sk',
      nama: 'Pendaftaran SK Hak Atas Tanah',
      kategori: 'Pemberian Hak',
      deskripsi: 'Pendaftaran dan pembukuan Surat Keputusan (SK) Pemberian Hak menjadi Sertifikat Hak Atas Tanah resmi.',
      dasarHukum: '1. PP No. 24 Tahun 1997\n2. Permen ATR/BPN No. 18 Tahun 2021\n3. PP No. 128 Tahun 2015',
      estimasiHari: 7,
      rumusBiaya: 'Rp 50.000 (Pendaftaran Hak)',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Wajib melampirkan SK Asli dan bukti lunas Uang Pemasukan ke Kas Negara / BPHTB.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran SK & Validasi Setoran', hari: 'Hari 1-2', keterangan: 'Verifikasi bukti setor uang pemasukan negara.' },
        { tahap: 2, nama: 'Pembukuan Buku Tanah', hari: 'Hari 3-5', keterangan: 'Pencatatan data yuridis SK ke buku tanah elektronik.' },
        { tahap: 3, nama: 'Penyerahan Sertifikat Pertama', hari: 'Hari 6-7', keterangan: 'Penerbitan dan penyerahan sertifikat.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pendaftaran SK', deskripsi: 'Form pendaftaran SK dari Google Drive bermeterai.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1bRcOo1-jwk1I9_yQxqeyLbVT78VyGBBH/view?usp=sharing' },
        { namaDokumen: 'SK Pemberian Hak Asli', deskripsi: 'Surat Keputusan Pemberian Hak lembar asli.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Bukti Bayar Uang Pemasukan Negara & BPHTB', deskripsi: 'Bukti setoran PNBP pemasukan negara dan validasi BPHTB.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },

    // 17. Perpanjangan SK Hak
    {
      kode: 'perpanjangan-sk',
      nama: 'Perpanjangan dan Pembaruan SK Hak',
      kategori: 'Perpanjangan Hak',
      deskripsi: 'Perpanjangan jangka waktu atau pembaruan hak atas tanah (Hak Guna Bangunan, Hak Pakai, Hak Guna Usaha) sebelum atau sesudah hak berakhir.',
      dasarHukum: '1. PP No. 18 Tahun 2021 tentang Hak Pengelolaan, Hak Atas Tanah, Satuan Rumah Susun\n2. PP No. 128 Tahun 2015',
      estimasiHari: 25,
      rumusBiaya: 'Tarif Pelayanan Pemeriksaan Tanah sesuai PP 128/2015',
      biayaTetap: 150000,
      isBiayaRumus: false,
      keterangan: 'Permohonan perpanjangan dapat diajukan paling lambat 2 tahun sebelum jangka waktu hak berakhir.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pengajuan & Verifikasi Syarat', hari: 'Hari 1-5', keterangan: 'Pemeriksaan status penggunaan tanah saat ini.' },
        { tahap: 2, nama: 'Peninjauan Lapangan', hari: 'Hari 6-15', keterangan: 'Pengecekan tanah masih dimanfaatkan sesuai peruntukan.' },
        { tahap: 3, nama: 'Penerbitan SK Perpanjangan', hari: 'Hari 16-25', keterangan: 'Penerbitan SK Perpanjangan Hak.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Permohonan SK Perpanjangan-Pembaruan', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1T7BDCRQ6oucC3fZ6Ci47112MI8l4NvCg/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Hak Atas Tanah Asli', deskripsi: 'Sertifikat HGB/HP yang hendak diperpanjang.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'SPPT PBB Tahun Berjalan', deskripsi: 'Bukti lunas PBB tahun berjalan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },

    // 18. Peningkatan Hak dengan SK Kepala Kantor
    {
      kode: 'peningkatan-hak',
      nama: 'Peningkatan Hak Milik dengan SK Kepala Kantor',
      kategori: 'Peningkatan Hak',
      deskripsi: 'Peningkatan jenis hak atas tanah dari Hak Guna Bangunan (HGB) atau Hak Pakai (HP) rumah tinggal menjadi Hak Milik (HM) milik WNI.',
      dasarHukum: '1. Keputusan Menteri Negara Agraria/Kepala BPN No. 6 Tahun 1998\n2. PP No. 128 Tahun 2015',
      estimasiHari: 5,
      rumusBiaya: 'Rp 50.000 per sertifikat (Untuk luas s.d 600 m²)',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Hanya berlaku untuk tanah peruntukan rumah tinggal kepemilikan Warga Negara Indonesia (WNI) luasan sampai dengan 600 m².',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Uji Syarat WNI', hari: 'Hari 1-2', keterangan: 'Pemeriksaan KTP WNI dan IMB/PBG rumah tinggal.' },
        { tahap: 2, nama: 'SK Peningkatan & Pembukuan Hak Milik', hari: 'Hari 3-4', keterangan: 'Penerbitan SK peningkatan hak dan pencatatan buku tanah HM.' },
        { tahap: 3, nama: 'Penyerahan Sertifikat Hak Milik', hari: 'Hari 5', keterangan: 'Sertifikat Hak Milik diserahkan kepada pemohon.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Peningkatan Hak Milik', deskripsi: 'Formulir peningkatan hak milik resmi dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1X1c6Bc2d1khqSDtX_aRPot7BR5hapSgz/view?usp=sharing' },
        { namaDokumen: 'Sertifikat HGB / Hak Pakai Asli', deskripsi: 'Sertifikat asli yang dimohonkan peningkatan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Fotokopi IMB / PBG Rumah Tinggal', deskripsi: 'Izin Mendirikan Bangunan atau bukti fisik rumah tinggal.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
        { namaDokumen: 'KTP & KK Pemohon (WNI)', deskripsi: 'Identitas pemohon berkewarganegaraan Indonesia.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
      ],
    },

    // 19. Perubahan Hak (Peningkatan / Penurunan Hak)
    {
      kode: 'perubahan-hak',
      nama: 'Perubahan Hak (Peningkatan / Penurunan Hak)',
      kategori: 'Peningkatan Hak',
      deskripsi: 'Perubahan jenis hak atas tanah, baik peningkatan jenis hak maupun penurunan hak (misal Hak Milik dialihkan ke Badan Hukum menjadi HGB).',
      dasarHukum: '1. UU No. 5 Tahun 1960\n2. PP No. 18 Tahun 2021\n3. PP No. 128 Tahun 2015',
      estimasiHari: 7,
      rumusBiaya: 'Rp 50.000 per sertifikat',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Tersedia formulir peningkatan hak dan formulir penurunan hak sesuai kebutuhan pemohon pada Google Drive.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Verifikasi Berkas Perubahan', hari: 'Hari 1-2', keterangan: 'Pemeriksaan dasar alasan perubahan status hak.' },
        { tahap: 2, nama: 'Pencatatan Konversi Hak', hari: 'Hari 3-5', keterangan: 'Pencatatan jenis hak baru pada buku tanah.' },
        { tahap: 3, nama: 'Penyerahan Sertifikat', hari: 'Hari 6-7', keterangan: 'Sertifikat jenis hak baru diserahkan.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Peningkatan Hak / Penurunan Hak', deskripsi: 'Pilih formulir peningkatan atau penurunan hak resmi dari Google Drive.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1RwkoP-vTC033z7W3nQCsjal5Xv69fBTO/view?usp=sharing' },
        { namaDokumen: 'Sertifikat Tanah Asli', deskripsi: 'Sertifikat tanah yang dimohonkan perubahan jenis hak.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Identitas Pemohon / Badan Hukum', deskripsi: 'Identitas perorangan atau akta pendirian badan hukum.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },

    // 20. Pengakuan Hak
    {
      kode: 'pengakuan-hak',
      nama: 'Pengakuan Hak Atas Tanah',
      kategori: 'Pengakuan Hak',
      deskripsi: 'Pendaftaran pengakuan hak atas tanah yang telah dikuasai secara fisik dan beriktikad baik selama 20 tahun atau lebih berturut-turut.',
      dasarHukum: '1. PP No. 24 Tahun 1997 Pasal 24 ayat (2)\n2. PP No. 128 Tahun 2015',
      estimasiHari: 35,
      rumusBiaya: 'Tarif Panitia Pemeriksaan Tanah + Rp 50.000',
      biayaTetap: 150000,
      isBiayaRumus: false,
      keterangan: 'Memerlukan surat pernyataan penguasaan fisik tanah bermeterai dan kesaksian tertulis tetangga batas.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Verifikasi Bukti Fisik', hari: 'Hari 1-7', keterangan: 'Pemeriksaan riwayat penguasaan fisik tanah.' },
        { tahap: 2, nama: 'Pemeriksaan Panitia A & Pengumuman', hari: 'Hari 8-28', keterangan: 'Pemeriksaan lapangan dan pengumuman sanggahan 14/30 hari.' },
        { tahap: 3, nama: 'Penerbitan Sertifikat Pengakuan Hak', hari: 'Hari 29-35', keterangan: 'Pembukuan buku tanah dan penerbitan sertifikat.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pengakuan Hak Bermeterai', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1xyqMFLeZw-wlTdo4dQrdT7-x9Dlaq1-h/view?usp=sharing' },
        { namaDokumen: 'Surat Pernyataan Penguasaan Fisik Bidang Tanah (Sporadik)', deskripsi: 'Pernyataan bermeterai disaksikan minimal 2 orang saksi warga setempat.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 2 },
        { namaDokumen: 'Peta Bidang Tanah (PBT)', deskripsi: 'Peta bidang hasil pengukuran kadastral.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
        { namaDokumen: 'KTP & KK Pemohon', deskripsi: 'Identitas pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 4 },
      ],
    },

    // 21. Penegasan Hak Verponding Indonesia / Adat
    {
      kode: 'penegasan-hak-verponding',
      nama: 'Penegasan Hak Pertama Kali (Verponding Indonesia / Adat)',
      kategori: 'Pengakuan Hak',
      deskripsi: 'Pendaftaran penegasan konversi hak atas tanah bekas hak lama (Verponding Indonesia, Tanah Milik Adat, Girik) menjadi sertifikat resmi.',
      dasarHukum: '1. UU No. 5 Tahun 1960 (Diktum Kedua Konversi)\n2. PP No. 24 Tahun 1997\n3. PP No. 128 Tahun 2015',
      estimasiHari: 35,
      rumusBiaya: 'Tarif Pemeriksaan Tanah + Rp 50.000',
      biayaTetap: 150000,
      isBiayaRumus: false,
      keterangan: 'Wajib menyertakan bukti asli warkah Verponding Indonesia / Girik / Petuk Pajak Bumi dan riwayat tanah tidak terputus.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Penelitian Dokumen Alas Hak Lama', hari: 'Hari 1-7', keterangan: 'Uji keaslian warkah verponding / girik pada arsip perpajakan lama.' },
        { tahap: 2, nama: 'Pemeriksaan Panitia A & Pengumuman', hari: 'Hari 8-28', keterangan: 'Pengumuman terbuka kepada publik selama jangka waktu yang ditentukan.' },
        { tahap: 3, nama: 'Penegasan Hak & Sertifikat Terbit', hari: 'Hari 29-35', keterangan: 'Penerbitan Sertifikat Hak Milik hasil penegasan hak.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Penegasan Hak Baru 2025', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1NY5_zQipOxfqRO-qnpi5QnflOCfot-TB/view?usp=sharing' },
        { namaDokumen: 'Bukti Asli Alas Hak Lama (Verponding/Girik)', deskripsi: 'Warkah asli bukti kepemilikan tanah sebelum UUPA 1960.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Surat Keterangan Riwayat Tanah dari Kelurahan', deskripsi: 'Surat keterangan lurah tentang riwayat penguasaan fisik.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },

    // 22. Pertimbangan Teknis Pertanahan
    {
      kode: 'pertimbangan-teknis',
      nama: 'Pertimbangan Teknis Pertanahan (PTP)',
      kategori: 'Pertimbangan Teknis',
      deskripsi: 'Pemberian rekomendasi pertimbangan teknis pertanahan dalam rangka perizinan berusaha, Persetujuan Bangunan Gedung (PBG), atau penetapan lokasi kegiatan pembangunan.',
      dasarHukum: '1. PP No. 21 Tahun 2021 tentang Penyelenggaraan Penataan Ruang\n2. Permen ATR/BPN No. 12 Tahun 2021\n3. PP No. 128 Tahun 2015',
      estimasiHari: 10,
      rumusBiaya: 'Tarif PTP sesuai luasan kegiatan perizinan (PP 128/2015)',
      biayaTetap: 250000,
      isBiayaRumus: false,
      keterangan: 'Tersedia dokumen formulir dan syarat permohonan pertimbangan teknis pertanahan resmi pada Google Drive.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran Berkas & Proposal', hari: 'Hari 1-3', keterangan: 'Pemeriksaan proposal rencana tata ruang dan tapak pemohon.' },
        { tahap: 2, nama: 'Analisis Teknis Spasial PTP', hari: 'Hari 4-7', keterangan: 'Analisis ketersediaan tanah dan kesesuaian ruang wilayah.' },
        { tahap: 3, nama: 'Penerbitan Risalah PTP', hari: 'Hari 8-10', keterangan: 'Penerbitan surat risalah Pertimbangan Teknis Pertanahan.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pertimbangan Teknis Pertanahan', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1CHKKaNPG8LLh8_QaZDCjncXocSwCbE9H/view?usp=sharing' },
        { namaDokumen: 'Syarat Permohonan Pertimbangan Teknis Pertanahan', deskripsi: 'Petunjuk dan syarat kelengkapan PTP resmi dari Google Drive.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 2, templateUrl: 'https://drive.google.com/file/d/1fEktod5Wu23WFmXjlXquu-pwhvm9c4IC/view?usp=sharing' },
        { namaDokumen: 'Proposal Rencana Kegiatan / Izin Berusaha', deskripsi: 'Rencana tapak dan peruntukan pemanfaatan tanah.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 15, urutan: 3 },
      ],
    },

    // 23. Blokir dan Pencabutan Blokir
    {
      kode: 'blokir-cabut-blokir',
      nama: 'Blokir dan Pencabutan Blokir Sertifikat',
      kategori: 'Catatan Hukum & Sengketa',
      deskripsi: 'Pencatatan blokir sengketa tanah untuk melindungi hak pihak yang berkepentingan serta pelayanan pencabutan blokir sertifikat.',
      dasarHukum: '1. Permen ATR/BPN No. 13 Tahun 2017 tentang Tata Cara Blokir, Sita dan Pengangkatan Sita\n2. PP No. 128 Tahun 2015',
      estimasiHari: 3,
      rumusBiaya: 'Rp 50.000 (Pendaftaran Catatan Blokir)',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Blokir perorangan berlaku maksimal 30 hari kalender jika tidak ditindaklanjuti dengan gugatan di pengadilan.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Uji Kepentingan Hukum Pemohon', hari: 'Hari 1', keterangan: 'Pemeriksaan bukti hubungan hukum dan potensi sengketa.' },
        { tahap: 2, nama: 'Pencatatan Blokir pada Buku Tanah', hari: 'Hari 2', keterangan: 'Pembukuan catatan blokir sistem KKP dan buku tanah.' },
        { tahap: 3, nama: 'Surat Pemberitahuan Blokir', hari: 'Hari 3', keterangan: 'Penerbitan surat keterangan pencatatan/pencabutan blokir.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Pendaftaran Blokir / Cabut Blokir', deskripsi: 'Formulir pendaftaran blokir atau cabut blokir resmi dari Google Drive.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1-fq0XrsDxlRC_xXCFjUx7JyUbXJP3evZ/view?usp=sharing' },
        { namaDokumen: 'Bukti Hubungan Hukum / Sengketa', deskripsi: 'Bukti gugatan pengadilan, laporan kepolisian, atau surat kesepakatan damai (untuk cabut blokir).', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'KTP Pemohon Blokir / Kuasa Hukum', deskripsi: 'Identitas pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },

    // 24. Sita dan Angkat Sita
    {
      kode: 'sita-angkat-sita',
      nama: 'Sita dan Pengangkatan Sita Sertifikat',
      kategori: 'Catatan Hukum & Sengketa',
      deskripsi: 'Pencatatan sita jaminan / sita eksekusi berdasarkan penetapan pengadilan serta pelayanan pengangkatan sita sertifikat tanah.',
      dasarHukum: '1. Permen ATR/BPN No. 13 Tahun 2017\n2. PP No. 128 Tahun 2015',
      estimasiHari: 3,
      rumusBiaya: 'Rp 50.000 per catatan',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Diajukan atas dasar Penetapan Pengadilan Negeri / Agama / TUN / Panitia Urusan Piutang Negara.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Penerimaan Berita Acara Sita Pengadilan', hari: 'Hari 1', keterangan: 'Validasi penetapan sita dan panitera pengadilan.' },
        { tahap: 2, nama: 'Pencatatan Sita pada Buku Tanah', hari: 'Hari 2', keterangan: 'Pencatatan sita pada buku tanah dan sertifikat.' },
        { tahap: 3, nama: 'Konfirmasi Resmi ke Pengadilan', hari: 'Hari 3', keterangan: 'Penerbitan surat konfirmasi pencatatan/pengangkatan sita.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir Sita / Angkat Sita', deskripsi: 'Formulir resmi dari Google Drive bertanda tangan pemohon/kuasa.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1rCt4SId1G3a53tyqOPLw2fQzbNjrMal3/view?usp=sharing' },
        { namaDokumen: 'Penetapan / Putusan Pengadilan Asli', deskripsi: 'Salinan resmi penetapan sita atau penetapan pengangkatan sita dari pengadilan.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'Berita Acara Sita dari Jurusita Pengadilan', deskripsi: 'Berita acara pelaksanaan sita jaminan / eksekusi.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 3 },
      ],
    },

    // 25. Surat Keterangan Pendaftaran Tanah (SKPT)
    {
      kode: 'skpt',
      nama: 'Surat Keterangan Pendaftaran Tanah (SKPT)',
      kategori: 'Informasi & Pengecekan',
      deskripsi: 'Penerbitan surat keterangan resmi mengenai status hukum, riwayat pendaftaran, beban ikatan, dan catatan sita suatu bidang tanah.',
      dasarHukum: '1. PP No. 24 Tahun 1997 Pasal 34\n2. PP No. 128 Tahun 2015 (Tarif Rp 50.000 per sertifikat)',
      estimasiHari: 1,
      rumusBiaya: 'Rp 50.000 per permohonan',
      biayaTetap: 50000,
      isBiayaRumus: false,
      keterangan: 'Layanan cepat 1 hari kerja untuk kepentingan pembuatan akta PPAT, lelang, perbankan, atau pembuktian di pengadilan.',
      alurProses: JSON.stringify([
        { tahap: 1, nama: 'Pendaftaran & Penarikan Buku Tanah', hari: 'Hari 1 Pagi', keterangan: 'Pemeriksaan status keaktifan buku tanah arsip.' },
        { tahap: 2, nama: 'Pencetakan Lembar SKPT', hari: 'Hari 1 Siang', keterangan: 'Penyusunan riwayat hukum bidang tanah.' },
        { tahap: 3, nama: 'Penyerahan SKPT Resmi', hari: 'Hari 1 Sore', keterangan: 'SKPT ditandatangani dan diserahkan kepada pemohon.' },
      ]),
      persyaratan: [
        { namaDokumen: 'Formulir SKPT Pemohon Langsung Terbaru', deskripsi: 'Formulir resmi SKPT dari Google Drive bertanda tangan pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 1, templateUrl: 'https://drive.google.com/file/d/1lAG0YYoNftfOjlQ-ULvOdcV0Y0q25x5K/view?usp=sharing' },
        { namaDokumen: 'Fotokopi Sertifikat Tanah', deskripsi: 'Fotokopi sertifikat yang dimohonkan SKPT.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 10, urutan: 2 },
        { namaDokumen: 'KTP Pemohon / Kuasa', deskripsi: 'Scan identitas pemohon.', isWajib: true, allowedTypes: 'pdf', maxSizeMB: 5, urutan: 3 },
      ],
    },
  ];

  for (const s of servicesData) {
    const { persyaratan, ...serviceField } = s;
    await prisma.service.create({
      data: {
        ...serviceField,
        persyaratan: {
          create: persyaratan,
        },
      },
    });
  }

  console.log(`Seeding completed successfully! Total services seeded: ${servicesData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
