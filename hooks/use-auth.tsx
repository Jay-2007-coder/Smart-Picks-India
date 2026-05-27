"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// User profile properties
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<{ success: boolean; message: string }>;
  socialLogin: (data: any) => Promise<{ success: boolean; message: string }>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; message: string }>;
  changePassword: (data: any) => Promise<{ success: boolean; message: string }>;
  uploadProfileImage: (image: string) => Promise<{ success: boolean; message: string }>;
  sendOtp: (phone: string, purpose: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (data: any) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check user session on initial load
  const checkSession = async () => {
    try {
      const response = await fetch("/api/v1/auth/me");
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (credentials: any) => {
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true, message: "Logged in successfully" };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch (err) {
      return { success: false, message: "An error occurred. Please try again." };
    }
  };

  const socialLogin = async (socialData: any) => {
    try {
      const response = await fetch("/api/v1/auth/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true, message: "Signed in successfully" };
      }
      return { success: false, message: data.message || "Social sign-in failed" };
    } catch (err) {
      return { success: false, message: "An error occurred. Please try again." };
    }
  };

  const register = async (details: any) => {
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Registration failed" };
    } catch (err) {
      return { success: false, message: "An error occurred during registration." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await fetch("/api/v1/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Profile update failed" };
    } catch (err) {
      return { success: false, message: "An error occurred while updating profile." };
    }
  };

  const changePassword = async (passwordData: any) => {
    try {
      const response = await fetch("/api/v1/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Password update failed" };
    } catch (err) {
      return { success: false, message: "An error occurred while updating password." };
    }
  };

  const uploadProfileImage = async (image: string) => {
    try {
      const response = await fetch("/api/v1/user/profile/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (user) {
          setUser({ ...user, profileImage: data.profileImage });
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Image upload failed" };
    } catch (err) {
      return { success: false, message: "An error occurred during image upload." };
    }
  };

  const sendOtp = async (phone: string, purpose: string) => {
    try {
      const response = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Failed to send OTP" };
    } catch (err) {
      return { success: false, message: "An error occurred while sending OTP." };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch("/api/v1/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Verification failed" };
    } catch (err) {
      return { success: false, message: "An error occurred during email verification." };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Failed to submit request" };
    } catch (err) {
      return { success: false, message: "An error occurred. Please try again." };
    }
  };

  const resetPassword = async (resetData: any) => {
    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Reset failed" };
    } catch (err) {
      return { success: false, message: "An error occurred during password reset." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        socialLogin,
        register,
        logout,
        checkSession,
        updateProfile,
        changePassword,
        uploadProfileImage,
        sendOtp,
        verifyEmail,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
