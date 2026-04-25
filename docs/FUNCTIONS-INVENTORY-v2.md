# Functions Inventory v2
Stand: 2026-04-25 — auto-generiert via `node scripts/audit-functions.mjs`.

## Zusammenfassung

- **onclick-Handler:** 726
- **addEventListener-Bindings:** 128
- **HTML-Top-Level-Functions:** 850
- **TS-Exports:** 346

## onclick-Handler (Top 80 — Kontext zeigt Button-Text)

| Handler | File:Line | Button-Text |
|---|---|---|
| `openM('m-auth')` | index.html:58 | 🔑 Jetzt einloggen |
| `undo()` | index.html:90 |  |
| `redo()` | index.html:92 |  |
| `saveProj()` | index.html:97 |  |
| `window.cscSwitchPlanningMode('room')` | index.html:105 |  |
| `window.cscSwitchPlanningMode('event')` | index.html:109 |  |
| `openTemplates()` | index.html:172 |  |
| `openKCaNGDashboard()` | index.html:177 |  |
| `openHelpModal()` | index.html:182 |  |
| `window.setUIMode && window.setUIMode('standard')` | index.html:197 |  |
| `toggleTBMenu('file')` | index.html:211 |  |
| `newProj()` | index.html:217 | 🆕 Neues Projekt |
| `showRight('save')` | index.html:219 | 📂 Projekte öffnen |
| `dlJSON()` | index.html:221 | 📥 Export .json |
| `exportFurnitureCSV()` | index.html:222 | 📊 Möbelliste .csv |
| `exportBudgetCSV()` | index.html:223 | 💰 Budget .csv |
| `exportGLTF()` | index.html:224 | 🏗 3D-Modell .gltf |
| `exportDXF()` | index.html:225 | 📐 Grundriss .dxf |
| `openPrintPreview()` | index.html:227 | 🖨 Druckvorschau |
| `generateAuthorityPackage()` | index.html:228 | 📦 Behörden-Paket (.zip) |
| `openM('m-hygiene')` | index.html:229 | 🧴 Hygiene-Konzept PDF |
| `generateOpeningHoursSign()` | index.html:230 | ⏰ Öffnungszeiten-Schild |
| `takePresentationScreenshot()` | index.html:231 | 📸 3D-Screenshot |
| `shareByEmail()` | index.html:232 | 📧 Per E-Mail teilen |
| `shareWhatsApp()` | index.html:233 | 📱 WhatsApp |
| `shareTelegram()` | index.html:234 | ✈️ Telegram |
| `exportToGoogleDrive()` | index.html:235 | 📂 Google Drive |
| `generateSessionProtocol()` | index.html:236 | 📋 Sitzungsprotokoll |
| `saveNamedVersion()` | index.html:237 | 🏷 Version benennen |
| `generateCostReport()` | index.html:238 | 💰 Kostenvoranschlag PDF |
| `generateEmbedCode()` | index.html:239 | 🔗 Embed-Code für Website |
| `exportIFC()` | index.html:240 | 🏗 IFC-Export (CAD) |
| `generateSecurityReport()` | index.html:241 | 🔐 Sicherheitsbericht PDF |
| `printBarcodeLabel()` | index.html:242 | 🏷 Inventar-Etiketten drucken |
| `openCSVImport()` | index.html:243 | 📂 Räume aus CSV |
| `openSetupWizard()` | index.html:244 | 🌿 Einrichtungs-Assistent |
| `openFloorPlanRecognizer()` | index.html:245 | 🤖 KI: Grundriss aus Foto |
| `testAIConnection()` | index.html:247 | 🔌 KI-Verbindung testen |
| `localStorage.removeItem('csc-onboarded')` | index.html:249 | 🔄 Onboarding zurücksetzen |
| `printToScale()` | index.html:250 | 📐 Druck 1:50 |
| `startPresentation()` | index.html:251 | 🎬 Präsentation |
| `exportEvacuationPlan()` | index.html:252 | 🚨 Flucht- & Rettungsplan |
| `toggleTBMenu('view')` | index.html:258 |  |
| `window.cscFrameScene&&window.cscFrameScene()` | index.html:265 | 🎯 Ansicht zentrieren |
| `toggleHelperFloor()` | index.html:266 | 🧭 Hilfsboden ein/aus |
| `toggleCeiling()` | index.html:267 | ⬜ Decke ein/aus |
| `toggleSliceView()` | index.html:268 | ✂️ Schnittansicht |
| `toggleAllFloors()` | index.html:269 | 🏢 Alle Etagen |
| `toggleSunAnimation()` | index.html:270 | 🌅 Tag/Nacht Animation |
| `toggleGrid2D()` | index.html:273 | ⬛ Raster ein/aus |
| `toggleDimensions()` | index.html:274 | 📏 Maßketten |
| `toggleHeatmap()` | index.html:275 | 🌡 Laufwege-Heatmap |
| `toggleSoundHeatmap()` | index.html:276 | 🔊 Schallschutz |
| `toggleLightSim()` | index.html:277 | ☀️ Lichteinfall |
| `toggleRuler()` | index.html:278 | 📐 Lineal |
| `toggleNoteMode()` | index.html:279 | 📌 Notizen |
| `openLayoutComparison()` | index.html:281 | 🔀 Lageplan vergleichen |
| `toggleTheme()` | index.html:282 | 🌙 Hell/Dunkel wechseln |
| `cycleDimStyle()` | index.html:283 | 📐 Maßketten-Stil wechseln |
| `toggleRoomStats()` | index.html:284 | 📊 Raum-Statistik im Plan |
| `openMaterialStudio()` | index.html:285 | 🎨 Material & Textur Studio |
| `setWeather('none')` | index.html:288 | ⛅ Kein Wetter |
| `setWeather('rain')` | index.html:289 | 🌧 Regen |
| `setWeather('snow')` | index.html:290 | ❄️ Schnee |
| `setWeather('sun')` | index.html:291 | ☀️ Sonnenstrahlen |
| `autoColorRooms()` | index.html:292 | 🎨 Räume auto-einfärben |
| `start3DTour()` | index.html:293 | 🎬 3D-Rundgang starten |
| `openColorHarmony()` | index.html:294 | 🖌 Farbharmonie |
| `placeSmartLighting()` | index.html:295 | 💡 Smart Lighting (KI) |
| `setLightTemperature('warm')` | index.html:298 | 🟡 Warmweiß 2700K |
| `setLightTemperature('neutral')` | index.html:299 | ⚪ Neutral 4000K |
| `setLightTemperature('cool')` | index.html:300 | 🔵 Kalt 6500K |
| `toggleKCaNGMonitor()` | index.html:302 | 🌿 KCanG Live-Monitor |
| `toggleAnnotationMode()` | index.html:303 | 📌 Annotations-Modus |
| `analyzeSound()` | index.html:304 | 🔊 Schallschutzplan |
| `toggleTransparency()` | index.html:305 | 👁 Transparenz-Modus |
| `autoConnectRooms()` | index.html:306 | 🚪 Türen automatisch setzen |
| `startDiff()` | index.html:307 | 📊 Diff-Basis setzen |
| `showDiff()` | index.html:308 | 📊 Diff anzeigen |
| `generateGantt()` | index.html:309 | 📅 Gantt aus Aufgaben |

