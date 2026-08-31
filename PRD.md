# PRD — Vision Check for kids

**Product:** Vision Check for kids (parent-facing) · **Shape Chase** (child-facing game)
**Surface:** Lenskart mobile app (PWA widget launcher integration)
**Author:** Mayank Arora · **Status:** Updated Draft for Review

---

## 1. In one line

A parent starts a vision check in the Lenskart App, installs a home screen game widget, and hands the phone to their child to play a 60-second shape-matching game. The results are synced securely and viewed directly in the parent's Lenskart App dashboard, keeping clinical details completely invisible to the child.

---

## 2. Problem

A child's eyes change faster than anything in a family's life reports. Nothing in a normal week tells a parent that their child stopped seeing clearly four months ago.

**The evidence.** The AIIMS North India Myopia Study screened 9,884 urban schoolchildren in Delhi: 13.1% were myopic, and only 24.7% of those were wearing appropriate spectacles. Three in four myopic children were uncorrected or wrongly corrected. A four-decade meta-analysis puts the urban 11–15 band at 15% in the most recent decade. A separate North India study found 45.2% of myopic children had at least one myopic parent.

**Two failures, both invisible:**

**The undetected child** has never seen a blackboard sharply, so nothing feels lost. He copes — front row, photograph the board and zoom in, ask the person beside him — and every coping strategy he invents makes the signal quieter.

**The under-corrected child** already has glasses. His power drifted seven months ago and nothing reported it. He gets replacements when a frame physically breaks, fitted against the old prescription copied off the lens packet. The family transacted, stood at the counter, and still went home corrected to who he was a year ago.

**Why waiting is not neutral.** The WSPOS consensus position is that under-correction either has no effect on myopia progression or increases it, does not slow it, and should no longer be advocated. The common belief that stronger glasses weaken a child's eyes points families in exactly the wrong direction.

---

## 3. Why Lenskart, why now

Lenskart's growth engine is market creation, not share capture. Around 35,000 people a day walk into a store and discover for the first time that they cannot see clearly; roughly half of all India eye tests are somebody's first; over a crore first-time eye tests in FY26.

This feature extends that engine to the one segment that cannot walk in by itself. And Lenskart holds the only asset that makes it work: prescriptions on file. For a child with glasses, that is the baseline. For a child without, the *parent's* prescription plus a registered dependant is a pre-qualified target no competitor can replicate.

---

## 4. Who this is for

### Aarav, 13 — the user who cannot buy

| | |
|---|---|
| **Job to be done** | Keep up with the board without asking anyone to repeat it |
| **Emotional job** | Not become the thing that gets discussed at home |
| **Social job** | Stay the kid who fields at point, not the one who ducks the catch |
| **What he fired** | Asking the person next to him — cost him socially, and once cost him a wrong sum |

**Needs:** to not be singled out; to not lose a half-day to a clinic; to not have a problem that becomes a family topic.

**Pain points**
- No reference for normal. He has never seen the board sharply, so nothing registers as lost.
- Reporting it has a visible cost and no visible benefit. Glasses are a downgrade in his world.
- His workarounds work. Every good workaround delays the fix.
- Headaches at 4pm get blamed on heat, screens, or a skipped lunch.
- **If he already wears glasses, the motive sharpens:** he does not want a stronger power, and the only thing he can control is what the test says.

### Divya, 41 — the buyer who cannot see the problem

| | |
|---|---|
| **Job to be done** | Work out whether slipping marks are effort, attention, or something physical |
| **Emotional job** | Not be the parent who missed something for two years |
| **Social job** | Be able to say she checked, if a teacher asks |
| **What she fired** | Waiting for the school screening camp — it happened, the slip never came home |

**Needs:** a trigger she trusts; a way to check that costs minutes not a half-day; certainty before she spends the half-day.

**Pain points**
- No trigger she trusts. Screen time is the available explanation and it absorbs every symptom.
- Taking a child to an optician is a half-day: school, traffic, a queue, and a suspicion of being sold to.
- She is myopic herself and has never been told that roughly doubles his risk.
- When the frame broke, she bought a replacement against the old prescription. No re-test happened.

### The gap this creates

Aarav optimises for concealment. Divya optimises for certainty. His coping quietens the signal; her caution waits for one loud enough to act on. **This is a signal-suppression problem, not a discovery or access problem.** A product that asks a child how well he sees will get a confident, wrong answer.

---

## 5. Solution

**Shape Chase** is a sixty-second game the child plays on a PWA. Under it is a shape-matching acuity staircase (pediatric Lea Symbols: **Heart ❤️, House 🏠, Circle 🟢, Square 🟨**). 

The parent clicks a generic Lenskart Home banner ad, grants consent, and installs a mock home screen widget. The child launches the game from the **white Duolingo-style 2x1 desktop widget** and completes the screen camera calibration (face alignment) right before beginning the game. Results sync securely to Lenskart and are delivered directly within the parent's Lenskart app dashboard, bypassing any third-party messaging risks (such as WhatsApp preview leaks).

**Three design decisions carry the product:**

* **Different Outputs**: The child and parent get different screens. The child sees scores, combos, and ranks. Never an acuity value or comparison, removing any motive to conceal.
* **Lea Shapes Matching**: Replaced directional Landolt C rings with simple shape-matching cards (Heart, House, Circle, Square). This is intuitive for younger children and easily taught.
* **Near Acuity Pacing (40 cm)**: Calibrated for comfortable hand-held distance (40 cm / 1.3 feet). This allows direct screen tapping, **eliminating microphone permissions or shouting controls**. If the child leans closer than 35 cm or further than 50 cm, the **Specsy Dino 🦖 mascot** pauses play with an alignment warning bubble.

