// QuizzesMetadata.jsx
import { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AuthContext } from "../components/AuthProvider";
import { toDatetimeLocal } from "../util/toDateTimeLocal";

const backendHost = import.meta.env.VITE_BACKEND_HOST;

// Solid primary button (no gradient)
const primaryBtnClass =
  "w-full px-4 py-2.5 rounded-xl transition-all font-display font-bold text-sm text-[#3a2010] bg-[#ff9450] hover:bg-[#f58540] hover:-translate-y-0.5 active:translate-y-0.5";
const primaryBtnStyle = {
  boxShadow:
    "inset -3px -3px 6px rgba(80,30,5,0.4), 5px 5px 12px rgba(0,0,0,0.10)",
};

function StudentsModal({ cls, editingQuiz, setEditingQuiz, onClose }) {
  const { authFetch } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "" });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const studentIds = editingQuiz.studentIds || [];
  const isClassChecked = editingQuiz.classIds.includes(cls.id);

  const handleToggleStudent = (studentId) => {
    setEditingQuiz((prev) => {
      const currentStudentIds = prev.studentIds || [];
      const isSelected = currentStudentIds.includes(studentId);
      const nextStudentIds = isSelected
        ? currentStudentIds.filter((id) => id !== studentId)
        : [...currentStudentIds, studentId];
      const hasAccess = prev.classIds.length > 0 || nextStudentIds.length > 0;
      return {
        ...prev,
        accessibility: hasAccess ? "restricted" : "anyone",
        studentIds: nextStudentIds,
      };
    });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    try {
      // ASSUMPTION: adjust this route/body to match your actual backend / classServices.js
      const response = await authFetch(
        `${backendHost}/api/classes/${cls.id}/students`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStudent),
          credentials: "include",
        },
      );
      if (!response || !response.ok) {
        const result = await response.json();
        throw new Error(
          result.errors?.map((err) => err.msg).join(", ") ||
            result?.message ||
            "failed to add student",
        );
      }
      const createdStudent = await response.json();

      // keep the roster (embedded in userClasses) in sync so it shows immediately
      queryClient.setQueryData(["userClasses"], (prev) =>
        prev?.map((c) =>
          c.id === cls.id
            ? { ...c, students: [...(c.students || []), createdStudent] }
            : c,
        ),
      );

      // auto-grant this new student individual access
      setEditingQuiz((prev) => ({
        ...prev,
        accessibility: "restricted",
        studentIds: [...(prev.studentIds || []), createdStudent.id],
      }));

      toast.success("Student added!");
      setNewStudent({ name: "", email: "" });
      setIsAdding(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong adding the student");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col bg-[#F2E8D8] rounded-2xl shadow-[6px_6px_20px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#E3D3B8] flex-shrink-0">
          <h3 className="font-display font-bold text-lg text-[#332619] truncate">
            {cls.name}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8A7455] hover:bg-[#D0BB98] hover:text-[#332619] transition-colors flex-shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isClassChecked && (
          <p className="px-5 pt-3 text-xs text-[#8A7455] flex-shrink-0">
            The whole class already has access, so students are auto-checked.
          </p>
        )}

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto qm-scroll px-5 py-3">
          {cls.students?.length ? (
            <div className="space-y-1">
              {cls.students.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center gap-3 py-2 text-sm text-[#332619] cursor-pointer hover:bg-[#E3D3B8] rounded-lg px-2 -mx-2"
                >
                  <input
                    type="checkbox"
                    checked={isClassChecked || studentIds.includes(student.id)}
                    disabled={isClassChecked}
                    onChange={() => handleToggleStudent(student.id)}
                    className="h-4 w-4 rounded border-[#D0BB98] bg-[#F2E8D8] text-[#C9612B] focus:ring-[#C9612B] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex-shrink-0"
                  />
                  <span className="truncate flex-1">{student.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8A7455] py-2">
              No students in this class yet.
            </p>
          )}

          {isAdding ? (
            <form
              onSubmit={handleAddStudent}
              className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#D0BB98]"
            >
              <input
                type="text"
                placeholder="Full name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent((prev) => ({ ...prev, name: e.target.value }))
                }
                className="rounded-lg bg-white px-3 py-2 text-sm text-[#332619] border border-[#D0BB98] focus:outline-none focus:ring-1 focus:ring-[#C9612B]"
              />
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent((prev) => ({ ...prev, email: e.target.value }))
                }
                className="rounded-lg bg-white px-3 py-2 text-sm text-[#332619] border border-[#D0BB98] focus:outline-none focus:ring-1 focus:ring-[#C9612B]"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-sm px-3 py-1.5 rounded-lg text-[#8A7455] hover:bg-[#E3D3B8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-lg bg-[#C9612B] text-white hover:bg-[#b3541f]"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                setNewStudent({ name: "", email: "" });
              }}
              className="text-sm font-medium text-[#C9612B] hover:underline py-2 mt-1"
            >
              + Add student
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#E3D3B8] flex-shrink-0">
          <button
            onClick={onClose}
            className={primaryBtnClass}
            style={primaryBtnStyle}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ClassAccessDropdown({
  editingQuiz,
  setEditingQuiz,
  userClasses,
  isFetchingClasses,
  classFetchError,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openClassId, setOpenClassId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const studentIds = editingQuiz.studentIds || [];
  const openClass = userClasses?.find((c) => c.id === openClassId) || null;

  const handleToggleClass = (classId) => {
    setEditingQuiz((prev) => {
      const classesWithAccessIds = prev.classIds;
      const isSelected = classesWithAccessIds.includes(classId);
      const nextIds = isSelected
        ? classesWithAccessIds.filter((id) => id !== classId)
        : [...classesWithAccessIds, classId];
      const hasAccess =
        nextIds.length > 0 || (prev.studentIds?.length || 0) > 0;
      return {
        ...prev,
        accessibility: hasAccess ? "restricted" : "anyone",
        classIds: nextIds,
      };
    });
  };

  const handleClearAll = () => {
    setEditingQuiz((prev) => ({
      ...prev,
      accessibility: "anyone",
      classIds: [],
      studentIds: [],
    }));
  };

  const displayText =
    editingQuiz.classIds.length === 0 && studentIds.length === 0
      ? "Anyone with the code"
      : editingQuiz.classIds.length === 1 && studentIds.length === 0
        ? (userClasses?.find((c) => c.id === editingQuiz.classIds[0])?.name ??
          "1 class selected")
        : [
            editingQuiz.classIds.length > 0
              ? `${editingQuiz.classIds.length} class${editingQuiz.classIds.length > 1 ? "es" : ""}`
              : null,
            studentIds.length > 0
              ? `${studentIds.length} student${studentIds.length > 1 ? "s" : ""}`
              : null,
          ]
            .filter(Boolean)
            .join(" + ");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full bg-[#E8DCC8] rounded-xl p-2.5 text-sm text-[#332619] text-left flex items-center justify-between shadow-[inset_4px_4px_8px_rgba(0,0,0,0.10)] hover:bg-[#E3D3B8] transition-all font-body"
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#E8DCC8] border border-[#D0BB98] rounded-xl shadow-lg z-20 max-h-72 overflow-y-auto qm-scroll">
          <label className="flex items-center gap-2 px-3 py-2 text-sm text-[#332619] hover:bg-[#E3D3B8] cursor-pointer border-b border-[#D0BB98]">
            <input
              type="checkbox"
              checked={
                editingQuiz?.classIds?.length === 0 && studentIds.length === 0
              }
              onChange={handleClearAll}
              className="h-4 w-4 rounded border-[#D0BB98] bg-[#F2E8D8] text-[#C9612B] focus:ring-[#C9612B] cursor-pointer"
            />
            <span>Anyone with the code</span>
          </label>

          {isFetchingClasses ? (
            <p className="px-3 py-2 text-[#8A7455] text-sm">
              Loading classes...
            </p>
          ) : classFetchError ? (
            <p className="px-3 py-2 text-red-400 text-xs">
              Unable to load classes.
            </p>
          ) : userClasses?.length ? (
            userClasses.map((cls) => {
              const isClassChecked = editingQuiz.classIds.includes(cls.id);
              const selectedStudentCount = (cls.students || []).filter((s) =>
                studentIds.includes(s.id),
              ).length;
              return (
                <div
                  key={cls.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#E3D3B8] border-b border-[#D0BB98] last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={isClassChecked}
                    onChange={() => handleToggleClass(cls.id)}
                    className="h-4 w-4 rounded border-[#D0BB98] bg-[#F2E8D8] text-[#C9612B] focus:ring-[#C9612B] cursor-pointer flex-shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => setOpenClassId(cls.id)}
                    className="flex-1 flex items-center justify-between gap-2 text-left text-sm text-[#332619]"
                  >
                    <span className="truncate">{cls.name}</span>
                    {isClassChecked ? (
                      <span className="text-xs text-[#8A7455] flex-shrink-0">
                        Whole class
                      </span>
                    ) : selectedStudentCount > 0 ? (
                      <span className="text-xs text-[#8A7455] flex-shrink-0">
                        {selectedStudentCount} student
                        {selectedStudentCount > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="px-3 py-2 text-[#8A7455] text-sm">
              No classes found.
            </p>
          )}
        </div>
      )}

      {openClass && (
        <StudentsModal
          cls={openClass}
          editingQuiz={editingQuiz}
          setEditingQuiz={setEditingQuiz}
          onClose={() => setOpenClassId(null)}
        />
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-[#E8DCC8] rounded-xl p-2.5 text-sm text-[#332619] placeholder:text-[#8A7455] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.10)] focus:outline-none focus:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.11),0_0_0_3px_rgba(255,148,80,0.35)] transition-all font-body";
const labelClass = "text-sm font-semibold text-[#8A7455] block mb-2 font-body";
const secondaryBtnClass =
  "w-full px-4 py-2.5 rounded-xl transition-all font-display font-bold text-sm text-[#5c4a34] bg-[#E8DCC8] hover:bg-[#E3D3B8] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.10)]";

const scrollStyles = `
  .qm-scroll::-webkit-scrollbar {
    width: 8px;
  }
  .qm-scroll::-webkit-scrollbar-track {
    background: #F2E8D8;
  }
  .qm-scroll::-webkit-scrollbar-thumb {
    background: #E2692A;
    border-radius: 6px;
  }
  .qm-scroll::-webkit-scrollbar-thumb:hover {
    background: #A84C1F;
  }
  .qm-scroll {
    scrollbar-width: thin;
    scrollbar-color: #E2692A #F2E8D8;
  }
`;

export default function QuizzesMetadata({
  quiz,
  onUpdateQuizMeta,
  userClasses,
  isFetchingClasses,
  classFetchError,
}) {
  const [editingQuiz, setEditingQuiz] = useState({
    classIds: [],
    studentIds: [],
    ...quiz,
  });
  const navigate = useNavigate();

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-full text-[#8A7455] text-sm font-body bg-[#E8DCC8] w-full p-3">
        <div className="w-full h-full rounded-2xl bg-[#F2E8D8] flex items-center justify-center shadow-[6px_6px_14px_rgba(0,0,0,0.10)]">
          Select a quiz to view details
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 h-full w-full bg-[#E8DCC8] flex flex-col font-body p-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        ${scrollStyles}
      `}</style>

      <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-[#F2E8D8] overflow-hidden shadow-[6px_6px_14px_rgba(0,0,0,0.10)]">
        {/* Header */}
        <div className="p-4 bg-[#E3D3B8]">
          <div className="flex items-center gap-0.5 mb-2 max-w-full">
            <input
              type="text"
              name="quizTitle"
              value={editingQuiz.quizTitle || ""}
              onChange={(e) =>
                setEditingQuiz((prev) => ({
                  ...prev,
                  quizTitle: e.target.value,
                }))
              }
              placeholder="Enter quiz title..."
              style={{
                width: `${Math.min(
                  Math.max(editingQuiz.quizTitle?.length || 16, 10),
                  32,
                )}ch`,
                paddingRight: 0,
              }}
              className="min-w-0 max-w-full bg-transparent text-lg sm:text-xl font-display font-bold text-[#332619] border-b border-transparent focus:border-[#C9612B] focus:outline-none transition-all hover:bg-[#F2E8D8]/70 rounded pl-1 -ml-1"
            />
            <svg
              className="w-4 h-4 text-black flex-shrink-0 opacity-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-[#8A7455]">
            <span>{quiz.questionCount} questions</span>
            <span>•</span>
            <span>Created {quiz.createdAt || "Recently"}</span>
          </div>
        </div>

        {/* Metadata Content */}
        <div className="flex-1 min-h-0 p-4 overflow-y-auto qm-scroll space-y-4">
          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={editingQuiz.description}
              onChange={(e) => {
                setEditingQuiz((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              className={`${inputClass} resize-none`}
              rows="3"
              placeholder="Enter quiz description"
            />
          </div>

          {/* Share Token */}
          <div>
            <label className={labelClass}>Share token</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quiz.shareToken?.toUpperCase() || "N/A"}
                readOnly
                className="flex-1 px-3 py-2 rounded-xl text-[#8A7455] text-sm min-w-0 bg-[#E8DCC8] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.10)]"
              />
              {quiz.shareToken && (
                <button
                  className="px-3 py-2 rounded-xl text-sm font-display font-bold text-[#3a2010] bg-[#ff9450] hover:bg-[#f58540] transition-all flex-shrink-0 hover:-translate-y-0.5 active:translate-y-0.5"
                  style={primaryBtnStyle}
                  onClick={() => {
                    navigator.clipboard.writeText(quiz.shareToken);
                    toast.success("Token copied to clipboard!", {
                      duration: 2000,
                      style: {
                        background: "#10B981",
                        color: "#fff",
                      },
                    });
                  }}
                >
                  Copy
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Due Date */}
            <div>
              <label className={labelClass}>Due date</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={toDatetimeLocal(editingQuiz.dueDate).slice(0, 16)}
                onChange={(e) =>
                  setEditingQuiz((prev) => ({
                    ...prev,
                    dueDate: e.target.value || null,
                  }))
                }
                className={inputClass}
              />
            </div>

            {/* Accessibility */}
            <div>
              <label className={labelClass}>Who can Access</label>
              <ClassAccessDropdown
                editingQuiz={editingQuiz}
                setEditingQuiz={setEditingQuiz}
                userClasses={userClasses}
                isFetchingClasses={isFetchingClasses}
                classFetchError={classFetchError}
              />
            </div>
          </div>

          {/* Status and Max Attempts - Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Max Attempts */}
            <div>
              <label className={labelClass}>Max attempts</label>
              <input
                type="number"
                name="maxAttempts"
                min="1"
                placeholder="e.g. 3"
                value={editingQuiz.maxAttempts || ""}
                onChange={(e) =>
                  setEditingQuiz((prev) => ({
                    ...prev,
                    maxAttempts:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className={inputClass}
              />
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={editingQuiz.status || "draft"}
                onChange={(e) =>
                  setEditingQuiz((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button
            className={primaryBtnClass}
            style={primaryBtnStyle}
            onClick={() => onUpdateQuizMeta(editingQuiz)}
          >
            Save changes
          </button>
          <button
            className={secondaryBtnClass}
            onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)}
          >
            View results
          </button>
        </div>
      </div>
    </div>
  );
}
