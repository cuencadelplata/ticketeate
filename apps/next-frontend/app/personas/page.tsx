import Image from 'next/image';

export default function PersonasPage() {
  // Student data with GitHub profiles and real avatar URLs
  const students = [
    {
      name: 'Augusto',
      github: 'AugustoOM',
      avatar: 'https://avatars.githubusercontent.com/u/132676808?v=4',
    },
    {
      name: 'Candela',
      github: 'Candecano',
      avatar: 'https://avatars.githubusercontent.com/u/167781166?v=4',
    },
    {
      name: 'Carla',
      github: 'CarlaMarturet',
      avatar: 'https://avatars.githubusercontent.com/u/171519982?v=4',
    },
    {
      name: 'Enzo',
      github: 'enzogabALF',
      avatar: 'https://avatars.githubusercontent.com/u/150981047?v=4',
    },
    {
      name: 'Gabriel',
      github: 'gabval',
      avatar: 'https://avatars.githubusercontent.com/u/177659094?v=4',
    },
    {
      name: 'Ignacio',
      github: 'nachoros2204',
      avatar: 'https://avatars.githubusercontent.com/u/104850904?v=4',
    },
    {
      name: 'Ivan',
      github: 'Ivancho1253 ',
      avatar: 'https://avatars.githubusercontent.com/u/124944083?v=4',
    },
    {
      name: 'Jeuel',
      github: 'Jeunex2004',
      avatar: 'https://avatars.githubusercontent.com/u/177658281?v=4',
    },
    {
      name: 'Joaquín',
      github: 'Joaco981',
      avatar: 'https://avatars.githubusercontent.com/u/95319291?v=4',
    },
    {
      name: 'Juan',
      github: 'juanmaqs5',
      avatar: 'https://avatars.githubusercontent.com/u/142261235?v=4',
    },
    {
      name: 'Lourdes',
      github: 'lourdesgomezsierra',
      avatar: 'https://avatars.githubusercontent.com/u/177658365?v=4',
    },
    {
      name: 'Máximo',
      github: 'MaximoSerafini',
      avatar: 'https://avatars.githubusercontent.com/u/111703978?v=4',
    },
    {
      name: 'Nicolás',
      github: 'NicoMedula',
      avatar: 'https://avatars.githubusercontent.com/u/152906196?v=4',
    },
    {
      name: 'Rodrigo',
      github: 'Rodrix0',
      avatar: 'https://avatars.githubusercontent.com/u/177499554?v=4',
    },
    {
      name: 'Santiago',
      github: 'Santserrano',
      avatar: 'https://avatars.githubusercontent.com/u/136268649?v=4',
    },
    {
      name: 'Uriel',
      github: 'UrielMaximiliano',
      avatar: 'https://avatars.githubusercontent.com/u/203035584?v=4',
    },
  ];

  // Professors data for special thanks section
  const professors = [
    {
      name: '-',
      location: 'Cuenca del Plata',
      avatar: 'https://avatars.githubusercontent.com/u/136268665?v=4',
      github: null,
    },
    {
      name: 'José',
      location: 'Cuenca del Plata',
      avatar: 'https://avatars.githubusercontent.com/u/201305?v=4',
      github: 'fernandezja',
    },
    {
      name: '-',
      location: 'Cuenca del Plata',
      avatar: 'https://avatars.githubusercontent.com/u/136268667?v=4',
      github: null,
    },
  ];

  return (
    <div className="min-h-screen bg-black py-8 md:py-16 px-4">
      <div className="max-w-7xl mx-auto pt-8 md:pt-16">
        {/* Title */}
        <div className="text-center mb-12 md:mb-24">
          <h1 className="text-4xl md:text-5xl lg:text-7xl bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent mb-4 md:mb-6 pb-2 font-instrument-serif">
            Personas
            <br />
            detrás de Ticketeate
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
            Un equipo de <span className="text-white">16 estudiantes</span> enfocados en
            <br />
            desarrollar software de impacto.
          </p>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-24 px-4 sm:px-8 md:px-12 lg:px-48">
          {students.map((student, index) => (
            <a
              key={index}
              href={`https://github.com/${student.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-center hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {/* Profile Picture */}
              <div className="w-20 sm:w-24 md:w-28 lg:w-36 h-20 sm:h-24 md:h-28 lg:h-36 mx-auto mb-1 sm:mb-2 relative overflow-hidden rounded-full">
                <Image
                  src={student.avatar}
                  alt={student.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 144px"
                />
              </div>

              {/* Name */}
              <h3 className="text-xs sm:text-sm font-medium text-gray-400 group-hover:text-primary transition-colors duration-300">
                {student.name}
              </h3>
            </a>
          ))}
        </div>

        {/* Special Thanks Section */}
        <div className="mt-16 md:mt-32 text-center px-4">
          <div className="flex items-center justify-center mb-4 md:mb-6 px-4 sm:px-8 md:px-12">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent px-4 md:px-8 pb-2"
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              Agradecimiento Especial
            </h2>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          </div>
          <p className="text-sm md:text-base lg:text-lg text-gray-400 max-w-3xl mx-auto mb-8 md:mb-16 px-2">
            A nuestros <span className="text-white">profesores</span> que han sido fundamentales en
            el <span className="text-white">acompañamiento y formación</span> durante este proyecto.
          </p>

          {/* Professors Grid */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 lg:gap-16 px-4">
            {professors.map((professor, index) => {
              const ProfessorContent = () => (
                <>
                  {/* Profile Picture */}
                  <div className="w-20 sm:w-24 md:w-28 lg:w-32 h-20 sm:h-24 md:h-28 lg:h-32 mx-auto mb-2 sm:mb-3 md:mb-4 relative overflow-hidden rounded-full">
                    <Image
                      src={professor.avatar}
                      alt={professor.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                    />
                  </div>

                  {/* Name */}
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-white mb-1">
                    {professor.name}
                  </h3>

                  {/* Location */}
                  <p className="text-xs md:text-sm text-gray-400">{professor.location}</p>
                </>
              );

              return professor.github ? (
                <a
                  key={index}
                  href={`https://github.com/${professor.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  <ProfessorContent />
                </a>
              ) : (
                <div key={index} className="text-center">
                  <ProfessorContent />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
