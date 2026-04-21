# CFO Bot Implementation Plan

This document outlines the detailed technical approach for building the CFO Bot, a single-page web application for cloud cost estimation based on the provided SSOT.

## User Review Required

> [!IMPORTANT]
> Please review the chosen technology stack (Vanilla JS) and architecture decisions before implementation proceeds.

## Proposed Changes

---

### 1. Technology Stack Decisions

- **Frontend Framework: Vanilla JavaScript (HTML5/CSS3/JS)**
  - *Rationale*: Section 3 states the architecture should be "minimal to maximise reliability and remain within Firebase free tier limits." Section 8 constraints dictate initial page load must complete within 3 seconds, with no external runtime APIs. A single-page application built with Vanilla JS avoids the heavy bundle size of frameworks like React, requires zero build steps, ensures high performance, and strictly adheres to the minimalist SSOT requirement.
- **Firebase Services: Firebase Hosting only**
  - *Rationale*: Section 3 notes "All pricing calculations MAY be implemented entirely client-side... Firebase Cloud Functions may be used if additional server-side validation or logging is desired, but it is not required." Given no sensitive data is involved and the need to maximise reliability while easily staying within the free tier, using just Hosting is the most efficient and compliant path.

### 2. File & Folder Structure

- **`index.html`**: The main structure file containing the basic two-panel page layout, user inputs, and output sections.
- **`styles.css`**: Contains all visual styling, layout grids, responsive design rules, and visual components like the required progress bar chart.
- **`constants.js`**: Stores all GCP pricing constants and free-tier allowance caps as a static set of rules mapped from Section 4.
- **`calculator.js`**: Contains the pure functions responsible for accurately executing the four service cost formulas.
- **`app.js`**: Handles DOM manipulation, binds input event listeners to the calculation functions, and dynamically updates UI result elements.
- **`firebase.json`**: Describes the settings and mappings required for Firebase Hosting deployment.
- **`.firebaserc`**: Identifies the specific linked Google Cloud/Firebase project alias for CLI deployments.

### 3. Component Breakdown

- **InputPanel**
  - *Inputs*: User keystrokes, numeric inputs, model tier drop-down selection (via `app.js` listeners).
  - *Outputs*: Selected parameter objects defining message volume, tokens, and storage metrics per day/month.
  - *SSOT Requirement Satisfied*: Section 6 (Input Parameters & Assumptions), Section 7.2 (Input Section).

- **ResultCard**
  - *Inputs*: Returned numeric arrays/dollars from the `calculator.js` functions for a specific service.
  - *Outputs*: Renders a visual card containing the service name and the individual monthly output cost, formatted dynamically. Highlighted if highest.
  - *SSOT Requirement Satisfied*: Section 7.3 (Itemised Cost Card for each service).

- **SummaryPanel**
  - *Inputs*: Total sum of all services, daily messages, and monthly active users.
  - *Outputs*: Prominent bold text for total monthly cost, and two derived metrics (cost per user, cost per 1k messages).
  - *SSOT Requirement Satisfied*: Section 7.3 (Total Output / Unit economics view).

- **CostChart**
  - *Inputs*: Array of four calculated monthly costs relative to the overall sum total.
  - *Outputs*: An interactive/static horizontal CSS bar chart visually illustrating the percentage breakdown of the cost.
  - *SSOT Requirement Satisfied*: Section 7.3 (Simple horizontal bar chart showing % breakdown).

### 4. Implementation Sequence

1. **Initialize Workspace & Setup Constants**: Create the basic file structure and define all the constants defined in Section 4. *Why: Freezing constants early eliminates magic numbers and establishes reference values before logic is written.*
2. **Implement Core Formulas (`calculator.js`)**: Code the 4 distinct calculator functions and ensure they correctly utilize the constants with no free-tier bleeding (no negative dollar values). *Why: Isolates core business logic to ensure 100% testability against formulas before wrestling with the DOM.*
3. **Build the Visual Skeleton (`index.html` and `styles.css`)**: Implement the semantic HTML structure (two-panel layout) and CSS. *Why: Ensures UI elements exist in the DOM to attach bindings, and guarantees the Section 7 UI requirements (headers, inputs) are implemented.*
4. **Wire Inputs and Orchestrate Calculations (`app.js`)**: Connect the form fields to DOM listeners. Pipe data into `calculator.js` and extract the values out into variables. Add validation rules (zeroes, negative inputs, boundaries). *Why: Safely connects the UI logic with the business logic without disrupting core calculator function.*
5. **Render Results and Chart**: Update the `ResultCard`, `SummaryPanel`, and `CostChart` with the dynamic values calculated in step 4. Format numbers to exactly 2 decimals. *Why: Delivers the final requested visible UI components after all underlying logic is firmly in place, resolving AC criteria AC-02, AC-06, and AC-07.*

