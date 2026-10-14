import { useEffect, useState, useRef } from "react";

// Palette — keep in sync with StudentSidebar / StudentQuizWindow / StudentTopbar
const C = {
  ink: "#1C1917",
  inkSoft: "#6B6259",
  paper: "#FFFFFF",
  page: "#FDF3EA",
  tangerine: "#E8590C",
  tangerineTint: "#FDEEE3",
  tangerineDark: "#B8430A",
  border: "#E7E1D8",
};

export default function StudentTimeLimit({
  timeLimit,
  onTimeout,
  attemptCount,
  maxAttempts,
  attemptId,
  questionId,
  currentQuestionIndex,
  totalQuestions,
}) {
  const timerStorageKey =
    attemptId && questionId ? `quiz_timer_${attemptId}_${questionId}` : null;

  // get stored start time in session storage
  // create new one if none
  const getStoredStartTime = () => {
    if (!timerStorageKey) return Date.now();

    try {
      const savedValue = sessionStorage.getItem(timerStorageKey);
      const parsedValue = Number(savedValue);
      const now = Date.now();
      const maxReasonableAge = timeLimit * 2 * 1000;

      if (
        !savedValue ||
        Number.isNaN(parsedValue) ||
        parsedValue <= 0 ||
        parsedValue > now ||
        now - parsedValue > maxReasonableAge
      ) {
        const now = Date.now();
        sessionStorage.setItem(timerStorageKey, String(now));
        return now;
      }

      return parsedValue;
    } catch (err) {
      console.error(
        "Session Storage access failed, using current time instead: ",
        err,
      );
      return Date.now();
    }
  };

  // 1. Initialize state
  const [startTime] = useState(() => getStoredStartTime());
  const [now, setNow] = useState(() => Date.now());
  const hasTimedOut = useRef(false);

  // Set start time on mount (when question changes, component remounts)
  const finishTime = startTime + timeLimit * 1000;
  const remainingMs = Math.max(0, finishTime - now);
  const remainingSeconds = Math.floor(remainingMs / 1000);

  //formatting time before display
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // changes "now" state pero second to recalculate remaining time
  useEffect(() => {
    if (timeLimit <= 0) return;

    //set up interval
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    //cleanup: stops timer when user leaves page
    return () => clearInterval(intervalId);
  }, [timeLimit]);

  // timeout handler
  useEffect(() => {
    if (timeLimit > 0 && remainingSeconds === 0 && !hasTimedOut.current) {
      hasTimedOut.current = true;
      onTimeout();
    }
  }, [timeLimit, onTimeout, remainingSeconds]);

  const isLowTime = remainingSeconds < 10;
  const progressPct =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  return (
    <>
      {/* Status bar - shown below the lg breakpoint, sits right under the
          topbar (adjust the top-[Npx] value if your topbar's height differs) */}
      <div
        className="lg:hidden fixed top-[73px] inset-x-0 z-20 px-4 py-2.5 backdrop-blur"
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <div
          className="mb-2 h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: C.tangerineTint }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, background: C.tangerine }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: C.inkSoft }}>
            {`Attempt ${attemptCount} of ${maxAttempts} · Q${currentQuestionIndex + 1} of ${totalQuestions}`}
          </span>
          <span
            className={`flex items-center gap-1 text-sm font-mono font-semibold ${isLowTime ? "animate-pulse" : ""}`}
            style={{ color: isLowTime ? "#B3261E" : C.tangerineDark }}
          >
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Full side panel - lg and up only, unchanged in substance from before */}
      <div
        className="w-72 p-6 hidden lg:flex flex-col gap-8"
        style={{ background: C.page, borderLeft: `1px solid ${C.border}` }}
      >
        {/* Timer Section */}
        <>
          <h2
            className="text-m font-bold mb-2"
            style={{ color: C.ink }}
          >{`Attempt: ${attemptCount} of ${maxAttempts}`}</h2>
        </>
        <div
          className="rounded-2xl p-6 text-center transition-colors"
          style={{
            background: isLowTime ? "#FCEBEA" : C.tangerineTint,
            border: `1px solid ${isLowTime ? "#F3C6C3" : "#F5D2B8"}`,
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: isLowTime ? "#B3261E" : C.tangerineDark }}
          >
            Time Remaining
          </p>
          <div
            className={`text-4xl font-mono font-bold ${isLowTime ? "animate-pulse" : ""}`}
            style={{ color: isLowTime ? "#B3261E" : C.tangerineDark }}
          >
            {formattedTime}
          </div>
        </div>

        {/* Quiz Info */}
        <div className="space-y-4">
          <div className="pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: C.inkSoft }}
            >
              Instructions
            </p>
            <ul
              className="text-xs space-y-2 list-disc pl-4"
              style={{ color: C.inkSoft }}
            >
              <li>Answers are saved automatically.</li>
              <li>The question auto-advances when time expires.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
