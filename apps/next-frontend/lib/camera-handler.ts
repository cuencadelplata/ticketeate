export async function requestCameraPermission(): Promise<MediaStream> {
  try {
    const constraints = {
      audio: false,
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new Error('PERMISSION_DENIED');
      } else if (error.name === 'NotFoundError') {
        throw new Error('DEVICE_NOT_FOUND');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('NOT_SUPPORTED');
      }
    }
    throw error;
  }
}

export function stopMediaStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

export async function toggleTorch(stream: MediaStream, enable: boolean): Promise<void> {
  try {
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const capabilities = (videoTrack.getCapabilities?.() as any) || {};
      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: enable }] as any,
        });
      }
    }
  } catch (error) {
    console.warn('Torch control not available:', error);
  }
}

export function hasTorchSupport(stream: MediaStream): boolean {
  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) return false;
  const capabilities = (videoTrack.getCapabilities?.() as any) || {};
  return capabilities.torch === true;
}
