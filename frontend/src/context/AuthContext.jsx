import React, { createContext, useContext, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (username, password) => {
    // In a real app we'd use proper auth, but here we query the users table like mockData
    const { data: users, error } = await supabase
      .from('users')
      .select('*, roles(role_name), barangays(barangay_name)')
      .eq('username', username)
      .eq('password_hash', password)
      .eq('is_active', true);

    if (error) {
      console.error("Login error:", error);
      return { success: false, error: "System error during login." };
    }

    if (users && users.length > 0) {
      const u = users[0];
      setCurrentUser({
        ...u,
        roleId: u.role_id,
        barangayId: u.barangay_id
      });
      return { success: true };
    }
    return { success: false, error: "Invalid username or password." };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.roleId === 1;
  const isOfficial = currentUser?.roleId === 2;

  const getUserRole = () => {
    if (!currentUser) return null;
    return currentUser.roles?.role_name || "Unknown";
  };

  const getUserBarangay = () => {
    if (!currentUser) return null;
    return currentUser.barangays?.barangay_name || "Unknown";
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAdmin,
        isOfficial,
        getUserRole,
        getUserBarangay
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
