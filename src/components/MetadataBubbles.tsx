import { useLayoutEffect, useRef, type CSSProperties } from 'react'

const maxTargets = [
  [100, 640, 1.15], [580, 547, 1], [370, 840, .65], [250, 1015, .85],
  [995, 1035, 1.3], [760, 1240, .85], [230, 1280, .9], [550, 1460, 1],
] as const

export function MetadataBubbles({ metadata, origin, variant = 'vk' }: {
  metadata: string[]
  origin: string
  variant?: 'vk' | 'max'
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (variant !== 'max') return
    const elements = Array.from(containerRef.current?.children ?? []) as HTMLSpanElement[]
    let cancelled = false
    const fit = () => {
      if (cancelled) return
      elements.forEach((element, index) => {
        const [targetX, , scale] = maxTargets[index % maxTargets.length]
        // Native CSS width is independent of viewport zoom and animated scale.
        const halfWidth = element.offsetWidth * scale / 2
        const x = Math.max(halfWidth + 24, Math.min(targetX, 1080 - halfWidth - 24))
        element.style.left = `${x}px`
        element.style.setProperty('--target-x', `${x}px`)
      })
    }
    const observer = new ResizeObserver(fit)
    elements.forEach(element => observer.observe(element))
    fit()
    void document.fonts.ready.then(fit)
    return () => { cancelled = true; observer.disconnect() }
  }, [metadata, variant])

  return (
    <div ref={containerRef} className={`vk-metadata vk-metadata--${origin}${variant === 'max' ? ` max-metadata max-metadata--${origin}` : ''}`} aria-live="polite">
      {metadata.map((tag, index) => {
        const [x, y, scale] = maxTargets[index % maxTargets.length]
        const style: CSSProperties | undefined = variant === 'max' ? {
          left: x, top: y,
          '--target-x': `${x}px`, '--target-y': `${y}px`, '--bubble-scale': scale,
          animationDelay: `${.1 + index * .08}s`,
        } as CSSProperties : undefined
        return (
          <span className={`vk-metadata-tag vk-metadata-tag--${index + 1} ${tag.length < 9 ? 'vk-metadata-tag--small' : ''}${variant === 'max' ? ' max-metadata-tag' : ''}`} style={style} key={`${tag}-${index}`}>
            {variant === 'max' ? <span>{tag}</span> : tag}
          </span>
        )
      })}
    </div>
  )
}
