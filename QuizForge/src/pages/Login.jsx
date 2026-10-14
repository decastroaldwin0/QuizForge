import React, { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../components/AuthProvider";
import "./Login.css";

const backendHost = import.meta.env.VITE_BACKEND_HOST;

export default function LogInComponent() {
  const [isLogin, setIsLogin] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const { setToken, setUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      alert("Please enter your first and last name");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";

      const body = isLogin
        ? {
            email: email.toLocaleLowerCase(),
            password: password,
          }
        : {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.toLocaleLowerCase().trim(),
            password: password,
            role: role,
          };

      const response = await fetch(`${backendHost}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json();

        throw new Error(
          result.errors?.map((e) => e.msg).join(", ") ||
            result?.message ||
            "failed to submit",
        );
      }

      const data = await response.json();

      if (isLogin && data.user.role === "teacher") {
        setToken(data.accessToken);
        setUserInfo(data.user);
        navigate("/teacher");
      } else if (isLogin && data.user.role === "student") {
        setToken(data.accessToken);
        setUserInfo(data.user);
        navigate("/student");
      } else {
        alert(data.message || "Something wrong with login");

        setIsLogin(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error:", error);

      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!backendHost) {
    return <Navigate to="/error" replace />;
  }

  return (
    <main className="page-container leaning-mode" id="pageContainer">
      {/* =====================================================
          MAIN STAGE
          The mascot, clipboard, books, lightbulb, etc. are all
          part of the login-design.png background, so only the
          form is rendered here.
         ===================================================== */}

      <div className="stage-wrapper">
        <div className="clipboard-card" id="clipboardCard">
          <div className="clipboard-board">
            {/* =============================================
                PAPER / FORM AREA
               ============================================= */}

            <div className="paper-sheet">
              {/* =========================================
                  HEADER
                 ========================================= */}

              <header className="card-header">
                <div className="brand-logo">
                  <div className="logo-icon-box">
                    <span className="q-letter">E</span>
                  </div>

                  <div className="brand-text">
                    <h2 className="brand-name">
                      Exam<span className="highlight">Gen</span>
                    </h2>

                    <p className="brand-subtext">Learn • Practice • Achieve</p>
                  </div>
                </div>

                <div className="classroom-badge">
                  <span className="badge-icon">🎓</span>

                  <div className="badge-text">
                    <span className="small-text">Built for the</span>

                    <span className="strong-text">Classroom</span>
                  </div>
                </div>
              </header>

              {/* =========================================
                  WELCOME SECTION
                 ========================================= */}

              <section className="headline-section">
                <h3 className="welcome-title">
                  {isLogin ? (
                    <>
                      Welcome <span className="highlight-orange">Back!</span>
                    </>
                  ) : (
                    <>
                      Create <span className="highlight-orange">Account!</span>
                    </>
                  )}
                </h3>

                <p className="welcome-subtitle">
                  {isLogin
                    ? "Log in to access your Exam and continue learning."
                    : "Sign up to start creating or taking Exams."}
                </p>
              </section>

              {/* =========================================
                  LOGIN / SIGNUP FORM
                 ========================================= */}

              <form
                id="loginForm"
                className="login-form"
                onSubmit={handleSubmit}
                autoComplete="on"
                noValidate
              >
                {/* =======================================
                    SIGNUP FIELDS
                   ======================================= */}

                {!isLogin && (
                  <>
                    {/* First + Last Name */}

                    <div className="signup-name-row">
                      <div className="form-group">
                        <label className="input-label">First name</label>

                        <div className="input-wrapper">
                          <span className="input-icon">👤</span>

                          <input
                            type="text"
                            className="custom-input"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Juan"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="input-label">Last name</label>

                        <div className="input-wrapper">
                          <span className="input-icon">👤</span>

                          <input
                            type="text"
                            className="custom-input"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Dela Cruz"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role */}

                    <div className="form-group">
                      <label className="input-label">I am a...</label>

                      <div className="role-selector">
                        <button
                          type="button"
                          className={`role-option ${
                            role === "student" ? "active" : ""
                          }`}
                          onClick={() => setRole("student")}
                        >
                          Student
                        </button>

                        <button
                          type="button"
                          className={`role-option ${
                            role === "teacher" ? "active" : ""
                          }`}
                          onClick={() => setRole("teacher")}
                        >
                          Teacher
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* =======================================
                    EMAIL
                   ======================================= */}

                <div className="form-group" id="emailGroup">
                  <div className="input-wrapper">
                    <span className="input-icon">✉</span>

                    <div className="input-content">
                      <label htmlFor="emailInput" className="input-label">
                        Email address
                      </label>

                      <input
                        type="email"
                        id="emailInput"
                        name="email"
                        className="custom-input"
                        value={email}
                        placeholder="youredu@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <span className="field-error" id="emailError" />
                </div>

                {/* =======================================
                    PASSWORD
                   ======================================= */}

                <div className="form-group" id="passwordGroup">
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>

                    <div className="input-content">
                      <label htmlFor="passwordInput" className="input-label">
                        Password
                      </label>

                      <input
                        type="password"
                        id="passwordInput"
                        name="password"
                        className="custom-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <span className="field-error" id="passwordError" />
                </div>

                {/* =======================================
                    CONFIRM PASSWORD
                   ======================================= */}

                {!isLogin && (
                  <div className="form-group">
                    <div className="input-wrapper">
                      <span className="input-icon">🔒</span>

                      <div className="input-content">
                        <label
                          htmlFor="confirmPasswordInput"
                          className="input-label"
                        >
                          Confirm password
                        </label>

                        <input
                          type="password"
                          id="confirmPasswordInput"
                          name="confirmPassword"
                          className="custom-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* =======================================
                    REMEMBER ME
                   ======================================= */}

                {isLogin && (
                  <div className="form-options">
                    <label className="custom-checkbox-container">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        defaultChecked
                      />

                      <span className="checkmark">
                        <span className="check-icon">✓</span>
                      </span>

                      <span className="checkbox-label">Remember me</span>
                    </label>

                    <span className="forgot-link">Forgot password?</span>
                  </div>
                )}

                {/* =======================================
                    SUBMIT BUTTON
                   ======================================= */}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                  id="submitBtn"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner" />

                      <span className="btn-text">Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-arrow-badge">→</span>

                      <span className="btn-text">
                        {isLogin ? "Log in" : "Sign up"}
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* =========================================
                  FOOTER
                 ========================================= */}

              <footer className="card-footer">
                <p>
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}

                  <button
                    type="button"
                    className="signup-link"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Sign up" : "Log in"}

                    <span className="small-arrow">→</span>
                  </button>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
