# Functions Inventory v2
Stand: 2026-04-20 — auto-generiert via `node scripts/audit-functions.mjs`.

## Zusammenfassung

- **onclick-Handler:** 732
- **addEventListener-Bindings:** 84
- **HTML-Top-Level-Functions:** 842
- **TS-Exports:** 297

## onclick-Handler (Top 80 — Kontext zeigt Button-Text)

| Handler | File:Line | Button-Text |
|---|---|---|
| `openM('m-auth')` | index.html:1767 | 🔑 Jetzt einloggen |
| `undo()` | index.html:1791 | ↩ |
| `redo()` | index.html:1793 | ↪ |
| `openTemplates()` | index.html:1797 |  |
| `openKCaNGDashboard()` | index.html:1800 |  |
| `openHelpModal()` | index.html:1803 |  |
| `toggleTBMenu('file')` | index.html:1822 | 📁 Datei |
| `newProj()` | index.html:1824 | 🆕 Neues Projekt |
| `saveProj()` | index.html:1825 | 💾 Speichern |
| `showRight('save')` | index.html:1826 | 📂 Projekte öffnen |
| `dlJSON()` | index.html:1828 | 📥 Export .json |
| `exportFurnitureCSV()` | index.html:1829 | 📊 Möbelliste .csv |
| `exportBudgetCSV()` | index.html:1830 | 💰 Budget .csv |
| `exportGLTF()` | index.html:1831 | 🏗 3D-Modell .gltf |
| `exportDXF()` | index.html:1832 | 📐 Grundriss .dxf |
| `openPrintPreview()` | index.html:1834 | 🖨 Druckvorschau |
| `generateAuthorityPackage()` | index.html:1835 | 📦 Behörden-Paket (.zip) |
| `openM('m-hygiene')` | index.html:1836 | 🧴 Hygiene-Konzept PDF |
| `generateOpeningHoursSign()` | index.html:1837 | ⏰ Öffnungszeiten-Schild |
| `takePresentationScreenshot()` | index.html:1838 | 📸 3D-Screenshot |
| `shareByEmail()` | index.html:1839 | 📧 Per E-Mail teilen |
| `shareWhatsApp()` | index.html:1840 | 📱 WhatsApp |
| `shareTelegram()` | index.html:1841 | ✈️ Telegram |
| `exportToGoogleDrive()` | index.html:1842 | 📂 Google Drive |
| `generateSessionProtocol()` | index.html:1843 | 📋 Sitzungsprotokoll |
| `saveNamedVersion()` | index.html:1844 | 🏷 Version benennen |
| `generateCostReport()` | index.html:1845 | 💰 Kostenvoranschlag PDF |
| `generateEmbedCode()` | index.html:1846 | 🔗 Embed-Code für Website |
| `exportIFC()` | index.html:1847 | 🏗 IFC-Export (CAD) |
| `generateSecurityReport()` | index.html:1848 | 🔐 Sicherheitsbericht PDF |
| `printBarcodeLabel()` | index.html:1849 | 🏷 Inventar-Etiketten drucken |
| `openCSVImport()` | index.html:1850 | 📂 Räume aus CSV |
| `openSetupWizard()` | index.html:1851 | 🌿 Einrichtungs-Assistent |
| `openFloorPlanRecognizer()` | index.html:1852 | 🤖 KI: Grundriss aus Foto |
| `testAIConnection()` | index.html:1854 | 🔌 KI-Verbindung testen |
| `localStorage.removeItem('csc-onboarded')` | index.html:1856 | 🔄 Onboarding zurücksetzen |
| `printToScale()` | index.html:1857 | 📐 Druck 1:50 |
| `startPresentation()` | index.html:1858 | 🎬 Präsentation |
| `exportEvacuationPlan()` | index.html:1859 | 🚨 Flucht- & Rettungsplan |
| `toggleTBMenu('view')` | index.html:1865 | 👁 Ansicht |
| `window.cscFrameScene&&window.cscFrameScene()` | index.html:1868 | 🎯 Ansicht zentrieren |
| `toggleHelperFloor()` | index.html:1869 | 🧭 Hilfsboden ein/aus |
| `toggleCeiling()` | index.html:1870 | ⬜ Decke ein/aus |
| `toggleSliceView()` | index.html:1871 | ✂️ Schnittansicht |
| `toggleAllFloors()` | index.html:1872 | 🏢 Alle Etagen |
| `toggleSunAnimation()` | index.html:1873 | 🌅 Tag/Nacht Animation |
| `toggleGrid2D()` | index.html:1876 | ⬛ Raster ein/aus |
| `toggleDimensions()` | index.html:1877 | 📏 Maßketten |
| `toggleHeatmap()` | index.html:1878 | 🌡 Laufwege-Heatmap |
| `toggleSoundHeatmap()` | index.html:1879 | 🔊 Schallschutz |
| `toggleLightSim()` | index.html:1880 | ☀️ Lichteinfall |
| `toggleRuler()` | index.html:1881 | 📐 Lineal |
| `toggleNoteMode()` | index.html:1882 | 📌 Notizen |
| `openLayoutComparison()` | index.html:1884 | 🔀 Lageplan vergleichen |
| `toggleTheme()` | index.html:1885 | 🌙 Hell/Dunkel wechseln |
| `cycleDimStyle()` | index.html:1887 | 📐 Maßketten-Stil wechseln |
| `toggleRoomStats()` | index.html:1888 | 📊 Raum-Statistik im Plan |
| `openMaterialStudio()` | index.html:1889 | 🎨 Material & Textur Studio |
| `setWeather('none')` | index.html:1892 | ⛅ Kein Wetter |
| `setWeather('rain')` | index.html:1893 | 🌧 Regen |
| `setWeather('snow')` | index.html:1894 | ❄️ Schnee |
| `setWeather('sun')` | index.html:1895 | ☀️ Sonnenstrahlen |
| `autoColorRooms()` | index.html:1896 | 🎨 Räume auto-einfärben |
| `start3DTour()` | index.html:1897 | 🎬 3D-Rundgang starten |
| `openColorHarmony()` | index.html:1898 | 🖌 Farbharmonie |
| `placeSmartLighting()` | index.html:1899 | 💡 Smart Lighting (KI) |
| `setLightTemperature('warm')` | index.html:1902 | 🟡 Warmweiß 2700K |
| `setLightTemperature('neutral')` | index.html:1903 | ⚪ Neutral 4000K |
| `setLightTemperature('cool')` | index.html:1904 | 🔵 Kalt 6500K |
| `toggleKCaNGMonitor()` | index.html:1906 | 🌿 KCanG Live-Monitor |
| `toggleAnnotationMode()` | index.html:1907 | 📌 Annotations-Modus |
| `analyzeSound()` | index.html:1908 | 🔊 Schallschutzplan |
| `toggleTransparency()` | index.html:1909 | 👁 Transparenz-Modus |
| `autoConnectRooms()` | index.html:1910 | 🚪 Türen automatisch setzen |
| `startDiff()` | index.html:1911 | 📊 Diff-Basis setzen |
| `showDiff()` | index.html:1912 | 📊 Diff anzeigen |
| `generateGantt()` | index.html:1913 | 📅 Gantt aus Aufgaben |
| `openDashboard()` | index.html:1915 | 🖥 Dashboard |
| `openChecklistWizard()` | index.html:1916 | 📋 Einrichtungs-Assistent |
| `toggleLayerPanel()` | index.html:1919 | 📚 Ebenen (Layer) |

