import React, { useState } from "react";
import CameraFeed from "./CameraFeed";

export default function MockPhone({
  activeApp,
  onAppToggle,
  syncStatus,
  screen,
  setScreen,
  activePersona,
  glassesWorn,
  setGlassesWorn,
  handoverChoice,
  setHandoverChoice,
  whatsappNumber,
  setWhatsappNumber,
  otpSent,
  setOtpSent,
  otpValue,
  setOtpValue,
  onCalibrateComplete,
  pxPerMm,
  setPxPerMm,
  logAnalyticsEvent,
  handleWithdrawConsent,
  gameScoreDetails,
  activeResult,
  setActiveResult,
  handleChildFinish,
  handleOpenParentReport,
  onAddWidgetResolve,
  widgetInstalled,
  children // GapchaseGame / ParentResultDetail
}) {
  // Consent checkbox states
  const [showSystemDialog, setShowSystemDialog] = useState(false);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [consent3, setConsent3] = useState(false);
  const [consent4, setConsent4] = useState(false);
  
  const allConsented = consent1 && consent2 && consent3 && consent4;

  // Auto-redirect loader effect after parent consent/permission is granted
  useEffect(() => {
    if (screen === "SETUP_LOADING") {
      const timer = setTimeout(() => {
        onAddWidgetResolve(true); // marks syncStatus = "AWAITING_PLAY" & installs widget
        setScreen("HOME"); // auto redirects parent to Lenskart Home!
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const child = activePersona.child;
  const isCorrectedTrack = child.track === "corrected";

  // Calculate elapsed months for stale prescription cards (A2)
  const getElapsedMonths = (dateStr) => {
    if (!dateStr) return 0;
    const pxDate = new Date(dateStr);
    const today = new Date();
    return (today.getFullYear() - pxDate.getFullYear()) * 12 + today.getMonth() - pxDate.getMonth();
  };

  const elapsedMonths = isCorrectedTrack ? getElapsedMonths(child.prescription?.date) : 0;
  const isPrescriptionStale = elapsedMonths > 6;

  const handleStartFlow = () => {
    logAnalyticsEvent("vision_check_consent_shown", { childId: child.id });
    setScreen("CONSENT");
  };

  const handleConsentSubmit = () => {
    if (!allConsented) return;
    logAnalyticsEvent("vision_check_consent_granted", { consent_version: "DPDP_V1.1" });
    setScreen("SETUP_LOADING");
  };

  const handlePhoneSelectSubmit = () => {
    if (handoverChoice === "child_phone" && !otpSent) {
      if (!whatsappNumber) {
        alert("Please enter a valid number.");
        return;
      }
      setOtpSent(true);
      alert("Simulated verification code sent to parent's phone. Enter '1234' to verify.");
      return;
    }

    if (handoverChoice === "child_phone" && otpSent && otpValue !== "1234") {
      alert("Invalid code. Enter '1234' for simulation.");
      return;
    }

    logAnalyticsEvent("vision_check_phone_handover_selected", { choice: handoverChoice });
    setScreen("CALIBRATION");
  };

  const handleStartGame = () => {
    logAnalyticsEvent("vision_check_session_started", {
      track: child.track,
      glasses_worn: glassesWorn,
      px_per_mm: pxPerMm
    });
    setScreen("CALIBRATION");
  };

  // Determine Arcade Rank (C3)
  const getArcadeRank = (score) => {
    if (score >= 2500) return "🌟 GAP MASTER LEGEND";
    if (score >= 1500) return "⚡ SPEEDSTER CHAMP";
    if (score >= 800) return "🌀 RING RUNNER";
    return "🎮 APPRENTICE CHASER";
  };

  // Check if current view is a game mode
  const isGameMode = activeApp === "GAPCHASE_PWA";

  return (
    <div className="phone-wrapper">
      {/* Notch */}
      <div className="phone-notch"></div>
      
      {/* Status Bar */}
      <div className={`phone-status-bar ${isGameMode ? "game-mode" : ""}`}>
        <span>17:30</span>
        <div style={{ display: "flex", gap: "5px" }}>
          <span>📶</span>
          <span>🔋 85%</span>
        </div>
      </div>

      {/* App Switcher Toggle (Three-App View) */}
      <div className={`app-switcher-bar ${isGameMode ? "game-mode" : ""}`}>
        <button 
          className={`app-btn ${activeApp === "LENSKART" ? "active" : ""}`}
          onClick={() => onAppToggle("LENSKART")}
        >
          📱 Lenskart App
        </button>
        <button 
          className={`app-btn ${activeApp === "HOME_SCREEN" ? "active" : ""}`}
          onClick={() => onAppToggle("HOME_SCREEN")}
        >
          🏡 Home Screen
        </button>
        <button 
          className={`app-btn ${activeApp === "GAPCHASE_PWA" ? "active" : ""}`}
          onClick={() => onAppToggle("GAPCHASE_PWA")}
        >
          🕹️ Shape Chase PWA
        </button>
      </div>

      {/* Screen Content */}
      <div className={`phone-content ${isGameMode ? "game-mode" : ""}`}>
        
        {/* ========================================================
           APP 1: LENSKART APP (PARENT PORTAL)
           ======================================================== */}
        {activeApp === "LENSKART" && (
          <>
            {/* LENSKART SCREEN: HOME */}
            {screen === "HOME" && (
              <div style={{ paddingBottom: "70px" }}> {/* spacer for fixed bottom navigation */}
                {/* 1. Green Store Banner */}
                <div className="lk-green-banner">
                  <span>🏪 MG Road Store is 2.4 km away</span>
                  <span style={{ cursor: "pointer", textDecoration: "underline" }}>Navigate &gt;</span>
                </div>

                {/* 2. Top Header with Logo, Gold Badge, and Cart */}
                <div className="lk-logo-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px", cursor: "pointer" }}>☰</span>
                    <div className="lk-logo" style={{ fontSize: "18px" }}>
                      lenskart<span>.</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="lk-gold-pill">Get Gold</span>
                    <span style={{ fontSize: "16px", cursor: "pointer" }}>❤️</span>
                    <span style={{ fontSize: "16px", cursor: "pointer", position: "relative" }}>
                      🛒
                      <span style={{ 
                        position: "absolute", 
                        top: "-5px", 
                        right: "-5px", 
                        background: "var(--lk-accent)", 
                        color: "white", 
                        fontSize: "8px", 
                        width: "12px", 
                        height: "12px", 
                        borderRadius: "50%", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontWeight: "bold" 
                      }}>
                        1
                      </span>
                    </span>
                  </div>
                </div>

                {/* 3. Search Bar Container */}
                <div className="lk-search-container">
                  <div className="lk-search-box" onClick={handleStartFlow} style={{ cursor: "pointer" }}>
                    <span>🔍</span>
                    <input type="text" placeholder="What are you looking for?" readOnly />
                    <span style={{ marginRight: "6px" }}>[⌗]</span>
                    <span>📷</span>
                  </div>
                </div>

                {/* 4. Timer Banner */}
                <div className="lk-timer-banner">
                  <span>Limited Memberships:</span>
                  <span style={{ color: "var(--lk-warning)" }}>02d : 06h : 59m : 16s</span>
                </div>

                {/* Direct report check when game is completed */}
                {syncStatus === "COMPLETED" && (
                  <div className="stale-card" style={{ borderColor: "var(--lk-success)", background: "rgba(46, 213, 115, 0.05)" }}>
                    <span className="stale-card-alert" style={{ background: "var(--lk-success)" }}>New Report</span>
                    <h4>Vision Screening Complete</h4>
                    <p className="subtitle" style={{ marginBottom: "12px" }}>
                      {child.name}'s test results are ready to view.
                    </p>
                    <button className="btn-primary" style={{ background: "var(--lk-success)", color: "#fff" }} onClick={handleOpenParentReport}>
                      Open Vision Report
                    </button>
                  </div>
                )}

                {/* Awaiting Child Play Card when returned to Home (solves dead screen look - generic copy) */}
                {syncStatus === "AWAITING_PLAY" && (
                  <div className="lk-banner-ad" style={{
                    margin: "16px",
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    borderRadius: "16px",
                    padding: "20px 16px",
                    color: "white",
                    position: "relative",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--lk-secondary)", fontWeight: "800" }}>
                      Kids Vision Check
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", lineHeight: "1.3", margin: 0 }}>
                      Setup Complete & Ready to Play 🦖
                    </h3>
                    <p style={{ fontSize: "11px", opacity: 0.8, lineHeight: "1.4", margin: 0 }}>
                      The Shape Chase game is ready! Launch the game from the home screen widget to start screening. Results will sync here automatically once play finishes.
                    </p>
                  </div>
                )}

                {/* 5. GENERIC MINIMALIST LENSKART AD BANNER (Acquisition path, matching R5 requirements) */}
                {syncStatus === "SETUP" && (
                  <div className="lk-banner-ad" onClick={handleStartFlow} style={{
                    margin: "16px",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    borderRadius: "16px",
                    padding: "20px 16px",
                    color: "white",
                    position: "relative",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--lk-secondary)", fontWeight: "800" }}>
                      Kids Vision Check
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", lineHeight: "1.3", margin: 0 }}>
                      Kids Vision Check at Home 🦖
                    </h3>
                    <p style={{ fontSize: "11px", opacity: 0.8, lineHeight: "1.4", margin: 0 }}>
                      Check your child's eyes in 60 seconds. A free, pediatric-calibrated screening helper game to monitor changes.
                    </p>
                    <button className="btn-primary" style={{
                      background: "white",
                      color: "#0f172a",
                      border: "none",
                      fontWeight: "bold",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      alignSelf: "flex-start",
                      fontSize: "11px",
                      cursor: "pointer",
                      marginTop: "4px"
                    }}>
                      Start 60s Check
                    </button>
                  </div>
                )}



                {/* Real Lenskart Categories footer matching Screenshot 1 */}
                <div style={{ padding: "0 0 20px 0" }}>
                  <div style={{ height: "1px", background: "var(--lk-border)", margin: "16px 16px 12px 16px" }} />
                  
                  {/* Category Section Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 16px 12px 16px" }}>
                    <span style={{ fontWeight: "800", color: "#000042", fontSize: "14px" }}>Eyeglasses</span>
                    <span style={{ background: "#ebe6ff", color: "#6b21a8", fontSize: "8px", padding: "2px 6px", borderRadius: "20px", fontWeight: "800" }}>
                      with Power
                    </span>
                  </div>

                  {/* 4 Category Grid Cards (Screenshot 1 Match) */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", padding: "0 16px" }}>
                    <div className="lk-category-card">
                      <div className="lk-cat-img-box" style={{ background: "#fee2e2" }}>👨</div>
                      <span className="lk-cat-label">Men</span>
                    </div>
                    <div className="lk-category-card">
                      <div className="lk-cat-img-box" style={{ background: "#fae8ff" }}>👩</div>
                      <span className="lk-cat-label">Women</span>
                    </div>
                    <div className="lk-category-card" onClick={handleStartFlow}>
                      <div className="lk-cat-img-box" style={{ background: "#e0f2fe" }}>👦</div>
                      <span className="lk-cat-label">Kids</span>
                    </div>
                    <div className="lk-category-card">
                      <div className="lk-cat-img-box" style={{ background: "#fef9c3", position: "relative" }}>
                        <span style={{ 
                          position: "absolute", 
                          top: "-6px", 
                          right: "-6px", 
                          background: "#ef4444", 
                          color: "white", 
                          fontSize: "6px", 
                          padding: "1px 3px", 
                          borderRadius: "4px",
                          fontWeight: "900"
                        }}>
                          NEW
                        </span>
                        👓
                      </div>
                      <span className="lk-cat-label">Co-Creator</span>
                    </div>
                  </div>
                </div>

                {/* 6. LENSKART APP BOTTOM NAVIGATION BAR */}
                <div className="lk-bottom-nav">
                  <div className="lk-bottom-nav-item active">
                    <span className="icon">♾️</span>
                    <span>Home</span>
                  </div>
                  <div className="lk-bottom-nav-item">
                    <span className="icon">🏪</span>
                    <span>Stores</span>
                  </div>
                  <div className="lk-bottom-nav-item">
                    <span className="icon">😀</span>
                    <span>3D Try on</span>
                  </div>
                  <div className="lk-bottom-nav-item" onClick={handleStartFlow}>
                    <span className="icon">👁️</span>
                    <span>Eye Test</span>
                  </div>
                  <div className="lk-bottom-nav-item">
                    <span className="icon">📋</span>
                    <span>Orders</span>
                  </div>
                  <div className="lk-bottom-nav-item">
                    <span className="icon">💬</span>
                    <span>Assistant</span>
                  </div>
                </div>
              </div>
            )}

            {/* LENSKART SCREEN: CONSENT */}
            {screen === "CONSENT" && (
              <div className="consent-screen">
                <h2>Parental Consent</h2>
                <p className="desc">
                  We require active verification from a registered guardian under India's DPDP Act to check <strong>{child.name}</strong>'s acuity.
                </p>

                <div className="consent-list">
                  <div className="consent-item" onClick={() => setConsent1(!consent1)}>
                    <div className={`consent-checkbox ${consent1 ? "checked" : ""}`} />
                    <div className="consent-text">
                      <strong>Guardian Status Affirmation</strong>
                      I confirm that I am the legal parent or guardian of {child.name}.
                    </div>
                  </div>

                  <div className="consent-item" onClick={() => setConsent2(!consent2)}>
                    <div className={`consent-checkbox ${consent2 ? "checked" : ""}`} />
                    <div className="consent-text">
                      <strong>Camera Access & Device Privacy</strong>
                      I authorize camera access to monitor face alignment. No video leaves this phone.
                    </div>
                  </div>

                  <div className="consent-item" onClick={() => setConsent3(!consent3)}>
                    <div className={`consent-checkbox ${consent3 ? "checked" : ""}`} />
                    <div className="consent-text">
                      <strong>Screening Helper, Not Diagnosis</strong>
                      I understand this is a change-monitoring tool. It does not replace clinical diagnostics.
                    </div>
                  </div>

                  <div className="consent-item" onClick={() => setConsent4(!consent4)}>
                    <div className={`consent-checkbox ${consent4 ? "checked" : ""}`} />
                    <div className="consent-text">
                      <strong>Result Syncing to Lenskart</strong>
                      I consent to sync results securely to my Lenskart account once play completes.
                    </div>
                  </div>
                </div>

                <div className="consent-dpdp-note">
                  🛡️ **DPDP Guard:** Continuous profiling of children is barred. This check runs as a single, explicit session.
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    className="btn-primary" 
                    disabled={!allConsented}
                    onClick={handleConsentSubmit}
                    style={{ flex: 1 }}
                  >
                    Agree & Continue
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ background: "#f1f5f9", color: "#475569", width: "70px" }}
                    onClick={() => setScreen("HOME")}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}





            {/* LENSKART SCREEN: SETUP_LOADING (2s auto-redirect loader) */}
            {screen === "SETUP_LOADING" && (
              <div style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                padding: "32px 24px",
                textAlign: "center"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e2e8f0",
                  borderTop: "4px solid var(--lk-primary)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "20px"
                }} />
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--lk-primary)", marginBottom: "8px" }}>
                  Permission Secured!
                </h3>
                <p style={{ fontSize: "12px", color: "var(--lk-text-sub)", lineHeight: "1.5" }}>
                  Configuring Kids Vision Check and widget reminder... Redirecting you to Lenskart Home.
                </p>
              </div>
            )}

            {/* LENSKART SCREEN: ADD_WIDGET (DUOLINGO STYLED) */}
            {screen === "ADD_WIDGET" && (
              <div className="duo-install-screen">
                <div style={{ marginTop: "10px" }}>
                  <h2 className="duo-install-title">Add the widget as a reminder to come back again!</h2>
                </div>

                <div className="duo-phone-preview">
                  {/* Mock Phone homescreen preview */}
                  <div className="duo-mock-widget-grid">
                    {/* 2x2 widget */}
                    <div className="duo-mock-widget-preview">
                      <div className="streak">
                        <span>🔥</span>
                        <span>{child.sessions ? child.sessions.length + 2 : 2}</span>
                      </div>
                      <div className="duo-mascot-avatar" style={{ alignSelf: "center", fontSize: "28px" }}>
                        🦖
                      </div>
                      <div style={{ fontSize: "8px", fontWeight: "700", opacity: 0.8 }}>
                        LENSKART KIDS
                      </div>
                    </div>
                    {/* Mock app icons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div className="duo-mock-app-icon" />
                      <div className="duo-mock-app-icon" />
                    </div>
                  </div>

                  <div className="duo-mock-widget-grid" style={{ marginTop: "12px" }}>
                    <div className="duo-mock-app-icon" />
                    <div className="duo-mock-app-icon" />
                    <div className="duo-mock-app-icon" />
                    <div className="duo-mock-app-icon" />
                  </div>
                </div>

                <div style={{ width: "100%", paddingBottom: "10px" }}>
                  <button 
                    className="btn-primary" 
                    style={{ background: "#0ea5e9", color: "white", marginBottom: "12px", border: "none" }}
                    onClick={() => setShowSystemDialog(true)}
                  >
                    ADD WIDGET
                  </button>
                  <button 
                    onClick={() => onAddWidgetResolve(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      fontWeight: "700",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      letterSpacing: "0.5px"
                    }}
                  >
                    MAYBE LATER
                  </button>
                </div>
              </div>
            )}

            {screen === "AWAITING_PLAY" && (
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", textAlign: "center", background: "#fff" }}>
                <div style={{ fontSize: "50px", marginBottom: "16px" }}>📡</div>
                <h2 style={{ color: "var(--lk-primary)", marginBottom: "8px", fontWeight: "800" }}>Awaiting Game Play</h2>
                <p style={{ fontSize: "13px", color: "var(--lk-text-sub)", lineHeight: "1.5", marginBottom: "20px" }}>
                  Your consent has been registered! 
                  The vision check screening is now ready for <strong>{child.name}</strong> to play.
                </p>
                <div style={{
                  background: "var(--lk-bg-light)",
                  border: "1px solid var(--lk-border)",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "11px",
                  color: "var(--lk-text-main)",
                  lineHeight: "1.4",
                  textAlign: "left",
                  marginBottom: "20px"
                }}>
                  <strong>🕹️ Next Steps:</strong>
                  <ol style={{ paddingLeft: "16px", marginTop: "6px", margin: 0 }}>
                    <li style={{ marginBottom: "4px" }}>
                      Open the **Shape Chase PWA** (tap the switcher at the top or use the Home Screen widget shortcut).
                    </li>
                    <li>
                      Let your child complete the game session.
                    </li>
                  </ol>
                </div>
                
                {/* Go to Homepage CTA (resolves dead screen look) */}
                <button 
                  className="btn-primary" 
                  style={{ background: "var(--lk-primary)", color: "white", width: "100%", marginBottom: "12px" }}
                  onClick={() => setScreen("HOME")}
                >
                  Go to Homepage
                </button>

                <p style={{ fontSize: "10px", color: "var(--lk-text-sub)", fontStyle: "italic", margin: 0 }}>
                  Status: Waiting for child gameplay...
                </p>
              </div>
            )}

            {/* LENSKART SCREEN: PARENT_REPORT */}
            {screen === "PARENT_REPORT" && children}
          </>
        )}

        {/* ========================================================
           APP 3: ANDROID HOME SCREEN MOCK (Screenshot 4 Match)
           ======================================================== */}
        {activeApp === "HOME_SCREEN" && (
          <div className="duo-homescreen-view">
            <div className="duo-homescreen-wallpaper" />
            
            <svg className="duo-mountain-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,100 0,60 30,35 50,45 80,18 100,50 100,100" fill="#201103" opacity="0.9" />
              <polygon points="0,100 0,72 40,42 65,52 90,28 100,42 100,100" fill="#130103" />
            </svg>

            <div className="duo-homescreen-content">
              <div className="duo-homescreen-grid">
                <div className="duo-home-app">
                  <div className="duo-home-app-icon" style={{ background: "#2563eb", color: "white" }}>🔑</div>
                  <span className="duo-home-app-label">Authenticator</span>
                </div>
                <div className="duo-home-app">
                  <div className="duo-home-app-icon" style={{ background: "#fbbf24", color: "black" }}>🥬</div>
                  <span className="duo-home-app-label">Blinkit</span>
                </div>
                <div className="duo-home-app">
                  <div className="duo-home-app-icon" style={{ background: "#22c55e", color: "white" }}>💬</div>
                  <span className="duo-home-app-label">WhatsApp</span>
                </div>
                <div className="duo-home-app">
                  <div className="duo-home-app-icon" style={{ background: "#ffffff", border: "1px solid #cbd5e1" }}>🎬</div>
                  <span className="duo-home-app-label">What to wat...</span>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                {widgetInstalled ? (
                  <div 
                    className="duo-white-widget" 
                    onClick={() => {
                      onAppToggle("GAPCHASE_PWA");
                      setScreen("PWA_START");
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ fontSize: "32px", animation: "wiggle 2s ease-in-out infinite alternate" }}>🦖</span>
                      <div style={{ textAlign: "left" }}>
                        <strong style={{ fontSize: "12px", display: "block", color: "#1e293b", fontWeight: "800" }}>
                          Shape Chase
                        </strong>
                        <span style={{ fontSize: "9px", color: "#64748b", fontWeight: "600" }}>
                          Start daily eye recheck!
                        </span>
                      </div>
                    </div>
                    <span className="streak-badge">
                      🔥 {child.sessions ? child.sessions.length + 2 : 2}
                    </span>
                  </div>
                ) : (
                  <div style={{
                    border: "2px dashed rgba(255,255,255,0.25)",
                    borderRadius: "20px",
                    padding: "16px",
                    textAlign: "center",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.8)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    background: "rgba(0,0,0,0.2)",
                    backdropFilter: "blur(5px)"
                  }}>
                    💡 Complete parent calibration setup in the Lenskart App to install the home screen game widget!
                  </div>
                )}
              </div>

              <div className="duo-home-dock">
                <div className="duo-home-app" onClick={() => onAppToggle("LENSKART")}>
                  <div className="duo-home-app-icon" style={{ background: "#ffffff" }}>👓</div>
                  <span className="duo-home-app-label" style={{ color: "#fff" }}>Lenskart</span>
                </div>
                <div className="duo-home-app">
                  <div className="duo-home-app-icon" style={{ background: "#0ea5e9" }}>📞</div>
                  <span className="duo-home-app-label" style={{ color: "#fff" }}>Phone</span>
                </div>
                <div className="duo-home-app">
                  <div className="duo-home-app-icon" style={{ background: "#22c55e" }}>💬</div>
                  <span className="duo-home-app-label" style={{ color: "#fff" }}>Messages</span>
                </div>
                <div className="duo-home-app">
                  <div className="duo-home-app-icon" style={{ background: "#f87171" }}>🌐</div>
                  <span className="duo-home-app-label" style={{ color: "#fff" }}>Chrome</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
           APP 2: GAPCHASE PWA (CHILD ARCADES)
           ======================================================== */}
        {activeApp === "GAPCHASE_PWA" && (
          <>
            {/* PWA GATING: Setup incomplete */}
            {syncStatus === "SETUP" && (
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center", textAlign: "center", background: "var(--game-bg)", color: "#fff" }}>
                <div style={{ fontSize: "60px", marginBottom: "20px" }}>🔒</div>
                <h2 style={{ fontFamily: "Space Mono, monospace", color: "var(--game-yellow)", fontSize: "20px", marginBottom: "12px" }}>
                  AWAITING PARENT SETUP
                </h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5", maxWidth: "80%" }}>
                  Please ask your parent to set up the vision check from the **Lenskart App** first.
                </p>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "24px" }}>
                  (Consent verification and device calibration are required before play)
                </div>
              </div>
            )}

            {/* PWA SCREEN: START GAME */}
            {syncStatus === "AWAITING_PLAY" && screen === "PWA_START" && (
              <div className="handover-screen" style={{ background: "var(--game-bg)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div className="handover-icon">🎮</div>
                <h2 style={{ color: "var(--game-yellow)", fontFamily: "Space Mono, monospace" }}>WELCOME TO SHAPE CHASE</h2>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: "8px 24px 20px 24px" }}>
                  Hold the screen at a comfortable distance (40 cm). 
                  Spot the shape in the center and tap the button at the bottom that matches it!
                </p>

                <button 
                  className="btn-primary" 
                  style={{ background: "var(--game-primary)", color: "var(--game-bg)", margin: "20px 24px 0 24px" }}
                  onClick={handleStartGame}
                >
                  Play Game (Shape Chase)
                </button>
              </div>
            )}

            {/* PWA SCREEN: CALIBRATION (webcam face alignment before play) */}
            {syncStatus === "AWAITING_PLAY" && screen === "CALIBRATION" && (
              <div style={{ background: "white", padding: "16px", height: "100%", display: "flex", flexDirection: "column" }}>
                <CameraFeed 
                  onCalibrateComplete={onCalibrateComplete}
                  pxPerMm={pxPerMm}
                  setPxPerMm={setPxPerMm}
                  logEvent={logAnalyticsEvent}
                />
              </div>
            )}

            {/* PWA SCREEN: GAME */}
            {syncStatus === "AWAITING_PLAY" && screen === "GAME" && children}

            {/* PWA SCREEN: CHILD COMPLETION (HIGH FIDELITY CELEBRATION) */}
            {screen === "CHILD_COMPLETION" && (
              <div className="game-over-screen" style={{ position: "relative", background: "white", color: "#334155", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                
                {/* 1. Confetti Pieces layer */}
                <div className="confetti-layer">
                  <div className="confetti-piece" style={{ left: "10%", background: "#ff4757", animationDelay: "0s", animationDuration: "3s" }} />
                  <div className="confetti-piece" style={{ left: "25%", background: "#ffd200", animationDelay: "0.5s", animationDuration: "2.5s" }} />
                  <div className="confetti-piece" style={{ left: "45%", background: "#2ed573", animationDelay: "0.2s", animationDuration: "3.2s" }} />
                  <div className="confetti-piece" style={{ left: "60%", background: "#00bac6", animationDelay: "0.8s", animationDuration: "2.8s" }} />
                  <div className="confetti-piece" style={{ left: "75%", background: "#ff007f", animationDelay: "0.3s", animationDuration: "3.5s" }} />
                  <div className="confetti-piece" style={{ left: "90%", background: "#ffd200", animationDelay: "0.6s", animationDuration: "2.4s" }} />
                </div>

                {/* 2. Emotional Mustache Mascot holding roses (Screenshot 5 Match) */}
                <svg className="duo-character-roses" viewBox="0 0 100 100" style={{ width: "130px", height: "130px", margin: "0 auto" }}>
                  {/* Hair */}
                  <path d="M25,30 C20,15 45,5 50,15 C55,5 80,15 75,30 C80,35 80,50 70,52 C30,52 20,35 25,30 Z" fill="#2d3748" />
                  {/* Face */}
                  <circle cx="50" cy="45" r="22" fill="#fed7aa" />
                  {/* Mustache */}
                  <path d="M36,51 C36,45 64,45 64,51 C58,49 42,49 36,51 Z" fill="#1a202c" />
                  {/* Blushing cheeks */}
                  <circle cx="36" cy="46" r="3" fill="#f87171" opacity="0.6" />
                  <circle cx="64" cy="46" r="3" fill="#f87171" opacity="0.6" />
                  {/* Sparkle Eyes */}
                  <circle cx="41" cy="38" r="5" fill="#1a202c" />
                  <circle cx="59" cy="38" r="5" fill="#1a202c" />
                  <circle cx="39.5" cy="36.5" r="1.5" fill="white" />
                  <circle cx="42" cy="39" r="0.8" fill="white" />
                  <circle cx="57.5" cy="36.5" r="1.5" fill="white" />
                  <circle cx="60" cy="39" r="0.8" fill="white" />
                  {/* Shirt */}
                  <path d="M30,67 L70,67 L60,82 L40,82 Z" fill="#f472b6" />
                  {/* Bouquet of roses */}
                  <circle cx="50" cy="62" r="13" fill="#10b981" />
                  <circle cx="44" cy="56" r="3.5" fill="#ff4757" />
                  <circle cx="56" cy="56" r="3.5" fill="#ff4757" />
                  <circle cx="50" cy="53" r="4" fill="#ff4757" />
                  {/* Stems */}
                  <path d="M48,58 L45,66" stroke="#059669" strokeWidth="2" />
                  <path d="M52,58 L55,66" stroke="#059669" strokeWidth="2" />
                </svg>

                <h2 style={{ fontSize: "24px", color: "#eab308", fontWeight: "900", margin: "12px 0 4px 0", textAlign: "center" }}>
                  I'm overwhelmed...
                </h2>
                
                <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "700", marginBottom: "16px", textAlign: "center" }}>
                  By your brilliance! 🌟
                </p>

                {/* Score & Streak Stats cards */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{ background: "#f8fafc", padding: "8px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", minWidth: "90px" }}>
                    <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>SCORE</span>
                    <strong style={{ fontSize: "15px", color: "#eab308" }}>{gameScoreDetails?.score || 0}</strong>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "8px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", minWidth: "90px" }}>
                    <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>BEST STREAK</span>
                    <strong style={{ fontSize: "15px", color: "#3b82f6" }}>{gameScoreDetails?.bestStreak || 0}x</strong>
                  </div>
                </div>

                <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "8px 12px", marginBottom: "20px", fontSize: "10px", color: "#701a75", textAlign: "center", margin: "0 24px 20px 24px" }}>
                  🦖 <strong>Milestone Achieved:</strong> Golden Dino Badge Unlocked!
                </div>

                <button 
                  className="btn-primary" 
                  style={{ background: "#0ea5e9", color: "white", width: "85%", alignSelf: "center", border: "none", fontWeight: "800", height: "42px", borderRadius: "12px" }}
                  onClick={handleChildFinish}
                >
                  CONTINUE
                </button>
              </div>
            )}

            {/* PWA SCREEN: FINISHED STATUS */}
            {screen === "PWA_FINISHED" && (
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center", textAlign: "center", background: "var(--game-bg)", color: "#fff" }}>
                <div style={{ fontSize: "60px", marginBottom: "20px" }}>📱🏁</div>
                <h2 style={{ fontFamily: "Space Mono, monospace", color: "var(--game-primary)", fontSize: "20px", marginBottom: "12px" }}>
                  GAME COMPLETED!
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5", maxWidth: "85%" }}>
                  Awesome play! Please hand the phone back to your parent now.
                </p>
                <div style={{
                  marginTop: "24px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "11px",
                  color: "#94a3b8"
                }}>
                  🔑 Your parent can now view the results report directly in the Lenskart App.
                </div>
              </div>
            )}
          </>
        )}

      </div>
      
      {/* 7. ANDROID SYSTEM ADD-WIDGET DIALOG OVERLAY (Screenshot 2 Match) */}
      {showSystemDialog && (
        <div className="duo-sys-dialog-overlay">
          <div className="duo-sys-dialog">
            <h3 className="duo-sys-dialog-title">Add to Home screen</h3>
            <p className="duo-sys-dialog-subtitle">
              Touch and hold the widget to move it around the home screen
            </p>
            
            <div className="duo-sys-widget-icon-box" style={{ background: "white", color: "#334155" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "20px" }}>🦖</span>
                <div style={{ textAlign: "left" }}>
                  <strong style={{ fontSize: "9px", display: "block" }}>Shape Chase</strong>
                  <span style={{ fontSize: "7px", color: "#64748b" }}>Lenskart Kids</span>
                </div>
              </div>
              <span style={{ fontSize: "9px", background: "#ffecd2", color: "#dd6b20", padding: "1px 4px", borderRadius: "4px" }}>
                🔥 {child.sessions ? child.sessions.length + 2 : 2}
              </span>
            </div>

            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "20px" }}>
              Size: 2 × 1
            </div>

            <div className="duo-sys-dialog-buttons">
              <button className="duo-sys-btn cancel" onClick={() => setShowSystemDialog(false)}>
                Cancel
              </button>
              <button className="duo-sys-btn" onClick={() => {
                setShowSystemDialog(false);
                onAddWidgetResolve(true);
              }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Home bar */}
      <div className={`phone-home-indicator ${isGameMode ? "game-mode" : ""}`}></div>
    </div>
  );
}
