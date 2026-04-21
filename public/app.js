// app.js — DOM orchestration layer

const FIELD_CONFIG = {
  dailyMessages:            { min: 0,   max: 10000000, def: 1000  },
  monthlyActiveUsers:       { min: 1,   max: 1000000,  def: 500   },
  avgInputTokens:           { min: 100, max: 10000,    def: 500   },
  avgOutputTokens:          { min: 50,  max: 4000,     def: 300   },
  avgRequestDurationSec:    { min: 0.1, max: 60,       def: 2.0   },
  firestoreStorageGib:      { min: 0,   max: 10000,    def: 1.0   },
  gcsStorageGib:            { min: 0,   max: 100000,   def: 10    },
  gcsEgressGib:             { min: 0,   max: 100000,   def: 5.0   },
  monthlyUploads:           { min: 0,   max: 10000000, def: 1000  },
  monthlyDownloads:         { min: 0,   max: 10000000, def: 5000  },
};

let currentModel = 'flash';

function fmt(n) {
  if (isNaN(n) || n === null || n === undefined) return '$0.00';
  if (n === 0) return '$0.00';
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + n.toFixed(2);
}

function readField(id) {
  const el = document.getElementById(id);
  if (!el) return FIELD_CONFIG[id] ? FIELD_CONFIG[id].def : 0;
  const v = parseFloat(el.value);
  return isNaN(v) ? FIELD_CONFIG[id].def : v;
}

function validateField(id, value) {
  const config = FIELD_CONFIG[id];
  if (!config) return true;
  const errEl  = document.getElementById('err-' + id);
  const inputEl = document.getElementById(id);
  const wrapEl = inputEl ? inputEl.closest('.input-wrap') : null;
  const setErr = function(msg) {
    if (errEl)  errEl.textContent = msg;
    if (wrapEl) wrapEl.classList.toggle('error', msg !== '');
  };
  if (isNaN(value))       { setErr('Enter a valid number'); return false; }
  if (value < config.min) { setErr('Min: ' + config.min);  return false; }
  if (value > config.max) { setErr('Max: ' + config.max.toLocaleString()); return false; }
  setErr('');
  return true;
}

function collectInputs() {
  var inputs = { modelTier: currentModel };
  var keys = Object.keys(FIELD_CONFIG);
  for (var i = 0; i < keys.length; i++) {
    var id = keys[i];
    var v = readField(id);
    validateField(id, v);
    inputs[id] = v;
  }
  inputs.vcpuCount  = 1;
  inputs.memoryGib  = 0.5;
  return inputs;
}

function safe(v) {
  return (isNaN(v) || v === null || v === undefined) ? 0 : v;
}

function updateUI(r) {
  document.getElementById('total-amount').textContent   = fmt(safe(r.total));
  document.getElementById('cost-per-user').textContent  = fmt(safe(r.perUser));
  document.getElementById('cost-per-1k').textContent    = fmt(safe(r.per1kMsgs));
  document.getElementById('cost-gemini').textContent    = fmt(safe(r.gemini));
  document.getElementById('cost-cloudrun').textContent  = fmt(safe(r.cloudRun));
  document.getElementById('cost-firestore').textContent = fmt(safe(r.firestore));
  document.getElementById('cost-storage').textContent   = fmt(safe(r.storage));
  document.getElementById('model-badge').textContent    = currentModel === 'pro' ? 'Pro' : 'Flash';

  var costs = {
    'card-gemini':    safe(r.gemini),
    'card-cloudrun':  safe(r.cloudRun),
    'card-firestore': safe(r.firestore),
    'card-storage':   safe(r.storage),
  };
  var vals = Object.values(costs);
  var maxVal = Math.max.apply(null, vals);
  var cardIds = Object.keys(costs);
  for (var i = 0; i < cardIds.length; i++) {
    var card = document.getElementById(cardIds[i]);
    if (card) card.classList.toggle('highest', costs[cardIds[i]] === maxVal && maxVal > 0);
  }

  var bars = [
    { id: 'bar-gemini',    val: safe(r.gemini) },
    { id: 'bar-cloudrun',  val: safe(r.cloudRun) },
    { id: 'bar-firestore', val: safe(r.firestore) },
    { id: 'bar-storage',   val: safe(r.storage) },
  ];
  var total = safe(r.total);
  for (var j = 0; j < bars.length; j++) {
    var row = document.getElementById(bars[j].id);
    if (!row) continue;
    var pct = total > 0 ? (bars[j].val / total * 100) : 0;
    row.querySelector('.bar-fill').style.width  = pct.toFixed(1) + '%';
    row.querySelector('.bar-value').textContent = fmt(bars[j].val);
  }
}

function recalculate() {
  var inputs  = collectInputs();
  var results = calculateTotalCost(inputs);
  updateUI(results);
}

function attachListeners() {
  var keys = Object.keys(FIELD_CONFIG);
  for (var i = 0; i < keys.length; i++) {
    (function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input',  recalculate);
        el.addEventListener('change', recalculate);
      }
    })(keys[i]);
  }
}

document.getElementById('btn-flash').addEventListener('click', function() {
  currentModel = 'flash';
  document.getElementById('btn-flash').classList.add('active');
  document.getElementById('btn-pro').classList.remove('active');
  recalculate();
});

document.getElementById('btn-pro').addEventListener('click', function() {
  currentModel = 'pro';
  document.getElementById('btn-pro').classList.add('active');
  document.getElementById('btn-flash').classList.remove('active');
  recalculate();
});

document.getElementById('btn-reset').addEventListener('click', function() {
  var keys = Object.keys(FIELD_CONFIG);
  for (var i = 0; i < keys.length; i++) {
    var el = document.getElementById(keys[i]);
    if (el) el.value = FIELD_CONFIG[keys[i]].def;
  }
  document.querySelectorAll('.field-error').forEach(function(el) { el.textContent = ''; });
  document.querySelectorAll('.input-wrap').forEach(function(el) { el.classList.remove('error'); });
  currentModel = 'flash';
  document.getElementById('btn-flash').classList.add('active');
  document.getElementById('btn-pro').classList.remove('active');
  recalculate();
});

attachListeners();
recalculate();
