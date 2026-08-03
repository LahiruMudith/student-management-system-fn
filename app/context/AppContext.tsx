"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Student {
  id?: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  age: string;
  gender: string;
  registrationDate?: string;
}

type ViewType = "dashboard" | "students";

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isLoggedIn: boolean;
  jwtToken: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  students: Student[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  setSuccessMessage: (msg: string | null) => void;
  setErrorMessage: (msg: string | null) => void;
  fetchStudents: () => Promise<void>;
  createStudent: (student: Omit<Student, "id" | "registrationDate">) => Promise<boolean>;
  updateStudent: (id: string, student: Omit<Student, "id" | "registrationDate">) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  searchStudents: (keyword: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:8080";

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);

  // Initialize Authentication state
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setJwtToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  // Sync state and fetch students
  useEffect(() => {
    if (isLoggedIn) {
      fetchStudents();
    }
  }, [isLoggedIn]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();
      const token = data.token;
      setJwtToken(token);
      setIsLoggedIn(true);
      localStorage.setItem("jwtToken", token);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to connect to the backend server. Is it running on port 8080?");
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setJwtToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem("jwtToken");
    setStudents([]);
    setCurrentView("dashboard");
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/students`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to fetch students from API.");
      }

      const data = await res.json();
      setStudents(data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Could not fetch data from Spring Boot API. Make sure the backend service is running.");
      setLoading(false);
    }
  };

  const createStudent = async (studentData: Omit<Student, "id" | "registrationDate">): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(studentData),
      });

      if (!res.ok) {
        throw new Error("Failed to create student on API.");
      }

      setSuccessMessage("Student record created successfully!");
      await fetchStudents();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to create student.");
      setLoading(false);
      return false;
    }
  };

  const updateStudent = async (id: string, studentData: Omit<Student, "id" | "registrationDate">): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/students/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(studentData),
      });

      if (!res.ok) {
        throw new Error("Failed to update student on API.");
      }

      setSuccessMessage("Student record updated successfully!");
      await fetchStudents();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update student.");
      setLoading(false);
      return false;
    }
  };

  const deleteStudent = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/students/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete student on API.");
      }

      setSuccessMessage("Student record deleted successfully!");
      await fetchStudents();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete student.");
      setLoading(false);
      return false;
    }
  };

  const searchStudents = async (keyword: string) => {
    setLoading(true);
    setError(null);

    if (!keyword.trim()) {
      await fetchStudents();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/students/search?keyword=${encodeURIComponent(keyword)}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Search request failed.");
      }

      const data = await res.json();
      setStudents(data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Search failed.");
      setLoading(false);
    }
  };

  const setSuccessMessage = (msg: string | null) => {
    setSuccessMessageState(msg);
    if (msg) {
      setTimeout(() => setSuccessMessageState(null), 4000);
    }
  };

  const setErrorMessage = (msg: string | null) => {
    setError(msg);
    if (msg) {
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isLoggedIn,
        jwtToken,
        login,
        logout,
        students,
        loading,
        error,
        successMessage,
        setSuccessMessage,
        setErrorMessage,
        fetchStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        searchStudents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