## TS-Exports pro File

### src/auth/magicLink.ts

- `consumeMagicLinkFromHash` (line 36)

### src/auth/state.ts

- `getAuthState` (line 34)
- `subscribe` (line 42)
- `setToken` (line 55)
- `clearAuth` (line 73)

### src/auth/supabase.ts

- `parseTokenPayload` (line 49)
- `tokenExpired` (line 68)
- `parseAuthRedirectFragment` (line 78)
- `buildRedirectUrl` (line 99)
- `performTokenRefresh` (line 110)
- `postMagicLink` (line 144)
- `postSignOut` (line 173)

### src/catalog/credits.ts

- `renderCreditsHtml` (line 67)

### src/catalog/grounds.ts

- `findGroundMaterial` (line 44)

### src/compliance/budget.ts

- `calcMesseBudget` (line 83)
- `fmtEUR` (line 132)

### src/compliance/escapeAnalysis.ts

- `scheduleAnalysis` (line 55)
- `getLatestAnalysis` (line 65)
- `subscribe` (line 69)

### src/compliance/metrics.ts

- `calcCapacity` (line 42)
- `calcHealthScore` (line 119)
- `calcFireSafety` (line 202)
- `calcAccessibilityScore` (line 291)
- `energyCertificate` (line 382)

### src/compliance/packlist.ts

