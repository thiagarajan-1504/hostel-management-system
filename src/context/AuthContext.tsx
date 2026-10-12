"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUser: (user: User) => void;
  logout: () => void;
  allUsers: User[];
  setAllUsers: (users: User[]) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUsers,
}: {
  children: React.ReactNode;
  initialUsers: User[];
}) {
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt to restore user from localStorage, else default to first admin or first user
    const savedUserId = typeof window !== "undefined" ? localStorage.getItem("hostel_user_id") : null;
    if (savedUserId && allUsers.length > 0) {
      const found = allUsers.find((u) => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
        setIsLoading(false);
        return;
      }
    }

    // Default: find Admin or first user
    const defaultUser = allUsers.find((u) => u.role === "ADMIN") || allUsers[0] || null;
    if (defaultUser) {
      setCurrentUser(defaultUser);
      localStorage.setItem("hostel_user_id", defaultUser.id);
    }
    setIsLoading(false);
  }, [allUsers]);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("hostel_user_id", user.id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("hostel_user_id");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        logout,
        allUsers,
        setAllUsers,
        isLoading,
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
