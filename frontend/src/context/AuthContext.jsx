import React, { createContext, useContext, useState } from "react";
import { users, roles, barangays } from "../mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.passwordHash === password && u.isActive
    );
    if (user) {
      setCurrentUser(user);
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
    const role = roles.find((r) => r.roleId === currentUser.roleId);
    return role?.roleName || "Unknown";
  };

  const getUserBarangay = () => {
    if (!currentUser) return null;
    const brgy = barangays.find((b) => b.id === currentUser.barangayId);
    return brgy?.name || "Unknown";
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
