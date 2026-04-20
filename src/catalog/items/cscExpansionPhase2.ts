// P5.2-Phase2 — Zweite Welle CSC-Realismus-Items.
// Ergänzt den Phase-1-Katalog (PR #50) um Items die dort fehlten:
// Trimm-Roboter, Hydro-Flood, Video-Rack, Billardtisch etc.

import type { PrimitiveCatalogItem } from './primitives.js';

export const CSC_ANBAU_EXP_P2: PrimitiveCatalogItem[] = [
  { id: 'csc-trimm-robot',     cat: '🌿 Anbau', icon: '🤖', name: 'Trimm-Roboter',          w: 0.7, d: 0.6, h: 0.95, builder: 'buildTrimmingRobot' },
  { id: 'csc-hydro-flood',     cat: '🌿 Anbau', icon: '💧', name: 'Hydro-Flood-Table',      w: 2.4, d: 1.2, h: 0.85, builder: 'buildHydroFloodTable' },
  { id: 'csc-glue-trap-post',  cat: '🌿 Anbau', icon: '🪤', name: 'Leimfallen-Aufsteller',  w: 0.2, d: 0.2, h: 1.2, builder: 'buildSlipstickBoard' },
];

export const CSC_SEC_EXP_P2: PrimitiveCatalogItem[] = [
  { id: 'csc-video-rack',      cat: '🔐 Sicherheit', icon: '📹', name: 'Video-Recorder-Rack 19"', w: 0.55, d: 0.5, h: 1.1, builder: 'buildVideoRecorderRack' },
  { id: 'csc-security-console',cat: '🔐 Sicherheit', icon: '🛡', name: 'Security-Leitstand',     w: 1.8, d: 0.8, h: 1.0, builder: 'buildSecurityConsole' },
  { id: 'csc-access-card-rd',  cat: '🔐 Sicherheit', icon: '💳', name: 'Zugangs-Karten-Leser',   w: 0.15, d: 0.08, h: 0.18, builder: 'buildAccessCardScanner' },
];

export const CSC_DISP_EXP_P2: PrimitiveCatalogItem[] = [
  { id: 'csc-return-box',      cat: '🏪 Ausgabe', icon: '📥', name: 'Rückgabe-Box (Leergut)', w: 0.5, d: 0.5, h: 1.1, builder: 'buildReturnBox' },
  { id: 'csc-payment-terminal',cat: '🏪 Ausgabe', icon: '💳', name: 'Zahlungs-Terminal',     w: 0.4, d: 0.35, h: 1.3, builder: 'buildPaymentTerminal' },
  { id: 'csc-notice-board',    cat: '🏪 Ausgabe', icon: '📋', name: 'Aushang-Tafel',         w: 1.0, d: 0.05, h: 1.5, builder: 'buildNoticeBoard', imageMapFace: 'front', imageMapAspect: 'cover' },
];

export const CSC_LAG_EXP_P2: PrimitiveCatalogItem[] = [
  { id: 'csc-climate-cabinet', cat: '📦 Lager', icon: '❄', name: 'Klima-Schrank (Glastür)', w: 0.7, d: 0.6, h: 1.9, builder: 'buildClimateCabinet' },
  { id: 'csc-humidity-logger', cat: '📦 Lager', icon: '💧', name: 'Feuchtigkeits-Logger',   w: 0.15, d: 0.05, h: 0.15, builder: 'buildHumidityLogger' },
  { id: 'csc-cold-chamber',    cat: '📦 Lager', icon: '🧊', name: 'Kältekammer (Tür)',      w: 2.0, d: 2.5, h: 2.4, builder: 'buildColdChamber' },
];

export const CSC_SOC_EXP_P2: PrimitiveCatalogItem[] = [
  { id: 'csc-pool-table',      cat: '🛋 Sozial', icon: '🎱', name: 'Billardtisch 2 m',        w: 2.1, d: 1.1, h: 0.8, builder: 'buildPoolTable' },
];

export const CSC_SAN_EXP_P2: PrimitiveCatalogItem[] = [
  { id: 'csc-soap-sensor',     cat: '🚻 Sanitär', icon: '🧼', name: 'Seifenspender Sensor',   w: 0.1, d: 0.1, h: 0.22, builder: 'buildSensorSoapDispenser' },
  { id: 'csc-trash-separation',cat: '🚻 Sanitär', icon: '♻', name: 'Müll-Trennung 4-fach',   w: 1.4, d: 0.4, h: 0.9, builder: 'buildTrashSeparation' },
];

export const CSC_EXPANSION_ITEMS_P2: PrimitiveCatalogItem[] = [
  ...CSC_ANBAU_EXP_P2,
  ...CSC_SEC_EXP_P2,
  ...CSC_DISP_EXP_P2,
  ...CSC_LAG_EXP_P2,
  ...CSC_SOC_EXP_P2,
  ...CSC_SAN_EXP_P2,
];
