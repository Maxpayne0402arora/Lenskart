// Mock database for the Lenskart Child Vision Monitoring prototype.
// This database holds information for three testing personas representing different entry paths.

export const initialPersonas = {
  divya_aarav: {
    id: "divya_aarav",
    parentName: "Divya Arora",
    parentAge: 38,
    parentEmail: "divya.arora@example.com",
    parentPhone: "+91 98765 43210",
    parentHasMyopia: true,
    parentPrescription: {
      od: { sph: -3.50, cyl: -0.50, axis: 180 },
      os: { sph: -3.25, cyl: -0.75, axis: 170 },
      date: "2025-01-15"
    },
    child: {
      id: "aarav_123",
      name: "Aarav Arora",
      dob: "2018-05-12", // 8 years old
      track: "corrected", // Wears glasses
      glassesWorn: true,
      baselineAcuity: "20/20", // Target 20/20 with current glasses
      prescription: {
        od: { sph: -1.50, cyl: -0.25, axis: 90 },
        os: { sph: -1.75, cyl: -0.50, axis: 90 },
        date: "2026-01-20" // 7+ months ago (stale!)
      },
      sessions: [
        {
          id: "sess_1",
          timestamp: "2026-02-15T10:00:00Z",
          threshold: "20/20",
          pxPerMm: 6.2,
          distanceMode: "camera",
          distanceVerified: true,
          glassesWorn: true,
          classification: "CLEAR",
          confidence: "high"
        },
        {
          id: "sess_2",
          timestamp: "2026-05-15T14:30:00Z",
          threshold: "20/25",
          pxPerMm: 6.2,
          distanceMode: "camera",
          distanceVerified: true,
          glassesWorn: true,
          classification: "MONITOR",
          confidence: "high"
        }
      ]
    }
  },
  rajesh_preeti: {
    id: "rajesh_preeti",
    parentName: "Rajesh Kumar",
    parentAge: 42,
    parentEmail: "rajesh.kumar@example.com",
    parentPhone: "+91 99999 88888",
    parentHasMyopia: true, // Qualifies parent-power targeting
    parentPrescription: {
      od: { sph: -2.50, cyl: 0, axis: 0 },
      os: { sph: -2.25, cyl: -0.25, axis: 180 },
      date: "2025-11-10"
    },
    child: {
      id: "preeti_456",
      name: "Preeti Kumar",
      dob: "2016-09-22", // 10 years old
      track: "unaware", // No glasses
      glassesWorn: false,
      baselineAcuity: null,
      prescription: null,
      sessions: [] // Session 1 output will be ENROLMENT only
    }
  },
  anjali_sam: {
    id: "anjali_sam",
    parentName: "Anjali Sharma",
    parentAge: 35,
    parentEmail: "anjali.sharma@example.com",
    parentPhone: "+91 98888 77777",
    parentHasMyopia: false,
    parentPrescription: null,
    child: {
      id: "sam_789",
      name: "Sam Sharma",
      dob: "2020-03-05", // 6 years old
      track: "unaware", // No glasses
      glassesWorn: false,
      baselineAcuity: null,
      prescription: null,
      sessions: []
    }
  }
};
