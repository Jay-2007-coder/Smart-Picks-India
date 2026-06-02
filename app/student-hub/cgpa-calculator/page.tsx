"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Calculator, RefreshCw } from "lucide-react";

interface Course {
  name: string;
  credits: number;
  gradePoint: number;
}

interface Semester {
  id: number;
  courses: Course[];
}

const gradeMap: { [key: string]: number } = {
  "O (10)": 10,
  "A+ (9)": 9,
  "A (8)": 8,
  "B+ (7)": 7,
  "B (6)": 6,
  "C (5)": 5,
  "P (4)": 4,
  "F (0)": 0,
};

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: 1,
      courses: [
        { name: "Course 1", credits: 4, gradePoint: 10 },
        { name: "Course 2", credits: 3, gradePoint: 9 },
        { name: "Course 3", credits: 3, gradePoint: 8 },
        { name: "Course 4", credits: 2, gradePoint: 10 },
      ],
    },
  ]);

  const handleAddSemester = () => {
    const nextId = semesters.length > 0 ? Math.max(...semesters.map((s) => s.id)) + 1 : 1;
    setSemesters([
      ...semesters,
      {
        id: nextId,
        courses: [{ name: "Course 1", credits: 3, gradePoint: 10 }],
      },
    ]);
  };

  const handleRemoveSemester = (semId: number) => {
    setSemesters(semesters.filter((s) => s.id !== semId));
  };

  const handleAddCourse = (semId: number) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          const nextIndex = sem.courses.length + 1;
          return {
            ...sem,
            courses: [...sem.courses, { name: `Course ${nextIndex}`, credits: 3, gradePoint: 10 }],
          };
        }
        return sem;
      })
    );
  };

  const handleRemoveCourse = (semId: number, courseIndex: number) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          return {
            ...sem,
            courses: sem.courses.filter((_, idx) => idx !== courseIndex),
          };
        }
        return sem;
      })
    );
  };

  const handleCourseChange = (
    semId: number,
    courseIndex: number,
    field: keyof Course,
    value: any
  ) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          const updatedCourses = [...sem.courses];
          updatedCourses[courseIndex] = {
            ...updatedCourses[courseIndex],
            [field]: value,
          };
          return { ...sem, courses: updatedCourses };
        }
        return sem;
      })
    );
  };

  // Calculates Semester SGPA
  const calculateSGPA = (courses: Course[]) => {
    let totalCredits = 0;
    let weightedPoints = 0;
    courses.forEach((c) => {
      totalCredits += c.credits;
      weightedPoints += c.credits * c.gradePoint;
    });
    return totalCredits > 0 ? Math.round((weightedPoints / totalCredits) * 100) / 100 : 0;
  };

  // Calculates Aggregate CGPA
  const calculateCGPA = () => {
    let totalCredits = 0;
    let weightedPoints = 0;
    semesters.forEach((sem) => {
      sem.courses.forEach((c) => {
        totalCredits += c.credits;
        weightedPoints += c.credits * c.gradePoint;
      });
    });
    return totalCredits > 0 ? Math.round((weightedPoints / totalCredits) * 100) / 100 : 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-4xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Dashboard Title Header */}
        <div className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">CGPA Calculator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add multiple semesters, allocate credits, and monitor your university targets.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <Calculator className="h-4 w-4" /> calculator
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Semesters list inputs */}
          <div className="md:col-span-2 space-y-6">
            {semesters.map((sem, semIdx) => {
              const sgpa = calculateSGPA(sem.courses);

              return (
                <div key={sem.id} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <h3 className="font-extrabold text-foreground text-sm">Semester {semIdx + 1}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-500 bg-brand-50/50 dark:bg-brand-950/20 px-2 py-0.5 rounded-lg">
                        SGPA: {sgpa.toFixed(2)}
                      </span>
                      {semesters.length > 1 && (
                        <button
                          onClick={() => handleRemoveSemester(sem.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Course rows */}
                  <div className="space-y-3">
                    {sem.courses.map((course, cIdx) => (
                      <div key={cIdx} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => handleCourseChange(sem.id, cIdx, "name", e.target.value)}
                            placeholder="Course Name"
                            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={course.credits || ""}
                            onChange={(e) => handleCourseChange(sem.id, cIdx, "credits", parseInt(e.target.value) || 0)}
                            placeholder="Credits"
                            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                            min="1"
                          />
                        </div>
                        <div className="col-span-3">
                          <select
                            value={course.gradePoint}
                            onChange={(e) => handleCourseChange(sem.id, cIdx, "gradePoint", parseInt(e.target.value))}
                            className="h-9 w-full bg-background border border-border rounded-xl px-2 text-xs font-bold text-foreground focus-visible:outline-none"
                          >
                            {Object.entries(gradeMap).map(([label, val]) => (
                              <option key={label} value={val}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1 text-center">
                          {sem.courses.length > 1 && (
                            <button
                              onClick={() => handleRemoveCourse(sem.id, cIdx)}
                              className="text-muted-foreground hover:text-red-500 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddCourse(sem.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-brand-600 hover:text-brand-700 mt-2"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Course
                  </button>
                </div>
              );
            })}

            <button
              onClick={handleAddSemester}
              className="flex h-10 w-full items-center justify-center gap-1.5 border border-dashed border-border rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Semester
            </button>
          </div>

          {/* Right panel: Final Score summary */}
          <div className="md:col-span-1">
            <div className="bg-card border border-border/85 rounded-3xl p-6 shadow-md space-y-6 sticky top-24 text-center">
              <div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  OVERALL CGPA
                </span>
                <h2 className="text-5xl font-black text-brand-600 mt-2">
                  {calculateCGPA().toFixed(2)}
                </h2>
              </div>

              <div className="border-t border-border/50 pt-5 space-y-2 text-xs font-bold text-muted-foreground text-left">
                <div className="flex justify-between">
                  <span>Total Semesters:</span>
                  <span className="text-foreground">{semesters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calculated SGPA Average:</span>
                  <span className="text-foreground">
                    {(semesters.reduce((acc, s) => acc + calculateSGPA(s.courses), 0) / (semesters.length || 1)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setSemesters([
                    {
                      id: 1,
                      courses: [
                        { name: "Course 1", credits: 4, gradePoint: 10 },
                        { name: "Course 2", credits: 3, gradePoint: 9 },
                        { name: "Course 3", credits: 3, gradePoint: 8 },
                      ],
                    },
                  ])
                }
                className="flex h-9 w-full items-center justify-center gap-1 border border-border rounded-xl text-[10px] font-black text-muted-foreground hover:bg-muted/55 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