- `buildPackList` (line 96)

### src/compliance/registry.ts

- `registerRule` (line 6)
- `listRules` (line 11)
- `listActiveRules` (line 17)
- `evaluateAll` (line 40)
- `evaluateForRoom` (line 47)

### src/config/defaults.ts

- `oldestLastVerified` (line 134)
- `latestLastVerified` (line 156)

### src/config/features.ts

- `userTier` (line 29)
- `currentLimits` (line 38)
- `hasFeature` (line 45)
- `checkLimit` (line 60)

### src/export/ifc.ts

- `exportToIfc` (line 178)
- `downloadIfc` (line 182)

### src/geo/overpass.ts

- `geocode` (line 11)
- `fetchPois` (line 46)
- `haversineM` (line 88)

### src/i18n/index.ts

- `t` (line 45)
- `setLang` (line 49)
- `availableLanguages` (line 56)

### src/icons/lucide.ts

- `icon` (line 157)
- `listIcons` (line 171)

### src/input/keyboard.ts

- `registerGlobalShortcuts` (line 70)

### src/legacy/toast.ts

- `toast` (line 16)

### src/modes/planningMode.ts

- `currentMode` (line 25)
- `setMode` (line 34)
- `onModeChange` (line 42)
- `isRuleActive` (line 52)

### src/persist/autosave.ts

- `STORAGE_KEY` (line 13)
- `TS_KEY` (line 14)
- `MAX_AGE_MS` (line 17)
- `writeAutosave` (line 26)
- `readAutosave` (line 41)
- `clearAutosave` (line 64)

### src/persist/cloudProjects.ts

- `findProjectByName` (line 145)
- `saveCloudProject` (line 163)
- `fetchAllCloudProjects` (line 219)
- `loadCloudProject` (line 245)
- `deleteCloudProject` (line 259)

### src/persist/index.ts

- `installBridge` (line 92)

### src/persist/localProjects.ts

- `STORAGE_KEY` (line 12)
- `loadAllSaved` (line 15)
- `listSavedNames` (line 29)
- `saveProject` (line 38)
- `deleteProject` (line 47)
- `getProject` (line 55)
- `countExcluding` (line 64)

### src/persist/offlineQueue.ts

- `registerHandler` (line 60)
- `queueAction` (line 65)
- `getQueueSize` (line 71)
- `listQueue` (line 76)
- `flushQueue` (line 90)
- `clearQueue` (line 130)

### src/persist/versionHistory.ts

- `STORAGE_KEY` (line 15)
- `MAX_VERSIONS` (line 16)
- `listVersions` (line 19)
- `pushVersion` (line 35)
- `removeVersion` (line 56)
- `getVersion` (line 69)

### src/templates/index.ts

- `findTemplate` (line 535)

### src/three/assetLoader.ts

- `loadModel` (line 42)
- `fitToBounds` (line 69)

### src/three/cscBuilders.ts

- `buildSeedlingStation` (line 30)
- `buildCuttingCabinet` (line 45)
- `buildDryingNet` (line 61)
- `buildPackagingStation` (line 79)
- `buildCompostBin` (line 93)
- `buildPhEcMeter` (line 105)
- `buildIrrigationTank` (line 119)
- `buildSaferRoomPanel` (line 134)
- `buildAirlockDoor` (line 149)
- `buildWalkthroughScanner` (line 161)
- `buildBiometricReader` (line 175)
- `buildPanicButton` (line 186)
- `buildAlarmStrobe` (line 197)
- `buildTastingCorner` (line 214)
- `buildConsultationBooth` (line 229)
- `buildOrderTerminal` (line 244)
- `buildMerchDisplay` (line 256)
- `buildGitterbox` (line 282)
- `buildEuroPallet` (line 312)
- `buildVacuumSealer` (line 338)
- `buildLabelPrinter` (line 350)
- `buildBatchTrackingStation` (line 362)
- `buildLoungePouf` (line 383)
- `buildBeanbag` (line 390)
- `buildCommunalTable` (line 398)
- `buildBoulderingWall` (line 410)
- `buildFoosball` (line 427)
- `buildDartboard` (line 450)
- `buildArcadeCabinet` (line 463)
- `buildAccessibleWc` (line 489)
- `buildChangingTable` (line 504)
- `buildUrinalBlock` (line 524)
- `buildTowelDispenser` (line 542)
- `buildTissueDispenser` (line 555)

