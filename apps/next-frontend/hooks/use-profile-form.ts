import { useState, useCallback } from 'react';

// Tipos para el estado del formulario
interface ProfileFormState {
  name: string;
  email: string;
}

interface OtpState {
  sent: boolean;
  code: string;
}

interface PasswordState {
  newPassword: string;
  confirmPassword: string;
}

// Hook para manejar el estado del formulario de perfil
export function useProfileForm(initialData?: { name: string; email: string }) {
  const [formData, setFormData] = useState<ProfileFormState>({
    name: initialData?.name || '',
    email: initialData?.email || '',
  });

  const [otpState, setOtpState] = useState<OtpState>({
    sent: false,
    code: '',
  });

  const [passwordState, setPasswordState] = useState<PasswordState>({
    newPassword: '',
    confirmPassword: '',
  });

  // Función para actualizar campos del formulario
  const updateField = useCallback((field: keyof ProfileFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Función para actualizar el estado OTP
  const updateOtpState = useCallback((updates: Partial<OtpState>) => {
    setOtpState(prev => ({ ...prev, ...updates }));
  }, []);

  // Función para actualizar el estado de contraseña
  const updatePasswordState = useCallback((updates: Partial<PasswordState>) => {
    setPasswordState(prev => ({ ...prev, ...updates }));
  }, []);

  // Función para resetear el formulario
  const resetForm = useCallback((newData?: ProfileFormState) => {
    setFormData(newData || { name: '', email: '' });
    setOtpState({ sent: false, code: '' });
    setPasswordState({ newPassword: '', confirmPassword: '' });
  }, []);

  // Función para resetear solo el estado OTP
  const resetOtpState = useCallback(() => {
    setOtpState({ sent: false, code: '' });
  }, []);

  // Función para resetear solo el estado de contraseña
  const resetPasswordState = useCallback(() => {
    setPasswordState({ newPassword: '', confirmPassword: '' });
  }, []);

  // Validaciones
  const isFormValid = formData.name.trim() && formData.email.trim();
  const isEmailValid = formData.email.includes('@') && formData.email.includes('.');
  const isOtpValid = otpState.code.length === 6;
  const isPasswordValid = passwordState.newPassword.length >= 8 && 
                         passwordState.newPassword === passwordState.confirmPassword;

  return {
    // Estado
    formData,
    otpState,
    passwordState,
    
    // Funciones de actualización
    updateField,
    updateOtpState,
    updatePasswordState,
    
    // Funciones de reset
    resetForm,
    resetOtpState,
    resetPasswordState,
    
    // Validaciones
    isFormValid,
    isEmailValid,
    isOtpValid,
    isPasswordValid,
  };
}

