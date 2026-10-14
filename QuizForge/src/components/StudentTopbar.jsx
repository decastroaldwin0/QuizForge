import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

// Palette — keep in sync with StudentSidebar / StudentQuizWindow / StudentTimeLimit
const C = {
  ink: "#1C1917",
  inkSoft: "#6B6259",
  paper: "#FFFFFF",
  tangerine: "#E8590C",
  border: "#E7E1D8",
};

export default function SudentTopbar({ onLogout, onToggleSidebar }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="p-4 flex items-center justify-between"
      style={{ borderBottom: `1px solid ${C.border}`, background: C.paper }}
    >
      {/* LEFT SIDE: Mobile menu button + Logo */}
      <div className="flex items-center gap-3">
        {/* Opens the question list drawer below the lg breakpoint */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ color: C.tangerine }}
          aria-label="Toggle question list"
        >
          <span className="text-lg leading-none">☰</span>
        </button>
        <span
          className="flex items-center gap-1.5 text-xl font-bold cursor-pointer transition-colors"
          style={{ color: C.ink }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
            style={{ background: C.tangerine }}
          >
            Q
          </span>
          Exam<span style={{ color: C.tangerine }}>Gen</span>
        </span>
      </div>

      {/* RIGHT SIDE: Actions */}
      <div className="flex items-center gap-4">
        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all"
            style={{ background: C.ink }}
          >
            {/* Placeholder for Profile Image */}
            <span className="text-white text-xs font-bold">JD</span>
          </button>
          {isProfileMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-2 z-50"
              style={{ background: C.paper, border: `1px solid ${C.border}` }}
            >
              <button
                className="w-full text-left px-4 py-2 transition-colors"
                style={{ color: "#B3261E" }}
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
