'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PixelBlast from './pixel-blast';

export function Hero() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] lg:min-h-[80vh] flex items-center pt-10">
      {/* Capas de fondo */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden">
        {/* Imagen de fondo con baja opacidad */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(/ticketeate-hero.webp)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />

        {/* Gradiente oscuro para fusionar */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        {/* PixelBlast encima */}
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#c9400e"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent={false}
          className="!w-full !h-full mix-blend-screen"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            opacity: 0.85,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-16 w-full relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Contenido de texto y botones centrado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 max-w-4xl"
          >
            {/* Título principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl font-normal tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-instrument-serif"
            >
              <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
                Eventos sin{' '}
              </span>
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent italic inline-block px-1 font-instrument-serif">
                límites
              </span>
              ,
              <br />
              <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
                gestión sin{' '}
              </span>
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent italic inline-block px-1 font-instrument-serif">
                complicaciones
              </span>
              .
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-md text-gray-200 sm:text-lg max-w-2xl mx-auto"
            >
              Crea, gestiona y vende entradas en minutos con{' '}
              <span className="text-white">Ticketeate</span>.
            </motion.p>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/crear"
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2 text-base font-semibold text-white shadow-xl shadow-orange-500/30 transition-all duration-300  hover:shadow-2xl hover:shadow-orange-500/40 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 transition-opacity duration-300"></span>
                <span className="relative">Crear tu primer evento</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <title>sparkle</title>
                  <g fill="none">
                    <path
                      d="M13 9.00531C13.5522 9.00531 13.9999 9.45308 14 10.0053V12.0053H16C16.5522 12.0053 16.9999 12.4531 17 13.0053C16.9998 13.5574 16.5521 14.0053 16 14.0053H14V16.0053C13.9998 16.5574 13.5521 17.0053 13 17.0053C12.4479 17.0053 12.0002 16.5574 12 16.0053V14.0053H10C9.44791 14.0053 9.00025 13.5574 9 13.0053C9.00007 12.4531 9.4478 12.0054 10 12.0053H12V10.0053C12.0001 9.45311 12.4478 9.00536 13 9.00531ZM6.07031 1.34125C6.4044 0.499912 7.59575 0.499853 7.92969 1.34125L9.25 4.66937C9.26453 4.70571 9.29373 4.73396 9.33008 4.74847L12.6592 6.07074C13.5005 6.40477 13.5005 7.59509 12.6592 7.92914L9.33008 9.2514C9.29374 9.2659 9.26454 9.29419 9.25 9.33051L7.92969 12.6586C7.59575 13.5 6.4044 13.5 6.07031 12.6586L4.74902 9.33051C4.73446 9.29418 4.70531 9.26588 4.66895 9.2514L1.34082 7.92914C0.49956 7.59509 0.49956 6.40479 1.34082 6.07074L4.66895 4.74847C4.70533 4.73399 4.73447 4.70572 4.74902 4.66937L6.07031 1.34125Z"
                      fill="url(#1752500502803-7613136_sparkle_existing_0_mj429roqu)"
                      data-glass="origin"
                      mask="url(#1752500502803-7613136_sparkle_mask_90yh9c2fr)"
                    ></path>
                    <path
                      d="M13 9.00531C13.5522 9.00531 13.9999 9.45308 14 10.0053V12.0053H16C16.5522 12.0053 16.9999 12.4531 17 13.0053C16.9998 13.5574 16.5521 14.0053 16 14.0053H14V16.0053C13.9998 16.5574 13.5521 17.0053 13 17.0053C12.4479 17.0053 12.0002 16.5574 12 16.0053V14.0053H10C9.44791 14.0053 9.00025 13.5574 9 13.0053C9.00007 12.4531 9.4478 12.0054 10 12.0053H12V10.0053C12.0001 9.45311 12.4478 9.00536 13 9.00531ZM6.07031 1.34125C6.4044 0.499912 7.59575 0.499853 7.92969 1.34125L9.25 4.66937C9.26453 4.70571 9.29373 4.73396 9.33008 4.74847L12.6592 6.07074C13.5005 6.40477 13.5005 7.59509 12.6592 7.92914L9.33008 9.2514C9.29374 9.2659 9.26454 9.29419 9.25 9.33051L7.92969 12.6586C7.59575 13.5 6.4044 13.5 6.07031 12.6586L4.74902 9.33051C4.73446 9.29418 4.70531 9.26588 4.66895 9.2514L1.34082 7.92914C0.49956 7.59509 0.49956 6.40479 1.34082 6.07074L4.66895 4.74847C4.70533 4.73399 4.73447 4.70572 4.74902 4.66937L6.07031 1.34125Z"
                      fill="url(#1752500502803-7613136_sparkle_existing_0_mj429roqu)"
                      data-glass="clone"
                      filter="url(#1752500502803-7613136_sparkle_filter_alhgtlde0)"
                      clip-path="url(#1752500502803-7613136_sparkle_clipPath_92n6igug9)"
                    ></path>
                    <path
                      d="M16.6562 9.21226L14.3939 3.51196C13.893 2.24987 12.1067 2.24971 11.6056 3.51172L9.34194 9.21226C9.31834 9.27153 9.27153 9.31834 9.21226 9.34194L3.51085 11.6059C2.24896 12.107 2.24896 13.893 3.51085 14.3941L9.21226 16.6581C9.27153 16.6817 9.31834 16.7285 9.34194 16.7877L11.6055 22.4883C12.1067 23.7503 13.8929 23.7501 14.3939 22.488L16.6562 16.7877C16.6799 16.7283 16.7273 16.6816 16.7868 16.6581L22.4888 14.3941C23.7507 13.8931 23.7507 12.1069 22.4888 11.6059L16.7868 9.34194C16.7273 9.3184 16.6799 9.27173 16.6562 9.21226Z"
                      fill="url(#1752500502803-7613136_sparkle_existing_1_itr2rlc6a)"
                      data-glass="blur"
                    ></path>
                    <path
                      d="M11.6054 3.51174C12.1064 2.24985 13.8924 2.24997 14.3934 3.51174L16.6561 9.21194C16.6798 9.27141 16.7275 9.31828 16.787 9.34182L22.4882 11.6055C23.7501 12.1065 23.7501 13.8935 22.4882 14.3946L16.787 16.6582L16.745 16.6797C16.7052 16.7056 16.6739 16.7433 16.6561 16.7881L14.3934 22.4883L14.3427 22.6026C13.8 23.7118 12.1987 23.712 11.6561 22.6026L11.6054 22.4883L9.34168 16.7881C9.31809 16.7288 9.27106 16.6818 9.2118 16.6582L3.51063 14.3946C2.24874 13.8935 2.24874 12.1066 3.51063 11.6055L9.2118 9.34182C9.27106 9.31822 9.31809 9.2712 9.34168 9.21194L11.6054 3.51174ZM13.6972 3.78909C13.4468 3.15817 12.5534 3.15751 12.3026 3.78811L10.0389 9.48928C9.95156 9.70875 9.78837 9.88881 9.58094 9.99709L9.48914 10.0391L3.78797 12.3028C3.15702 12.5533 3.15703 13.4467 3.78797 13.6973L9.48914 15.961C9.70861 16.0483 9.88867 16.2115 9.99695 16.419L10.0389 16.5108L12.3026 22.2119C12.5534 22.8425 13.4458 22.8419 13.6962 22.211L15.9589 16.5108L16.0018 16.418C16.1117 16.2083 16.293 16.047 16.5097 15.961L22.2118 13.6973C22.8428 13.4468 22.8428 12.5533 22.2118 12.3028L16.5097 10.0391V10.0381C16.2931 9.95206 16.1116 9.79167 16.0018 9.58205L15.9589 9.48928L13.6972 3.78909Z"
                      fill="url(#1752500502803-7613136_sparkle_existing_2_7lj7nb2b2)"
                    ></path>
                    <defs>
                      <linearGradient
                        id="1752500502803-7613136_sparkle_existing_0_mj429roqu"
                        x1="8.855"
                        y1=".71"
                        x2="8.855"
                        y2="13.5"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#575757"></stop>
                        <stop offset="1" stop-color="#fff"></stop>
                      </linearGradient>
                      <linearGradient
                        id="1752500502803-7613136_sparkle_existing_1_itr2rlc6a"
                        x1="13"
                        y1="0"
                        x2="13"
                        y2="26"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#E3E3E5" stop-opacity=".6"></stop>
                        <stop offset="1" stop-color="#BBBBC0" stop-opacity=".6"></stop>
                      </linearGradient>
                      <linearGradient
                        id="1752500502803-7613136_sparkle_existing_2_7lj7nb2b2"
                        x1="12.999"
                        y1="2.565"
                        x2="12.999"
                        y2="13.5"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#fff"></stop>
                        <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
                      </linearGradient>
                      <filter
                        id="1752500502803-7613136_sparkle_filter_alhgtlde0"
                        x="-100%"
                        y="-100%"
                        width="400%"
                        height="400%"
                        filterUnits="objectBoundingBox"
                        primitiveUnits="userSpaceOnUse"
                      >
                        <feGaussianBlur
                          stdDeviation="2"
                          x="0%"
                          y="0%"
                          width="100%"
                          height="100%"
                          in="SourceGraphic"
                          edgeMode="none"
                          result="blur"
                        ></feGaussianBlur>
                      </filter>
                      <clipPath id="1752500502803-7613136_sparkle_clipPath_92n6igug9">
                        <path
                          d="M16.6562 9.21226L14.3939 3.51196C13.893 2.24987 12.1067 2.24971 11.6056 3.51172L9.34194 9.21226C9.31834 9.27153 9.27153 9.31834 9.21226 9.34194L3.51085 11.6059C2.24896 12.107 2.24896 13.893 3.51085 14.3941L9.21226 16.6581C9.27153 16.6817 9.31834 16.7285 9.34194 16.7877L11.6055 22.4883C12.1067 23.7503 13.8929 23.7501 14.3939 22.488L16.6562 16.7877C16.6799 16.7283 16.7273 16.6816 16.7868 16.6581L22.4888 14.3941C23.7507 13.8931 23.7507 12.1069 22.4888 11.6059L16.7868 9.34194C16.7273 9.3184 16.6799 9.27173 16.6562 9.21226Z"
                          fill="url(#1752500502803-7613136_sparkle_existing_1_itr2rlc6a)"
                        ></path>
                      </clipPath>
                      <mask id="1752500502803-7613136_sparkle_mask_90yh9c2fr">
                        <rect width="100%" height="100%" fill="#FFF"></rect>
                        <path
                          d="M16.6562 9.21226L14.3939 3.51196C13.893 2.24987 12.1067 2.24971 11.6056 3.51172L9.34194 9.21226C9.31834 9.27153 9.27153 9.31834 9.21226 9.34194L3.51085 11.6059C2.24896 12.107 2.24896 13.893 3.51085 14.3941L9.21226 16.6581C9.27153 16.6817 9.31834 16.7285 9.34194 16.7877L11.6055 22.4883C12.1067 23.7503 13.8929 23.7501 14.3939 22.488L16.6562 16.7877C16.6799 16.7283 16.7273 16.6816 16.7868 16.6581L22.4888 14.3941C23.7507 13.8931 23.7507 12.1069 22.4888 11.6059L16.7868 9.34194C16.7273 9.3184 16.6799 9.27173 16.6562 9.21226Z"
                          fill="#000"
                        ></path>
                      </mask>
                    </defs>
                  </g>
                </svg>
              </Link>

              <Link
                href="/descubrir"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-4 py-2 text-base font-medium text-white border-2 border-white/30 shadow-lg transition-all duration-300 hover:bg-white/20 hover:border-white/50"
              >
                <span>Descubrir eventos</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <title>magnifier</title>
                  <g fill="none">
                    <path
                      d="M10.586 10.5859C11.3671 9.80486 12.6331 9.80486 13.4142 10.5859L21.9142 19.0859L22.0519 19.2373C22.6926 20.0228 22.6464 21.1818 21.9142 21.914C21.1819 22.6463 20.0229 22.6925 19.2374 22.0517L19.086 21.914L10.586 13.414C9.80498 12.633 9.80498 11.367 10.586 10.5859Z"
                      fill="url(#1752500502796-6054278_magnifier_existing_0_gpzbpr1b3)"
                      data-glass="origin"
                      mask="url(#1752500502796-6054278_magnifier_mask_u1j50qeck)"
                    ></path>
                    <path
                      d="M10.586 10.5859C11.3671 9.80486 12.6331 9.80486 13.4142 10.5859L21.9142 19.0859L22.0519 19.2373C22.6926 20.0228 22.6464 21.1818 21.9142 21.914C21.1819 22.6463 20.0229 22.6925 19.2374 22.0517L19.086 21.914L10.586 13.414C9.80498 12.633 9.80498 11.367 10.586 10.5859Z"
                      fill="url(#1752500502796-6054278_magnifier_existing_0_gpzbpr1b3)"
                      data-glass="clone"
                      filter="url(#1752500502796-6054278_magnifier_filter_u6qjvmab1)"
                      clip-path="url(#1752500502796-6054278_magnifier_clipPath_k96ejzfu8)"
                    ></path>
                    <path
                      d="M18.5 10C18.5 14.6943 14.6943 18.5 10 18.5C5.30567 18.5 1.5 14.6943 1.5 10C1.5 5.30567 5.30567 1.5 10 1.5C14.6943 1.5 18.5 5.30567 18.5 10Z"
                      fill="url(#1752500502796-6054278_magnifier_existing_1_82nwa6xrf)"
                      data-glass="blur"
                    ></path>
                    <path
                      d="M17.75 10C17.75 5.71989 14.2801 2.25 10 2.25C5.71989 2.25 2.25 5.71989 2.25 10C2.25 14.2801 5.71989 17.75 10 17.75V18.5C5.30567 18.5 1.5 14.6943 1.5 10C1.5 5.30567 5.30567 1.5 10 1.5C14.6943 1.5 18.5 5.30567 18.5 10C18.5 14.6943 14.6943 18.5 10 18.5V17.75C14.2801 17.75 17.75 14.2801 17.75 10Z"
                      fill="url(#1752500502796-6054278_magnifier_existing_2_8ve8k2etb)"
                    ></path>
                    <defs>
                      <linearGradient
                        id="1752500502796-6054278_magnifier_existing_0_gpzbpr1b3"
                        x1="16.25"
                        y1="10"
                        x2="16.25"
                        y2="22.5"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#575757"></stop>
                        <stop offset="1" stop-color="#fff"></stop>
                      </linearGradient>
                      <linearGradient
                        id="1752500502796-6054278_magnifier_existing_1_82nwa6xrf"
                        x1="10"
                        y1="1.5"
                        x2="10"
                        y2="18.5"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#E3E3E5" stop-opacity=".6"></stop>
                        <stop offset="1" stop-color="#BBBBC0" stop-opacity=".6"></stop>
                      </linearGradient>
                      <linearGradient
                        id="1752500502796-6054278_magnifier_existing_2_8ve8k2etb"
                        x1="10"
                        y1="1.5"
                        x2="10"
                        y2="11.345"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#fff"></stop>
                        <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
                      </linearGradient>
                      <filter
                        id="1752500502796-6054278_magnifier_filter_u6qjvmab1"
                        x="-100%"
                        y="-100%"
                        width="400%"
                        height="400%"
                        filterUnits="objectBoundingBox"
                        primitiveUnits="userSpaceOnUse"
                      >
                        <feGaussianBlur
                          stdDeviation="2"
                          x="0%"
                          y="0%"
                          width="100%"
                          height="100%"
                          in="SourceGraphic"
                          edgeMode="none"
                          result="blur"
                        ></feGaussianBlur>
                      </filter>
                      <clipPath id="1752500502796-6054278_magnifier_clipPath_k96ejzfu8">
                        <path
                          d="M18.5 10C18.5 14.6943 14.6943 18.5 10 18.5C5.30567 18.5 1.5 14.6943 1.5 10C1.5 5.30567 5.30567 1.5 10 1.5C14.6943 1.5 18.5 5.30567 18.5 10Z"
                          fill="url(#1752500502796-6054278_magnifier_existing_1_82nwa6xrf)"
                        ></path>
                      </clipPath>
                      <mask id="1752500502796-6054278_magnifier_mask_u1j50qeck">
                        <rect width="100%" height="100%" fill="#FFF"></rect>
                        <path
                          d="M18.5 10C18.5 14.6943 14.6943 18.5 10 18.5C5.30567 18.5 1.5 14.6943 1.5 10C1.5 5.30567 5.30567 1.5 10 1.5C14.6943 1.5 18.5 5.30567 18.5 10Z"
                          fill="#000"
                        ></path>
                      </mask>
                    </defs>
                  </g>
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
