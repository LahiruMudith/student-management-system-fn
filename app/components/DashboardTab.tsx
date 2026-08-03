"use client";

import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import * as Icons from "./Icons";

export const DashboardTab: React.FC = () => {
  const { students, setCurrentView } = useApp();

  // Calculations for KPI
  const totalStudents = students.length;

  // Recently added students (limit to 4, sorted by registration date descending)
  const recentStudents = useMemo(() => {
    const listCopy = [...students];
    listCopy.sort((a, b) => {
      const dateA = a.registrationDate || "";
      const dateB = b.registrationDate || "";
      return dateB.localeCompare(dateA);
    });
    return listCopy.slice(0, 4);
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Academy Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Welcome back, Administrator. Here is the current registry summary.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
          <Icons.Calendar size={16} />
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      {/* KPI Cards Row - Only Total Students */}
      <div className="grid grid-cols-1 gap-5 max-w-sm">
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Students</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Icons.GraduationCap size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {totalStudents}
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              Active
            </span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            Registered student headcount
          </p>
        </div>
      </div>

      {/* Recently Added Students */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100">Recently Enrolled</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Recently created student profile records</p>
          </div>
          <button
            onClick={() => setCurrentView("students")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View All Registry
          </button>
        </div>

        {recentStudents.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No students enrolled yet. Go to Students Registry to add some.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Course</th>
                  <th className="py-2.5">Reg. Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentStudents.map((s, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                    <td className="py-2.5 font-mono text-zinc-400">{s.studentId}</td>
                    <td className="py-2.5 font-medium text-zinc-900 dark:text-zinc-50">{s.name}</td>
                    <td className="py-2.5">{s.course}</td>
                    <td className="py-2.5 text-zinc-400">
                      {s.registrationDate
                        ? new Date(s.registrationDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
