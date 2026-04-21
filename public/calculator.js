// calculator.js — Pure cost calculation functions
// Implements Formulas 4.1, 4.2, 4.3, 4.4, 5.0 from SSOT

function calculateGeminiCost(dailyMessages, modelTier, avgInputTokens, avgOutputTokens) {
  var monthlyMessages   = dailyMessages * 30;
  var inputTokensTotal  = monthlyMessages * avgInputTokens;
  var outputTokensTotal = monthlyMessages * avgOutputTokens;
  var priceIn, priceOut;
  if (modelTier === 'pro') {
    priceIn  = GCP_PRICING.GEMINI.PRO_INPUT_PER_1M;
    priceOut = GCP_PRICING.GEMINI.PRO_OUTPUT_PER_1M;
  } else {
    priceIn  = GCP_PRICING.GEMINI.FLASH_INPUT_PER_1M;
    priceOut = GCP_PRICING.GEMINI.FLASH_OUTPUT_PER_1M;
  }
  var costInput  = (inputTokensTotal  / 1000000) * priceIn;
  var costOutput = (outputTokensTotal / 1000000) * priceOut;
  return costInput + costOutput;
}

function calculateCloudRunCost(dailyMessages, avgRequestDurationSec, vcpuCount, memoryGib) {
  var monthlyRequests = dailyMessages * 30;
  var billableRequests = Math.max(0, monthlyRequests - GCP_PRICING.CLOUD_RUN.FREE_TIER_REQUESTS);
  var costRequests     = (billableRequests / 1000000) * GCP_PRICING.CLOUD_RUN.REQUESTS_PER_1M;
  var cpuSecondsTotal  = monthlyRequests * avgRequestDurationSec * vcpuCount;
  var billableCpu      = Math.max(0, cpuSecondsTotal - GCP_PRICING.CLOUD_RUN.FREE_TIER_CPU_SEC);
  var costCpu          = billableCpu * GCP_PRICING.CLOUD_RUN.CPU_PER_VCPU_SEC;
  var memSecondsTotal  = monthlyRequests * avgRequestDurationSec * memoryGib;
  var billableMem      = Math.max(0, memSecondsTotal - GCP_PRICING.CLOUD_RUN.FREE_TIER_MEM_SEC);
  var costMem          = billableMem * GCP_PRICING.CLOUD_RUN.MEMORY_PER_GIB_SEC;
  return costRequests + costCpu + costMem;
}

function calculateFirestoreCost(dailyMessages, readsPerMessage, writesPerMessage, storageGib) {
  var readsPerDay  = dailyMessages * readsPerMessage;
  var writesPerDay = dailyMessages * writesPerMessage;
  var billableReadsDay  = Math.max(0, readsPerDay  - GCP_PRICING.FIRESTORE.FREE_TIER_READS_PER_DAY);
  var billableWritesDay = Math.max(0, writesPerDay - GCP_PRICING.FIRESTORE.FREE_TIER_WRITES_PER_DAY);
  var monthlyReads  = billableReadsDay  * 30;
  var monthlyWrites = billableWritesDay * 30;
  var costReads     = (monthlyReads  / 100000) * GCP_PRICING.FIRESTORE.READS_PER_100K;
  var costWrites    = (monthlyWrites / 100000) * GCP_PRICING.FIRESTORE.WRITES_PER_100K;
  var billableStorage = Math.max(0, storageGib - GCP_PRICING.FIRESTORE.FREE_TIER_STORAGE_GIB);
  var costStorage     = billableStorage * GCP_PRICING.FIRESTORE.STORAGE_PER_GIB;
  return costReads + costWrites + costStorage;
}

function calculateStorageCost(storageGib, egressGib, monthlyUploads, monthlyDownloads) {
  // Fallback to defaults if values are missing or NaN
  var s  = (isNaN(storageGib)      || storageGib      === undefined) ? 10   : storageGib;
  var e  = (isNaN(egressGib)       || egressGib       === undefined) ? 5    : egressGib;
  var up = (isNaN(monthlyUploads)  || monthlyUploads  === undefined) ? 1000 : monthlyUploads;
  var dn = (isNaN(monthlyDownloads)|| monthlyDownloads=== undefined) ? 5000 : monthlyDownloads;

  var billableStorage = Math.max(0, s  - GCP_PRICING.CLOUD_STORAGE.FREE_TIER_STORAGE_GIB);
  var costStorage     = billableStorage * GCP_PRICING.CLOUD_STORAGE.STORAGE_PER_GIB;
  var billableEgress  = Math.max(0, e  - GCP_PRICING.CLOUD_STORAGE.FREE_TIER_EGRESS_GIB);
  var costEgress      = billableEgress  * GCP_PRICING.CLOUD_STORAGE.EGRESS_PER_GIB;
  var billableClassA  = Math.max(0, up - GCP_PRICING.CLOUD_STORAGE.FREE_TIER_CLASS_A_OPS);
  var costClassA      = (billableClassA / 10000) * GCP_PRICING.CLOUD_STORAGE.CLASS_A_PER_10K;
  var billableClassB  = Math.max(0, dn - GCP_PRICING.CLOUD_STORAGE.FREE_TIER_CLASS_B_OPS);
  var costClassB      = (billableClassB / 10000) * GCP_PRICING.CLOUD_STORAGE.CLASS_B_PER_10K;

  return costStorage + costEgress + costClassA + costClassB;
}

function calculateTotalCost(inputs) {
  var gemini = calculateGeminiCost(
    inputs.dailyMessages  || 0,
    inputs.modelTier      || 'flash',
    inputs.avgInputTokens || 500,
    inputs.avgOutputTokens|| 300
  );
  var cloudRun = calculateCloudRunCost(
    inputs.dailyMessages         || 0,
    inputs.avgRequestDurationSec || 2.0,
    inputs.vcpuCount             || 1,
    inputs.memoryGib             || 0.5
  );
  var firestore = calculateFirestoreCost(
    inputs.dailyMessages      || 0,
    2, 1,
    inputs.firestoreStorageGib|| 1
  );
  var storage = calculateStorageCost(
    inputs.gcsStorageGib   ,
    inputs.gcsEgressGib    ,
    inputs.monthlyUploads  ,
    inputs.monthlyDownloads
  );

  // Final NaN guard on each component
  gemini    = isNaN(gemini)    ? 0 : gemini;
  cloudRun  = isNaN(cloudRun)  ? 0 : cloudRun;
  firestore = isNaN(firestore) ? 0 : firestore;
  storage   = isNaN(storage)   ? 0 : storage;

  var total = gemini + cloudRun + firestore + storage;
  var mau   = inputs.monthlyActiveUsers || 1;
  var msgs  = (inputs.dailyMessages || 0) * 30;

  return {
    gemini:    gemini,
    cloudRun:  cloudRun,
    firestore: firestore,
    storage:   storage,
    total:     total,
    perUser:   mau   > 0 ? total / mau         : 0,
    per1kMsgs: msgs  > 0 ? (total / msgs) * 1000 : 0
  };
}
