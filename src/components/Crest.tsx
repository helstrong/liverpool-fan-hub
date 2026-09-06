// A deliberately generic LFC monogram, used only as a fallback for when the
// data source hasn't supplied the club's badge (sample mode, or a missing
// image). The real crest is a registered mark of Liverpool Football Club and
// isn't reproduced here — when live data is available the API's own badge is
// what renders. See the design note: "the badge is a monogram placeholder".
export default function Crest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="94" height="94" rx="18" fill="#C8102E" stroke="#F6EB61" strokeWidth={5} />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="34"
        fontWeight="700"
        letterSpacing="1"
        fill="#F6EB61"
        fontFamily="Oswald, system-ui, sans-serif"
      >
        LFC
      </text>
    </svg>
  )
}
