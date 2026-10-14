import { useState, useContext, useCallback, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Navigate,
  useBeforeUnload,
} from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AuthContext } from "../components/AuthProvider";
import { studentQuizService } from "../services/studentQuizService";
import StudentTopbar from "../components/StudentTopbar";
import StudentSidebar from "../components/StudentSidebar";
import StudentQuizWindow from "../components/StudentQuizWindow";
import StudentTimeLimit from "../components/StudentTimeLimit";
import LoadingScreen from "../components/LoadingScreen";

const backendHost = import.meta.env.VITE_BACKEND_HOST;

// Palette — keep in sync with StudentSidebar / StudentQuizWindow / StudentTimeLimit / StudentTopbar
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

export default function StudentQuizPage() {
  // ----------------------------------------------------------------
  // STATES AND FRIENDS
  // ----------------------------------------------------------------
  const { quizToken } = useParams();
  const storageKey = `quiz_progress_${quizToken}`;
  const { authFetch, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? JSON.parse(saved).answers : {};
  });
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? JSON.parse(saved).selectedQuestionIndex : 0;
  });
  const [answeredQuestions, setAnsweredQuestions] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    // sessionStorage can't store a Set
    // save it as an array and convert back
    return saved ? new Set(JSON.parse(saved).answeredQuestions) : new Set();
  });
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  // Mobile question-list drawer - shared by StudentTopbar's hamburger button
  // and StudentSidebar's drawer/backdrop. UI-only, doesn't touch quiz logic.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch quiz data
  const {
    data: quizData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["studentQuiz", quizToken],
    queryFn: () =>
      studentQuizService.fetchStudentQuiz(authFetch, quizToken, backendHost),
    enabled: !!quizToken && !!authFetch && !!backendHost,
    staleTime: 5000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Extract quiz data for readability
  const quiz = quizData?.quiz;
  const questions = quizData?.questions;
  const attemptId = quizData?.attemptId;
  const attemptCount = quizData?.totalAttempts;
  const maxAttempts = quiz?.maxAttempts;
  const selectedQuestion = questions?.[selectedQuestionIndex] || null;

  const canPrev = false;
  const canNext = true;

  // intercept backward navigation
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
  }, []);

  // If navigating back
  // Ask user to stay or submit quiz before navigation
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowExitWarning(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // save user progress to session
  const saveProgress = (
    updatedAnswers,
    updatedIndex,
    updatedAnsweredQuestions,
  ) => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        answers: updatedAnswers,
        selectedQuestionIndex: updatedIndex,
        // Convert Set to array for serialization
        answeredQuestions: [...updatedAnsweredQuestions],
      }),
    );
  };

  // function to clear timers on session storage
  const clearTimerStorage = useCallback(() => {
    if (!attemptId) return;

    const timerPrefix = `quiz_timer_${attemptId}_`;

    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const storageKey = sessionStorage.key(index);

      if (storageKey?.startsWith(timerPrefix)) {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [attemptId]);

  // ----------------------------------------------------------
  // MUTATION FUNCTIONS
  // ----------------------------------------------------------
  const submitQuizMutation = useMutation({
    mutationFn: (payload) =>
      studentQuizService.submitStudentQuiz(
        authFetch,
        quizToken,
        backendHost,
        payload,
      ),
    onSuccess: () => {
      // Remove session storage
      sessionStorage.removeItem(storageKey);
      clearTimerStorage();
      toast.success("Attempt received!");
      navigate("/student", { replace: true });
    },
    onError: (error) => {
      console.error(error);
      toast.error(
        error?.message || "Something went wrong while submitting attempt",
      );
    },
  });

  const deleteAttemptMutation = useMutation({
    mutationFn: () =>
      studentQuizService.deleteStudentQuizAttempt(
        authFetch,
        quizToken,
        backendHost,
      ),
    onSuccess: () => {
      // Remove session storage
      sessionStorage.removeItem(storageKey);
      clearTimerStorage();
      navigate("/student");
    },
    onError: (error) => {
      console.error("Failed delete attempt", error);
      toast.error("Failed to delete attempt");
    },
  });

  const handleQuestionSelect = (index) => {
    setSelectedQuestionIndex(index);
    saveProgress(answers, index, answeredQuestions);
  };

  const handlePrev = () => {
    if (selectedQuestionIndex > 0) {
      setSelectedQuestionIndex((prev) => prev - 1);
    }
  };
  const handleNext = () => {
    if (selectedQuestionIndex < questions.length - 1) {
      setSelectedQuestionIndex((prev) => prev + 1);
    }
  };

  const handleAnswerChange = (ans) => {
    const updatedAnswers = { ...answers, [selectedQuestion.id]: ans };
    const updatedAnsweredQuestions = new Set(answeredQuestions);
    updatedAnsweredQuestions.add(selectedQuestion.id);

    setAnswers(updatedAnswers);
    setAnsweredQuestions(updatedAnsweredQuestions);
    saveProgress(
      updatedAnswers,
      selectedQuestionIndex,
      updatedAnsweredQuestions,
    );
  };

  // auto advance to next question when time runs out
  // auto submit if there is no next question
  const handleTimeout = () => {
    if (selectedQuestionIndex < questions.length - 1) {
      setSelectedQuestionIndex((prev) => prev + 1);
    } else {
      handleQuizSubmit();
    }
  };

  // warn before closing or refreshing tab
  useBeforeUnload(
    useCallback((e) => {
      e.preventDefault();
    }, []),
  );

  const handleQuizSubmit = async () => {
    return submitQuizMutation.mutateAsync({
      questions,
      answers,
      quiz,
      attemptId,
    });
  };

  const hasActiveQuizProgress = () => {
    const savedProgress = sessionStorage.getItem(storageKey);
    const savedAnswers = savedProgress
      ? JSON.parse(savedProgress)?.answers || {}
      : {};

    return Boolean(
      attemptId ||
      Object.keys(savedAnswers).length > 0 ||
      answeredQuestions.size > 0,
    );
  };

  const deleteAttempt = () => {
    deleteAttemptMutation.mutate();
  };

  const handleLogout = async () => {
    if (hasActiveQuizProgress()) {
      return setShowLogoutWarning(true);
    }
    try {
      await logout();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while logging out");
    }
  };

  const submitAndLogout = async () => {
    try {
      await handleQuizSubmit();
      await logout();
    } catch (err) {
      console.error(err);
      alert("Something went wrong on submit and logout");
    }
  };

  // -------------------------------------------------------------------
  // ERROR BOUNDARIES
  // -------------------------------------------------------------------
  if (isLoading) {
    return <LoadingScreen fullScreen />;
  }

  if (error) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: C.page, color: C.ink }}
      >
        <div
          className="text-center rounded-2xl border p-8 shadow-sm max-w-sm"
          style={{ background: C.paper, borderColor: C.border }}
        >
          <p style={{ color: "#B3261E" }}>{error?.message}</p>
          <button
            onClick={() => {
              deleteAttempt();
            }}
            className="mt-4 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            style={{ background: C.tangerine }}
          >
            Back to Student Page
          </button>
        </div>
      </div>
    );
  }

  if (!backendHost) {
    return <Navigate to="/error" replace />;
  }

  return (
    <div
      className="h-screen flex flex-col font-sans"
      style={{ background: C.page, color: C.ink }}
    >
      <StudentTopbar
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: C.page }}
      >
        {showExitWarning && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
            style={{ background: "rgba(28,25,23,0.45)" }}
          >
            <div
              className="rounded-2xl p-6 max-w-sm text-center space-y-4 shadow-xl border"
              style={{ background: C.paper, borderColor: C.border }}
            >
              <h2 className="text-lg font-bold" style={{ color: C.ink }}>
                Leave Exam?
              </h2>
              <p className="text-sm" style={{ color: C.inkSoft }}>
                Your Exam will be auto-submitted if you navigate away.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ border: `1px solid ${C.border}`, color: C.inkSoft }}
                >
                  Stay
                </button>
                <button
                  onClick={() => {
                    setShowExitWarning(false);
                    handleQuizSubmit();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                  style={{ background: C.tangerine }}
                >
                  Submit & Exit
                </button>
              </div>
            </div>
          </div>
        )}
        {showLogoutWarning && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
            style={{ background: "rgba(28,25,23,0.45)" }}
          >
            <div
              className="rounded-2xl p-6 max-w-sm text-center space-y-4 shadow-xl border"
              style={{ background: C.paper, borderColor: C.border }}
            >
              <h2 className="text-lg font-bold" style={{ color: C.ink }}>
                Leave Quiz?
              </h2>
              <p className="text-sm" style={{ color: C.inkSoft }}>
                Your quiz will be auto-submitted if you navigate away.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowLogoutWarning(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ border: `1px solid ${C.border}`, color: C.inkSoft }}
                >
                  Stay
                </button>
                <button
                  onClick={() => {
                    setShowLogoutWarning(false);
                    submitAndLogout();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                  style={{ background: C.tangerine }}
                >
                  Submit & Logout
                </button>
              </div>
            </div>
          </div>
        )}
        {/* The Question List*/}
        <StudentSidebar
          questions={questions}
          onQuestionSelect={handleQuestionSelect}
          currentQuestionIndex={selectedQuestionIndex}
          answeredQuestions={answeredQuestions}
          onQuizSubmit={handleQuizSubmit}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* The Question Stage (Center) */}
        <StudentQuizWindow
          question={selectedQuestion}
          canPrev={canPrev}
          onPrev={handlePrev}
          canNext={canNext}
          onNext={handleNext}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          totalQuestions={questions?.length ?? 0}
          answeredCount={answeredQuestions.size}
          onQuizSubmit={handleQuizSubmit}
        />

        {/* The Timer Sidebar (Right) */}
        <StudentTimeLimit
          key={selectedQuestionIndex}
          timeLimit={selectedQuestion?.timeLimit ?? null}
          onTimeout={handleTimeout}
          attemptCount={attemptCount}
          maxAttempts={maxAttempts}
          attemptId={attemptId}
          questionId={selectedQuestion?.id}
          currentQuestionIndex={selectedQuestionIndex}
          totalQuestions={questions?.length ?? 0}
        />
      </div>
    </div>
  );
}
