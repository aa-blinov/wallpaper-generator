// Реестр всех доступных стилей. Каждый стиль экспортируется модулем.

import { curlflow } from "./styles/curlflow.js";
import { domainwarp } from "./styles/domainwarp.js";
import { voronoi } from "./styles/voronoi.js";
import { truchet } from "./styles/truchet.js";
import { reactiondiffusion } from "./styles/reactiondiffusion.js";
import { topography } from "./styles/topography.js";
import { spirograph } from "./styles/spirograph.js";
import { logpolar } from "./styles/logpolar.js";
import { stippling } from "./styles/stippling.js";
import { concentric } from "./styles/concentric.js";
import { hexgrid } from "./styles/hexgrid.js";
import { phyllotaxis } from "./styles/phyllotaxis.js";
import { halftone } from "./styles/halftone.js";
import { mandelbrot } from "./styles/mandelbrot.js";
import { caustics } from "./styles/caustics.js";
import { cracked } from "./styles/cracked.js";
import { asemic } from "./styles/asemic.js";
import { lsystem } from "./styles/lsystem.js";
import { maze } from "./styles/maze.js";
import { barcode } from "./styles/barcode.js";
import { billow } from "./styles/billow.js";
import { ridged } from "./styles/ridged.js";
import { brick } from "./styles/brick.js";
import { lissajous } from "./styles/lissajous.js";
import { hilbert } from "./styles/hilbert.js";
import { dragon } from "./styles/dragon.js";
import { sierpinski } from "./styles/sierpinski.js";
import { polarrose } from "./styles/polarrose.js";
import { archimedes } from "./styles/archimedes.js";
import { weave } from "./styles/weave.js";
import { plaid } from "./styles/plaid.js";
import { waves } from "./styles/waves.js";
import { frost } from "./styles/frost.js";
import { nebula } from "./styles/nebula.js";
import { inkblot } from "./styles/inkblot.js";
import { glyphs } from "./styles/glyphs.js";
import { clover } from "./styles/clover.js";
import { porthole } from "./styles/porthole.js";
import { metaballs } from "./styles/metaballs.js";
import { julia } from "./styles/julia.js";
import { newton } from "./styles/newton.js";
import { burning } from "./styles/burning.js";
import { tree } from "./styles/tree.js";
import { fern } from "./styles/fern.js";
import { wire } from "./styles/wire.js";
import { pulse } from "./styles/pulse.js";
import { water } from "./styles/water.js";
import { fire } from "./styles/fire.js";
import { mosaic } from "./styles/mosaic.js";
import { stainedglass } from "./styles/stainedglass.js";
import { wood } from "./styles/wood.js";
import { marble } from "./styles/marble.js";
import { kaleidoscope } from "./styles/kaleidoscope.js";
import { tessellation } from "./styles/tessellation.js";
import { celtic } from "./styles/celtic.js";
import { triangles } from "./styles/triangles.js";
import { scatter } from "./styles/scatter.js";
import { diamonds } from "./styles/diamonds.js";
import { stars } from "./styles/stars.js";
import { cantor } from "./styles/cantor.js";
import { lightning } from "./styles/lightning.js";
import { chains } from "./styles/chains.js";
import { compass } from "./styles/compass.js";
import { spring } from "./styles/spring.js";
import { orbital } from "./styles/orbital.js";
import { sorting } from "./styles/sorting.js";
import { rock } from "./styles/rock.js";
import { circuit } from "./styles/circuit.js";
import { gears } from "./styles/gears.js";
import { shards } from "./styles/shards.js";
import { bubblewrap } from "./styles/bubblewrap.js";
import { hatching } from "./styles/hatching.js";
import { ripples } from "./styles/ripples.js";
import { cloudpuff } from "./styles/cloudpuff.js";
import { sand } from "./styles/sand.js";
import { lorenz } from "./styles/lorenz.js";
import { flowsnake } from "./styles/flowsnake.js";
import { squiggles } from "./styles/squiggles.js";
import { vortex } from "./styles/vortex.js";
import { tentacles } from "./styles/tentacles.js";
import { wave_field } from "./styles/wave_field.js";
import { echo } from "./styles/echo.js";
import { stripes_curved } from "./styles/stripes_curved.js";
import { chainmail } from "./styles/chainmail.js";
import { calligraphy } from "./styles/calligraphy.js";
import { bars } from "./styles/bars.js";
import { netgraph } from "./styles/netgraph.js";
import { spectrum } from "./styles/spectrum.js";
import { honeycomb3d } from "./styles/honeycomb3d.js";
import { azulejo } from "./styles/azulejo.js";
import { neon } from "./styles/neon.js";
import { lava } from "./styles/lava.js";
import { stripesdiag } from "./styles/stripesdiag.js";
import { gradient_mesh } from "./styles/gradient_mesh.js";
import { branches } from "./styles/branches.js";
import { dotgrid } from "./styles/dotgrid.js";
import { pollen } from "./styles/pollen.js";
import { waves_grid } from "./styles/waves_grid.js";
import { flowsnake2 } from "./styles/flowsnake2.js";
import { messyhair } from "./styles/messyhair.js";
import { strings } from "./styles/strings.js";
import { bubbles } from "./styles/bubbles.js";
import { rings3 } from "./styles/rings3.js";
import { runic } from "./styles/runic.js";
import { sandhills } from "./styles/sandhills.js";

