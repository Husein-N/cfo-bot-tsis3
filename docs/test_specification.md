# CFO Bot — Test Specification Document

This document defines the formal test suite to ensure the CFO Bot's mathematical accuracy against the System Specification (SSOT). All expected outputs have been calculated strictly in compliance with the formulas in Section 4 and Section 5.

---

## 1. UNIT TEST CASES — GEMINI API COST (Formula 4.1)

| Test ID | Description    | Inputs (messages, tokenIn, tokenOut, tier)       | Expected Output (Calculation Step-by-Step)   | Pass Condition         |
| :---    | :---           | :---                                             | :---                                         | :---                   |
| **TC1.1** | Low Volume   | `msg/day=100`, `in=500`, `out=300`, `Flash`      | • mo_msg = 3,000<br>• In Tokens = 1.5M -> 1.5 * $0.075 = $0.1125<br>• Out Tokens = 0.9M -> 0.9 * $0.30 = $0.27<br>• Total = $0.3825 | Output strictly equals `$0.38` |
| **TC1.2** | Medium Volume| `msg/day=1,000`, `in=500`, `out=300`, `Flash`    | • mo_msg = 30,000<br>• In Tokens = 15.0M -> 15 * $0.075 = $1.125<br>• Out Tokens = 9.0M -> 9 * $0.30 = $2.70<br>• Total = $3.825 | Output strictly equals `$3.83` |
| **TC1.3** | High Volume  | `msg/day=10,000`, `in=1,000`, `out=500`, `Pro` | • mo_msg = 300,000<br>• In Tokens = 300M -> 300 * $3.50 = $1,050.00<br>• Out Tokens = 150M -> 150 * $10.50 = $1,575.00<br>• Total = $2,625.00 | Output strictly equals `$2625.00` |
| **TC1.4** | Model Switch | `msg/day=1,000`, `in=500`, `out=300`, `Pro`      | • mo_msg = 30,000<br>• In Tokens = 15.0M -> 15 * $3.50 = $52.50<br>• Out Tokens = 9.0M -> 9 * $10.50 = $94.50<br>• Total = $147.00 | Output strictly equals `$147.00` |

## 2. UNIT TEST CASES — CLOUD RUN COST (Formula 4.2)

*(Assumption constants used per SSOT logic or as input substitutions: vcpu=1, mem=0.5)*

| Test ID | Description      | Inputs (msg/day, sec, vcpu, mem)        | Expected Output (Calculation Step-by-Step)   | Pass Condition         |
| :---    | :---             | :---                                    | :---                                         | :---                   |
| **TC2.1** | Below Free Tier| `msg=10,000`, `sec=0.5`, `vCPU=1`, `Mem=0.5` | • req = 300,000 (0 billable)<br>• vCPU-sec = 150,000 (0 billable)<br>• Mem-sec = 75,000 (0 billable)<br>• Total = $0.00 | Output strictly equals `$0.00` (Not negative) |
| **TC2.2** | Exceed Free Tier | `msg=100,000`, `sec=2.0`, `vCPU=1`, `Mem=0.5`| • req = 3.0M -> 1M billable * $0.40/M = $0.40<br>• vCPU-sec = 6.0M -> 5,820,000 billable * $0.000024 = $139.68<br>• Mem-sec = 3.0M -> 2,640,000 billable * 0.0000025 = $6.60<br>• Total = $146.68 | Output strictly equals `$146.68` |
| **TC2.3** | High Usage       | `msg=500,000`, `sec=5.0`, `vCPU=2`, `Mem=1.0`| • req = 15M -> 13M billable * $0.40/M = $5.20<br>• vCPU-sec = 150M -> 149.82M billable * $0.000024 = $3,595.68<br>• Mem-sec = 75M -> 74.64M billable * 0.0000025 = $186.60<br>• Total = $3,787.48 | Output strictly equals `$3787.48` |

## 3. UNIT TEST CASES — FIRESTORE COST (Formula 4.3)

