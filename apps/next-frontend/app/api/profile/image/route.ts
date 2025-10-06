import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';
import { CloudinaryProfileService } from '@/lib/cloudinary-profile';

export async function POST(request: NextRequest) {
  try {
    // Verificar la sesión del usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      console.log('FormData keys:', Array.from(formData.keys()));
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 },
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Obtener imagen anterior para eliminarla después
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir imagen a Cloudinary
    const uploadResult = await CloudinaryProfileService.uploadProfileImage(
      buffer,
      session.user.id,
      file.name,
    );

    // Actualizar la imagen del usuario en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: uploadResult.url },
    });

    // Eliminar imagen anterior si existe
    if (currentUser?.image) {
      const oldPublicId = CloudinaryProfileService.extractPublicIdFromUrl(currentUser.image);
      if (oldPublicId) {
        try {
          await CloudinaryProfileService.deleteProfileImage(oldPublicId);
        } catch (error) {
          console.warn('Error deleting old profile image:', error);
          // No fallar la operación si no se puede eliminar la imagen anterior
        }
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      format: uploadResult.format,
      size: uploadResult.size,
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar la sesión del usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (!currentUser?.image) {
      return NextResponse.json({ error: 'No profile image to delete' }, { status: 400 });
    }

    // Extraer public_id de la URL
    const publicId = CloudinaryProfileService.extractPublicIdFromUrl(currentUser.image);

    if (!publicId) {
      return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 });
    }

    // Eliminar imagen de Cloudinary
    await CloudinaryProfileService.deleteProfileImage(publicId);

    // Actualizar usuario en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
