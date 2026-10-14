// Palette — keep in sync with StudentSidebar / StudentTimeLimit / StudentTopbar
const C = {
  ink: "#1C1917",
  inkSoft: "#6B6259",
  paper: "#FFFFFF",
  page: "#FDF3EA",
  tangerine: "#E8590C",
  tangerineTint: "#FDEEE3",
  tangerineDark: "#B8430A",
  green: "#1F8A57",
  border: "#E7E1D8",
  borderStrong: "#D3C9BC",
};

// --------------------------------------------------
// SUB COMPONENT
// --------------------------------------------------
function ReasoningAnswerInput({ answers, question, onAnswerChange }) {
  // prevent pasting answer
  const handlePaste = (e) => {
    e.preventDefault();
  };

  return (
    <div className="h-40 sm:h-48 flex flex-col">
      {/* Fixed height for textarea to prevent takeover */}
      <textarea
        className="w-full flex-1 rounded-xl p-3 sm:p-4 focus:outline-none text-sm resize-none"
        style={{
          background: C.paper,
          border: `1px solid ${C.border}`,
          color: C.ink,
        }}
        onFocus={(e) => (e.target.style.borderColor = C.tangerine)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
        placeholder="Type your answer here..."
        value={answers[question.id] || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        onPaste={(e) => handlePaste(e)}
      />
    </div>
  );
}

export default function StudentQuizWindow({
  question,
  onNext,
  onPrev,
  canNext,
  canPrev,
  answers,
  onAnswerChange,
  totalQuestions,
  answeredCount,
  onQuizSubmit,
}) {
  if (!question)
    return (
      <div
        className="flex-1 p-6 sm:p-8 text-sm sm:text-base"
        style={{ color: C.inkSoft, background: C.page }}
      >
        Select a question to begin.
      </div>
    );

  // Same "confirm if unanswered" behavior as the Submit button in
  // StudentSidebar, just also reachable here since the sidebar is
  // hidden behind a drawer on mobile.
  const handleSubmitClick = () => {
    const unanswered = (totalQuestions ?? 0) - (answeredCount ?? 0);
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`,
      );
      if (!confirmed) return;
    }
    onQuizSubmit();
  };

  return (
    <div
      className="flex-1 flex flex-col min-w-0 pt-32 lg:pt-0"
      style={{ background: C.page, color: C.ink }}
    >
      {/* Question Content */}
      <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-0">
        <div
          className="flex-1 flex flex-col rounded-2xl p-4 sm:p-6 lg:rounded-none lg:border-none lg:p-0 lg:shadow-none"
          style={{
            background: C.paper,
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Question Part */}
          <div
            className="flex-1 flex flex-col justify-center py-4 sm:py-6 overflow-y-auto pr-2"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <h1
              className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed select-none text-center"
              style={{ color: C.ink }}
            >
              {question.questionText}
            </h1>
          </div>

          {/* Input Part */}
          <div className="flex-1 flex flex-col justify-center py-4 sm:py-6">
            <div className="w-full max-w-2xl mx-auto">
              {/* max-w-2xl keeps buttons from getting too wide on desktop */}
              {question.questionType === "multiple-choice" ? (
                <div
                  className="divide-y overflow-hidden rounded-2xl shadow-sm"
                  style={{ border: `2px solid ${C.borderStrong}` }}
                >
                  {["A", "B", "C", "D"].map((letter) => {
                    const optionKey = `option${letter}`;
                    const optionText = question[optionKey];
                    if (!optionText) return null;

                    const isSelected =
                      answers?.[question.id] === letter.toLowerCase();

                    return (
                      <button
                        key={letter}
                        onClick={() => onAnswerChange(letter.toLowerCase())}
                        className="w-full p-2.5 sm:p-3 text-left transition-all flex items-center gap-3"
                        style={{
                          background: isSelected ? C.tangerineTint : C.paper,
                        }}
                      >
                        {/* Letter Indicator */}
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0"
                          style={
                            isSelected
                              ? { background: C.tangerine, color: "#fff" }
                              : { background: "#F1EEE9", color: C.inkSoft }
                          }
                        >
                          {letter}
                        </div>
                        <span
                          className="text-sm flex-1"
                          style={{
                            color: isSelected ? C.tangerineDark : C.ink,
                            fontWeight: isSelected ? 500 : 400,
                          }}
                        >
                          {optionText}
                        </span>
                        {isSelected && (
                          <span
                            className="shrink-0 text-sm font-bold"
                            style={{ color: C.tangerine }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : question.questionType === "true-false" ? (
                <div className="space-y-3">
                  {/* True Option */}
                  <label
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl cursor-pointer transition-colors"
                    style={{
                      background: C.paper,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="true"
                      checked={answers[question.id] === "true"}
                      onChange={(e) => onAnswerChange(e.target.value)}
                      className="w-5 h-5"
                      style={{ accentColor: C.tangerine }}
                    />
                    <span className="text-sm flex-1" style={{ color: C.ink }}>
                      True
                    </span>
                  </label>

                  {/* False Option */}
                  <label
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl cursor-pointer transition-colors"
                    style={{
                      background: C.paper,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="false"
                      checked={answers[question.id] === "false"}
                      onChange={(e) => onAnswerChange(e.target.value)}
                      className="w-5 h-5"
                      style={{ accentColor: C.tangerine }}
                    />
                    <span className="text-sm flex-1" style={{ color: C.ink }}>
                      False
                    </span>
                  </label>
                </div>
              ) : (
                <ReasoningAnswerInput
                  answers={answers}
                  question={question}
                  onAnswerChange={onAnswerChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div
        className="p-4 sm:p-6 flex justify-between items-center backdrop-blur-sm"
        style={{
          borderTop: `1px solid ${C.border}`,
          background: "rgba(255,255,255,0.7)",
        }}
      >
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all disabled:opacity-20"
          style={{ color: C.inkSoft }}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex items-center gap-2 px-5 sm:px-8 py-2 rounded-lg text-sm sm:text-base font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-20"
          style={{ background: C.tangerine }}
        >
          Next →
        </button>
      </div>

      {/* Mobile-only submit - reachable without opening the question drawer, now at the very bottom */}
      <button
        onClick={handleSubmitClick}
        className="w-full py-3 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] lg:hidden"
        style={{ background: C.green }}
      >
        Submit quiz
      </button>
    </div>
  );
}