| Test ID   | Description      | Inputs (msg/day, reads, writes, storage) | Expected Output (Calculation Step-by-Step)   | Pass Condition         |
| :---      | :---             | :---                                     | :---                                         | :---                   |
| **TC3.1** | Pure Free Tier   | `msg=10k`, `reads=2`, `writes=1`, `gb=1.0`| • read/day=20k (0 bill), write/day=10k (0 bill)<br>• gb=1.0 (0 bill)<br>• Total = $0.00 | Output strictly equals `$0.00` |
| **TC3.2** | Narrow Exceed    | `msg=26k`, `reads=2`, `writes=1`, `gb=1.5`| • read/day=52k -> 2k bill * 30 / 100k * $0.06 = $0.036<br>• write/day=26k -> 6k bill * 30 / 100k * $0.18 = $0.324<br>• gb=1.5 -> 0.5 bill * $0.18 = $0.09<br>• Total = 0.036+0.324+0.09 = $0.45 | Output strictly equals `$0.45` |
| **TC3.3** | High Usage       | `msg=500k`, `reads=5`, `writes=2`, `gb=50` | • read/d=2.5M -> 2.45M bill * 30 / 100k * $0.06 = $44.10<br>• write/d=1M -> 0.98M bill * 30 / 100k * $0.18 = $52.92<br>• gb=50 -> 49 bill * $0.18 = $8.82<br>• Total = $105.84 | Output strictly equals `$105.84` |

## 4. UNIT TEST CASES — CLOUD STORAGE COST (Formula 4.4)

| Test ID   | Description      | Inputs (gb, egress, uploads, downloads)  | Expected Output (Calculation Step-by-Step)   | Pass Condition         |
| :---      | :---             | :---                                     | :---                                         | :---                   |
| **TC4.1** | Under Limits     | `gb=4`, `egress=0.5`, `up=4k`, `down=40k`| • gb=4 (0 bill), eg=0.5 (0 bill), up=4k (0 bill), down=40k (0 bill)<br>• Total = $0.00 | Output strictly equals `$0.00` |
| **TC4.2** | Business App     | `gb=15`, `egress=21`, `up=35k`, `down=250k`| • gb=15 -> 10 bill * $0.02 = $0.20<br>• eg=21 -> 20 bill * $0.12 = $2.40<br>• up=35k -> 30k bill / 10k * $0.05 = $0.15<br>• down=250k -> 200k bill / 10k * $0.004 = $0.08<br>• Total = $2.83 | Output strictly equals `$2.83` |
| **TC4.3** | Media Heavy      | `gb=5k`, `eg=1k`, `up=1M`, `down=5M`    | • gb=5000 -> 4995 bill * $0.02 = $99.90<br>• eg=1000 -> 999 bill * $0.12 = $119.88<br>• up=1M -> 995k bill / 10k * $0.05 = $4.975<br>• down=5M -> 4.95M bill / 10k * $0.004= $1.98<br>• Total = $226.735 | Output strictly equals `$226.74` |

---

## 5. INTEGRATION TEST CASES — TOTAL COST (Formula 5.0)

**TC5.1: Small Startup (Assumed Default Baseline)**
- **Inputs**: `msg/day=1,000`, `MAU=500`, `tier=Flash`, `in_tok=500`, `out_tok=300`, `req_sec=2.0`, `vcpu=1`, `mem=0.5`, `fs_gb=1.0`, `gcs_gb=10`, `gcs_eg=5.0`, `up=1000`, `down=5000`
- **Breakdown**:
  - Gemini (TC1.2): $3.825
  - Cloud Run (Below Free): $0.00
  - Firestore (Below Free): $0.00
  - Cloud Storage: (5 * $0.02) + (4 * $0.12) + $0 + $0 = $0.58
- **Expected Outputs**:
  - `TOTAL COST` = $3.825 + $0.58 = `$4.41`
  - `Cost per User` = 4.405 / 500 = `$0.01`
  - `Cost per 1k msgs` = (4.405 / 30,000) * 1000 = `$0.15`

**TC5.2: Scaled Enterprise App**
- **Inputs**: `msg/day=100,000`, `MAU=50,000`, `tier=Pro`, `in=1000`, `out=500`, `req_sec=2.0`, `vcpu=1`, `mem=0.5`, `fs_gb=10`, `gcs_gb=105`, `gcs_eg=101`, `up=55k`, `down=150k`
- **Breakdown**:
  - Gemini: $26,250.00 (In: 3000M*$3.5, Out: 1500M*$10.5)
  - Cloud Run: $146.68 (Match TC2.2)
  - Firestore: Reads $2.70 + Writes $4.32 + Storage $1.62 = $8.64
  - Cloud Storage: Store $2.00 + Eg $12.00 + Up $0.25 + Down $0.04 = $14.29
- **Expected Outputs**:
  - `TOTAL COST` = `$26,419.61`
  - `Cost per User` = 26,419.61 / 50,000 = `$0.53`
  - `Cost per 1k msgs` = (26,419.61 / 3,000,000) * 1000 = `$8.81`

