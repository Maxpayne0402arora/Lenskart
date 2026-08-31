import React, { useState, useEffect } from "react";
import { initialPersonas } from "./data/mockDb";
import MockPhone from "./components/MockPhone";
import GapchaseGame from "./components/GapchaseGame";
import CameraFeed from "./components/CameraFeed";
import ParentResultDetail from "./components/ParentResultDetail";

const LADDER = [100, 80, 63, 50, 40, 32, 25, 20];

export default function App() {
  // DB & Personas
  const [personas, setPersonas] = useState(initialPersonas);
  const [activePersonaId, setActivePersonaId] = useState("divya_aarav");
  const activePersona = personas[activePersonaId];

  // Two-App Architecture States
  // activeApp: 'LENSKART' or 'GAPCHASE_PWA'
  const [activeApp, setActiveApp] = useState("LENSKART");
  
  // syncStatus: 'SETUP' (consent/calibration), 'AWAITING_PLAY' (setup done, child needs to play), 'COMPLETED' (results synced)
  const [syncStatus, setSyncStatus] = useState("SETUP");

  // Lenskart App Phone navigation screens: 'HOME', 'CONSENT', 'CALIBRATION', 'AWAITING_PLAY', 'PARENT_REPORT'
  const [parentScreen, setParentScreen] = useState("HOME");

  // Gapchase PWA Phone navigation screens: 'PWA_START', 'GAME', 'CHILD_COMPLETION', 'PWA_FINISHED'
  const [childScreen, setChildScreen] = useState("PWA_START");
  
  // Handover state
  const [glassesWorn, setGlassesWorn] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [handoverChoice, setHandoverChoice] = useState("my_phone"); // 'my_phone' or 'child_phone'
  const [widgetInstalled, setWidgetInstalled] = useState(false);

  // Calibration states
  const [pxPerMm, setPxPerMm] = useState(6.0); // default DPI
  const [distanceVerified, setDistanceVerified] = useState(true);
  const [ipdBaselinePx, setIpdBaselinePx] = useState(80);

  // Anti-cheat mock triggers (from console)
  const [cheatDistance, setCheatDistance] = useState(1.0); // 1.0 = normal
  const [cameraDropped, setCameraDropped] = useState(false);
  const [suspectFastSimulated, setSuspectFastSimulated] = useState(false);

  // Ledgers & Log states
  const [measurementLedger, setMeasurementLedger] = useState([]);
  const [gameLedger, setGameLedger] = useState([]);
  const [analyticsLogs, setAnalyticsLogs] = useState([]);
  const [phoneCopyText, setPhoneCopyText] = useState("");

  // Synced report data
  const [queuedResult, setQueuedResult] = useState(null);
  const [activeResult, setActiveResult] = useState(null);
  const [gameScoreDetails, setGameScoreDetails] = useState(null);

  // Scan text content of the active phone screen for the F2 Copy Linter
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.querySelector(".phone-content");
      if (el) {
        setPhoneCopyText(el.innerText || "");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeApp, parentScreen, childScreen, glassesWorn, handoverChoice, otpSent, activePersonaId, activeResult]);

  // Switch persona from developer selector
  const handlePersonaChange = (id) => {
    setActivePersonaId(id);
    setParentScreen("HOME");
    setChildScreen("PWA_START");
    setActiveApp("LENSKART");
    setSyncStatus("SETUP");
    setWidgetInstalled(false);
    setActiveResult(null);
    setQueuedResult(null);
    setMeasurementLedger([]);
    setGameLedger([]);
    setGlassesWorn(personas[id].child.glassesWorn || false);
    setWhatsappNumber(personas[id].parentPhone);
    setOtpSent(false);
    setOtpValue("");
    
    logAnalyticsEvent("vision_check_entry_shown", {
      surface: "homepage_tile",
      track: personas[id].child.track
    });
  };

  // Log to Event logs console
  const logAnalyticsEvent = (name, properties) => {
    const newLog = {
      name,
      properties,
      time: new Date().toLocaleTimeString()
    };
    setAnalyticsLogs((prev) => [...prev, newLog]);
  };

  const logMeasurement = (record) => {
    setMeasurementLedger((prev) => [...prev, record]);
  };

  const logGameAction = (record) => {
    setGameLedger((prev) => [...prev, record]);
  };

  // DPDP Consent Withdraw
  const handleWithdrawConsent = () => {
    const confirmWithdraw = window.confirm(
      "Confirming DPDP Consent Withdrawal: This will delete all session history for this child and disable screening triggers. Proceed?"
    );
    if (!confirmWithdraw) return;

    logAnalyticsEvent("vision_check_consent_withdrawn", {
      childId: activePersona.child.id
    });

    setPersonas(prev => ({
      ...prev,
      [activePersonaId]: {
        ...prev[activePersonaId],
        child: {
          ...prev[activePersonaId].child,
          sessions: []
        }
      }
    }));
    
    setSyncStatus("SETUP");
    setParentScreen("HOME");
    alert("Consent withdrawn. All session history has been deleted.");
  };

  // Calibration complete
  const handleCalibrateComplete = (data) => {
    setPxPerMm(data.pxPerMm);
    setDistanceVerified(data.distanceVerified);
    setIpdBaselinePx(data.ipdBaselinePx);
    
    logAnalyticsEvent("vision_check_calibration_completed", {
      pxPerMm: data.pxPerMm,
      distanceVerified: data.distanceVerified
    });
    
    // Calibration happens during PWA child gameplay now, so route child straight to GAME
    setChildScreen("GAME");
  };

  const handleAddWidgetResolve = (installed) => {
    logAnalyticsEvent("vision_check_widget_install_resolved", { installed });
    setWidgetInstalled(installed);
    setSyncStatus("AWAITING_PLAY"); // Setup completed, awaiting child play
    setParentScreen("AWAITING_PLAY");
  };

  // Game over handler - computes result class (D1)
  const handleGameCompleted = (gameDetails) => {
    setGameScoreDetails(gameDetails);
    
    // Compute result logic (D1)
    const child = activePersona.child;
    const isCorrectedTrack = child.track === "corrected";
    const todayThreshold = gameDetails.threshold;
    
    let classification = "CLEAR";
    let deltaLines = 0;
    let confidence = gameDetails.isVoid ? "low" : "high";
    let isComparable = true;
    let comparabilityFailReason = null;
    
    const todayDenom = parseInt(todayThreshold.split("/")[1]);
    const todayIndex = LADDER.indexOf(todayDenom);

    // Baseline Acuity
    let baselineAcuity = isCorrectedTrack ? child.baselineAcuity : null;
    
    if (!isCorrectedTrack && child.sessions.length > 0) {
      baselineAcuity = child.sessions[child.sessions.length - 1].threshold;
    }

    if (gameDetails.isVoid) {
      classification = "MONITOR";
    } else if (!baselineAcuity) {
      // Session 1: Enrolment or immediate REFER
      if (todayDenom >= 100) {
        classification = "REFER";
      } else {
        classification = "ENROL";
      }
    } else {
      const baselineDenom = parseInt(baselineAcuity.split("/")[1]);
      const baselineIndex = LADDER.indexOf(baselineDenom);
      
      deltaLines = baselineIndex - todayIndex;
      
      // E2 Comparability Check:
      if (child.sessions.length > 0) {
        const lastSession = child.sessions[child.sessions.length - 1];
        const pxDifference = Math.abs(pxPerMm - lastSession.pxPerMm) / lastSession.pxPerMm;
        const glassesMatch = glassesWorn === lastSession.glassesWorn;
        
        if (pxDifference > 0.05 || !glassesMatch) {
          isComparable = false;
          classification = "MONITOR";
          comparabilityFailReason = pxDifference > 0.05 
            ? "Screen calibration (DPI) differs from previous session." 
            : "Glasses wear state does not match previous session.";
        }
      }

      if (isComparable) {
        if (deltaLines >= 2) {
          if (distanceVerified && gameDetails.suspectFastCount <= 2) {
            classification = "REFER";
          } else {
            classification = "MONITOR";
          }
        } else if (deltaLines === 1) {
          classification = "MONITOR";
        } else {
          classification = "CLEAR";
        }

        // E4 Trend Check
        if (child.sessions.length >= 2 && isComparable) {
          const s1 = child.sessions[0];
          const s2 = child.sessions[1];
          const s1Denom = parseInt(s1.threshold.split("/")[1]);
          const s2Denom = parseInt(s2.threshold.split("/")[1]);
          
          if (s1Denom < s2Denom && s2Denom < todayDenom) {
            classification = "REFER";
            logAnalyticsEvent("vision_check_trend_referral", {
              trend: `${s1.threshold} -> ${s2.threshold} -> ${todayThreshold}`
            });
          }
        }
      }
    }

    const resultObj = {
      childId: child.id,
      childName: child.name,
      track: child.track,
      glassesWorn,
      classification,
      confidence,
      threshold: todayThreshold,
      baseline: baselineAcuity,
      deltaLines,
      distanceVerified,
      pxPerMm: parseFloat(pxPerMm.toFixed(2)),
      suspectFast: gameDetails.suspectFastCount,
      isComparable,
      comparabilityFailReason
    };

    setQueuedResult(resultObj);
    
    // Save to persona database session history
    if (!gameDetails.isVoid) {
      const newSession = {
        id: `sess_${Date.now()}`,
        timestamp: new Date().toISOString(),
        threshold: todayThreshold,
        pxPerMm: parseFloat(pxPerMm.toFixed(2)),
        distanceMode: "camera",
        distanceVerified,
        glassesWorn,
        classification,
        confidence
      };

      setPersonas((prev) => ({
        ...prev,
        [activePersonaId]: {
          ...prev[activePersonaId],
          child: {
            ...prev[activePersonaId].child,
            sessions: [...prev[activePersonaId].child.sessions, newSession]
          }
        }
      }));
    }

    // Set sync status to Completed (results uploaded to cloud)
    setSyncStatus("COMPLETED");
    setChildScreen("CHILD_COMPLETION");
  };

  // Developer bypass button: simulates child play completion
  const handleSimulateChildPlay = () => {
    logAnalyticsEvent("vision_check_simulated_play_triggered", { childId: activePersona.child.id });
    
    const mockGameDetails = {
      threshold: activePersona.child.track === "corrected" ? "20/32" : "20/25",
      score: 1650,
      bestStreak: 6,
      suspectFastCount: 0,
      isVoid: false,
      totalTrials: 12
    };

    // Populate mock measurement ledger for display
    const mockMeasurements = [
      { trial: 1, acuity: "20/100", targetDir: "UP", response: "UP", correct: true, reactionTimeMs: 450, suspectFast: false, distanceVerified: true },
      { trial: 2, acuity: "20/100", targetDir: "LEFT", response: "LEFT", correct: true, reactionTimeMs: 500, suspectFast: false, distanceVerified: true },
      { trial: 3, acuity: "20/80", targetDir: "RIGHT", response: "RIGHT", correct: true, reactionTimeMs: 400, suspectFast: false, distanceVerified: true },
      { trial: 4, acuity: "20/80", targetDir: "DOWN", response: "DOWN", correct: true, reactionTimeMs: 600, suspectFast: false, distanceVerified: true },
      { trial: 5, acuity: "20/63", targetDir: "UP", response: "UP", correct: true, reactionTimeMs: 350, suspectFast: false, distanceVerified: true },
      { trial: 6, acuity: "20/63", targetDir: "LEFT", response: "LEFT", correct: true, reactionTimeMs: 700, suspectFast: false, distanceVerified: true },
      { trial: 7, acuity: "20/50", targetDir: "DOWN", response: "DOWN", correct: true, reactionTimeMs: 510, suspectFast: false, distanceVerified: true },
      { trial: 8, acuity: "20/50", targetDir: "RIGHT", response: "RIGHT", correct: true, reactionTimeMs: 480, suspectFast: false, distanceVerified: true },
      { trial: 9, acuity: "20/40", targetDir: "UP", response: "LEFT", correct: false, reactionTimeMs: 650, suspectFast: false, distanceVerified: true },
      { trial: 10, acuity: "20/50", targetDir: "LEFT", response: "LEFT", correct: true, reactionTimeMs: 380, suspectFast: false, distanceVerified: true },
      { trial: 11, acuity: "20/40", targetDir: "RIGHT", response: "LEFT", correct: false, reactionTimeMs: 440, suspectFast: false, distanceVerified: true },
      { trial: 12, acuity: "20/50", targetDir: "DOWN", response: "DOWN", correct: true, reactionTimeMs: 580, suspectFast: false, distanceVerified: true }
    ];
    setMeasurementLedger(mockMeasurements);

    // Mock game ledger
    setGameLedger([
      { trial: 1, type: "First Action", acuity: "20/100", correct: true, scoreChange: 100, combo: 1 },
      { trial: 3, type: "First Action", acuity: "20/80", correct: true, scoreChange: 200, combo: 3 },
      { trial: 5, type: "First Action", acuity: "20/63", correct: true, scoreChange: 300, combo: 5 },
      { trial: 9, type: "First Action", acuity: "20/40", correct: false, scoreChange: 0, combo: 0 },
      { trial: 9, type: "Second Chance (Success)", acuity: "20/40", correct: true, scoreChange: 250, combo: 1 }
    ]);

    handleGameCompleted(mockGameDetails);
  };

  // Child finishes PWA game
  const handleChildFinish = () => {
    setChildScreen("PWA_FINISHED");
    logAnalyticsEvent("vision_check_child_pwa_finished", { childId: activePersona.child.id });
  };

  // Switch between Parent Lenskart app and Child PWA view (developer controls)
  const handleAppToggle = (appName) => {
    setActiveApp(appName);
    logAnalyticsEvent("vision_check_app_toggled", { app: appName });
  };

  const handleOpenParentReport = () => {
    logAnalyticsEvent("vision_check_result_opened", { source: "lenskart_app_direct" });
    setActiveResult(queuedResult);
    setParentScreen("PARENT_REPORT");
  };

  return (
    <div className="dashboard-container">
      {/* LEFT PANEL: MOBILE DEVICE MOCK */}
      <div className="phone-panel">
        <MockPhone 
          // App Switcher Bar props
          activeApp={activeApp}
          onAppToggle={handleAppToggle}
          syncStatus={syncStatus}

          // Screen navigation states
          screen={activeApp === "LENSKART" ? parentScreen : childScreen}
          setScreen={activeApp === "LENSKART" ? setParentScreen : setChildScreen}
          
          activePersona={activePersona}
          glassesWorn={glassesWorn}
          setGlassesWorn={setGlassesWorn}
          handoverChoice={handoverChoice}
          setHandoverChoice={setHandoverChoice}
          whatsappNumber={whatsappNumber}
          setWhatsappNumber={setWhatsappNumber}
          otpSent={otpSent}
          setOtpSent={setOtpSent}
          otpValue={otpValue}
          setOtpValue={setOtpValue}
          onCalibrateComplete={handleCalibrateComplete}
          pxPerMm={pxPerMm}
          setPxPerMm={setPxPerMm}
          logAnalyticsEvent={logAnalyticsEvent}
          handleWithdrawConsent={handleWithdrawConsent}
          gameScoreDetails={gameScoreDetails}
          activeResult={activeResult}
          setActiveResult={setActiveResult}
          handleChildFinish={handleChildFinish}
          handleOpenParentReport={handleOpenParentReport}
          onAddWidgetResolve={handleAddWidgetResolve}
          widgetInstalled={widgetInstalled}
        >
          {/* GAPCHASE PWA Screen Content */}
          {activeApp === "GAPCHASE_PWA" && childScreen === "GAME" && (
            <GapchaseGame 
              pxPerMm={pxPerMm}
              glassesWorn={glassesWorn}
              track={activePersona.child.track}
              ipdBaselinePx={ipdBaselinePx}
              cheatDistanceMultiplier={cheatDistance}
              cameraDropped={cameraDropped}
              suspectFastSimulated={suspectFastSimulated}
              onGameCompleted={handleGameCompleted}
              logEvent={logAnalyticsEvent}
              logMeasurement={logMeasurement}
              logGameAction={logGameAction}
            />
          )}

          {/* LENSKART APP Screen Content */}
          {activeApp === "LENSKART" && parentScreen === "PARENT_REPORT" && (
            <ParentResultDetail 
              result={activeResult}
              onClose={() => {
                setParentScreen("HOME");
                setActiveResult(null);
              }}
              logEvent={logAnalyticsEvent}
            />
          )}
        </MockPhone>
      </div>      
    </div>
  );
}
