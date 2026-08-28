import React, { useState } from "react";

export default function ParentResultDetail({
  result, // contains { classification, confidence, threshold, baseline, deltaLines, distanceVerified, pxPerMm, glassesWorn, childName, track }
  onClose,
  logEvent
}) {
  const [bookingStep, setBookingStep] = useState("CHOICE"); // 'CHOICE', 'CONFIRMED'
  const [bookingMode, setBookingMode] = useState(null); // 'home' or 'store'
  const [monitorInterval, setMonitorInterval] = useState("3");

  const classification = result?.classification || "ENROL";
  const track = result?.track || "unaware";
  const childName = result?.childName || "Your child";

  const handleBook = (mode) => {
    setBookingMode(mode);
    setBookingStep("CONFIRMED");
    logEvent("vision_check_booking_made", {
      mode: mode,
      lead_time_hours: mode === "home" ? 24 : 2
    });
  };

  const getVerdictHeader = () => {
    switch (classification) {
      case "REFER":
        return {
          title: "Recommendation: Detailed Eye Test Advised",
          desc: `Based on today's check, we recommend having an optometrist look at ${childName}'s eyes to see if a prescription adjustment is needed.`,
          class: "refer"
        };
      case "MONITOR":
        return {
          title: "Action: Monitor Vision (Recheck Scheduled)",
          desc: `The vision check shows a small shift or was completed under variable conditions. We recommend monitoring and rechecking in a few months.`,
          class: "monitor"
        };
      case "CLEAR":
        return {
          title: "Vision: Stable and Clear",
          desc: `Great news! ${childName}'s vision check matches their baseline target. Keep up the routine checks.`,
          class: "clear"
        };
      case "ENROL":
      default:
        return {
          title: "Vision Check Enrolled",
          desc: `Today's screening was successful and has established the initial baseline. We need another check to compare future vision changes.`,
          class: "enrol"
        };
    }
  };

  const headerDetails = getVerdictHeader();

  return (
    <div className="parent-result-screen">
      <div className="parent-result-header">
        <h2 style={{ color: "var(--lk-primary)" }}>Vision Check Report</h2>
        <span style={{ fontSize: "11px", color: "var(--lk-text-sub)" }}>
          Child: <strong>{childName}</strong> • Date: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* R4: Screening never diagnosis statement */}
      <div style={{
        fontSize: "11px",
        background: "rgba(255, 165, 0, 0.08)",
        border: "1px solid rgba(255, 165, 0, 0.2)",
        borderRadius: "8px",
        padding: "10px",
        color: "#d97706",
        lineHeight: "1.4"
      }}>
        ⚠️ **Important Screening Note:** This check is a screening helper taken at home, not a clinical diagnosis. It helps track change over time to flag when a professional look is appropriate.
      </div>

      {/* Verdict Banner */}
      <div className={`verdict-banner ${headerDetails.class}`}>
        <span className="verdict-title" style={{
          color: classification === "REFER" ? "var(--lk-accent)" : 
                 classification === "MONITOR" ? "var(--lk-warning)" : 
                 classification === "CLEAR" ? "var(--lk-success)" : "var(--lk-secondary)"
        }}>
          {headerDetails.title}
        </span>
        <span className="verdict-desc">{headerDetails.desc}</span>
      </div>

      {/* Baseline / Today comparison side-by-side (D3) */}
      <div className="comparison-box">
        <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "10px", color: "var(--lk-primary)" }}>
          Acuity Performance Comparison
        </h4>
        <div className="comparison-grid">
          <div className="comp-item">
            <label>Baseline Target</label>
            <span style={{ color: "var(--lk-text-sub)" }}>
              {result?.baseline || "None (Sess 1)"}
            </span>
          </div>
          <div className="comp-item">
            <label>Today's Screening</label>
            <span style={{ 
              color: classification === "REFER" ? "var(--lk-accent)" : "var(--lk-primary)",
              fontWeight: "bold" 
            }}>
              {result?.threshold}
            </span>
          </div>
        </div>
        
        {classification !== "ENROL" && (
          <div style={{ fontSize: "12px", marginTop: "12px", color: "var(--lk-text-main)", textAlign: "center", fontWeight: "500" }}>
            {result?.deltaLines > 0 ? (
              <span style={{ color: "var(--lk-accent)" }}>
                📈 Shifted by {result.deltaLines} {result.deltaLines === 1 ? "line" : "lines"} finer compared to baseline.
              </span>
            ) : result?.deltaLines < 0 ? (
              <span style={{ color: "var(--lk-accent)" }}>
                📉 Vision indicates a decline of {Math.abs(result.deltaLines)} {Math.abs(result.deltaLines) === 1 ? "line" : "lines"} on Snellen chart.
              </span>
            ) : (
              <span style={{ color: "var(--lk-success)" }}>
                🎯 Vision is stable and matches target perfectly.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Track Explanations (D3) */}
      {track === "corrected" && (
        <div style={{
          fontSize: "12px",
          background: "rgba(0, 186, 198, 0.05)",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid rgba(0, 186, 198, 0.15)",
          color: "var(--lk-text-main)",
          lineHeight: "1.4"
        }}>
          👓 **Corrected Vision Log:** Today's check was run with glasses **ON**. This means any variation indicates a potential shift in the child's prescription power, rather than a degradation of their naked eyesight.
        </div>
      )}

      {/* D3 Under-Correction Consensus Note */}
      <div className="clinical-note">
        <strong>💡 Medical Advisory Note:</strong>
        <p style={{ marginTop: "4px" }}>
          Current pediatric ophthalmology consensus is that leaving a child under-corrected (wearing glasses too weak for their eyes) does not slow myopic progression, and can actually accelerate it. Regular adjustments to keep correction full are highly recommended.
        </p>
      </div>

      {/* Conditions Box */}
      <div style={{
        background: "var(--lk-bg-light)",
        borderRadius: "12px",
        padding: "12px",
        fontSize: "11px",
        color: "var(--lk-text-sub)"
      }}>
        <div style={{ fontWeight: "700", marginBottom: "4px", color: "var(--lk-text-main)" }}>
          Screening Conditions Checklist:
        </div>
        <div>Distance mode: <strong>{result?.distanceVerified ? "Camera-verified (40cm)" : "Assumed (40cm fallback)"}</strong></div>
        <div>Calibration scale: <strong>{result?.pxPerMm ? `${result.pxPerMm} px/mm` : "Default DPI"}</strong></div>
        <div>Glasses Worn: <strong>{result?.glassesWorn ? "Yes" : "No"}</strong></div>
        <div>Fast Clicks Filtered: <strong>{result?.suspectFast || 0} clicks under 250ms</strong></div>
      </div>

      {/* R5: NO COMMERCE. Directly offer Referral or Monitoring */}
      {bookingStep === "CHOICE" ? (
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {classification === "REFER" || classification === "MONITOR" ? (
            <>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--lk-primary)" }}>
                {classification === "REFER" ? "Next Professional Steps:" : "Scheduling Options:"}
              </h3>
              
              {/* Referral paths (D4) - Unaware track shows home test first */}
              {track === "unaware" ? (
                <>
                  <button className="btn-primary" onClick={() => handleBook("home")}>
                    🏠 Book Home Eye Test (Free)
                  </button>
                  <div style={{
                    border: "1px solid var(--lk-border)",
                    borderRadius: "12px",
                    padding: "12px",
                    background: "#fff"
                  }}>
                    <div style={{ fontWeight: "600", fontSize: "12px", color: "var(--lk-primary)" }}>
                      Or Visit Nearest Lenskart Store
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--lk-text-sub)", margin: "4px 0 8px 0" }}>
                      📍 MG Road Store (2.4 km) • Open until 9:00 PM • Next slot: Tomorrow 11:00 AM
                    </p>
                    <button 
                      className="btn-primary" 
                      style={{ background: "#000c24", color: "#fff" }}
                      onClick={() => handleBook("store")}
                    >
                      Book Free Store Test
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    border: "1px solid var(--lk-border)",
                    borderRadius: "12px",
                    padding: "12px",
                    background: "#fff",
                    marginBottom: "4px"
                  }}>
                    <div style={{ fontWeight: "600", fontSize: "12px", color: "var(--lk-primary)" }}>
                      Lenskart MG Road Store (2.4 km)
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--lk-text-sub)", margin: "4px 0 8px 0" }}>
                      Open 10:00 AM - 9:00 PM • Next available slot: Today at 6:30 PM
                    </p>
                    <button className="btn-primary" onClick={() => handleBook("store")}>
                      Book Store Eye Test
                    </button>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ background: "#000c24", color: "#fff" }}
                    onClick={() => handleBook("home")}
                  >
                    Book Home Vision Test
                  </button>
                </>
              )}

              {/* Monitor Section (D5) */}
              {classification === "MONITOR" && (
                <div style={{
                  borderTop: "1px solid var(--lk-border)",
                  paddingTop: "12px",
                  marginTop: "8px"
                }}>
                  <div style={{ fontWeight: "600", fontSize: "12px", color: "var(--lk-primary)", marginBottom: "6px" }}>
                    Or Schedule Vision Monitoring
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select 
                      value={monitorInterval}
                      onChange={(e) => setMonitorInterval(e.target.value)}
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid var(--lk-border)",
                        fontSize: "12px",
                        flex: 1
                      }}
                    >
                      <option value="1">Recheck in 1 month</option>
                      <option value="3">Recheck in 3 months (Recommended)</option>
                      <option value="6">Recheck in 6 months</option>
                    </select>
                    <button 
                      className="custom-button"
                      onClick={() => {
                        logEvent("vision_check_reminder_scheduled", { interval_months: monitorInterval });
                        alert(`Recheck scheduled in ${monitorInterval} months! We will notify you in the Lenskart App.`);
                        onClose();
                      }}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Clear or Enrolled state */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--lk-text-sub)" }}>
                  RECOMMENDED CADENCE:
                </label>
                <p style={{ fontSize: "12px", color: "var(--lk-text-main)", marginTop: "2px" }}>
                  Schedule next routine screening in 3 months to monitor vision growth.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    logEvent("vision_check_reminder_scheduled", { interval_months: 3 });
                    alert("Routine check scheduled! We'll notify you in 3 months.");
                    onClose();
                  }}
                >
                  Schedule 3 Month Recheck
                </button>
                
                {/* D5: Override option always available */}
                <button 
                  className="btn-primary"
                  style={{ background: "#e2e8f0", color: "var(--lk-text-main)", border: "1px solid #cbd5e1" }}
                  onClick={() => handleBook("store")}
                >
                  Book Store Visit Anyway
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Booking confirmed screen */
        <div style={{
          textAlign: "center",
          background: "var(--lk-bg-light)",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid var(--lk-border)"
        }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>✅</div>
          <h3 style={{ color: "var(--lk-primary)", marginBottom: "4px" }}>Booking Confirmed!</h3>
          <p style={{ fontSize: "12px", color: "var(--lk-text-sub)", marginBottom: "16px", lineHeight: "1.4" }}>
            Your free {bookingMode === "home" ? "Home Eye Test" : "Store Optometrist Session"} is scheduled. 
            Details saved to your Lenskart account.
          </p>
          
          {/* D4 Instructions */}
          {track === "corrected" && (
            <div style={{
              fontSize: "11px",
              background: "#fff",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 71, 87, 0.2)",
              color: "var(--lk-accent)",
              textAlign: "left",
              marginBottom: "12px"
            }}>
              ⚠️ **Important:** Please remember to bring the glasses {childName} currently wears to this examination.
            </div>
          )}

          {/* D4 Zero-Engineering High-Leverage Store Rule */}
          <div style={{
            fontSize: "11px",
            background: "#fff",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid var(--lk-border)",
            textAlign: "left",
            lineHeight: "1.4",
            color: "var(--lk-text-main)"
          }}>
            📋 **Lenskart Safety Rule:** Anyone under 18 arriving to replace a broken or scratched frame is mandatory re-tested before the order is taken, never fitted against a prescription on file.
          </div>

          <button 
            className="btn-primary" 
            style={{ marginTop: "16px" }}
            onClick={onClose}
          >
            Close Report
          </button>
        </div>
      )}
    </div>
  );
}