---

## 6. EDGE CASE TESTS (Mapping SSOT Section 9)

| Edge Case | Test Action | Expected Result | Pass Condition |
| :--- | :--- | :--- | :--- |
| **Zero Inputs (Div/0)** | Enter `0` in `daily_messages` and `MAU`. | Costs display `$0.00`, no NaN or Infinity exceptions thrown. | Displays `$0.00` cleanly |
| **Free Tier Boundary** | Input variables matching exact free tier maximums (e.g. 2M req, 50k reads) | Cost strictly stops descending at 0. Never displays negative numbers (e.g. `-$1.40`). | Displays `$0.00` cleanly |
| **Very Large Inputs** | Enter `10,000,000` messages. | UI elements do not wrap unnaturally, and JS does not overflow memory limits. | Displays `$270,958.00` roughly with visual grid intact |
| **Non-numeric Inputs** | Key in `abc` or `$$` into form boxes. | System rejects input or visually highlights a validation error box. | Error shown, DOM not crashed |
| **Out-of-range Inputs**| Key in `-999` for `msg/day`. | System clips to `1` as defined by Section 6 (1 - 10,000,000 range constraint). | Box defaults/clamps input |
| **Model Switch** | User toggles `Pro` -> `Flash` and checks visually. | The chart and numbers redraw immediately without hitting `/refresh`. | DOM refresh purely responsive|
| **Decimal Precision** | Check standard inputs calculating long floats. | Numbers display exactly two decimals (`$4.07`, not `$4.0699`). | Regex match `^\$[0-9,]+\.[0-9]{2}$` |

---

## 7. UI/UX VALIDATION CHECKLIST (Section 7)

- [ ] **Check Layout Responsiveness**: Resize browser window to `768px` wide; confirm panels reflow intelligently without hiding data.
- [ ] **Check Auto-Calculation**: Type `1500` into `msg/day`; verify output total changes immediately without a "Submit" button click.
- [ ] **Check Groupings**: Verify forms are visually divided into "Usage", "AI Model", and "Storage" blocks.
- [ ] **Check Input Affordances**: Ensure every box clearly shows the unit label mapping (e.g., `messages/day`), and has standard placeholders.
- [ ] **Check Model Dropdown**: Assert the toggle for `Flash` and `Pro` is highly visible and explicitly functional.
- [ ] **Check the Reset Flow**: Modify all parameters -> Click "Reset to Defaults" -> Assert form returns precisely to the Section 6 defaults.
- [ ] **Check Highlight Logic**: Visually locate the largest card output (usually Gemini); confirm it wears a colored border or badge.
- [ ] **Check Breakdown Chart**: Verify the horizontal CSS bar chart displays 4 colored segments properly corresponding to percentage weight.
- [ ] **Check Header Element**: Observe the phrase "CFO Bot" and "Monthly Cloud Cost Estimator for AI Chat Applications" in the main top-header.

---

## 8. ACCEPTANCE CRITERIA VERIFICATION (Section 10)

| AC # | Validation Procedure | Status |
| :--- | :--- | :--- |
| **AC-01** | Open URL in incognito window to verify it serves public Firebase payload over HTTPS. | Pending Deployment |
| **AC-02** | Type numeric values across all 9 fields independently; observe the Total updating in < 100ms. | Pending QA |
| **AC-03** | Use baseline form; Toggle model to Pro. Guarantee `Total Cost` spikes higher than Flash. | Pending QA |
| **AC-04** | Use values from **TC1.2** through **TC4.3** in the UI and confirm outputs match exactly down to pennies. | Pending QA |
| **AC-05** | Inject **TC5.1** parameters to ensure sub-costs successfully truncate downwards explicitly to zero. | Pending QA |
| **AC-06** | Manually sum the four service cards presented in the UI panel against the bold `Total Cost` view. | Pending QA |
| **AC-07** | Use Chrome Inspector tools to review width percentages supplied to the Horizontal Bar Chart `div` wrappers. | Pending QA |
| **AC-08** | Attempt to inject negative string values (`-5.0`) into numeric forms to invoke error notifications explicitly. | Pending QA |
| **AC-09** | Mash keyboard into inputs arbitrarily, then click `Reset` and confirm `MAU` returns specifically to `500`. | Pending QA |
| **AC-10** | Open Chrome DevTools -> Network Panel -> Ensure `"Finish"` load time measures absolutely under `3.0s`. | Pending Deployment |
