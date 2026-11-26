// Illustrations copied from design/mockups/landing.html, one component per habit card.

export function RunIllustration() {
  return (
    <svg className="block size-full" viewBox="0 0 240 180" role="img" aria-label="Illustration of a person running at sunrise"><circle cx="190" cy="48" r="22" fill="#FFC23D"/><rect y="150" width="240" height="30" fill="#F6B79A"/>
    <path d="M26 82h30M14 102h40M34 122h22" stroke="#0F3D2E" strokeOpacity=".22" strokeWidth="5" strokeLinecap="round"/>
    <g strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M108 70 100 108" stroke="#E8583A" strokeWidth="16"/>
    <path d="M108 78 128 92 142 80M108 78 90 90 78 106" stroke="#0F3D2E" strokeWidth="7"/>
    <path d="M100 108 124 124 120 150M100 108 80 128 56 132" stroke="#0F3D2E" strokeWidth="8"/></g><circle cx="113" cy="52" r="13" fill="#8D5A3B"/></svg>
  )
}

export function MealIllustration() {
  return (
    <svg className="block size-full" viewBox="0 0 240 180" role="img" aria-label="Illustration of a colourful healthy salad bowl"><rect y="146" width="240" height="34" fill="#BFE08F"/>
    <circle cx="92" cy="94" r="17" fill="#E8583A"/><ellipse cx="128" cy="84" rx="19" ry="15" fill="#7BB661"/><circle cx="128" cy="86" r="6" fill="#8B5E3C"/>
    <ellipse cx="160" cy="94" rx="21" ry="10" fill="#3FA352" transform="rotate(-14 160 94)"/><circle cx="112" cy="72" r="9" fill="#FFC23D"/>
    <path d="M58 100Q58 150 120 150Q182 150 182 100Z" fill="#fff" stroke="#0F3D2E" strokeWidth="6" strokeLinejoin="round"/><path d="M52 100H188" stroke="#0F3D2E" strokeWidth="6" strokeLinecap="round"/>
    <path d="M208 66V144M200 66v18a8 8 0 0 0 16 0V66" fill="none" stroke="#0F3D2E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 54l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#0F3D2E" opacity=".5"/></svg>
  )
}

export function ReadIllustration() {
  return (
    <svg className="block size-full" viewBox="0 0 240 180" role="img" aria-label="Illustration of a person reading a book under a lamp"><rect y="150" width="240" height="30" fill="#D6BDF2"/>
    <path d="M178 66h16l26 82h-68z" fill="#FFC23D" opacity=".28"/><path d="M200 150V72Q200 50 180 50" fill="none" stroke="#0F3D2E" strokeWidth="5" strokeLinecap="round"/><path d="M170 48h22l-6 18h-10z" fill="#FFC23D" stroke="#0F3D2E" strokeWidth="4" strokeLinejoin="round"/><rect x="188" y="146" width="24" height="6" rx="3" fill="#0F3D2E"/>
    <g strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M92 82 98 122" stroke="#3A7BD5" strokeWidth="17"/><path d="M98 122 138 104 150 148" stroke="#0F3D2E" strokeWidth="8"/></g>
    <circle cx="91" cy="62" r="13" fill="#C68B59"/>
    <path d="M108 72l30 7-4 28-30-7z" fill="#fff" stroke="#0F3D2E" strokeWidth="4" strokeLinejoin="round"/><path d="M122 75.5l-4 28" stroke="#0F3D2E" strokeWidth="3"/>
    <path d="M96 90l14 8" stroke="#0F3D2E" strokeWidth="7" strokeLinecap="round"/></svg>
  )
}

export function StretchIllustration() {
  return (
    <svg className="block size-full" viewBox="0 0 240 180" role="img" aria-label="Illustration of a person stretching cross-legged in front of the sun"><circle cx="120" cy="92" r="56" fill="#fff" opacity=".55"/><rect y="148" width="240" height="32" fill="#A7DEDA"/>
    <path d="M70 130Q96 108 120 120Q144 108 170 130Q144 148 120 140Q96 148 70 130Z" fill="#0F3D2E"/>
    <g strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M120 72V114" stroke="#F2A33A" strokeWidth="18"/><path d="M120 80 96 102 102 118M120 80 144 102 138 118" stroke="#0F3D2E" strokeWidth="7"/></g>
    <circle cx="120" cy="54" r="13" fill="#8D5A3B"/></svg>
  )
}

export function RideIllustration() {
  return (
    <svg className="block size-full" viewBox="0 0 240 180" role="img" aria-label="Illustration of a person cycling"><rect y="152" width="240" height="28" fill="#B4CFF2"/><circle cx="46" cy="40" r="18" fill="#fff" opacity=".8"/><circle cx="64" cy="44" r="14" fill="#fff" opacity=".8"/>
    <g fill="none" stroke="#0F3D2E" strokeLinecap="round" strokeLinejoin="round"><circle cx="70" cy="122" r="29" strokeWidth="6"/><circle cx="170" cy="122" r="29" strokeWidth="6"/>
    <path d="M70 122 104 88 152 86M104 88 118 122 70 122M118 122 152 86 170 122M152 86 158 76h10M96 82h18" strokeWidth="5"/>
    <path d="M106 80 140 54" stroke="#3FA352" strokeWidth="16"/><path d="M138 60 160 76" strokeWidth="7"/><path d="M106 80 130 102 118 122" strokeWidth="8"/></g>
    <circle cx="150" cy="42" r="12" fill="#C68B59"/></svg>
  )
}

export function SleepIllustration() {
  return (
    <svg className="block size-full" viewBox="0 0 240 180" role="img" aria-label="Illustration of a crescent moon and stars for going to bed on time"><defs><mask id="cres"><rect width="240" height="180" fill="#fff"/><circle cx="142" cy="72" r="38" fill="#000"/></mask></defs>
    <circle cx="112" cy="92" r="46" fill="#FFE08A" mask="url(#cres)"/>
    <g fill="#D8F45A"><path d="M184 44l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/><path d="M60 40l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M200 118l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></g>
    <g fontFamily="Unbounded,sans-serif" fontWeight="800" fill="#D8F45A"><text x="150" y="118" fontSize="26">Z</text><text x="174" y="98" fontSize="19">z</text><text x="192" y="82" fontSize="14">z</text></g></svg>
  )
}
