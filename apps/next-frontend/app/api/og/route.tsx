// Route handler para generar imágenes OG dinámicas con AWS (alternativa a @vercel/og)
// Para usar: instala canvas o sharp para generación de imágenes
// Alternativa: usa directamente las imágenes de Cloudinary sin generación dinámica

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventImage = searchParams.get('image') || '';

    if (!eventImage) {
      return new Response('Image URL required', { status: 400 });
    }

    // Redirecciona a la imagen de Cloudinary directamente
    // En AWS EC2, no necesitas generar dinámicamente
    // Usa las imágenes de Cloudinary directamente en los meta tags
    return new Response(
      JSON.stringify({
        message: 'Use event image directly from Cloudinary in OG tags',
        imageUrl: eventImage,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      },
    );
  } catch (error) {
    console.error('Error in OG route:', error);
    return new Response('Error', { status: 500 });
  }
}
