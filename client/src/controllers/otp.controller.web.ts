export interface ForgotPasswordData {
  identifier: string;
  method: "email" | "sms";
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
}

import { fetchApi } from "./api.client";

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Phone number is required";
  if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) return "Enter a valid 10-digit phone number";
  return null;
}

export function validateOTP(otp: string): string | null {
  if (!otp.trim()) return "OTP is required";
  if (!/^\d{6}$/.test(otp)) return "OTP must be 6 digits";
  return null;
}

export function validateNewPassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

// ── Handlers ─────────────────────────────────────────────────

export async function handleForgotPassword(
  data: ForgotPasswordData,
): Promise<ForgotPasswordResult> {
  const isEmail = data.identifier.includes('@');
  
  if (isEmail) {
    const emailError = validateEmail(data.identifier);
    if (emailError) return { success: false, message: emailError };
  } else {
    const phoneError = validatePhone(data.identifier);
    if (phoneError) return { success: false, message: phoneError };
  }

  try {
    const response = await fetchApi('/otp/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      success: true,
      message: response.message || "OTP sent successfully",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to send OTP" };
  }
}

export async function handleVerifyOTP(
  data: VerifyOTPData,
): Promise<ForgotPasswordResult> {
  const otpError = validateOTP(data.otp);
  if (otpError) return { success: false, message: otpError };

  try {
    const response = await fetchApi('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ identifier: data.email, otp: data.otp }),
    });

    return { success: true, message: response.message || "OTP verified successfully." };
  } catch (error: any) {
    return { success: false, message: error.message || "OTP verification failed" };
  }
}

export async function handleResetPassword(
  data: ResetPasswordData,
): Promise<ForgotPasswordResult> {
  const passwordError = validateNewPassword(data.newPassword);
  if (passwordError) return { success: false, message: passwordError };

  if (data.newPassword !== data.confirmPassword) {
    return { success: false, message: "Passwords do not match" };
  }

  try {
    const response = await fetchApi('/otp/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        identifier: data.email,
        otp: data.otp,
        newPassword: data.newPassword
      }),
    });

    return {
      success: true,
      message: response.message || "Password reset successful! Please sign in.",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Password reset failed" };
  }
}
