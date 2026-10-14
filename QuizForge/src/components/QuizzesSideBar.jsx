// QuizzesSidebar.jsx
import { useNavigate } from "react-router-dom";
import "./LoadingScreen.css";

// Solid primary button (no gradient)
const primaryBtnClass =
  "w-full px-4 py-2.5 rounded-xl transition-all font-display font-bold text-sm text-[#3a2010] bg-[#ff9450] hover:bg-[#f58540] hover:-translate-y-0.5 active:translate-y-0.5";
const primaryBtnStyle = {
  boxShadow:
    "inset 2px 2px 4px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(80,30,5,0.3), 6px 6px 14px rgba(0,0,0,0.10)",
};

export default function QuizzesSidebar({
  isFetching,
  quizzes,
  setSelectedQuizId,
  selectedQuizId,
  onDeleteQuiz,
  isError,
}) {
  const navigate = useNavigate();

  if (isFetching) {
    return (
      <div className="w-full lg:w-64 flex flex-col min-h-0 bg-[#E8DCC8] p-3">
        <div className="flex-1 rounded-2xl bg-[#F2E8D8] flex items-center justify-center shadow-[6px_6px_14px_rgba(0,0,0,0.10)]">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full lg:w-64 flex flex-col min-h-0 bg-[#E8DCC8] font-body p-3 gap-3">
        <div className="flex-1 rounded-2xl bg-[#F2E8D8] flex items-center justify-center text-[#8A7455] text-sm shadow-[6px_6px_14px_rgba(0,0,0,0.10)]">
          Failed to fetch quizzes
        </div>
        {/* Create New Quiz Button */}
        <div className="rounded-2xl bg-[#F2E8D8] p-4 shadow-[6px_6px_14px_rgba(0,0,0,0.10)]">
          <button
            onClick={() =>
              navigate("/teacher", { state: { openForgeQuizModal: true } })
            }
            className={primaryBtnClass}
            style={primaryBtnStyle}
          >
            + Create new quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-64 flex flex-col min-h-0 bg-[#E8DCC8] font-body p-3 gap-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        .quiz-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .quiz-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .quiz-scroll::-webkit-scrollbar-thumb {
          background: #E2692A;
          border-radius: 8px;
        }
        .quiz-scroll::-webkit-scrollbar-thumb:hover {
          background: #A84C1F;
        }
        .quiz-scroll {
          scrollbar-width: thin;
          scrollbar-color: #E2692A transparent;
        }
      `}</style>

      <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-[#F2E8D8] overflow-hidden shadow-[6px_6px_14px_rgba(0,0,0,0.10)]">
        {/* Header */}
        <div className="p-4 bg-[#E3D3B8]">
          <h2 className="text-sm font-display font-semibold text-[#332619]">
            Exams
          </h2>
        </div>

        {/* Quiz List */}
        <div className="flex-1 min-h-0 p-4 overflow-y-auto quiz-scroll">
          <div className="space-y-2">
            {quizzes?.length > 0 ? (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`p-3 rounded-xl text-sm flex items-center justify-between group cursor-pointer transition-all ${
                    selectedQuizId === quiz.id
                      ? "bg-[#ff9450] text-[#3a2010] shadow-[inset_-2px_-2px_5px_rgba(80,30,5,0.3),4px_4px_10px_rgba(0,0,0,0.10)]"
                      : "bg-[#E8DCC8] hover:bg-[#E3D3B8] text-[#332619] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.10)]"
                  }`}
                  onClick={() => {
                    const newId = selectedQuizId === quiz.id ? null : quiz.id;
                    setSelectedQuizId(newId);
                  }}
                >
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{quiz.quizTitle}</div>
                    <div
                      className={`text-xs mt-1 ${
                        selectedQuizId === quiz.id
                          ? "text-[#5c3512]"
                          : "text-[#8A7455]"
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
                        ? "text-[#3a2010] hover:text-black"
                        : "text-red-400 hover:text-red-500"
                    }`}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="text-[#8A7455] text-sm text-center py-8">
                No quizzes yet
              </div>
            )}
          </div>
        </div>

        {/* Create New Quiz Button */}
        <div className="p-4">
          <button
            onClick={() =>
              navigate("/teacher", { state: { openForgeQuizModal: true } })
            }
            className={primaryBtnClass}
            style={primaryBtnStyle}
          >
            + Create new Exams
          </button>
        </div>
      </div>
    </div>
  );
}
