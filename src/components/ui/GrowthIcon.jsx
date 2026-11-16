import React from 'react';

/**
 * Animasi pertumbuhan kebiasaan.
 * Tema "plant"     : biji -> tunas -> bibit -> tanaman muda -> pohon -> pohon rimbun berbuah
 * Tema "butterfly" : telur -> ulat kecil -> ulat gemuk -> kepompong -> mau menetas -> kupu-kupu
 * Tahap ditentukan dari streak (hari berturut-turut) sebuah kebiasaan.
 */

export const STAGE_LABELS = {
  plant: ['Biji', 'Tunas', 'Bibit', 'Tanaman muda', 'Pohon', 'Pohon rimbun'],
  butterfly: ['Telur', 'Ulat kecil', 'Ulat gemuk', 'Kepompong', 'Hampir menetas', 'Kupu-kupu'],
};

// streak minimal untuk mencapai tahap 1..5 (hari untuk kebiasaan harian, minggu untuk target mingguan)
const THRESHOLDS = [1, 2, 4, 7, 14];
const THRESHOLDS_WEEKLY = [1, 2, 3, 5, 8];

export const stageFromStreak = (streak, weekly = false) => {
  const list = weekly ? THRESHOLDS_WEEKLY : THRESHOLDS;
  let stage = 0;
  list.forEach((t, i) => {
    if (streak >= t) stage = i + 1;
  });
  return stage;
};

// berapa hari/minggu lagi menuju tahap berikutnya (0 jika sudah mentok)
export const daysToNextStage = (streak, weekly = false) => {
  const list = weekly ? THRESHOLDS_WEEKLY : THRESHOLDS;
  const next = list.find((t) => streak < t);
  return next === undefined ? 0 : next - streak;
};

const LEAF = '#7FB08E';
const LEAF_DARK = '#5C7A67';
const TRUNK = '#9B7E5C';
const SOIL = '#C9B08A';

function Plant({ stage }) {
  return (
    <>
      <ellipse cx="32" cy="57" rx="19" ry="4" fill={SOIL} />
      {stage === 0 && <ellipse cx="32" cy="54" rx="5" ry="3.4" fill="#8A6A45" />}

      {stage === 1 && (
        <g>
          <path d="M32 55 V44" stroke={LEAF_DARK} strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="27" cy="43" rx="5.5" ry="3" fill={LEAF} transform="rotate(-30 27 43)" />
          <ellipse cx="37" cy="43" rx="5.5" ry="3" fill={LEAF} transform="rotate(30 37 43)" />
        </g>
      )}

      {stage === 2 && (
        <g className="sway">
          <path d="M32 55 V32" stroke={LEAF_DARK} strokeWidth="2.8" strokeLinecap="round" />
          <ellipse cx="25" cy="44" rx="7" ry="3.4" fill={LEAF} transform="rotate(-28 25 44)" />
          <ellipse cx="39" cy="40" rx="7" ry="3.4" fill={LEAF} transform="rotate(28 39 40)" />
          <ellipse cx="26" cy="34" rx="6" ry="3" fill="#93C4A0" transform="rotate(-30 26 34)" />
          <ellipse cx="38" cy="31" rx="6" ry="3" fill="#93C4A0" transform="rotate(30 38 31)" />
        </g>
      )}

      {stage === 3 && (
        <g className="sway">
          <rect x="30" y="34" width="4" height="22" rx="2" fill={TRUNK} />
          <circle cx="32" cy="29" r="12" fill={LEAF} />
          <circle cx="27" cy="31" r="7" fill="#93C4A0" />
          <circle cx="38" cy="26" r="6" fill="#6E9A7A" />
        </g>
      )}

      {stage === 4 && (
        <g className="sway">
          <path d="M29 56 L30 34 H34 L35 56Z" fill={TRUNK} />
          <circle cx="32" cy="22" r="13" fill={LEAF} />
          <circle cx="21" cy="31" r="9.5" fill="#6E9A7A" />
          <circle cx="43" cy="31" r="9.5" fill="#6E9A7A" />
          <circle cx="29" cy="20" r="7" fill="#93C4A0" />
        </g>
      )}

      {stage >= 5 && (
        <g className="sway">
          <path d="M28.5 56 L30 32 H34 L35.5 56Z" fill={TRUNK} />
          <path d="M32 44 L24 36 M32 40 L41 33" stroke={TRUNK} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="32" cy="19" r="14" fill={LEAF} />
          <circle cx="19" cy="30" r="10.5" fill="#6E9A7A" />
          <circle cx="45" cy="30" r="10.5" fill="#6E9A7A" />
          <circle cx="27" cy="17" r="8" fill="#93C4A0" />
          <circle cx="40" cy="14" r="5" fill="#93C4A0" />
          {/* buah & bunga */}
          <circle cx="26" cy="26" r="2.6" fill="#C86D51" />
          <circle cx="38" cy="24" r="2.6" fill="#C86D51" />
          <circle cx="19" cy="34" r="2.4" fill="#C86D51" />
          <circle cx="46" cy="34" r="2.4" fill="#C86D51" />
          <circle cx="32" cy="12" r="2.2" fill="#F2B8A2" />
          <circle cx="13" cy="27" r="2" fill="#F2B8A2" />
          <circle cx="52" cy="26" r="2" fill="#F2B8A2" />
        </g>
      )}
    </>
  );
}

