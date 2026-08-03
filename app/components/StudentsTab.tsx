"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp, Student } from "../context/AppContext";
import * as Icons from "./Icons";

type SortField = "studentId" | "name" | "course" | "registrationDate";
type SortOrder = "asc" | "desc";

export const StudentsTab: React.FC = () => {
  const {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    setSuccessMessage,
    setErrorMessage,
  } = useApp();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Table sorting & pagination
  const [sortField, setSortField] = useState<SortField>("studentId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected student for details drawer
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form State
  const [formFields, setFormFields] = useState<Omit<Student, "id" | "registrationDate">>({
    studentId: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    age: "",
    gender: "Male",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchStudents(searchTerm);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Sort and Filter Data
  const sortedStudents = useMemo(() => {
    const list = [...students];
    return list.sort((a, b) => {
      let valA = a[sortField]?.toLowerCase() || "";
      let valB = b[sortField]?.toLowerCase() || "";
      
      if (sortField === "studentId") {
        // Handle natural numeric sorting if ID starts with S
        const numA = parseInt(valA.replace(/\D/g, ""), 10);
        const numB = parseInt(valB.replace(/\D/g, ""), 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [students, sortField, sortOrder]);

  // Paginated Data
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedStudents, currentPage]);

  const totalPages = Math.max(Math.ceil(sortedStudents.length / itemsPerPage), 1);

  // Handle Sort triggers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formFields.studentId.trim()) errors.studentId = "Student ID is required";
    if (!formFields.name.trim()) errors.name = "Name is required";
    if (!formFields.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formFields.email)) {
      errors.email = "Invalid email format";
    }
    if (!formFields.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formFields.phone)) {
      errors.phone = "Invalid phone number format";
    }
    if (!formFields.course.trim()) errors.course = "Course is required";
    if (!formFields.age.trim()) {
      errors.age = "Age is required";
    } else {
      const ageNum = parseInt(formFields.age, 10);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
        errors.age = "Age must be a valid number between 1 and 120";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormFields({
      studentId: "",
      name: "",
      email: "",
      phone: "",
      course: "",
      age: "",
      gender: "Male",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setFormFields({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      age: student.age,
      gender: student.gender,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await createStudent(formFields);
    if (success) {
      setIsAddModalOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedStudent || !selectedStudent.id) return;

    const success = await updateStudent(selectedStudent.id, formFields);
    if (success) {
      setIsEditModalOpen(false);
      // Update selected drawer state
      setSelectedStudent({
        ...selectedStudent,
        ...formFields,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent || !selectedStudent.id) return;
    const success = await deleteStudent(selectedStudent.id);
    if (success) {
      setSelectedStudent(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Toolbar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
            Students Registry
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            View, search, edit, and create student profiles.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Icons.Plus size={16} />
          Add Student
        </button>
      </div>

      {/* Main Split Layout: Table and Drawer */}
      <div className="flex flex-col gap-6 lg:flex-row items-start">
        
        {/* Left Side: Table & Search Toolbar */}
        <div className={`w-full transition-all duration-300 ${selectedStudent ? "lg:w-2/3" : "w-full"}`}>
          {/* Table Container */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900/60">
            {/* Table Toolbar */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
                  <Icons.Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-100 shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>
              
              {loading && <Icons.Spinner className="text-indigo-600 dark:text-indigo-400 shrink-0" size={18} />}
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 dark:bg-zinc-950/40 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                    <th onClick={() => handleSort("studentId")} className="p-4 cursor-pointer hover:text-indigo-500 transition-colors">
                      <div className="flex items-center gap-1">
                        ID
                        {sortField === "studentId" && (sortOrder === "asc" ? " ↑" : " ↓")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("name")} className="p-4 cursor-pointer hover:text-indigo-500 transition-colors">
                      <div className="flex items-center gap-1">
                        Name
                        {sortField === "name" && (sortOrder === "asc" ? " ↑" : " ↓")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("course")} className="p-4 cursor-pointer hover:text-indigo-500 transition-colors">
                      <div className="flex items-center gap-1">
                        Course
                        {sortField === "course" && (sortOrder === "asc" ? " ↑" : " ↓")}
                      </div>
                    </th>
                    <th className="p-4">Contact</th>
                    <th onClick={() => handleSort("registrationDate")} className="p-4 cursor-pointer hover:text-indigo-500 transition-colors hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        Joined
                        {sortField === "registrationDate" && (sortOrder === "asc" ? " ↑" : " ↓")}
                      </div>
                    </th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-400">
                        {loading ? "Loading registry records..." : "No student records found matching the search."}
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => {
                      const isSelected = selectedStudent?.id === student.id;
                      return (
                        <tr
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`group hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 cursor-pointer transition-colors ${
                            isSelected ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-l-2 border-indigo-600" : ""
                          }`}
                        >
                          <td className="p-4 font-mono font-bold text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {student.studentId}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-50">{student.name}</div>
                            <div className="text-[10px] text-zinc-400">{student.gender} • {student.age} yrs</div>
                          </td>
                          <td className="p-4">
                            <span className="inline-block rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {student.course}
                            </span>
                          </td>
                          <td className="p-4 max-w-[140px] truncate">
                            <div className="truncate text-[11px]">{student.email}</div>
                            <div className="text-[10px] text-zinc-400">{student.phone}</div>
                          </td>
                          <td className="p-4 text-zinc-400 hidden md:table-cell">
                            {student.registrationDate
                              ? new Date(student.registrationDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-600"
                                title="View Details"
                              >
                                <Icons.Info size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  handleOpenEditModal(student);
                                }}
                                className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-600"
                                title="Edit"
                              >
                                <Icons.Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span>
                Showing {Math.min(sortedStudents.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                {Math.min(sortedStudents.length, currentPage * itemsPerPage)} of {sortedStudents.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="First Page"
                >
                  <Icons.ChevronsLeft size={16} />
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous Page"
                >
                  <Icons.ChevronLeft size={16} />
                </button>
                <span className="px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Next Page"
                >
                  <Icons.ChevronRight size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Last Page"
                >
                  <Icons.ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Details Side Drawer (Slides in when student is selected) */}
        {selectedStudent && (
          <div className="w-full lg:w-1/3 rounded-xl border border-zinc-200 bg-white p-5 shadow-lg relative dark:border-zinc-800 dark:bg-zinc-900/90 animate-fade-in-right shrink-0">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <Icons.X size={16} />
            </button>

            {/* Profile Info Header */}
            <div className="flex flex-col items-center border-b border-zinc-100 pb-5 text-center dark:border-zinc-800">
              <div className="h-16 w-16 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl mb-3">
                {selectedStudent.name.charAt(0)}
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{selectedStudent.name}</h2>
              <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider font-mono mt-1">
                Student ID: {selectedStudent.studentId}
              </p>
            </div>

            {/* Information Grid */}
            <div className="py-4 space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="font-semibold text-zinc-400">Course</span>
                <span className="col-span-2 font-medium text-zinc-950 dark:text-zinc-100">{selectedStudent.course}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="font-semibold text-zinc-400">Age</span>
                <span className="col-span-2 font-medium text-zinc-950 dark:text-zinc-100">{selectedStudent.age} years</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="font-semibold text-zinc-400">Gender</span>
                <span className="col-span-2 font-medium text-zinc-950 dark:text-zinc-100">{selectedStudent.gender}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="font-semibold text-zinc-400">Email</span>
                <span className="col-span-2 font-medium break-all text-zinc-950 dark:text-zinc-100">{selectedStudent.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="font-semibold text-zinc-400">Phone</span>
                <span className="col-span-2 font-medium text-zinc-950 dark:text-zinc-100">{selectedStudent.phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="font-semibold text-zinc-400">Joined</span>
                <span className="col-span-2 font-medium text-zinc-950 dark:text-zinc-100">
                  {selectedStudent.registrationDate
                    ? new Date(selectedStudent.registrationDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 border-t border-zinc-100 pt-5 flex items-center justify-between gap-3 dark:border-zinc-800">
              <button
                onClick={() => handleOpenEditModal(selectedStudent)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold py-2 text-xs transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <Icons.Edit size={14} />
                Edit Profile
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 text-xs transition-colors shadow-sm cursor-pointer"
              >
                <Icons.Trash size={14} />
                Delete Record
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 dark:border-zinc-800">
              <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100">Add New Student</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <Icons.X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Student ID (e.g. S001)</label>
                <input
                  type="text"
                  required
                  placeholder="S001"
                  value={formFields.studentId}
                  onChange={(e) => setFormFields({ ...formFields, studentId: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.studentId ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.studentId && <p className="text-[10px] text-rose-500 mt-1">{formErrors.studentId}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.name ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-rose-500 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={formFields.age}
                    onChange={(e) => setFormFields({ ...formFields, age: e.target.value })}
                    className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      formErrors.age ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  />
                  {formErrors.age && <p className="text-[10px] text-rose-500 mt-1">{formErrors.age}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Gender</label>
                  <select
                    value={formFields.gender}
                    onChange={(e) => setFormFields({ ...formFields, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Course Program</label>
                <input
                  type="text"
                  required
                  placeholder="Computer Science"
                  value={formFields.course}
                  onChange={(e) => setFormFields({ ...formFields, course: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.course ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.course && <p className="text-[10px] text-rose-500 mt-1">{formErrors.course}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={formFields.email}
                  onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.email ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.email && <p className="text-[10px] text-rose-500 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="1234567890"
                  value={formFields.phone}
                  onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.phone ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.phone && <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold px-4 py-2 text-xs transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Student */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 dark:border-zinc-800">
              <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100 font-sans">Edit Student Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <Icons.X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Student ID (Read-only)</label>
                <input
                  type="text"
                  disabled
                  value={formFields.studentId}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 border border-zinc-200 rounded-lg dark:bg-zinc-950 dark:border-zinc-800 text-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.name ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-rose-500 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={formFields.age}
                    onChange={(e) => setFormFields({ ...formFields, age: e.target.value })}
                    className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      formErrors.age ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  />
                  {formErrors.age && <p className="text-[10px] text-rose-500 mt-1">{formErrors.age}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Gender</label>
                  <select
                    value={formFields.gender}
                    onChange={(e) => setFormFields({ ...formFields, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Course Program</label>
                <input
                  type="text"
                  required
                  placeholder="Computer Science"
                  value={formFields.course}
                  onChange={(e) => setFormFields({ ...formFields, course: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.course ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.course && <p className="text-[10px] text-rose-500 mt-1">{formErrors.course}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={formFields.email}
                  onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.email ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.email && <p className="text-[10px] text-rose-500 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="1234567890"
                  value={formFields.phone}
                  onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-zinc-50 border rounded-lg dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.phone ? "border-rose-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                />
                {formErrors.phone && <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold px-4 py-2 text-xs transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: Delete Confirm */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
                <Icons.AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-sans">Delete Student Profile?</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Are you sure you want to delete the profile of <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedStudent?.name}</span>? 
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold px-3 py-1.5 text-xs transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                No, Keep
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1.5 text-xs transition-colors shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
