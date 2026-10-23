// QuizzesSidebar.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LoadingScreen.css";

const primaryBtnClass =
  "w-full px-4 py-2.5 rounded-md transition-all font-display font-bold text-sm bg-accept text-inkondark hover:bg-green-600 hover:-translate-y-0.5 active:translate-y-0.5";

export default function QuizzesSidebar({
  isFetching,
  quizzes,
  onSelectQuiz,
  selectedQuizId,
  onDeleteQuiz,
  isError,
}) {
  const navigate = useNavigate();
  const quizListRef = useRef(null);
  const quizListContentRef = useRef(null);
  const [scrollMetrics, setScrollMetrics] = useState({
    clientHeight: 0,
    scrollHeight: 0,
    scrollTop: 0,
  });

  useEffect(() => {
    const list = quizListRef.current;
    const content = quizListContentRef.current;
    if (!list || !content) return;

    const updateScrollMetrics = () => {
      setScrollMetrics({
        clientHeight: list.clientHeight,
        scrollHeight: list.scrollHeight,
        scrollTop: list.scrollTop,
      });
    };

    updateScrollMetrics();
    list.addEventListener("scroll", updateScrollMetrics, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollMetrics);
    resizeObserver.observe(list);
    resizeObserver.observe(content);

    return () => {
      list.removeEventListener("scroll", updateScrollMetrics);
      resizeObserver.disconnect();
    };
  }, [quizzes]);

  const scrollTrackHeight = Math.max(0, scrollMetrics.clientHeight - 8);
  const scrollThumbHeight = Math.min(
    scrollTrackHeight,
    Math.max(
      24,
      (scrollTrackHeight * scrollMetrics.clientHeight) /
        Math.max(scrollMetrics.scrollHeight, 1),
    ),
  );
  const scrollProgress =
    scrollMetrics.scrollHeight > scrollMetrics.clientHeight
      ? scrollMetrics.scrollTop /
        (scrollMetrics.scrollHeight - scrollMetrics.clientHeight)
      : 0;
  const scrollThumbTop =
    4 +
    scrollProgress * Math.max(0, scrollTrackHeight - scrollThumbHeight);

  if (isFetching) {
    return (
      <div className="w-full lg:w-64 min-w-0 flex flex-col bg-specialsurface backdrop-blur border-r-2 border-accent/50 p-3">
        <div className="flex-1 rounded-lg flex items-center justify-center border border-muted/20">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full lg:w-64 flex-1 lg:flex-none min-h-0 min-w-0 flex flex-col bg-specialsurface backdrop-blur border-r-2 border-accent/50 font-body p-3 gap-3">
        <div className="flex-1 rounded-lg flex items-center justify-center text-red-400 text-sm border border-muted/20">
          Failed to fetch quizzes
        </div>
        {/* Create New Quiz Button */}
        <div className="rounded-lg p-4 border border-muted/20">
          <button
            onClick={() =>
              navigate("/teacher", { state: { openForgeQuizModal: true } })
            }
            className={primaryBtnClass}
          >
            + Create new quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-64 flex-1 lg:flex-none min-h-0 min-w-0 flex flex-col bg-specialsurface backdrop-blur border-r-2 border-accent/50 font-body p-3 gap-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        @media (max-width: 1023px) {
          .quiz-list-scroll {
            scrollbar-width: none !important;
          }
          .quiz-list-scroll::-webkit-scrollbar {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden border border-muted/20">
        {/* Header */}
        <div className="p-4 border-b border-muted/20">
          <h2 className="text-sm font-display font-semibold text-inkondark">
            Quizzes
          </h2>
        </div>

        {/* Quiz List */}
        <div className="relative flex-1 min-h-0">
          <div
            ref={quizListRef}
            className="quiz-list-scroll h-full p-4 pr-6 overflow-y-auto overscroll-contain"
          >
            <div ref={quizListContentRef} className="space-y-2">
              {quizzes?.length > 0 ? (
                quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className={`p-3 rounded-md text-sm flex items-center justify-between group cursor-pointer transition-all ${
                      selectedQuizId === quiz.id
                        ? "bg-accent text-inkondark"
                        : "hover:bg-muted/20 text-inkondark border border-muted/20"
                    }`}
                    onClick={() => {
                      const newId =
                        selectedQuizId === quiz.id ? null : quiz.id;
                      onSelectQuiz(newId);
                    }}
                  >
                    <div className="flex-1 truncate">
                      <div className="font-medium truncate">
                        {quiz.quizTitle}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedQuizId === quiz.id
                            ? "text-inkondark"
                            : "text-muted"
                        }`}
                      >
                        {quiz.questionCount || 0} questions
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteQuiz(quiz.id);
                      }}
                      className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${
                        selectedQuizId === quiz.id
                          ? "text-inkondark hover:text-red-500"
                          : "text-red-400 hover:text-red-500"
                      }`}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-muted text-sm text-center py-8">
                  No quizzes yet
                </div>
              )}
            </div>
          </div>
          {scrollMetrics.scrollHeight > scrollMetrics.clientHeight && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-1 top-1 bottom-1 w-1 rounded-full bg-line/60 lg:hidden"
            >
              <div
                className="absolute left-0 right-0 rounded-full bg-accent"
                style={{
                  height: `${scrollThumbHeight}px`,
                  top: `${scrollThumbTop}px`,
                }}
              />
            </div>
          )}
        </div>

        {/* Create New Quiz Button */}
        <div className="p-4">
          <button
            onClick={() =>
              navigate("/teacher", { state: { openForgeQuizModal: true } })
            }
            className={primaryBtnClass}
          >
            + Create new quiz
          </button>
        </div>
      </div>
    </div>
  );
}