const LeafBase = () => (
  <path d="M8 55 Q32 38 56 55 Q32 62 8 55Z" fill={LEAF} stroke={LEAF_DARK} strokeWidth="1" />
);

function WingsLeft() {
  return (
    <>
      <path
        d="M32 35 C20 14 4 20 9 35 C12 42 25 40 32 36Z"
        fill="#E9A77A"
        stroke="#B3694A"
        strokeWidth="1"
      />
      <path
        d="M32 37 C22 38 12 46 18 54 C25 59 32 48 32 39Z"
        fill="#C86D51"
        stroke="#B3694A"
        strokeWidth="1"
      />
      <circle cx="17" cy="30" r="3" fill="#FFF1E6" />
      <circle cx="21" cy="49" r="2" fill="#FFF1E6" />
    </>
  );
}

function ButterflyArt({ stage }) {
  return (
    <>
      {stage === 0 && (
        <g>
          <LeafBase />
          <ellipse cx="32" cy="48" rx="3.6" ry="4.6" fill="#FFF8E7" stroke="#E0D5BD" />
        </g>
      )}

      {stage === 1 && (
        <g>
          <LeafBase />
          {[22, 28, 34].map((x) => (
            <circle key={x} cx={x} cy="49" r="3.4" fill="#9BC47F" stroke="#6E9A7A" />
          ))}
          <circle cx="40" cy="48" r="3.9" fill="#C86D51" />
          <circle cx="41.5" cy="47" r="0.9" fill="#fff" />
        </g>
      )}

      {stage === 2 && (
        <g>
          <LeafBase />
          {[14, 21, 28, 35].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy="48"
              r="5"
              fill={i % 2 ? '#B6D98F' : '#9BC47F'}
              stroke="#6E9A7A"
            />
          ))}
          <circle cx="44" cy="46" r="5.6" fill="#C86D51" />
          <circle cx="46" cy="44.5" r="1.2" fill="#fff" />
          <path d="M44 41 Q43 36 40 35 M47 41 Q49 36 52 36" stroke="#8A6A45" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      )}

      {stage === 3 && (
        <g>
          <path d="M8 12 H56" stroke={TRUNK} strokeWidth="3.4" strokeLinecap="round" />
          <g className="swing">
            <path d="M32 12 V21" stroke="#8A6A45" strokeWidth="1.4" />
            <path
              d="M32 21 C23 29 23 45 32 55 C41 45 41 29 32 21Z"
              fill="#8FBF9A"
              stroke={LEAF_DARK}
              strokeWidth="1.4"
            />
            <path d="M27 33 H37 M26.5 40 H37.5 M28 47 H36" stroke={LEAF_DARK} strokeWidth="1" opacity="0.6" />
          </g>
        </g>
      )}

      {stage === 4 && (
        <g>
          <path d="M8 12 H56" stroke={TRUNK} strokeWidth="3.4" strokeLinecap="round" />
          <g className="swing">
            <path d="M32 12 V21" stroke="#8A6A45" strokeWidth="1.4" />
            <path
              d="M32 21 C23 29 23 45 32 55 C41 45 41 29 32 21Z"
              fill="#A7D2AF"
              stroke={LEAF_DARK}
              strokeWidth="1.4"
            />
            <path d="M32 24 L30 33 L34 38 L31 46" stroke="#5C7A67" strokeWidth="1.2" fill="none" />
            <path d="M34 34 C41 31 43 40 37 45Z" fill="#E9A77A" />
            <path d="M30 38 C24 38 23 45 28 48Z" fill="#C86D51" />
          </g>
        </g>
      )}

      {stage >= 5 && (
        <g className="float">
          <g className="wing">
            <WingsLeft />
          </g>
          <g className="wing">
            <g transform="translate(64 0) scale(-1 1)">
              <WingsLeft />
            </g>
          </g>
          <ellipse cx="32" cy="38" rx="2.6" ry="12" fill="#5A4A3C" />
          <circle cx="32" cy="25" r="3.2" fill="#5A4A3C" />
          <path d="M31 23 Q28 15 24 14 M33 23 Q36 15 40 14" stroke="#5A4A3C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      )}
    </>
  );
}

export default function GrowthIcon({ stage = 0, theme = 'plant', size = 48, className = '' }) {
  const s = Math.max(0, Math.min(5, Math.round(stage)));
  const label = `${STAGE_LABELS[theme]?.[s] ?? ''}`;

  return (
    <svg
      // key berubah saat tahap naik -> animasi "tumbuh" diputar ulang
      key={`${theme}-${s}`}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={`growth-pop shrink-0 ${className}`}
    >
      <title>{label}</title>
      {theme === 'butterfly' ? <ButterflyArt stage={s} /> : <Plant stage={s} />}
    </svg>
  );
}