### src/three/cscBuildersPhase2.ts

- `buildTrimmingRobot` (line 22)
- `buildHydroFloodTable` (line 32)
- `buildSlipstickBoard` (line 45)
- `buildVideoRecorderRack` (line 55)
- `buildSecurityConsole` (line 68)
- `buildReturnBox` (line 85)
- `buildPaymentTerminal` (line 93)
- `buildNoticeBoard` (line 104)
- `buildClimateCabinet` (line 119)
- `buildHumidityLogger` (line 129)
- `buildColdChamber` (line 137)
- `buildPoolTable` (line 152)
- `buildSensorSoapDispenser` (line 175)
- `buildTrashSeparation` (line 185)

### src/three/environment.ts

- `applyRendererDefaults` (line 39)
- `loadEnvironment` (line 49)
- `applyEnvironment` (line 79)
- `fallbackEnvironment` (line 112)
- `createComposer` (line 129)
- `tuneSunShadow` (line 148)

### src/three/eventBuilders.ts

- `buildStageModule` (line 43)
- `buildStageStep` (line 59)
- `buildStageRamp` (line 72)
- `buildStageCorner` (line 85)
- `buildStageSkirt` (line 96)
- `buildStageRailGuard` (line 107)
- `buildCatwalk` (line 123)
- `buildDrape` (line 135)
- `buildRostrumXL` (line 146)
- `buildSideBlind` (line 157)
- `buildRowChair` (line 185)
- `buildConfChair` (line 188)
- `buildArmchairEvent` (line 191)
- `buildFoldingChair` (line 201)
- `buildBarstoolHigh` (line 214)
- `buildBanquetTable` (line 235)
- `buildLoungeTable` (line 244)
- `buildRoundTable6p` (line 247)
- `buildCateringHighTable` (line 257)
- `buildFoldingTable` (line 271)
- `buildBistroTable` (line 274)
- `buildProjectorStand` (line 289)
- `buildProjectionScreenLarge` (line 302)
- `buildMobileLedWall` (line 319)
- `buildVideoPillar` (line 327)
- `buildTouchscreenKiosk` (line 335)
- `buildTranslatorBooth` (line 348)
- `buildFMDesk` (line 358)
- `buildCableRamp` (line 369)
- `buildControlDesk` (line 381)
- `buildTrussSquare` (line 391)
- `buildMovingHead` (line 411)
- `buildParLight` (line 425)
- `buildLedBar` (line 439)
- `buildStrobe` (line 449)
- `buildFogMachine` (line 457)
- `buildConfettiCannon` (line 468)
- `buildBeamer` (line 478)
- `buildFollowSpot` (line 489)
- `buildHazer` (line 505)
- `buildUvBar` (line 513)
- `buildLineArrayElement` (line 528)
- `buildSubwoofer` (line 541)
- `buildFloorMonitor` (line 552)
- `buildMicStand` (line 562)
- `buildMicHandheld` (line 576)
- `buildHeadsetMic` (line 584)
- `buildMixerConsole` (line 596)
- `buildWirelessRack` (line 608)
- `buildSpeakerStand` (line 621)
- `buildActiveColumn` (line 636)
- `buildChafingDish` (line 649)
- `buildCoffeeStation` (line 664)
- `buildJuiceDispenser` (line 675)
- `buildDishTrolley` (line 686)
- `buildTrayCart` (line 703)
- `buildServingCounter` (line 706)
- `buildIceMachine` (line 718)
- `buildBuffetTable` (line 728)
- `buildDessertStand` (line 740)
- `buildPunchBowl` (line 752)
- `buildTallPlant` (line 767)
- `buildPartitionPanel` (line 777)
- `buildArtworkSet` (line 787)
- `buildBalloonBouquet` (line 798)
- `buildFireTorch` (line 812)
- `buildFireBowl` (line 822)
- `buildStringLights` (line 830)
- `buildCenterpiece` (line 843)
- `buildDrapeCurtain` (line 851)
- `buildVaseTall` (line 864)
- `buildPostRope` (line 875)
- `buildMobileGate` (line 885)
- `buildMetalDetector` (line 906)
- `buildTurnstile` (line 916)
- `buildInfoDesk` (line 929)
- `buildSecurityCheckpoint` (line 939)
- `buildQueueDivider` (line 948)
- `buildWelcomeSign` (line 958)
- `buildEntranceArch` (line 969)
- `buildBagScanner` (line 980)
- `buildFlipchart` (line 993)
- `buildPinboard` (line 1011)
- `buildModerationCase` (line 1025)
- `buildBreakoutTable` (line 1034)
- `buildGroupTable4` (line 1037)
- `buildWhiteboardMobile` (line 1040)
- `buildEasel` (line 1057)
- `buildPodiumSpeaker` (line 1073)
- `buildHandoutRack` (line 1084)
- `buildNoteblockPack` (line 1099)
- `buildPavilion` (line 1113)
- `buildTentLarge` (line 1131)
- `buildBeerTableSet` (line 1135)
- `buildPatioHeater` (line 1158)
- `buildRainSail` (line 1170)
- `buildPortableToilet` (line 1184)
- `buildWindscreen` (line 1194)
- `buildGardenUmbrella` (line 1206)
- `buildOutdoorBench` (line 1216)
- `buildGenerator` (line 1234)
- `buildCableDrum` (line 1244)
- `buildHeatLamp` (line 1257)
- `buildFanIndustrial` (line 1269)
- `buildDehumidifier` (line 1289)
- `buildExtensionBox` (line 1299)
- `buildPowerDistro` (line 1311)
- `buildCaseFlight` (line 1322)
- `buildToolbox` (line 1338)
- `buildWalkieCharger` (line 1347)

