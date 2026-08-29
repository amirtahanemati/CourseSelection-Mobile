import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Course } from "../types/index";

interface CourseState {
  courses: Course[];
  selectedCourseId: number | null;
  theme: "dark" | "light";

  addCourse: (course: Course) => void;
  updateCourse: (id: number, updatedCourse: Partial<Course>) => void;
  deleteCourse: (id: number) => void;
  setSelectedCourseId: (id: number | null) => void;
  toggleTheme: () => void;
  importCourses: (courses: Course[]) => void;
}

const systemTheme = Appearance.getColorScheme() || "light";

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      courses: [],
      selectedCourseId: null,
      theme: systemTheme as "dark" | "light",

      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),

      updateCourse: (id, updatedCourse) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...updatedCourse } : c,
          ),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          selectedCourseId:
            state.selectedCourseId === id ? null : state.selectedCourseId,
        })),

      setSelectedCourseId: (id) => set({ selectedCourseId: id }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),

      importCourses: (courses) => set({ courses }),
    }),
    {
      name: "course-planner-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
export { Course };
