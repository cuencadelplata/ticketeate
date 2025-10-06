import { prisma } from './index';

async function migrateUsuariosToUser() {
  console.log('Starting migration from usuarios to user table...');
  
  try {
    // Obtener todos los usuarios de la tabla usuarios
    const usuarios = await prisma.usuarios.findMany();
    
    console.log(`Found ${usuarios.length} usuarios to migrate`);
    
    for (const usuario of usuarios) {
      try {
        // Verificar si ya existe en la tabla user
        const existingUser = await prisma.user.findUnique({
          where: { email: usuario.email }
        });
        
        if (existingUser) {
          console.log(`User with email ${usuario.email} already exists, updating...`);
          
          // Mapear el rol de usuarios a user
          let role: 'ORGANIZADOR' | 'COLABORADOR' | 'USUARIO' = 'USUARIO';
          if (usuario.rol === 'organizador') {
            role = 'ORGANIZADOR';
          } else if (usuario.rol === 'colaborador') {
            role = 'COLABORADOR';
          }
          
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: `${usuario.nombre} ${usuario.apellido}`,
              role: role,
            }
          });
        } else {
          console.log(`Creating new user for ${usuario.email}...`);
          
          // Mapear el rol de usuarios a user
          let role: 'ORGANIZADOR' | 'COLABORADOR' | 'USUARIO' = 'USUARIO';
          if (usuario.rol === 'organizador') {
            role = 'ORGANIZADOR';
          } else if (usuario.rol === 'colaborador') {
            role = 'COLABORADOR';
          }
          
          await prisma.user.create({
            data: {
              id: usuario.usuarioid,
              name: `${usuario.nombre} ${usuario.apellido}`,
              email: usuario.email,
              emailVerified: true, // Asumir que los usuarios existentes están verificados
              role: role,
            }
          });
        }
      } catch (error) {
        console.error(`Error migrating usuario ${usuario.email}:`, error);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  migrateUsuariosToUser();
}

export { migrateUsuariosToUser };
