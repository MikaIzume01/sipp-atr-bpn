import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ServiceCatalog from '@/components/ServiceCatalog';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LayananIndexPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      persyaratan: {
        orderBy: { urutan: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="bg-slate-50 min-h-screen py-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-800">Katalog Informasi Layanan</span>
        </nav>

        {/* Service Catalog Component */}
        <ServiceCatalog services={services} />
      </div>
    </div>
  );
}
