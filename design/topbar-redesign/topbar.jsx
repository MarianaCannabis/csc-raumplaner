/* global React */
const { useState } = React;

/* =========================================================================
   Icon set — custom 16px monochromatic line icons (Lucide/Phosphor-flavoured,
   drawn from scratch, 1.75 stroke, square caps, 2px visual rhythm).
   Every icon shares: 16×16, currentColor, stroke-width 1.6, round line-caps.
   ========================================================================= */
const IconBase = ({ children, size = 16, strokeWidth = 1.6 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Icon = {
  Undo:   () => <IconBase><path d="M3 8h7.5a2.5 2.5 0 0 1 0 5H7"/><path d="M6 5 3 8l3 3"/></IconBase>,
  Redo:   () => <IconBase><path d="M13 8H5.5a2.5 2.5 0 0 0 0 5H9"/><path d="M10 5l3 3-3 3"/></IconBase>,
  Save:   () => <IconBase><path d="M3 3h8l2 2v8H3z"/><path d="M5 3v4h6V3"/><path d="M5 13v-4h6v4"/></IconBase>,
  Room:   () => <IconBase><rect x="2.5" y="2.5" width="11" height="11" rx=".5"/><path d="M2.5 9h4.5v4.5"/></IconBase>,
  Event:  () => <IconBase><rect x="2.5" y="3.5" width="11" height="10" rx="1"/><path d="M2.5 6.5h11"/><path d="M5.5 2v3M10.5 2v3"/></IconBase>,
  Leaf:   () => <IconBase><path d="M13 3c0 5.5-3.5 9-10 10 1-6 4.5-10 10-10z"/><path d="M13 3 5 11"/></IconBase>,
  Globe:  () => <IconBase><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11"/><path d="M8 2.5c1.8 2 1.8 9 0 11M8 2.5c-1.8 2-1.8 9 0 11"/></IconBase>,
  View:   () => <IconBase><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="1.75"/></IconBase>,
  File:   () => <IconBase><path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3"/></IconBase>,
  Layers: () => <IconBase><path d="M8 2 2 5l6 3 6-3-6-3z"/><path d="m2 8 6 3 6-3"/><path d="m2 11 6 3 6-3"/></IconBase>,
  Chart:  () => <IconBase><path d="M2.5 13.5V9M6 13.5V5M9.5 13.5v-6M13 13.5V3"/></IconBase>,
  Share:  () => <IconBase><circle cx="4" cy="8" r="1.75"/><circle cx="12" cy="4" r="1.75"/><circle cx="12" cy="12" r="1.75"/><path d="m5.5 7 5-2M5.5 9l5 2"/></IconBase>,
  Clock:  () => <IconBase><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></IconBase>,
  Sun:    () => <IconBase><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.3 3.3l1 1M11.7 11.7l1 1M3.3 12.7l1-1M11.7 4.3l1-1"/></IconBase>,
  Moon:   () => <IconBase><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/></IconBase>,
  Cube:   () => <IconBase><path d="M8 2 2.5 5v6L8 14l5.5-3V5L8 2z"/><path d="M2.5 5 8 8l5.5-3M8 8v6"/></IconBase>,
  Square: () => <IconBase><rect x="2.5" y="2.5" width="11" height="11" rx="1"/></IconBase>,
  Plus:   () => <IconBase><path d="M8 3v10M3 8h10"/></IconBase>,
  Chevron:() => <IconBase><path d="m4 6 4 4 4-4"/></IconBase>,
  More:   () => <IconBase><circle cx="3.5" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="12.5" cy="8" r=".9" fill="currentColor" stroke="none"/></IconBase>,
  Cursor: () => <IconBase><path d="M3 2.5 13 7l-4 1.5L7.5 13z"/></IconBase>,
  Wall:   () => <IconBase><path d="M2.5 5h11v6h-11z"/><path d="M2.5 8h11M6 5v3M10 8v3"/></IconBase>,
  RoomDraw:() => <IconBase><path d="M3 3h10v10H3z" strokeDasharray="1.6 1.4"/><circle cx="3" cy="3" r="1.2" fill="currentColor" stroke="none"/><circle cx="13" cy="13" r="1.2" fill="currentColor" stroke="none"/></IconBase>,
  Area:   () => <IconBase><path d="M2 13 5 7l3 3 6-8"/><path d="M2 13h12"/></IconBase>,
  Ruler:  () => <IconBase><path d="m2 10 4-8 8 4-4 8z"/><path d="m4.5 4.5 1 2M7 3l1.5 2M9.5 1.5l1.5 2"/></IconBase>,
  Move:   () => <IconBase><path d="M8 2v12M2 8h12M6 4l2-2 2 2M6 12l2 2 2-2M4 6 2 8l2 2M12 6l2 2-2 2"/></IconBase>,
  Center: () => <IconBase><circle cx="8" cy="8" r="2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2"/></IconBase>,
  Box:    () => <IconBase><rect x="3" y="3" width="10" height="10" rx="1"/><path d="M6 3v10M3 6h10"/></IconBase>,
  Folder: () => <IconBase><path d="M2 4.5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/></IconBase>,
  Sliders:() => <IconBase><path d="M3 4h10M3 8h10M3 12h10"/><circle cx="6" cy="4" r="1.3" fill="var(--bg-panel)"/><circle cx="10" cy="8" r="1.3" fill="var(--bg-panel)"/><circle cx="5" cy="12" r="1.3" fill="var(--bg-panel)"/></IconBase>,
};

/* ========================================================================= */

const Divider = () => <span className="tb-divider" aria-hidden="true" />;

const Btn = ({ icon: Ico, label, badge, hasChevron, active, kind = "ghost", compact, title }) => (
  <button
    className={`tb-btn tb-btn--${kind} ${active ? "is-active" : ""} ${compact ? "is-compact" : ""}`}
    title={title || label}
    type="button"
  >
    {Ico && <span className="tb-btn__icon"><Ico /></span>}
    {label && <span className="tb-btn__label">{label}</span>}
    {badge && <span className="tb-btn__badge">{badge}</span>}
    {hasChevron && <span className="tb-btn__chev"><Icon.Chevron /></span>}
  </button>
);

const SegGroup = ({ children }) => <div className="tb-seg">{children}</div>;
const Seg = ({ icon: Ico, label, active }) => (
  <button className={`tb-seg__item ${active ? "is-active" : ""}`} type="button">
    {Ico && <span className="tb-btn__icon"><Ico /></span>}
    <span>{label}</span>
  </button>
);

const Group = ({ children, className = "" }) => (
  <div className={`tb-group ${className}`}>{children}</div>
);

/* =========================================================================
   The topbar itself. Two rows:
   Row 1: file-ops | mode switcher | club/lang/preset | dropdowns | theme | 2D/3D | CTA
   Row 2: draw tools | overflow
   ========================================================================= */
function Topbar({ theme = "dark", narrow = false }) {
  return (
    <div className={`tb tb--${theme} ${narrow ? "tb--narrow" : ""}`}>
      {/* ROW 1 */}
      <div className="tb-row">
        {/* Brand */}
        <Group className="tb-brand">
          <div className="tb-logo">
            <div className="tb-logo__mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="1.5" y="1.5" width="15" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M6 9.5c0-2 1.4-3.5 3-3.5s3 1.5 3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="9" cy="11" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="tb-logo__text">
              <span className="tb-logo__name">CSC Studio Pro</span>
              <span className="tb-logo__ver">v2.22</span>
            </div>
          </div>
        </Group>

        <Divider />

        {/* File ops */}
        <Group>
          <Btn icon={Icon.Undo} kind="ghost" compact title="Rückgängig (⌘Z)" />
          <Btn icon={Icon.Redo} kind="ghost" compact title="Wiederholen (⌘⇧Z)" />
        </Group>

        <Divider />

        {/* PRIMARY CTA — dominant */}
        <Group>
          <Btn icon={Icon.Save} label="Speichern" kind="primary" title="Speichern (⌘S)" />
        </Group>

        <Divider />

        {/* Mode switcher — second tier, segmented */}
        <SegGroup>
          <Seg icon={Icon.Room}  label="Raumplanung" active />
          <Seg icon={Icon.Event} label="Veranstaltung" />
        </SegGroup>

        <Divider />

        {/* Context pickers — third tier */}
        <Group>
          <Btn icon={Icon.Leaf}  label="KGarG" hasChevron kind="soft" title="Club auswählen" />
          <Btn icon={Icon.Globe} label="DE"    hasChevron kind="ghost" compact title="Sprache" />
          <Btn icon={Icon.View}  label="Standard" hasChevron kind="ghost" title="Ansicht-Voreinstellung" />
        </Group>

        <div className="tb-spacer" />

        {/* Dropdowns — third tier, compact */}
        <Group className="tb-menus">
          <Btn icon={Icon.File}   label="Datei"   hasChevron kind="ghost" />
          <Btn icon={Icon.Layers} label="Ansicht" hasChevron kind="ghost" />
          <Btn icon={Icon.Chart}  label="Analyse" hasChevron kind="ghost" />
          <Btn icon={Icon.Share}  label="Teilen"  hasChevron kind="ghost" />
          <Btn icon={Icon.Clock}  label="Zeit"    hasChevron kind="ghost" />
        </Group>

        <Divider />

        {/* Theme + dimension toggle */}
        <Group>
          <Btn icon={theme === "dark" ? Icon.Moon : Icon.Sun} kind="ghost" compact title="Design umschalten" />
          <SegGroup>
            <Seg label="2D" active />
            <Seg label="3D" />
          </SegGroup>
        </Group>

        <Divider />

        {/* Secondary CTA */}
        <Group>
          <Btn icon={Icon.Plus} label="Neue Ausgabestelle" kind="accent" />
        </Group>
      </div>

      {/* ROW 2 — draw tools */}
      <div className="tb-row tb-row--sub">
        <Group>
          <Btn icon={Icon.Cursor}   label="Auswählen"    kind="tool" active />
          <Btn icon={Icon.Wall}     label="Wand"         kind="tool" />
          <Btn icon={Icon.RoomDraw} label="Raum"         kind="tool" />
          <Btn icon={Icon.Area}     label="Fläche"       kind="tool" />
          <Btn icon={Icon.Ruler}    label="Maß"          kind="tool" />
        </Group>

        <Divider />

        <Group>
          <Btn icon={Icon.Move}   label="Verschieben" kind="tool" />
          <Btn icon={Icon.Center} label="Zentrieren"  kind="tool" />
        </Group>

        <div className="tb-spacer" />

        {/* Panel tabs + overflow */}
        <Group>
          <Btn icon={Icon.Box}     label="Assets"        kind="tab" />
          <Btn icon={Icon.Folder}  label="Projekte"      kind="tab" />
          <Btn icon={Icon.Sliders} label="Eigenschaften" kind="tab" active />
        </Group>

        <Divider />

        <Group>
          <Btn icon={Icon.More} kind="ghost" compact title="Mehr" />
        </Group>
      </div>
    </div>
  );
}

/* Narrow variant — collapses into a single row w/ overflow menu */
function TopbarNarrow({ theme = "dark" }) {
  return (
    <div className={`tb tb--${theme} tb--narrow-single`}>
      <div className="tb-row">
        <Group className="tb-brand">
          <div className="tb-logo">
            <div className="tb-logo__mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="1.5" y="1.5" width="15" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M6 9.5c0-2 1.4-3.5 3-3.5s3 1.5 3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="9" cy="11" r="1" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </Group>

        <Divider />

        <Group>
          <Btn icon={Icon.Undo} kind="ghost" compact />
          <Btn icon={Icon.Redo} kind="ghost" compact />
        </Group>

        <Divider />

        <Group>
          <Btn icon={Icon.Save} label="Speichern" kind="primary" />
        </Group>

        <Divider />

        <SegGroup>
          <Seg icon={Icon.Room}  label="Raum" active />
          <Seg icon={Icon.Event} label="Event" />
        </SegGroup>

        <div className="tb-spacer" />

        <SegGroup>
          <Seg label="2D" active />
          <Seg label="3D" />
        </SegGroup>

        <Divider />

        <Group>
          <Btn icon={Icon.More} kind="ghost" compact title="Weitere Optionen" />
        </Group>
      </div>
    </div>
  );
}

Object.assign(window, { Topbar, TopbarNarrow, Icon });
