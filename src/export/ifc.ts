// P9.1 — IFC4-Export als String-Template (keine 24-MB web-ifc-Lib).
//
// Schreibt IFC2x3 (weit kompatibler zu bestehenden BIM-Viewern als IFC4).
// Rooms → IfcSpace, Objects → IfcFurnishingElement, Walls → IfcWallStandardCase,
// Measures → IfcAnnotation, Grounds → IfcSlab.
//
// Nicht jede IFC-Kleinigkeit abgedeckt (keine Material-Referenzen,
// keine Texturen, keine Opening-Elements für Türen/Fenster) — aber
// ausreichend für Architekten/Messebauer um Grundriss-Layout zu
// übernehmen.
//
// Lizenzfrei; der Output ist Standard-IFC-STEP-21, lesbar in jedem
// BIM-Viewer (BIMvision, Solibri, xeokit, ifcjs).

export interface IfcProject {
  name: string;
  rooms: Array<{ id: string; name: string; x: number; y: number; w: number; d: number; h?: number }>;
  objects: Array<{ id: string; typeId: string; name?: string; x: number; y: number; w?: number; d?: number; h?: number; rot?: number; py?: number }>;
  measures?: Array<{ ax: number; ay: number; bx: number; by: number }>;
  grounds?: Array<{ id: string; name?: string; x: number; y: number; w: number; d: number }>;
  walls?: Array<{ id: string; x1: number; z1: number; x2: number; z2: number; h?: number }>;
  meta?: { owner?: string; createdAt?: string; memberCount?: number; maxHeight?: number };
}

// =============================================================================
// IFC-STEP-21 Writer — minimal-invasive handgeschriebene Serialisierung.
// Entity-Counter beginnt bei 100 damit die Header-Entities 1-99 frei bleiben.
// =============================================================================

