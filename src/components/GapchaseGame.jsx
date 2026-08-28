import React, { useState, useEffect, useRef } from "react";

// Standard pediatric symbols for kids vision checking (Lea Symbols)
const SHAPES = ["HEART", "HOUSE", "CIRCLE", "SQUARE"];
const LADDER = [100, 80, 63, 50, 40, 32, 25, 20];

// Dynamic Speeches from Specsy Dino (Duolingo mascot)
const DEFAULT_SPEECHES = [
  "Tap the shape below that matches!",
  "Find the matching card! You can do it!",
  "Look closely! Which shape is in the box?",
  "Spot the shape! Tap its card below!"
];

const CORRECT_SPEECHES = [
  "Wow! You're super fast! 🚀",
  "Awesome match! Keep it up! ✨",
  "Incredible! Spot on! 🌟",
  "Great job! Keep the streak hot! 🔥"
];

const INCORRECT_SPEECHES = [
  "Almost had it! Keep trying! 💪",
  "No worries! Focus on the next one! 🎯",
  "Nice try! You've got this! ⭐",
  "Almost! Keep chasing the shapes! ⚡"
];

export default function GapchaseGame({
  pxPerMm,
  glassesWorn,
  track,
  ipdBaselinePx,
  cheatDistanceMultiplier, // 1.0 = normal
  cameraDropped,
  suspectFastSimulated,
  onGameCompleted,
  logEvent,
  logMeasurement,
  logGameAction
}) {
  const [trialNum, setTrialNum] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [rungIndex, setRungIndex] = useState(0); // starts at 20/100
  const [targetShape, setTargetShape] = useState("HEART");
  const [lastShapes, setLastShapes] = useState([]);
  
  // Game states: 'PLAYING', 'FEEDBACK', 'RETRY_PROMPT', 'RETRYING', 'BONUS_ALERT', 'BONUS_PLAYING', 'CONFIRM_QUIT'
  const [gameState, setGameState] = useState("PLAYING");
  const [showTutorial, setShowTutorial] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [pendingNextAction, setPendingNextAction] = useState(null);
  
  // Mascot speech text
  const [mascotSpeech, setMascotSpeech] = useState("Tap the shape below that matches!");

  // Scoring values
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);
  const [suspectFastCount, setSuspectFastCount] = useState(0);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(4000);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [finestThreshold, setFinestThreshold] = useState("20/100");
  const [allMeasurementTrials, setAllMeasurementTrials] = useState([]);

  // Dynamic Mascot speech selector
  useEffect(() => {
    if (gameState === "PLAYING" || gameState === "BONUS_PLAYING") {
      if (combo > 0) {
        setMascotSpeech(`Wow! ${combo} matches in a row! Streak on! 🔥`);
      } else {
        const randomSpeech = DEFAULT_SPEECHES[Math.floor(Math.random() * DEFAULT_SPEECHES.length)];
        setMascotSpeech(randomSpeech);
      }
    }
  }, [trialNum, combo, gameState]);

  // Check anti-cheat distance guard via Mascot speech (Duolingo styled alerts)
  const isTooClose = cheatDistanceMultiplier > 1.15;
  const isTooFar = cheatDistanceMultiplier < 0.8;

  useEffect(() => {
    if (gameState === "FEEDBACK" || gameState === "RETRY_PROMPT" || gameState === "BONUS_ALERT" || gameState === "CONFIRM_QUIT") return;

    if (isTooClose) {
      setMascotSpeech("Whoa! You're super close! Lean back a bit so we can keep playing! 🦖");
      logEvent("vision_check_anti_cheat_triggered", { ipdRatio: cheatDistanceMultiplier, type: "too_close" });
    } else if (isTooFar) {
      setMascotSpeech("Hmm, you're a bit too far! Move slightly closer to catch the shapes! 🔍");
      logEvent("vision_check_anti_cheat_triggered", { ipdRatio: cheatDistanceMultiplier, type: "too_far" });
    } else {
      // Restore normal speech
      if (combo > 0) {
        setMascotSpeech(`Awesome ${combo} streak! Let's get the next one!`);
      } else {
        setMascotSpeech("Match the shape in the white box!");
      }
    }
  }, [cheatDistanceMultiplier, isTooClose, isTooFar]);

  const getNextShape = () => {
    let nextShp;
    do {
      nextShp = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    } while (
      lastShapes.length >= 2 &&
      lastShapes[lastShapes.length - 1] === nextShp &&
      lastShapes[lastShapes.length - 2] === nextShp
    );
    return nextShp;
  };

  const startNewTrial = (nextRung, nextState = "PLAYING") => {
    const shp = getNextShape();
    setTargetShape(shp);
    setLastShapes((prev) => [...prev.slice(-2), shp]);
    setGameState(nextState);
    setTimeLeft(4000);
    startTimeRef.current = Date.now();
  };

  // Keyboard mapping for testing (Left=Heart, Up=House, Right=Circle, Down=Square)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== "PLAYING" && gameState !== "RETRYING" && gameState !== "BONUS_PLAYING") return;
      if (isTooClose || isTooFar || showTutorial) return; // lock controls on warning/tutorial
      
      let response = null;
      if (e.key === "ArrowLeft") response = "HEART";
      else if (e.key === "ArrowUp") response = "HOUSE";
      else if (e.key === "ArrowRight") response = "CIRCLE";
      else if (e.key === "ArrowDown") response = "SQUARE";
      
      if (response) {
        e.preventDefault();
        handleResponse(response);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, targetShape, rungIndex, trialNum, score, combo, isTooClose, isTooFar]);

  // Timer loop
  useEffect(() => {
    if (gameState !== "PLAYING" && gameState !== "RETRYING" && gameState !== "BONUS_PLAYING") return;
    if (isTooClose || isTooFar || showTutorial) return; // pause timer on warning/tutorial
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 4000 - elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        handleResponse(null); // timeout
      }
    }, 50);
    
    return () => clearInterval(timerRef.current);
  }, [gameState, trialNum, isTooClose, isTooFar]);

  const handleResponse = (response) => {
    clearInterval(timerRef.current);
    
    const reactionTime = Date.now() - startTimeRef.current;
    const isCorrect = response === targetShape;
    const isSuspect = reactionTime < 250 || suspectFastSimulated;
    
    if (isSuspect && response) {
      setSuspectFastCount(prev => prev + 1);
    }

    const currentDenominator = LADDER[rungIndex];
    const currentAcuity = `20/${currentDenominator}`;
    
    // Set Playful UI Feedback & Dino speech bubble
    setGameState("FEEDBACK");
    if (isCorrect) {
      const duoSpeaks = CORRECT_SPEECHES[Math.floor(Math.random() * CORRECT_SPEECHES.length)];
      setMascotSpeech(duoSpeaks);
      setFeedbackMsg("CORRECT! 🎉");
      setFeedbackColor("#4ade80");
    } else {
      const duoSpeaks = INCORRECT_SPEECHES[Math.floor(Math.random() * INCORRECT_SPEECHES.length)];
      setMascotSpeech(duoSpeaks);
      setFeedbackMsg("Oops! 🎯");
      setFeedbackColor("#ff4757");
    }

    setPendingNextAction(() => () => {
      if (gameState === "PLAYING") {
        const record = {
          trial: trialNum,
          acuity: currentAcuity,
          targetShape: targetShape,
          response: response || "TIMEOUT",
          correct: isCorrect,
          reactionTimeMs: reactionTime,
          suspectFast: isSuspect,
          distanceVerified: !cameraDropped && cheatDistanceMultiplier <= 1.15
        };
        
        setAllMeasurementTrials(prev => [...prev, record]);
        logMeasurement(record);

        let points = 0;
        let newCombo = combo;
        
        if (isCorrect) {
          newCombo += 1;
          setBestStreak(prev => Math.max(prev, newCombo));
          const baseScore = (rungIndex + 1) * 100;
          const speedBonus = reactionTime < 1000 ? 50 : 0;
          points = (baseScore + speedBonus) * (1 + Math.floor(newCombo / 3) * 0.5);
          setScore(prev => prev + points);
          
          logGameAction({
            trial: trialNum,
            type: "First Action",
            acuity: currentAcuity,
            correct: true,
            scoreChange: points,
            combo: newCombo
          });
        } else {
          newCombo = 0;
          logGameAction({
            trial: trialNum,
            type: "First Action",
            acuity: currentAcuity,
            correct: false,
            scoreChange: 0,
            combo: 0
          });
        }
        setCombo(newCombo);

        let nextRung = rungIndex;
        let nextCorrect = consecutiveCorrect;
        let nextIncorrect = consecutiveIncorrect;

        if (isCorrect) {
          nextIncorrect = 0;
          nextCorrect += 1;
          if (nextCorrect === 2) {
            if (rungIndex < LADDER.length - 1) {
              nextRung += 1;
            }
            setFinestThreshold(`20/${LADDER[nextRung]}`);
            nextCorrect = 0;
          }
        } else {
          nextCorrect = 0;
          nextIncorrect += 1;
          if (nextIncorrect === 2) {
            if (rungIndex > 0) {
              nextRung -= 1;
            }
            nextIncorrect = 0;
          }
        }
        
        setConsecutiveCorrect(nextCorrect);
        setConsecutiveIncorrect(nextIncorrect);
        setRungIndex(nextRung);

        if (!isCorrect && response !== null) {
          setGameState("RETRY_PROMPT");
          setMascotSpeech("Let's try that shape one more time! Focus! 🛡️");
          return;
        }
        


        advanceTrialFlow();

      } else if (gameState === "RETRYING") {
        let points = 0;
        if (isCorrect) {
          points = (rungIndex + 1) * 50;
          setScore(prev => prev + points);
          setCombo(1);
        }
        
        logGameAction({
          trial: trialNum,
          type: `Second Chance (${isCorrect ? "Success" : "Fail"})`,
          acuity: currentAcuity,
          correct: isCorrect,
          scoreChange: points,
          combo: isCorrect ? 1 : 0
        });

        advanceTrialFlow();

      } else if (gameState === "BONUS_PLAYING") {
        let points = 0;
        if (isCorrect) {
          points = (rungIndex + 1) * 200;
          setScore(prev => prev + points);
          setCombo(prev => prev + 1);
        }
        
        logGameAction({
          trial: trialNum,
          type: `Bonus Streak Target (${isCorrect ? "Hit" : "Miss"})`,
          acuity: currentAcuity,
          correct: isCorrect,
          scoreChange: points,
          combo: combo + (isCorrect ? 1 : 0)
        });
        
        advanceTrialFlow();
      }
    });
  };

  useEffect(() => {
    if (gameState !== "FEEDBACK" || !pendingNextAction) return;

    const delayTimer = setTimeout(() => {
      setFeedbackMsg("");
      pendingNextAction();
      setPendingNextAction(null);
    }, 700);

    return () => clearTimeout(delayTimer);
  }, [gameState, pendingNextAction]);

  const advanceTrialFlow = () => {
    if (trialNum >= 12) {
      const isVoid = allMeasurementTrials.length < 8 || suspectFastCount > 4;
      onGameCompleted({
        threshold: finestThreshold,
        score,
        bestStreak,
        suspectFastCount,
        isVoid,
        totalTrials: allMeasurementTrials.length + 1
      });
    } else {
      setTrialNum(prev => prev + 1);
      startNewTrial(rungIndex, "PLAYING");
    }
  };

  // Close Game Confirmation Dialog (X button)
  const handleXClick = () => {
    setGameState("CONFIRM_QUIT");
  };

  const handleQuitConfirm = (shouldQuit) => {
    if (shouldQuit) {
      logEvent("vision_check_quit_early", { trial: trialNum });
      window.location.reload(); // simple reset back to lobby
    } else {
      setGameState("PLAYING");
      startTimeRef.current = Date.now();
    }
  };

  // SVG Sizing Math (5-unit outer diameter bounding box, Lea pediatric equivalent)
  const currentDenominator = LADDER[rungIndex];
  const assumedDistanceMm = 400; // 40 cm
  const theta = (5 * (currentDenominator / 20) / 60) * (Math.PI / 180);
  const heightMm = assumedDistanceMm * theta;
  const heightPx = heightMm * pxPerMm;

  const visualPercentage = (timeLeft / 4000) * 100;
  const runnerPercentage = (trialNum / 12) * 100;

  // Render vector paths for the matching shapes
  const renderShapeSVG = (shape) => {
    switch (shape) {
      case "HEART":
        return (
          <path 
            d="M50,82 C25,57 12,42 12,27 C12,15 22,8 33,8 C40,8 46,13 50,18 C54,13 60,8 67,8 C78,8 88,15 88,27 C88,42 75,57 50,82 Z" 
            stroke="#ff4757" 
            strokeWidth="10" 
            fill="none" 
            strokeLinejoin="round" 
          />
        );
      case "HOUSE":
        return (
          <path 
            d="M50,12 L14,45 L23,45 L23,84 L77,84 L77,45 L86,45 Z" 
            stroke="#3b82f6" 
            strokeWidth="10" 
            fill="none" 
            strokeLinejoin="round" 
          />
        );
      case "CIRCLE":
        return (
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            stroke="#10b981" 
            strokeWidth="10" 
            fill="none" 
          />
        );
      case "SQUARE":
      default:
        return (
          <rect 
            x="15" 
            y="15" 
            width="70" 
            height="70" 
            rx="6" 
            stroke="#fbbf24" 
            strokeWidth="10" 
            fill="none" 
            strokeLinejoin="round" 
          />
        );
    }
  };

  return (
    <div className="game-screen" style={{ background: "#f8fafc", color: "#334155", padding: "12px", justifyContent: "space-between" }}>
      
      {/* 1. DUOLINGO STYLE TOP HEADER BAR */}
      <div className="duo-pwa-header-bar" style={{ background: "#f8fafc" }}>
        <button className="duo-close-btn" onClick={handleXClick}>✕</button>
        
        {/* Thick progress bar */}
        <div style={{ flex: 1, height: "14px", background: "#e2e8f0", borderRadius: "10px", margin: "0 12px", overflow: "hidden" }}>
          <div style={{
            width: `${runnerPercentage}%`,
            height: "100%",
            background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
            borderRadius: "10px",
            transition: "width 0.3s ease"
          }} />
        </div>

        {/* Lightning infinity pill */}
        <div className="duo-energy-pill">
          <span>⚡</span>
          <span>∞</span>
        </div>
      </div>

      {/* Concept tag */}
      <div style={{ alignSelf: "flex-start", margin: "4px 8px" }}>
        <span style={{ background: "#f3e8ff", color: "#a855f7", fontSize: "9px", fontWeight: "800", padding: "3px 8px", borderRadius: "8px" }}>
          ⭐ SHAPE MATCH
        </span>
      </div>

      {/* 2. CUTE MASCOT GUIDE WITH SPEECH BUBBLE */}
      <div className="duo-character-section">
        <div className="duo-mascot-avatar">🦖</div>
        <div className="duo-character-speech-bubble">
          {mascotSpeech}
        </div>
      </div>

      {/* 3. WHITE ROUNDED TARGET CARD */}
      <div className="game-canvas-area" style={{ background: "#f8fafc", minHeight: "180px", margin: "8px 0" }}>
        {gameState === "PLAYING" || gameState === "RETRYING" || gameState === "BONUS_PLAYING" ? (
          <>
            {/* Countdown pacing bar */}
            <div className="tempo-bar-container" style={{ background: "#e2e8f0", height: "4px", width: "80%", margin: "0 auto 8px auto" }}>
              <div 
                className="tempo-bar-fill" 
                style={{ 
                  width: `${visualPercentage}%`,
                  backgroundColor: gameState === "BONUS_PLAYING" ? "#fbbf24" : "#a855f7",
                  height: "100%"
                }}
              />
            </div>
            
            {/* Glowing target shape card */}
            <div 
              style={{
                width: "140px",
                height: "140px",
                background: "white",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                border: "2px solid #e2e8f0",
                position: "relative",
                margin: "0 auto"
              }}
            >
              {gameState === "BONUS_PLAYING" && (
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  background: "#fbbf24",
                  color: "#000",
                  fontSize: "8px",
                  fontWeight: "900",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  DOUBLE SCORE
                </div>
              )}
              
              <svg width={Math.max(30, Math.min(100, heightPx))} height={Math.max(30, Math.min(100, heightPx))} viewBox="0 0 100 100">
                {renderShapeSVG(targetShape)}
              </svg>
            </div>
          </>
        ) : gameState === "FEEDBACK" ? (
          /* Feedback overlays */
          <div style={{ textAlign: "center", margin: "auto" }}>
            <h2 style={{ fontSize: "28px", color: feedbackColor, fontWeight: "900", letterSpacing: "-0.5px" }}>
              {feedbackMsg}
            </h2>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "Space Mono", marginTop: "4px" }}>
              Score: {score} (+{(rungIndex + 1) * 100})
            </div>
          </div>
        ) : gameState === "RETRY_PROMPT" ? (
          <div style={{ textAlign: "center", padding: "16px", background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "32px", marginBottom: "4px" }}>🛡️</div>
            <h3 style={{ color: "#fbbf24", fontWeight: "800", fontSize: "14px", marginBottom: "4px" }}>Second Chance!</h3>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px", lineHeight: "1.3" }}>
              Let's match that shape again to score points!
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <button 
                className="custom-button" 
                style={{ background: "#3b82f6", color: "white", fontSize: "11px", padding: "8px 12px" }}
                onClick={() => {
                  logEvent("vision_check_second_chance_taken", { trial: trialNum });
                  startNewTrial(rungIndex, "RETRYING");
                }}
              >
                Retry
              </button>
              <button 
                className="custom-button" 
                style={{ background: "#e2e8f0", color: "#475569", fontSize: "11px", padding: "8px 12px" }}
                onClick={() => {
                  logEvent("vision_check_second_chance_skipped", { trial: trialNum });
                  advanceTrialFlow();
                }}
              >
                Skip
              </button>
            </div>
          </div>
        ) : gameState === "CONFIRM_QUIT" ? (
          <div style={{ textAlign: "center", padding: "16px", background: "white", borderRadius: "20px", border: "2px solid #ff4757", boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "32px", marginBottom: "4px" }}>🦖❗</div>
            <h3 style={{ color: "#ff4757", fontWeight: "800", fontSize: "15px", marginBottom: "6px" }}>Quit Game?</h3>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "16px", lineHeight: "1.4" }}>
              You will lose your progress and Golden Dino Badge milestones!
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button 
                className="btn-primary" 
                style={{ background: "#0ea5e9", color: "white", padding: "10px", fontSize: "12px", border: "none" }}
                onClick={() => handleQuitConfirm(false)}
              >
                KEEP PLAYING
              </button>
              <button 
                onClick={() => handleQuitConfirm(true)}
                style={{ background: "none", border: "none", color: "#ff4757", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
              >
                QUIT & RESET
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Lock screen during distance cheat warnings */}
      {(isTooClose || isTooFar) && gameState !== "CONFIRM_QUIT" && (
        <div style={{
          position: "absolute",
          top: "60px",
          left: 0,
          width: "100%",
          height: "calc(100% - 60px)",
          background: "rgba(248, 250, 252, 0.95)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center"
        }}>
          {/* Dino Mascot */}
          <div style={{ fontSize: "70px", animation: "wiggle 2s ease-in-out infinite alternate" }}>🦖</div>
          
          {/* Duolingo style Speech bubble */}
          <div className="duo-speech-bubble" style={{
            background: "#fff",
            border: "2px solid #e2e8f0",
            borderRadius: "16px",
            padding: "16px",
            width: "85%",
            position: "relative",
            marginTop: "16px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
          }}>
            {/* Speech bubble arrow pointer */}
            <div style={{
              position: "absolute",
              top: "-10px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "16px",
              height: "16px",
              background: "#fff",
              borderLeft: "2px solid #e2e8f0",
              borderTop: "2px solid #e2e8f0"
            }} />
            
            <h3 style={{ margin: "0 0 6px 0", color: isTooClose ? "#ef4444" : "#3b82f6", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>
              {isTooClose ? "Lean Back! ✋" : "Come Closer! 🔍"}
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.4", fontWeight: "700" }}>
              {isTooClose 
                ? "Whoa! You're super close! Move back a bit so we can keep playing!" 
                : "Hmm, you're a bit too far! Move slightly closer to catch the shapes!"
              }
            </p>
          </div>

          <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "24px" }}>
            (Game pauses automatically. Align your face to resume)
          </div>
        </div>
      )}

      {/* 4. DUOLINGO SHAPES DECK (Heart, House, Circle, Square) */}
      <div className="duo-shape-deck">
        <button 
          className="duo-shape-card heart" 
          disabled={gameState !== "PLAYING" && gameState !== "RETRYING" && gameState !== "BONUS_PLAYING"}
          onClick={() => handleResponse("HEART")}
        >
          <span style={{ fontSize: "24px" }}>❤️</span>
          <span className="duo-shape-label">HEART</span>
        </button>

        <button 
          className="duo-shape-card house" 
          disabled={gameState !== "PLAYING" && gameState !== "RETRYING" && gameState !== "BONUS_PLAYING"}
          onClick={() => handleResponse("HOUSE")}
        >
          <span style={{ fontSize: "24px" }}>🏠</span>
          <span className="duo-shape-label">HOUSE</span>
        </button>

        <button 
          className="duo-shape-card circle" 
          disabled={gameState !== "PLAYING" && gameState !== "RETRYING" && gameState !== "BONUS_PLAYING"}
          onClick={() => handleResponse("CIRCLE")}
        >
          <span style={{ fontSize: "24px" }}>🟢</span>
          <span className="duo-shape-label">CIRCLE</span>
        </button>

        <button 
          className="duo-shape-card square" 
          disabled={gameState !== "PLAYING" && gameState !== "RETRYING" && gameState !== "BONUS_PLAYING"}
          onClick={() => handleResponse("SQUARE")}
        >
          <span style={{ fontSize: "24px" }}>🟨</span>
          <span className="duo-shape-label">SQUARE</span>
        </button>
      </div>

      {/* 5. FIRST TIME PLAYER EXPLANATION / WALKTHROUGH */}
      {showTutorial && (
        <div className="duo-tutorial-overlay">
          <div style={{ fontSize: "50px", marginBottom: "12px", animation: "gentleBounce 2s infinite alternate" }}>🦖</div>
          
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#fbbf24", marginBottom: "8px" }}>
            Let's learn how to play!
          </h2>
          <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "0 20px 24px 20px", lineHeight: "1.4" }}>
            Specsy Dino will guide you to check your vision. It takes just 60 seconds!
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "260px", textAlign: "left", marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "24px" }}>📦</span>
              <div>
                <strong style={{ fontSize: "11px", display: "block", color: "white" }}>1. Look at the box</strong>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>A shape will appear in the center box.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "24px" }}>🎴</span>
              <div>
                <strong style={{ fontSize: "11px", display: "block", color: "white" }}>2. Tap matching card</strong>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Select the matching shape below it.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "24px" }}>📏</span>
              <div>
                <strong style={{ fontSize: "11px", display: "block", color: "white" }}>3. Sit at 40 cm</strong>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Keep your face aligned in the camera box.</span>
              </div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ background: "#10b981", color: "white", width: "80%", border: "none", fontWeight: "800", height: "42px", borderRadius: "12px" }}
            onClick={() => {
              setShowTutorial(false);
              startTimeRef.current = Date.now();
            }}
          >
            GOT IT! LET'S PLAY
          </button>
        </div>
      )}

    </div>
  );
}
