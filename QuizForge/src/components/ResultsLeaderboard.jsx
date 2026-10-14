// ResultsLeaderboard.jsx
//
// A two-panel leaderboard sidebar for the quiz results dashboard.
// Top panel: individual student rankings for this quiz.
// Bottom panel: class (section) rankings by average score.

// Derives initials from a full name string — e.g. "Ana Reyes" → "AR"
function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Assigns a deterministic avatar bg/text color from a small palette
// so each student always gets the same color without storing it.
const AVATAR_COLORS = [
  { bg: "bg-[#3a2a1c]", text: "text-[#ffb27a]" },
  { bg: "bg-[#1c332e]", text: "text-teal-300" },
  { bg: "bg-[#2a1c33]", text: "text-purple-300" },
  { bg: "bg-[#332a1c]", text: "text-amber-300" },
  { bg: "bg-[#331c24]", text: "text-rose-300" },
];

function avatarColor(id) {
  const safeId = typeof id === "number" ? id : 0;
  return AVATAR_COLORS[safeId % AVATAR_COLORS.length];
}

// Medal colors for the top 3 ranks
function rankStyle(rank) {
  if (rank === 1) return "text-[#C9612B] font-bold";
  if (rank === 2) return "text-[#5c4a34] font-bold";
  if (rank === 3) return "text-[#c9873a] font-bold";
  return "text-[#8A7455] font-medium";
}

// Score badge color: green if high, amber if mid, red if low
function scoreBadgeClass(score) {
  if (score >= 85) return "bg-green-900/50 text-green-300";
  if (score >= 65) return "bg-amber-900/50 text-amber-300";
  return "bg-red-900/50 text-red-300";
}

// ─────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────

function StudentRow({ student, rank }) {
  const { bg, text } = avatarColor(student.id);

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#E3D3B8] transition-colors group font-body">
      {/* Rank number */}
      <span className={`w-5 text-center text-sm ${rankStyle(rank)}`}>
        {rank}
      </span>

      {/* Avatar circle */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-display font-semibold ${bg} ${text}`}
      >
        {getInitials(student.name)}
      </div>

      {/* Name */}
      <span className="flex-1 text-sm text-[#5c4a34] truncate">
        {student.name}
      </span>

      {/* Score badge */}
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBadgeClass(student.score)}`}
      >
        {student.score}%
      </span>
    </div>
  );
}

function ClassRow({ cls, rank, maxAverage }) {
  // Width of the progress bar is relative to the top-scoring class
  const barWidth =
    maxAverage > 0 ? Math.round((cls.averagescore / maxAverage) * 100) : 0;

  return (
    <div className="py-2 px-3 rounded-xl hover:bg-[#E3D3B8] transition-colors font-body">
      {/* Top line: rank, name, average badge */}
      <div className="flex items-center gap-3 mb-1.5">
        <span className={`w-5 text-center text-sm ${rankStyle(rank)}`}>
          {rank}
        </span>
        <span className="flex-1 text-sm text-[#5c4a34] truncate">
          {cls.classname}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBadgeClass(cls.averagescore)}`}
        >
          {cls.averagescore ?? 0}%
        </span>
      </div>

      {/* Progress bar (solid color, no gradient) */}
      <div className="ml-8 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-[#E8DCC8] rounded-full overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.10)]">
          <div
            className="h-full rounded-full transition-all duration-500 bg-[#ff9450]"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className="text-xs text-[#8A7455] w-14 text-right">
          {cls.takers} students
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ResultsLeaderboard({ STUDENTS, classes }) {
  const maxAverage =
    classes?.length > 0 ? Math.max(...classes.map((c) => c.averagescore)) : 0;

  return (
    <div className="w-full lg:w-[30%] flex-shrink-0 flex flex-col gap-3 h-full bg-[#E8DCC8] font-body p-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        .rl-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .rl-scroll::-webkit-scrollbar-track {
          background: #F2E8D8;
        }
        .rl-scroll::-webkit-scrollbar-thumb {
          background: #E2692A;
          border-radius: 6px;
        }
        .rl-scroll::-webkit-scrollbar-thumb:hover {
          background: #A84C1F;
        }
        .rl-scroll {
          scrollbar-width: thin;
          scrollbar-color: #E2692A #F2E8D8;
        }
      `}</style>

      {/* ── Top half: Student ranking ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-[#F2E8D8] overflow-hidden shadow-[6px_6px_14px_rgba(0,0,0,0.10)]">
        {/* Header */}
        <div className="px-4 py-3 bg-[#E3D3B8] flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-display font-semibold text-[#332619] tracking-wide">
            Student ranking
          </h2>
          <span className="text-xs text-[#8A7455]">
            {STUDENTS?.length ?? 0} Students
          </span>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto rl-scroll py-2 px-1">
          {!STUDENTS || !Array.isArray(STUDENTS) || STUDENTS.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <svg
                className="w-16 h-16 text-[#E3D3B8] mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="text-[#8A7455] font-display font-medium">
                Waiting for students
              </h3>
              <p className="text-sm text-[#8A7455] mt-1 max-w-xs">
                Once students start the quiz, their progress and scores will
                appear here automatically.
              </p>
            </div>
          ) : (
            STUDENTS?.map((student, index) => (
              <StudentRow key={student.id} student={student} rank={index + 1} />
            ))
          )}
        </div>
      </div>

      {/* ── Bottom half: Class ranking ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-[#F2E8D8] overflow-hidden shadow-[6px_6px_14px_rgba(0,0,0,0.10)]">
        {/* Header */}
        <div className="px-4 py-3 bg-[#E3D3B8] flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-display font-semibold text-[#332619] tracking-wide">
            Class ranking
          </h2>
          <span className="text-xs text-[#8A7455]">
            {classes?.length} sections
          </span>
        </div>

        {/* List — no scroll needed for a small number of classes */}
        <div className="flex-1 overflow-y-auto rl-scroll py-2 px-1">
          {classes?.map((cls, index) => (
            <ClassRow
              key={cls.classid}
              cls={cls}
              rank={index + 1}
              maxAverage={maxAverage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
