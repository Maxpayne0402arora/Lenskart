import React, { useState, useEffect } from "react";

export default function DevConsole({
  activePersona,
  personas,
  setPersona,
  measurementLedger,
  gameLedger,
  logs,
  activeApp,
  syncStatus,
  onSimulateChildCompletion,
  cheatDistance,
  setCheatDistance,
  cameraDropped,
  setCameraDropped,
  suspectFastSimulated,
  setSuspectFastSimulated,
  currentPhoneScreen,
  phoneCopyText // text content gathered from the phone screen to lint
}) {
  const [lintResults, setLintResults] = useState({ pass: true, violations: [] });

  // Safety Linter (F2)
  // Scans phone copy for clinical terms if the child is playing/viewing the screen.
  // Child screens are 'GAME', 'HANDOVER', 'CHILD_COMPLETION'
  useEffect(() => {
    const childScreens = ["GAME", "HANDOVER", "CHILD_COMPLETION"];
    const isChildScreen = childScreens.includes(currentPhoneScreen);
    
    if (!isChildScreen) {
      setLintResults({ pass: true, violations: [], text: "Parent-facing screen. Clinical terms allowed." });
      return;
    }

    const clinicalTerms = ["vision", "eye", "sight", "test", "prescription", "acuity", "glasses", "clinical", "optometrist", "fail", "pass", "result"];
    const textLower = phoneCopyText.toLowerCase();
    const violations = clinicalTerms.filter(term => textLower.includes(term));
    
    setLintResults({
      pass: violations.length === 0,
      violations,
      text: violations.length === 0 
        ? "No clinical terms detected. F2 Safe!" 
        : `F2 Violation! Clinical terms found: ${violations.join(", ")}`
    });
  }, [phoneCopyText, currentPhoneScreen]);

  return (
    <div className="console-panel">
      {/* Header */}
      <div className="console-header">
        <h1 className="console-title">
          Developer Simulator Console <span>v1.0.0</span>
        </h1>
        <div style={{ fontSize: "12px", color: "var(--dev-accent)" }}>
          Active screen: <strong>{currentPhoneScreen}</strong>
        </div>
      </div>

      {/* Grid of panels */}
      <div className="console-grid">
        
        {/* PANEL 1: PERSONAS & ANTI-CHEAT */}
        <div className="console-card">
          <div className="card-header">
            <span>👤 Simulation Personas & Controls</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Persona Selector */}
            <div className="persona-selector">
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--dev-text)" }}>
                SELECT ACTIVE ACCOUNT:
              </label>
              {Object.values(personas).map((p) => (
                <button
                  key={p.id}
                  className={`persona-btn ${activePersona.id === p.id ? "active" : ""}`}
                  onClick={() => setPersona(p.id)}
                >
                  <div>
                    <strong style={{ color: "#fff", display: "block" }}>{p.parentName} & {p.child.name}</strong>
                    <span style={{ fontSize: "11px" }}>
                      Track: {p.child.track === "corrected" ? "Corrected" : "Unaware"} ({p.child.track === "corrected" ? "Wears Glasses" : "No Glasses"})
                    </span>
                  </div>
                  <span className={`badge ${p.child.track}`}>
                    {p.child.track}
                  </span>
                </button>
              ))}
            </div>

            {/* Anti-cheat Sliders */}
            <div style={{ borderTop: "1px solid var(--dev-border)", paddingTop: "14px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--dev-text)", display: "block", marginBottom: "8px" }}>
                ANTI-CHEAT MOCK TRIGGERS (C5):
              </label>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span>Simulate Face Distance (IPD Ratio):</span>
                    <span style={{ color: cheatDistance > 1.15 ? "var(--dev-red)" : "var(--dev-green)", fontWeight: "bold" }}>
                      {cheatDistance.toFixed(2)}x {cheatDistance > 1.15 ? "(CHEAT)" : "(NORMAL)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.02"
                    value={cheatDistance}
                    onChange={(e) => setCheatDistance(parseFloat(e.target.value))}
                    disabled={currentPhoneScreen !== "PWA_GAME"}
                    style={{ width: "100%", cursor: "pointer" }}
                  />
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                    Set to &gt; 1.15 (Too Close) or &lt; 0.80 (Too Far) during gameplay to test alerts.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={cameraDropped}
                      onChange={(e) => setCameraDropped(e.target.checked)}
                      disabled={currentPhoneScreen !== "PWA_GAME"}
                    />
                    Simulate Camera Drop
                  </label>
                  
                  <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={suspectFastSimulated}
                      onChange={(e) => setSuspectFastSimulated(e.target.checked)}
                      disabled={currentPhoneScreen !== "PWA_GAME"}
                    />
                    Simulate Fast Clicks
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: R1 LEDGERS (Split ledger) */}
        <div className="console-card">
          <div className="card-header">
            <span>📜 Ledgers Monitor (R1 Separation Guard)</span>
            <span style={{ fontSize: "10px", color: "var(--dev-green)" }}>R1 Rule Active</span>
          </div>
          <div className="card-body" style={{ padding: "10px" }}>
            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "8px", lineHeight: "1.3" }}>
              ⚠️ **R1 Ledger Law:** The Measurement ledger records *only* the first response to each target. Retries and combos belong *strictly* to the Game ledger.
            </div>
            
            <div className="ledger-split">
              {/* Measurement Ledger */}
              <div className="ledger-box">
                <h5>📁 Measurement Ledger</h5>
                <div className="ledger-content">
                  {measurementLedger.length === 0 ? (
                    <div style={{ color: "#64748b", padding: "10px", textAlign: "center" }}>No records yet. Start the vision check game.</div>
                  ) : (
                    measurementLedger.map((row, i) => (
                      <div key={i} className="ledger-row" style={{ borderLeft: `2px solid ${row.correct ? "var(--dev-green)" : "var(--dev-red)"}`, paddingLeft: "4px" }}>
                        <div>
                          <span>#{row.trial} • {row.acuity} ({row.targetDir})</span>
                          <span style={{ display: "block", fontSize: "9px", color: "#64748b" }}>
                            Time: {row.reactionTimeMs}ms {row.suspectFast ? "⚡" : ""}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ color: row.correct ? "var(--dev-green)" : "var(--dev-red)", fontWeight: "bold" }}>
                            {row.correct ? "OK" : "MISS"}
                          </span>
                          <span style={{ display: "block", fontSize: "9px", color: "#64748b" }}>
                            Cam: {row.distanceVerified ? "Verified" : "Assumed"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Game Ledger */}
              <div className="ledger-box">
                <h5>🎮 Game Ledger</h5>
                <div className="ledger-content">
                  {gameLedger.length === 0 ? (
                    <div style={{ color: "#64748b", padding: "10px", textAlign: "center" }}>No scores logged yet.</div>
                  ) : (
                    gameLedger.map((row, i) => (
                      <div key={i} className="ledger-row">
                        <div>
                          <strong>{row.type}</strong>
                          <span style={{ display: "block", fontSize: "9px", color: "#64748b" }}>
                            Acuity: {row.acuity} • Combo: {row.combo}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ color: "var(--dev-yellow)", fontWeight: "bold" }}>
                            +{row.scoreChange} pts
                          </span>
                          <span style={{ display: "block", fontSize: "9px", color: "#64748b" }}>
                            {row.correct ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: PWA SYNC STATUS DASHBOARD */}
        <div className="console-card">
          <div className="card-header">
            <span>🔄 PWA Sync Dashboard (Two-App Link)</span>
            <span className="badge corrected" style={{ background: "rgba(74, 222, 128, 0.2)", color: "#4ade80" }}>Online</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--dev-border)",
                fontSize: "11px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>App Connection State:</span>
                  <strong style={{ color: "var(--dev-accent)" }}>Dual Sync Active</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Parent Consent Status:</span>
                  <span style={{ color: syncStatus !== "SETUP" ? "var(--dev-green)" : "var(--dev-red)", fontWeight: "bold" }}>
                    {syncStatus !== "SETUP" ? "GRANTED" : "AWAITING"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>PWA Play State:</span>
                  <span style={{ 
                    color: syncStatus === "COMPLETED" ? "var(--dev-green)" : 
                           syncStatus === "AWAITING_PLAY" ? "var(--dev-yellow)" : "var(--lk-text-sub)", 
                    fontWeight: "bold" 
                  }}>
                    {syncStatus === "COMPLETED" ? "PLAYED & SYNCED" : 
                     syncStatus === "AWAITING_PLAY" ? "AWAITING PLAY" : "NOT STARTED"}
                  </span>
                </div>
              </div>

              {/* Simulation link details */}
              <div style={{ fontSize: "11px", color: "var(--dev-text)", lineHeight: "1.4" }}>
                🎯 **Two-App Sync Flow:**
                <ol style={{ paddingLeft: "16px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li>Give consent on the 📱 **Lenskart App**.</li>
                  <li>Toggle to the 🕹️ **Gapchase PWA** via the header switch on the phone wrapper.</li>
                  <li>Play the game on the PWA to write to the cloud database.</li>
                  <li>Toggle back to 📱 **Lenskart App** where report results will automatically be unlocked!</li>
                </ol>
              </div>

              {/* Developer Cheat Bypass Button */}
              {syncStatus === "AWAITING_PLAY" && (
                <div style={{
                  marginTop: "8px",
                  background: "rgba(56, 189, 248, 0.1)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    ⚡ Skip playing game?
                    <span style={{ display: "block", fontSize: "9px", color: "var(--dev-text)" }}>
                      Simulate child finishing the check.
                    </span>
                  </div>
                  <button
                    className="custom-button"
                    style={{ fontSize: "10px", padding: "4px 8px", background: "var(--dev-accent)", color: "#000" }}
                    onClick={onSimulateChildCompletion}
                  >
                    Simulate Completion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 4: INSTRUMENTATION EVENTS & F2 COPY LINTER */}
        <div className="console-card">
          <div className="card-header">
            <span>⚙️ Analytics Logs & Safety Linter</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Copy Linter */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--dev-text)" }}>
                  F2 SAFETY COPY LINTER:
                </span>
                <span className={`badge ${lintResults.pass ? "corrected" : "unaware"}`} style={{
                  backgroundColor: lintResults.pass ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)",
                  color: lintResults.pass ? "#4ade80" : "#f87171"
                }}>
                  {lintResults.pass ? "SAFE" : "VIOLATION"}
                </span>
              </div>
              <div className={`lint-item ${lintResults.pass ? "pass" : "fail"}`}>
                <span>{lintResults.text}</span>
              </div>
            </div>

            {/* Event logger */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "130px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--dev-text)", marginBottom: "6px", display: "block" }}>
                vision_check EVENT LOGS:
              </span>
              <div style={{
                background: "#090d16",
                border: "1px solid var(--dev-border)",
                borderRadius: "8px",
                padding: "8px",
                flex: 1,
                overflowY: "auto",
                maxHeight: "150px"
              }}>
                <div className="event-log-container">
                  {logs.length === 0 ? (
                    <div style={{ color: "#475569", textAlign: "center", padding: "10px" }}>No events triggered yet.</div>
                  ) : (
                    logs.slice().reverse().map((log, i) => (
                      <div key={i} className="event-log-item">
                        <div>
                          <span className="time">{log.time}</span>
                          <span className="name">{log.name}</span>
                        </div>
                        <div className="props">
                          {JSON.stringify(log.properties)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
