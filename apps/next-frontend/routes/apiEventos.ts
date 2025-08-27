import { prisma } from '../../../packages/db/src';

// Función para obtener eventos usando Prisma
export async function fetchEventos() {
  try {
    // Ejemplo de fetch con Prisma - puedes ajustar según tus necesidades
    const eventos = await prisma.user.findMany({
      include: {
        posts: true
      }
    });
    
    return eventos;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    throw error;
  }
}

// Función para obtener un evento específico por ID
export async function fetchEventoById(id: string) {
  try {
    const evento = await prisma.user.findUnique({
      where: {
        id: id
      },
      include: {
        posts: true
      }
    });
    
    return evento;
  } catch (error) {
    console.error('Error al obtener evento por ID:', error);
    throw error;
  }
}

// Función para crear un nuevo evento
export async function createEvento(data: { email: string; name?: string }) {
  try {
    const nuevoEvento = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name
      }
    });
    
    return nuevoEvento;
  } catch (error) {
    console.error('Error al crear evento:', error);
    throw error;
  }
}
