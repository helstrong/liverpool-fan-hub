type IconProps = { name: string; className?: string }

const paths: Record<string, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  fixtures: 'M7 3v4M17 3v4M4 8h16M5 6h14v14H5z',
  standings: 'M4 6h16M4 12h16M4 18h16',
  squad: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6',
  club: 'M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6z',
  news: 'M4 5h16v14H4zM8 9h8M8 13h8M8 17h4',
}

export default function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
