// Palette — keep in sync with StudentQuizWindow / StudentTimeLimit / StudentTopbar
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
};

// StudentQuizSidebar.jsx
// isOpen / onClose control the mobile drawer and are owned by StudentQuizPage
// (shared with the hamburger button in StudentTopbar) - they're UI-only,
// separate from the answer/question logic below.
export default function StudentSidebar({
  questions,
  currentQuestionIndex,
  //onQuestionSelect,
  answeredQuestions,
  onQuizSubmit,
  isOpen,
  onClose,
}) {
  const totalQuestions = questions?.length ?? 0;
  const answeredCount = answeredQuestions?.size || 0;
  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <>
      {/* Backdrop, mobile only */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-30"
          style={{ background: "rgba(28,25,23,0.45)" }}
        />
      )}

      <div
        className={`w-80 max-w-[85vw] flex flex-col h-full fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 lg:static lg:z-auto lg:max-w-none lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: C.paper, borderRight: `1px solid ${C.border}` }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div>
            <h2 className="text-lg font-semibold" style={{ color: C.ink }}>
              Questions
            </h2>
            <p className="text-xs mt-1" style={{ color: C.inkSoft }}>
              {answeredCount} of {totalQuestions} answered
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded"
            style={{ color: C.inkSoft }}
            aria-label="Close question list"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div
          className="px-4 py-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="w-full rounded-full h-2"
            style={{ background: C.tangerineTint }}
          >
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
                background: C.tangerine,
              }}
            />
          </div>
        </div>

        {/* Questions List - Now a vertical list */}
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {questions?.map((question, index) => {
              const isSelected = index === currentQuestionIndex;
              const isAnswered = answeredQuestions?.has(question.id);

              return (
                <button
                  key={question.id}
                  //onClick={() => onQuestionSelect(index)}
                  className="flex items-center gap-3 p-3 rounded-lg text-sm transition-all text-left"
                  style={{
                    background: isSelected ? C.tangerineTint : "transparent",
                    color: isSelected ? C.tangerineDark : C.inkSoft,
                    border: `1px solid ${isSelected ? C.tangerine : "transparent"}`,
                  }}
                >
                  {/* Status Indicator Circle */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      isSelected ? "ring-2 ring-offset-2" : ""
                    }`}
                    style={{
                      ...(isAnswered
                        ? { background: C.green, color: "#fff" }
                        : { background: "#F1EEE9", color: C.inkSoft }),
                      ...(isSelected
                        ? {
                            "--tw-ring-color": C.tangerine,
                            "--tw-ring-offset-color": C.paper,
                          }
                        : {}),
                    }}
                  >
                    {index + 1}
                  </div>

                  <span className="truncate font-medium">
                    {`Question ${index + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Quiz Button */}
        <div className="p-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <button
            className="w-full px-4 py-3 text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: C.green }}
            onClick={() => {
              const unanswered = totalQuestions - answeredCount;
              if (unanswered > 0) {
                const confirm = window.confirm(
                  `You have ${unanswered} unanswered question(s). Submit anyway?`,
                );
                console.log(confirm);
                if (!confirm) return;
              }
              onQuizSubmit();
            }}
          >
            Submit Exam
          </button>
        </div>
      </div>
    </>
  );
}