### src/three/eventBuildersPhase2.ts

- `buildProscenium` (line 34)
- `buildLectern` (line 44)
- `buildIntervalWall` (line 56)
- `buildStageTile` (line 64)
- `buildCinemaChair` (line 78)
- `buildSwivelBarstool` (line 92)
- `buildTribuneRow` (line 104)
- `buildAudienceBench` (line 115)
- `buildMediaServer` (line 128)
- `buildLavalierMic` (line 142)
- `buildPyroCandle` (line 154)
- `buildMirrorBall` (line 164)
- `buildWashLight` (line 172)
- `buildProfileSpot` (line 186)
- `buildLaserProjector` (line 198)
- `buildGlassBar` (line 209)
- `buildBarBackWall` (line 225)
- `buildDishwasherCommercial` (line 248)
- `buildBeverageCooler` (line 259)
- `buildChairCover` (line 275)
- `buildTableLinen` (line 284)
- `buildCenterpieceLux` (line 294)
- `buildCandleStand` (line 304)
- `buildWelcomeBoard` (line 316)
- `buildPeopleCounter` (line 334)
- `buildAccessCardScanner` (line 344)
- `buildBeachLoungerSet` (line 354)
- `buildPavilionSidewall` (line 367)
- `buildTripodSpotlight` (line 379)
- `buildGenericChair` (line 404)
- `buildGenericTable` (line 417)
- `buildGenericCabinet` (line 428)
- `buildGenericLamp` (line 442)
- `buildGenericPlant` (line 454)
- `buildGenericDeco` (line 462)

### src/three/materials.ts

- `matWood` (line 63)
- `matMetal` (line 67)
- `matFabric` (line 71)
- `matPlastic` (line 76)
- `matConcrete` (line 80)
- `matGlassPhys` (line 88)
- `matLED` (line 93)
- `matLeather` (line 99)
- `makeMaterial` (line 133)
- `imageMapMaterial` (line 183)
- `disposeImageMapTexture` (line 209)
- `loadGroundMaterial` (line 217)

### src/three/primitiveBuilders.ts

