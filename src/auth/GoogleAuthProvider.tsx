import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({
  children,
}) => {
  if (!googleClientId) {
    console.error("Missing VITE_GOOGLE_CLIENT_ID in environment variables");
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthProvider;