## TS-Exports pro File

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

- `registerRule` (line 5)
- `listRules` (line 10)
- `evaluateAll` (line 32)
- `evaluateForRoom` (line 39)

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
- `woodMaterial` (line 149)
- `metalMaterial` (line 150)
- `fabricMaterial` (line 151)
- `plasticMaterial` (line 152)
- `glassMaterial` (line 153)
- `concreteMaterial` (line 154)
- `imageMapMaterial` (line 191)
- `disposeImageMapTexture` (line 217)
- `loadGroundMaterial` (line 225)

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

## HTML-Functions (Top 60 Legacy-Block in index.html)

| Function | Line |
|---|---|
| `_loadTelemetryScripts` | 3959 |
| `_showCrashModal` | 4039 |
| `loadSharedFurniture` | 4231 |
| `saveSharedFurniture` | 4248 |
| `deleteSharedFurniture` | 4275 |
| `aiFetch` | 4292 |
| `callAI` | 4319 |
| `aiText` | 4367 |
| `aiJSON` | 4373 |
| `testAIConnection` | 4387 |
| `loadCustom` | 4429 |
| `saveCustom` | 4430 |
| `getCatalog` | 5103 |
| `getArchCatalog` | 5111 |
| `getSecurityCatalog` | 5112 |
| `toggleCatGroup` | 5113 |
| `findItem` | 5125 |
| `m2px` | 5153 |
| `px2m` | 5154 |
| `wx2cx` | 5155 |
| `wy2cy` | 5156 |
| `cx2wx` | 5157 |
| `cy2wy` | 5158 |
| `snapM` | 5159 |
| `resizeCv` | 5161 |
| `draw2D` | 5167 |
| `drawGrid` | 5267 |
| `drawRoom2D` | 5290 |
| `drawGround2D` | 5352 |
| `hitGround` | 5389 |
| `hitGroundResizeHandle` | 5406 |
| `_getImgCached` | 5421 |
| `drawObj2D` | 5432 |
| `drawMeasure` | 5534 |
| `hitObj` | 5555 |
| `hitRoom` | 5565 |
| `hitRoomResizeHandle` | 5573 |
| `startCatalogDrag` | 5839 |
| `placeFromCatalog` | 5849 |
| `quickAddRoom` | 5873 |
| `addRoom` | 5879 |
| `addObject` | 5901 |
| `removeRoom` | 5925 |
| `quickAddGround` | 5933 |
| `addGround` | 5943 |
| `removeGround` | 5960 |
| `selectGround` | 5969 |
| `openGroundMaterialPicker` | 5979 |
| `closeGroundMaterialPicker` | 5999 |
| `openGroundPropPanel` | 6005 |
| `closeGroundPropPanel` | 6051 |
| `syncGroundPropPanel` | 6055 |
| `deleteSelectedGround` | 6065 |
| `setSelection` | 6070 |
| `updateSelBotBar` | 6098 |
| `applySelProps` | 6134 |
| `rotateSel` | 6144 |
| `dupSel` | 6163 |
| `deleteSel` | 6169 |
| `removeFreeWall` | 6177 |

---

**Hinweis:** Dieses Inventory ist ein Rohbild — Legacy-JS in `index.html` hat viele Helper-Functions, die sich über ~21k Lines erstrecken. Migration nach `src/` erfolgt inkrementell (Strangler-Pattern).