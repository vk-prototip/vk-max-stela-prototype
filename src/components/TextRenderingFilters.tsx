export function TextRenderingFilters() {
  return (
    <svg className="text-rendering-filters" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        {/* Matches measured Figma edge coverage without changing the font outlines. */}
        <filter id="figma-text-edges" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncA type="gamma" amplitude="1" exponent="2.2" offset="0" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}