export const STYLES = [
  // Поток
  curlflow,
  // Шум
  domainwarp,
  topography,
  logpolar,
  billow,
  ridged,
  nebula,
  gradient_mesh,
  sandhills,
  // Геометрия
  voronoi,
  truchet,
  spirograph,
  concentric,
  hexgrid,
  barcode,
  brick,
  lissajous,
  polarrose,
  archimedes,
  clover,
  tessellation,
  celtic,
  triangles,
  diamonds,
  compass,
  spring,
  gears,
  shards,
  azulejo,
  neon,
  stripes_curved,
  stripesdiag,
  waves_grid,
  rings3,
  strings,
  // Алгоритмы
  reactiondiffusion,
  mandelbrot,
  lsystem,
  maze,
  hilbert,
  dragon,
  sierpinski,
  frost,
  julia,
  newton,
  burning,
  metaballs,
  tree,
  fern,
  wire,
  cantor,
  chains,
  sorting,
  circuit,
  lorenz,
  flowsnake,
  flowsnake2,
  branches,
  netgraph,
  messyhair,
  // Точки
  stippling,
  phyllotaxis,
  glyphs,
  pulse,
  scatter,
  stars,
  orbital,
  dotgrid,
  pollen,
  runic,
  // Текстуры
  halftone,
  cracked,
  weave,
  plaid,
  porthole,
  mosaic,
  stainedglass,
  wood,
  marble,
  rock,
  bubblewrap,
  hatching,
  sand,
  bars,
  spectrum,
  honeycomb3d,
  chainmail,
  // Органические
  caustics,
  asemic,
  inkblot,
  waves,
  water,
  fire,
  kaleidoscope,
  lightning,
  cloudpuff,
  ripples,
  squiggles,
  vortex,
  tentacles,
  wave_field,
  echo,
  lava,
  bubbles,
  calligraphy,
];

export const CATEGORIES = [
  "Flow",
  "Noise",
  "Geometry",
  "Algorithms",
  "Dots",
  "Textures",
  "Organic",
];

export function getStyle(id) {
  return STYLES.find((s) => s.id === id) ?? STYLES[0];
}

export function listStyles() {
  return STYLES.map((s) => ({ id: s.id, name: s.name, blurb: s.blurb, category: s.category }));
}

export function stylesByCategory() {
  const groups = {};
  for (const cat of CATEGORIES) groups[cat] = [];
  for (const s of STYLES) {
    const cat = s.category || "Other";
    (groups[cat] ||= []).push(s);
  }
  return groups;
}
