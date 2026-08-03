import React, { createContext, useContext, useState } from "react";
import { supabase } from "./supabaseClient";
import { ROLE, ROLE_META, checkPermission } from "@/shared/lib/permissions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (username, password) => {
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

  const roleId = currentUser?.roleId;

  const isCaptain   = roleId === ROLE.CAPTAIN;
  const isSecretary = roleId === ROLE.SECRETARY;
  const isKagawad   = roleId === ROLE.KAGAWAD;
  const isTanod     = roleId === ROLE.TANOD;

  // Legacy flags
  const isAdmin    = isCaptain || isSecretary;
  const isOfficial = isKagawad || isTanod;

  const hasPermission = (perm) => checkPermission(roleId, perm);
  const canEdit = !isTanod && !!currentUser;

  const getUserRole = () => {
    if (!currentUser) return null;
    return currentUser.roles?.role_name || "Unknown";
  };

  const getUserBarangay = () => {
    return "Brgy. 46 Zone 6";
  };

  const getRoleBadge = () => {
    if (!roleId) return null;
    return ROLE_META[roleId]?.badge ?? null;
  };

  const getRoleColor = () => {
    if (!roleId) return null;
    return ROLE_META[roleId]?.color ?? null;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isCaptain,
        isSecretary,
        isKagawad,
        isTanod,
        isAdmin,
        isOfficial,
        hasPermission,
        canEdit,
        getUserRole,
        getUserBarangay,
        getRoleBadge,
        getRoleColor,
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