- `buildOfficeChair` (line 61)
- `buildDesk` (line 90)
- `buildFilingCabinet` (line 104)
- `buildBookshelf` (line 121)
- `buildConferenceTable` (line 147)
- `buildWhiteboard` (line 158)
- `buildReceptionDesk` (line 171)
- `buildDispensingCounter` (line 190)
- `buildConsultingBooth` (line 204)
- `buildWaitingBench` (line 222)
- `buildLockerRow` (line 238)
- `buildGrowTent` (line 262)
- `buildDryingRack` (line 308)
- `buildLedGrowLight` (line 328)
- `buildVentilationFan` (line 337)
- `buildHarvestBin` (line 355)
- `buildStorageCabinet` (line 364)
- `buildSafeBox` (line 386)
- `buildDomeCamera` (line 400)
- `buildBulletCamera` (line 411)
- `buildMotionSensor` (line 424)
- `buildAlarmPanel` (line 433)
- `buildFireExtinguisher` (line 446)
- `buildSmokeDetector` (line 461)
- `buildExitSign` (line 473)
- `buildSofaModule` (line 486)
- `buildCoffeeTable` (line 509)
- `buildKitchenCounter` (line 523)
- `buildFridge` (line 539)
- `buildSink` (line 554)
- `buildStool` (line 565)
- `buildDoorRC2` (line 582)
- `buildDoorT90` (line 597)
- `buildSlidingDoor` (line 608)
- `buildWindowFrame` (line 621)
- `buildPartitionWall` (line 640)
- `buildPottedPlant` (line 654)
- `buildWallArt` (line 677)
- `buildFloorLamp` (line 686)
- `buildBackwall` (line 716)
- `buildRollupBanner` (line 738)
- `buildCounterFront` (line 762)
- `buildLedWall` (line 776)
- `buildFlag` (line 796)

### src/util/imageUpload.ts

- `processUpload` (line 20)
- `estimateImageMapBytes` (line 50)

### src/util/loadingState.ts

- `beginLoading` (line 22)
- `endLoading` (line 32)
- `wrapInSpinner` (line 42)

## HTML-Functions (Top 60 Legacy-Block in index.html)

| Function | Line |
|---|---|
| `_loadTelemetryScripts` | 2342 |
| `_showCrashModal` | 2422 |
| `loadSharedFurniture` | 2619 |
| `saveSharedFurniture` | 2636 |
| `deleteSharedFurniture` | 2663 |
| `aiFetch` | 2680 |
| `callAI` | 2707 |
| `aiText` | 2755 |
| `aiJSON` | 2761 |
| `testAIConnection` | 2775 |
| `loadCustom` | 2817 |
| `saveCustom` | 2818 |
| `getCatalog` | 2828 |
| `getArchCatalog` | 2836 |
| `getSecurityCatalog` | 2837 |
| `toggleCatGroup` | 2838 |
| `findItem` | 2850 |
| `m2px` | 2878 |
| `px2m` | 2879 |
| `wx2cx` | 2880 |
| `wy2cy` | 2881 |
| `cx2wx` | 2882 |
| `cy2wy` | 2883 |
| `snapM` | 2884 |
| `resizeCv` | 2886 |
| `draw2D` | 2892 |
| `drawGrid` | 2992 |
| `drawRoom2D` | 3015 |
| `drawGround2D` | 3077 |
| `hitGround` | 3114 |
| `hitGroundResizeHandle` | 3131 |
| `_getImgCached` | 3146 |
| `drawObj2D` | 3157 |
| `drawMeasure` | 3259 |
| `hitObj` | 3280 |
| `hitRoom` | 3290 |
| `hitRoomResizeHandle` | 3298 |
| `startCatalogDrag` | 3564 |
| `placeFromCatalog` | 3574 |
| `quickAddRoom` | 3598 |
| `addRoom` | 3604 |
| `addObject` | 3626 |
| `removeRoom` | 3650 |
| `quickAddGround` | 3658 |
| `addGround` | 3668 |
| `removeGround` | 3685 |
| `selectGround` | 3694 |
| `openGroundMaterialPicker` | 3704 |
| `closeGroundMaterialPicker` | 3724 |
| `openGroundPropPanel` | 3730 |
| `closeGroundPropPanel` | 3776 |
| `syncGroundPropPanel` | 3780 |
| `deleteSelectedGround` | 3790 |
| `setSelection` | 3795 |
| `updateSelBotBar` | 3823 |
| `applySelProps` | 3859 |
| `rotateSel` | 3869 |
| `dupSel` | 3888 |
| `deleteSel` | 3894 |
| `removeFreeWall` | 3902 |

---

**Hinweis:** Dieses Inventory ist ein Rohbild — Legacy-JS in `index.html` hat viele Helper-Functions, die sich über ~21k Lines erstrecken. Migration nach `src/` erfolgt inkrementell (Strangler-Pattern).