**Two tracks, one engine.**

| | Corrected | Unaware |
|---|---|---|
| Baseline | Prescription on file | Session 1 |
| Glasses during play | On | Off |
| Verdict from | Session 1 | Session 2 |
| Session 1 output | Delta and referral | Enrolment, plus an immediate referral if worse than 20/200 |

**Why session 1 cannot conclude for an unaware child.** Cold screening at ~15% prevalence with a realistic 80/80 classifier yields a positive predictive value near 41% — six in ten flagged children would not have a problem. Against the child's own earlier session, that base-rate problem disappears entirely. So session 1 enrols honestly rather than guessing, and a coarse 20/200 threshold catches the severe cases where no baseline is needed.

**The result the parent gets** is one of three: book a home test or store visit; keep monitoring and we will know more in three months; or nothing to act on today. An optometrist booking is available from every state — a parent's own concern outranks the classifier.

**And one change that needs no engineering at all.** Anyone under 18 arriving to replace a broken or scratched frame is re-tested before the order is taken, never fitted against a prescription on file. That single default is what sent Aarav home corrected to who he was a year earlier.

---

## 6. Scope

**In:** 
* Generic, unpersonalized Lenskart marketing banner ad (*"Kids Vision Check at Home"*)
* Parental consent screen (bypassing handover options to reduce friction)
* Screen camera calibration (relocated to the start of the child's PWA gameplay journey)
* Android widget installation flow (with native confirmation pop-ups)
* 2x1 white home screen launcher widget
* Shape Chase game loop (pediatric shape cards, wiggling Specsy Dino 🦖 mascot guides)
* Real-time eye distance warnings (pauses at <35 cm or >50 cm)
* Secure parent dashboard results sync (with "Go to Homepage" navigation options)
* Store and home-visit booking funnels

**Out:** 
* Cold-screen verdicts from a single session
* Astigmatism, colour and near vision
* Any clinical result or acuity score shown to the child during gameplay
* Double-point streak multipliers or speed-bonus alert popups
* Passive or background monitoring of a child
* Third-party WhatsApp result previews (replaced by secure in-app dashboard cards)

---

## 7. Success

**North star behaviour**
Families re-check a child's vision on a schedule driven by their eyes, not by a frame breaking.

**Primary metric**
Attended under-18 eye tests attributable to Vision Check, per month. Attended, not booked — a booking nobody shows up for is worth zero.

**Contributing metrics** — the funnel that produces the primary
Entry shown → consent granted → session started → session completed → result delivered → result opened → booking made → **test attended**. Each stage is instrumented; the primary is the last one.

**Leading indicators** — visible in week 1–2
- Session completion rate (started → completed without void)
- In-app result view rate within 24 hours
- Booking rate from a REFER result
- Void rate, and the reason split

**Lagging indicators** — confirm at 6–12 weeks
- Attendance rate on bookings made through the feature
- Share of attended tests that resulted in a prescription change — this validates that the screener is pointing at real cases
- Share of under-18 prescriptions on file that are under 12 months old
- Repeat-session rate at the 3-month re-check

**Guardrail metrics** — what we protect
- **False negatives.** Children classified CLEAR who need a prescription change within 90 days of an in-store test. This is the metric that can shut the feature down.
- Consent withdrawal rate
- Re-check reminder opt-out rate
- Support tickets and store reports mentioning the feature
- **Child-facing leakage: zero tolerance.** Any instance of clinical language reaching a child is a P0 defect, not a metric.

**Anti-metric — watch, never optimise**
Attach rate on the resulting store or home visit. It will rise, and that is fine. It must not appear in anyone's goals, on any dashboard used for decisions, or in any experiment's success criteria. Optimising it converts a health check into a sales trigger, and the parent will feel it within one cycle.

**What bad looks like — thresholds set now, not later**
- More than 10% of CLEAR children need a prescription change within 90 days → pull the feature.
- Attach rate growing faster than attendance → the flow is being used as a funnel; audit the copy.
- Consent withdrawal above 5% → the consent screen is over-reaching or the in-app reminders are unwelcome.

---

## 8. Risks and open questions

| Risk | Handling |
|---|---|
| Child accesses parent dashboard details | Results dashboard is gated behind parent login verification credentials. |
| Device change between sessions reads as a vision change | Comparability guard: no delta computed unless distance mode, pixel density within 5%, and glasses state all match. |
| A corrected child recognises the game — he has seen a phoropter | Disguise must be stronger for this track, not weaker. His motive to appear fine is more specific than the unaware child's. |
| Parent uses the screener instead of an eye test | Every result state offers an immediate optometrist booking, including CLEAR. |
| Camera unavailable | Full fallback to assumed distance. Flow always completes; result labelled unverified. |

---

## 9. Assumptions

**Published, not assumed:** myopia prevalence and spectacle-correction figures (AIIMS NIM Study, PLOS One 2015); parental myopia correlation (Indian J Ophthalmol, 2022); prevalence trend (PLOS One meta-analysis, 2020); under-correction consensus (WSPOS); Lenskart eye-test volumes (company earnings disclosures).

**Assumed, and load-bearing if wrong:**
- That children conceal. Consistent with low spectacle compliance, but not established by this work.
- That the game's time pressure does not systematically bias the threshold. Mitigated because comparison is against the child's own prior session under identical conditions, so a constant bias cancels.
- That the breakage-driven replacement cycle is real. Testable against Lenskart's own under-18 repeat-order data before anything is built.
- That parents will hand a phone to a child and not narrate what it is for.
- The DPDP reading — under-18 means child, verifiable parental consent required, tracking and behavioural monitoring barred regardless of consent. My reading, not legal advice.
