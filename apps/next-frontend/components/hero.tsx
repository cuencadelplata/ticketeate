'use client';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { NavbarMain } from './navbar-main';

export function Hero() {
  return (
    <div>
      <section className="relative h-screen overflow-hidden dark:text-white">
        <div className="z-20 grid grid-cols-3 items-center bg-transparent px-12 py-4">
          <div className="flex items-center">
            <Image
              src="/wordmark-ticketeate.png"
              alt="Wordmark logo"
              width={80}
              height={10}
              className="z-20"
            />
          </div>

          <div className="flex justify-center">
            <NavbarMain />
          </div>

          <div></div>
        </div>

        <video
          autoPlay
          loop
          muted
          playsInline
          src="https://ease-one.vercel.app/bg/something.mp4"
          className="z-2 absolute left-0 top-0 h-full w-full object-cover opacity-40"
        />

        <div className="z-5 relative mx-auto px-12 sm:px-6 md:px-0">
          <div className="pb-12 pt-4 md:pt-28">
            <div className="pb-6 text-center md:pb-16">
              <h1
                className="mx-auto mb-6 max-w-3xl border-y text-5xl font-normal tracking-tighter [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.),transparent)1] dark:border-none md:text-6xl"
                data-aos="zoom-y-out"
                data-aos-delay={150}
              >
                Eventos sin límites, infraestructura sin complicaciones.
              </h1>
              <div className="relative mx-auto max-w-3xl">
                <p className="mb-8 text-lg text-white" data-aos="zoom-y-out" data-aos-delay={300}>
                  Crea, gestiona y vende entradas en minutos con Ticketeate.
                </p>
                <div
                  className="absolute left-0 top-0 h-80 w-[90%] overflow-x-hidden bg-[rgb(54,157,253)] bg-opacity-40 opacity-60 blur-[337.4px]"
                  style={{ transform: 'rotate(-30deg)' }}
                />
                <div className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] dark:before:border-none">
                  <div
                    className="z-20 mx-auto mb-[20px] mt-[-20px] max-w-xs items-center gap-5 sm:flex sm:max-w-none sm:justify-center"
                    data-aos="zoom-y-out"
                    data-aos-delay={450}
                  >
                    <Link
                      href="/crear"
                      className="bg-page-gradient text-md font-geistSans group ml-3 mt-2 inline-flex w-fit items-center justify-center gap-x-2 rounded-xl border border-white/30 px-5 py-3 text-lg text-white backdrop-blur-md duration-200 hover:border-zinc-600 hover:bg-transparent/10 hover:text-zinc-100"
                    >
                      Crear tu primer evento
                      <div className="relative ml-1 flex h-5 w-5 items-center justify-center overflow-hidden">
                        <ArrowUpRight className="absolute transition-all duration-500 group-hover:-translate-y-5 group-hover:translate-x-4" />
                        <ArrowUpRight className="absolute -translate-x-4 -translate-y-5 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