### 5. Pricing Constants Module

```javascript
export const GCP_PRICING = {
  GEMINI: {
    FLASH_INPUT_PER_1M: 0.075,
    FLASH_OUTPUT_PER_1M: 0.30,
    PRO_INPUT_PER_1M: 3.50,
    PRO_OUTPUT_PER_1M: 10.50
  },
  CLOUD_RUN: {
    REQUESTS_PER_1M: 0.40,
    CPU_PER_VCPU_SEC: 0.00002400,
    MEMORY_PER_GIB_SEC: 0.00000250,
    FREE_TIER_REQUESTS: 2000000,
    FREE_TIER_CPU_SEC: 180000,
    FREE_TIER_MEM_SEC: 360000
  },
  FIRESTORE: {
    READS_PER_100K: 0.06,
    WRITES_PER_100K: 0.18,
    DELETES_PER_100K: 0.02,
    STORAGE_PER_GIB: 0.18,
    FREE_TIER_READS_PER_DAY: 50000,
    FREE_TIER_WRITES_PER_DAY: 20000,
    FREE_TIER_DELETES_PER_DAY: 20000,
    FREE_TIER_STORAGE_GIB: 1
  },
  CLOUD_STORAGE: {
    STORAGE_PER_GIB: 0.020,
    EGRESS_PER_GIB: 0.12,
    CLASS_A_PER_10K: 0.05,
    CLASS_B_PER_10K: 0.004,
    FREE_TIER_STORAGE_GIB: 5,
    FREE_TIER_EGRESS_GIB: 1,
    FREE_TIER_CLASS_A_OPS: 5000,
    FREE_TIER_CLASS_B_OPS: 50000
  }
};
```

### 6. Calculation Function Signatures

1. `function calculateGeminiCost(dailyMessages, modelTier, avgInputTokens, avgOutputTokens)`
   - Computes monthly Gemini API cost based on token volume generated by the selected model tier.
2. `function calculateCloudRunCost(dailyMessages, avgRequestDurationSec, vcpuCount, memoryGib)`
   - Calculates monthly Cloud Run server usage costs (requests, vCPU, memory seconds) accounting for generous free tier allowances.
3. `function calculateFirestoreCost(dailyMessages, readsPerMessage, writesPerMessage, storageGib)`
   - Evaluates monthly Cloud Firestore document operation fees and database storage costs after applying free tier discounts.
4. `function calculateStorageCost(storageGib, egressGib, monthlyUploads, monthlyDownloads)`
   - Estimates monthly Cloud Storage expenses derived from raw file storage, data egress traffic, and class-based API operations.

### 7. Firebase Deployment Plan

**Enabled Services**: Firebase Hosting only (Serverless cloud functions are not required based on Vanilla JS state management).

**Deployment Steps**:
1. `npm install -g firebase-tools` (Installs Firebase CLI)
2. `firebase login` (Authenticates with Google Account)
3. `firebase init hosting` (Initializes project, configures public folder setup, sets single-page app behavior to false assuming simple asset serving)
4. `firebase deploy --only hosting` (Deploys static assets to Google CDN via public URL)

### 8. Risk & Mitigation

1. **Risk**: *User inputs values causing JavaScript floating point artifacting, leading to inaccurate dollar sums (e.g. $4.0699).*
   - **Mitigation**: Employ strict bounding and formatting output loops using `.toFixed(2)` on all final UI rendering blocks. Optionally, compute intermediate tier limits using parsed float constants.
2. **Risk**: *Low usage volume values result in negative dollar calculations due to unhandled free-tier subtraction overlapping.*
   - **Mitigation**: Standardize a strict `Math.max(0, measured_usage - free_tier)` barrier throughout all sub-functions in `calculator.js` to mathematically lock bottom bounds to $0.00 for every service.
3. **Risk**: *Performance bloat causes the initial load time to breach the 3.0 second hard requirement defined in Section 8.*
   - **Mitigation**: Rely totally on a minimal Vanilla JS structure, avoiding heavyweight 1MB+ web frameworks like React or Vue, and leveraging Firebase Hosting's globally cached edge network natively.

## Open Questions

- Should we proceed with initializing these files in the destination directory?

## Verification Plan

### Automated Tests
- Since there is no framework running, rely on console spot-checking and rigid unit function evaluation natively inside `calculator.js`.

### Manual Verification
- Launch locally `python3 -m http.server` and verify the page loads under limits.
- Enter bounds checking and manually calculate a test vector to ensure it is accurate within $0.01 margin of error as stated in AC-04.
- Toggle between Pro and Flash dropdown to ensure AC-03 is met seamlessly.
