// constants.js — GCP Pricing Constants (2025 Q1)
// Source: CFO Bot SSOT Specification v1.0, Section 4
// DO NOT modify values without updating the SSOT document.

const GCP_PRICING = {
  GEMINI: {
    FLASH_INPUT_PER_1M:  0.075,
    FLASH_OUTPUT_PER_1M: 0.30,
    PRO_INPUT_PER_1M:    3.50,
    PRO_OUTPUT_PER_1M:   10.50
  },
  CLOUD_RUN: {
    REQUESTS_PER_1M:     0.40,
    CPU_PER_VCPU_SEC:    0.00002400,
    MEMORY_PER_GIB_SEC:  0.00000250,
    FREE_TIER_REQUESTS:  2000000,
    FREE_TIER_CPU_SEC:   180000,
    FREE_TIER_MEM_SEC:   360000
  },
  FIRESTORE: {
    READS_PER_100K:           0.06,
    WRITES_PER_100K:          0.18,
    STORAGE_PER_GIB:          0.18,
    FREE_TIER_READS_PER_DAY:  50000,
    FREE_TIER_WRITES_PER_DAY: 20000,
    FREE_TIER_STORAGE_GIB:    1
  },
  CLOUD_STORAGE: {
    STORAGE_PER_GIB:      0.020,
    EGRESS_PER_GIB:       0.12,
    CLASS_A_PER_10K:      0.05,
    CLASS_B_PER_10K:      0.004,
    FREE_TIER_STORAGE_GIB: 5,
    FREE_TIER_EGRESS_GIB:  1,
    FREE_TIER_CLASS_A_OPS: 5000,
    FREE_TIER_CLASS_B_OPS: 50000
  }
};

// Default input values — Section 6 of SSOT
const DEFAULTS = {
  dailyMessages:         1000,
  monthlyActiveUsers:    500,
  modelTier:             'flash',
  avgInputTokens:        500,
  avgOutputTokens:       300,
  avgRequestDurationSec: 2.0,
  vcpuCount:             1,
  memoryGib:             0.5,
  firestoreStorageGib:   1.0,
  gcsStorageGib:         10,
  gcsEgressGib:          5.0,
  monthlyUploads:        1000,
  monthlyDownloads:      5000
};