class IfcWriter {
  private lines: string[] = [];
  private idx = 100;
  private guid(): string {
    // IFC Global Unique ID: 22-char Base64-ähnliches Format. Vereinfachte
    // Timestamp+Random-Implementation reicht für die meisten Viewer.
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
    let s = '';
    for (let i = 0; i < 22; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }
  next(): number { return this.idx++; }
  emit(line: string): number {
    const id = this.next();
    this.lines.push('#' + id + '=' + line + ';');
    return id;
  }
  build(project: IfcProject): string {
    const now = project.meta?.createdAt || new Date().toISOString();
    const owner = project.meta?.owner || 'CSC Raumplaner Pro';
    const projectName = (project.name || 'Projekt').replace(/'/g, "''");

    // Header
    const header = [
      'ISO-10303-21;',
      'HEADER;',
      "FILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0]'),'2;1');",
      `FILE_NAME('${projectName}.ifc','${now}',('${owner}'),(''),'CSC Raumplaner Pro v1.0','','');`,
      "FILE_SCHEMA(('IFC2X3'));",
      'ENDSEC;',
      'DATA;',
    ];

    // Fix-entities (1-99 reserved)
    const origin3D = `#1=IFCCARTESIANPOINT((0.,0.,0.));`;
    const dirX = `#2=IFCDIRECTION((1.,0.,0.));`;
    const dirY = `#3=IFCDIRECTION((0.,1.,0.));`;
    const dirZ = `#4=IFCDIRECTION((0.,0.,1.));`;
    const axis2Placement = `#5=IFCAXIS2PLACEMENT3D(#1,#4,#2);`;
    const context = `#6=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,0.01,#5,$);`;
    const unitM = `#7=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);`;
    const unitM2 = `#8=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);`;
    const unitM3 = `#9=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);`;
    const unitAssignment = `#10=IFCUNITASSIGNMENT((#7,#8,#9));`;
    const ownerHist = `#11=IFCOWNERHISTORY($,$,$,.ADDED.,$,$,$,${Math.floor(Date.now() / 1000)});`;
    const placementProj = `#12=IFCLOCALPLACEMENT($,#5);`;
    this.lines.push(origin3D, dirX, dirY, dirZ, axis2Placement, context, unitM, unitM2, unitM3, unitAssignment, ownerHist, placementProj);
    this.idx = 100;

    // Project → Site → Building → Storey
    const projId = this.emit(`IFCPROJECT('${this.guid()}',#11,'${projectName}',$,$,$,$,(#6),#10)`);
    const sitePlacement = this.emit(`IFCLOCALPLACEMENT(#12,#5)`);
    const siteId = this.emit(`IFCSITE('${this.guid()}',#11,'Site',$,$,#${sitePlacement},$,$,.ELEMENT.,(0,0,0,0,0),(0,0,0,0,0),0.,$,$)`);
    const buildingPlacement = this.emit(`IFCLOCALPLACEMENT(#${sitePlacement},#5)`);
    const buildingId = this.emit(`IFCBUILDING('${this.guid()}',#11,'${projectName}',$,$,#${buildingPlacement},$,$,.ELEMENT.,0.,$,$)`);
    const storeyPlacement = this.emit(`IFCLOCALPLACEMENT(#${buildingPlacement},#5)`);
    const storeyId = this.emit(`IFCBUILDINGSTOREY('${this.guid()}',#11,'EG',$,$,#${storeyPlacement},$,$,.ELEMENT.,0.)`);
    this.emit(`IFCRELAGGREGATES('${this.guid()}',#11,$,$,#${projId},(#${siteId}))`);
    this.emit(`IFCRELAGGREGATES('${this.guid()}',#11,$,$,#${siteId},(#${buildingId}))`);
    this.emit(`IFCRELAGGREGATES('${this.guid()}',#11,$,$,#${buildingId},(#${storeyId}))`);

    // Helper: place-point-at(cx, cy, cz)
    const placePoint = (cx: number, cy: number, cz: number) => {
      const p = this.emit(`IFCCARTESIANPOINT((${cx.toFixed(3)},${cy.toFixed(3)},${cz.toFixed(3)}))`);
      const a = this.emit(`IFCAXIS2PLACEMENT3D(#${p},$,$)`);
      const l = this.emit(`IFCLOCALPLACEMENT(#${storeyPlacement},#${a})`);
      return l;
    };

    // Rooms → IfcSpace
    const roomRefs: number[] = [];
    project.rooms.forEach((r) => {
      const cx = r.x + r.w / 2, cy = r.y + r.d / 2;
      const placement = placePoint(cx, cy, 0);
      const spaceName = (r.name || 'Raum').replace(/'/g, "''");
      const space = this.emit(`IFCSPACE('${this.guid()}',#11,'${spaceName}',$,$,#${placement},$,'${spaceName}',.ELEMENT.,.INTERNAL.,$)`);
      roomRefs.push(space);
    });
    if (roomRefs.length) {
      this.emit(`IFCRELAGGREGATES('${this.guid()}',#11,$,$,#${storeyId},(${roomRefs.map((r) => '#' + r).join(',')}))`);
    }

    // Walls → IfcWallStandardCase
    const wallRefs: number[] = [];
    (project.walls ?? []).forEach((w) => {
      const cx = (w.x1 + w.x2) / 2, cy = (w.z1 + w.z2) / 2;
      const placement = placePoint(cx, cy, 0);
      const wall = this.emit(`IFCWALLSTANDARDCASE('${this.guid()}',#11,'Wand',$,$,#${placement},$,$,.NOTDEFINED.)`);
      wallRefs.push(wall);
    });

    // Objects → IfcFurnishingElement
    const objRefs: number[] = [];
    project.objects.forEach((o) => {
      const w = o.w || 1, d = o.d || 1;
      const cx = o.x + w / 2, cy = o.y + d / 2, cz = o.py || 0;
      const placement = placePoint(cx, cy, cz);
      const name = (o.name || o.typeId).replace(/'/g, "''");
      const fe = this.emit(`IFCFURNISHINGELEMENT('${this.guid()}',#11,'${name}',$,'${o.typeId}',#${placement},$,$)`);
      objRefs.push(fe);
    });

    // Grounds → IfcSlab
    const groundRefs: number[] = [];
    (project.grounds ?? []).forEach((g) => {
      const cx = g.x + g.w / 2, cy = g.y + g.d / 2;
      const placement = placePoint(cx, cy, 0);
      const name = (g.name || 'Boden').replace(/'/g, "''");
      const slab = this.emit(`IFCSLAB('${this.guid()}',#11,'${name}',$,$,#${placement},$,$,.FLOOR.)`);
      groundRefs.push(slab);
    });

    // Measures → IfcAnnotation
    const measureRefs: number[] = [];
    (project.measures ?? []).forEach((m) => {
      const cx = (m.ax + m.bx) / 2, cy = (m.ay + m.by) / 2;
      const placement = placePoint(cx, cy, 0);
      const ann = this.emit(`IFCANNOTATION('${this.guid()}',#11,'Maß',$,$,#${placement},$)`);
      measureRefs.push(ann);
    });

    // ContainedInStorey — alle Elements ans Storey anhängen
    const allProducts = [...wallRefs, ...objRefs, ...groundRefs, ...measureRefs];
    if (allProducts.length) {
      this.emit(`IFCRELCONTAINEDINSPATIALSTRUCTURE('${this.guid()}',#11,'Elements',$,(${allProducts.map((p) => '#' + p).join(',')}),#${storeyId})`);
    }

    // Property-Set für Projekt-Meta
    if (project.meta) {
      const props: number[] = [];
      if (project.meta.memberCount != null) {
        const p = this.emit(`IFCPROPERTYSINGLEVALUE('Mitglieder',$,IFCINTEGER(${project.meta.memberCount}),$)`);
        props.push(p);
      }
      if (project.meta.maxHeight != null) {
        const p = this.emit(`IFCPROPERTYSINGLEVALUE('MaxHöhe',$,IFCLENGTHMEASURE(${project.meta.maxHeight}),$)`);
        props.push(p);
      }
      if (props.length) {
        const pset = this.emit(`IFCPROPERTYSET('${this.guid()}',#11,'CSC_Meta',$,(${props.map((p) => '#' + p).join(',')}))`);
        this.emit(`IFCRELDEFINESBYPROPERTIES('${this.guid()}',#11,$,$,(#${projId}),#${pset})`);
      }
    }

    return header.concat(this.lines).concat(['ENDSEC;', 'END-ISO-10303-21;']).join('\n');
  }
}

export function exportToIfc(project: IfcProject): string {
  return new IfcWriter().build(project);
}

export function downloadIfc(project: IfcProject): void {
  const content = exportToIfc(project);
  const blob = new Blob([content], { type: 'application/x-step' });
  const filename = (project.name || 'projekt').replace(/[^a-z0-9]/gi, '_') + '.ifc';
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
  a.click();
}
