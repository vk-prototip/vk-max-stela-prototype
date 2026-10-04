import { useLayoutEffect, useRef } from 'react'
import vkLogo from '../assets/images/vk-flow/logo.png'
import vkBack from '../assets/images/vk-flow/back.png'
import selectedDriveBackground from '../assets/images/vk-flow/selected-drive-background.svg'
import photoSkip from '../assets/images/vk-flow/photo-skip.png'
import q11 from '../assets/images/vk-flow/question-1-option-1.png'
import q12 from '../assets/images/vk-flow/question-1-option-2.png'
import q13 from '../assets/images/vk-flow/question-1-option-3.png'
import q14 from '../assets/images/vk-flow/question-1-option-4.png'
import q21 from '../assets/images/vk-flow/question-2-option-1.png'
import q22 from '../assets/images/vk-flow/question-2-option-2.png'
import q23 from '../assets/images/vk-flow/question-2-option-3.png'
import q24 from '../assets/images/vk-flow/question-2-option-4.png'
import q31 from '../assets/images/vk-flow/question-3-option-1-figma-final.png'
import q32 from '../assets/images/vk-flow/question-3-option-2-figma-final.png'
import q3hero from '../assets/images/vk-flow/question-3-option-hero-figma-final.png'
import q34 from '../assets/images/vk-flow/question-3-option-4-figma-final.png'
import discoveryActivation from '../assets/images/vk-flow/discovery-activation-figma-clean.webp'
import scanBlue from '../assets/images/vk-flow/scan-background-final.webp'
import scanLightContour from '../assets/images/vk-flow/scan-light-contour-scenario.webp'
import scanWhiteParticles from '../assets/images/vk-flow/scan-white-particles-scenario.webp'
import { vkCopy, vkQuestions } from '../content/vkVideo'
import { MetadataBubbles } from './MetadataBubbles'

const cards = [[q11, q12, q13, q14], [q21, q22, q23, q24], [q31, q32, q3hero, q34]]
const thirdQuestionBreakAfter = [['то,'], ['Новое,', 'моих'], ['героем'], ['чем', 'сейчас']]

function cardLabel(questionIndex: number, optionIndex: number, label: string) {
  const capitalized = label[0].toUpperCase() + label.slice(1)
  if (questionIndex !== 2) return capitalized

  return thirdQuestionBreakAfter[optionIndex].reduce(
    (text, word) => text.replace(`${word} `, `${word}\n`),
    capitalized,
  )
}

export function VkFlowLogo() {
  return <img className="vk-flow-logo" src={vkLogo} alt="VK Видео" draggable={false} />
}

// Native Figma 4788:10640 frames. These are visual slots, not metadata values.
const activationTagFrames = [
  { x: 212.792, y: 1103.47, width: 234.932, height: 112.25, fontSize: 44.4159, baseline: 1175.04 },
  { x: 611.091, y: 1101.38, width: 184.232, height: 68.4349, fontSize: 27.0543, baseline: 1143.65 },
  { x: 165.467, y: 1197.95, width: 100.467, height: 52.3141, fontSize: 20.6914, baseline: 1230.26 },
  { x: 480.063, y: 1193.81, width: 306.914, height: 95.7672, fontSize: 37.8579, baseline: 1252.66 },
  { x: 831.418, y: 1212.38, width: 130.611, height: 42.5632, fontSize: 16.8134, baseline: 1238.6 },
  { x: 392.536, y: 1344.15, width: 245.99, height: 113.085, fontSize: 57.0048, baseline: 1418.04 },
  { x: 124.321, y: 1446.69, width: 128.407, height: 65.9871, fontSize: 26.5691, baseline: 1487.34 },
  { x: 579.141, y: 1433.28, width: 329.635, height: 142.503, fontSize: 57.3448, baseline: 1520.76 },
  { x: 301.865, y: 1519.51, width: 100.467, height: 52.3141, fontSize: 20.6914, baseline: 1551.82 },
  { x: 426.988, y: 1571.92, width: 173.588, height: 90.389, fontSize: 35.7508, baseline: 1627.79 },
]

function activationTagSlots(tags: string[]) {
  const slots = activationTagFrames.map((frame, index) => ({ index, width: frame.width }))
    .sort((a, b) => b.width - a.width || a.index - b.index)
  const ranked = tags.map((label, index) => ({ index, length: [...label].length }))
    .sort((a, b) => b.length - a.length || a.index - b.index)
  const assignments = new Map(ranked.map((tag, rank) => [tag.index, slots[rank].index]))
  return tags.map((label, index) => ({ label, slot: assignments.get(index)! }))
}

function ActivationTag({ label, index }: { label: string; index: number }) {
  const frame = activationTagFrames[index]
  const tracking = index >= 5 && index <= 7 ? .01 : 0
  const textRef = useRef<HTMLSpanElement>(null)
  // VK Display hhea 950/-330, UPEM 1000: Auto 1.28em, baseline 0.95em.
  const centerY = frame.baseline - frame.y - frame.fontSize * 0.31

  useLayoutEffect(() => {
    let cancelled = false
    const fit = () => {
      const span = textRef.current
      if (!span || cancelled) return
      const context = document.createElement('canvas').getContext('2d')
      if (!context) return
      const width = frame.width - 20
      const words = label.split(/\s+/)
      let size = frame.fontSize
      let lines = 1
      for (; size > 1; size -= 1) {
        context.font = `700 ${size}px "VK Sans Display"`
        let currentLine = ''
        lines = 1
        for (const word of words) {
          const candidate = currentLine ? `${currentLine} ${word}` : word
          const candidateWidth = context.measureText(candidate).width + Math.max(0, [...candidate].length - 1) * size * tracking
          if (currentLine && candidateWidth > width) {
            lines += 1
            currentLine = word
          } else currentLine = candidate
        }
        if (words.every(word => context.measureText(word).width + Math.max(0, [...word].length - 1) * size * tracking <= width)
          && lines * size * 1.28 <= frame.height - 12) break
      }
      span.style.fontSize = `${size}px`
      span.style.top = `${centerY - lines * size * 0.64}px`
    }
    fit()
    void document.fonts.ready.then(fit)
    return () => { cancelled = true }
  }, [label, frame, centerY, tracking])

  return (
    <div className={`vk-activation-tag${index === 5 ? ' vk-activation-tag--blurred' : ''}`} style={{ left: frame.x, top: frame.y, width: frame.width, height: frame.height }}>
      <span ref={textRef} style={{ fontSize: frame.fontSize, letterSpacing: `${tracking}em`, top: frame.baseline - frame.y - frame.fontSize * 0.95 }}>{label}</span>
    </div>
  )
}

export function VkDiscoveryActivation({ metadata }: { metadata: string[] }) {
  const tags = [...new Set(metadata)].slice(0, activationTagFrames.length)
  return (
    <section className="screen screen--vk-discovery-activation" aria-label="Активация Discovery">
      <img className="vk-activation-frame" src={discoveryActivation} alt="" draggable={false} />
      <h1 className="vk-activation-title">
        {vkCopy.discoveryActivationTitle.replace(' активированы', '\nактивированы').split('\n').map((line, index) => (
          <span key={line} style={{ left: [122.184, 266.91][index], top: index * 83 }}>{line}{index === 0 ? ' ' : ''}</span>
        ))}
      </h1>
      <p className="vk-activation-description">
        {vkCopy.discoveryActivationDescription.replace(' уже', '\nуже').split('\n').map((line, index) => (
          <span key={line} style={{ left: [255.339, 311.779][index], top: index * 39 }}>{line}{index === 0 ? ' ' : ''}</span>
        ))}
      </p>
      <div className="vk-activation-tags" aria-label="Собранные метаданные">
        {activationTagSlots(tags).map(({ label, slot }) => <ActivationTag key={label} label={label} index={slot} />)}
      </div>
    </section>
  )
}

export function VkScanningScreen() {
  return (
    <section className="screen screen--scanning" aria-label="Имитация оцифровки">
      <img className="vk-scanning-frame vk-scanning-frame--blue" src={scanBlue} alt="" draggable={false} />
      <img className="vk-scanning-frame vk-scanning-frame--light-contour" src={scanLightContour} alt="" draggable={false} />
      <img className="vk-scanning-frame vk-scanning-frame--white-particles" src={scanWhiteParticles} alt="" draggable={false} />
    </section>
  )
}

export function VkFlowBack({ onClick }: { onClick: () => void }) {
  return (
    <button className="vk-flow-back" type="button" onClick={onClick} aria-label="Назад">
      <img src={vkBack} alt="" draggable={false} />
    </button>
  )
}

export function VkFlowQuestion({ index, onSelect, onBack }: {
  index: number
  onSelect: (id: string) => void
  onBack: () => void
}) {
  const question = vkQuestions[index]

  return (
    <section className={`screen screen--vk-flow-question${index === 1 ? ' screen--vk-flow-question-2' : ''}${index === 2 ? ' screen--vk-flow-question-3' : ''}`} aria-labelledby="vk-question-title">
      <VkFlowLogo />
      <h1 id="vk-question-title">{index === 2
        ? question.prompt.replace('решили ', 'решили\n').replace('. Что', '.\nЧто')
        : question.prompt}</h1>
      <div className="vk-flow-grid">
        {question.options.map((option, optionIndex) => (
          <button
            className={`vk-flow-card${index === 2 && optionIndex === 2 ? ' vk-flow-card--hero' : ''}`}
            type="button"
            key={option.id}
            style={{ backgroundImage: `url(${cards[index][optionIndex]})` }}
            onClick={() => onSelect(option.id)}
          >
            <span>{cardLabel(index, optionIndex, option.label)}</span>
          </button>
        ))}
      </div>
      <VkFlowBack onClick={onBack} />
    </section>
  )
}

export function VkAnswerReveal({ questionIndex, optionIndex, label, metadata }: {
  questionIndex: number
  optionIndex: number
  label: string
  metadata: string[]
}) {
  // Native 4527:141278 confirms this backdrop for the selected drive answer.
  const background = questionIndex === 1 && optionIndex === 0 ? {
    backgroundImage: `url(${selectedDriveBackground})`,
    backgroundSize: '1080px 1920px', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
  } : undefined
  return (
    <section className={`screen screen--vk-answer-reveal${questionIndex === 1 ? ' screen--vk-answer-reveal-2' : ''}${questionIndex === 2 ? ' screen--vk-answer-reveal-3' : ''}`} style={background} aria-label="Метаданные ответа">
      <VkFlowLogo />
      <div
        className={`vk-flow-card vk-flow-card--selected vk-flow-card--position-${optionIndex + 1}${questionIndex === 2 && optionIndex === 2 ? ' vk-flow-card--hero' : ''}`}
        style={{ backgroundImage: `url(${cards[questionIndex][optionIndex]})` }}
      >
        <span>{cardLabel(questionIndex, optionIndex, label)}</span>
      </div>
      <MetadataBubbles metadata={metadata} origin={`position-${optionIndex + 1}`} />
    </section>
  )
}

export function VkPhotoReveal({ answerId, metadata }: { answerId: 'accept' | 'skip'; metadata: string[] }) {
  return (
    <section className="screen screen--vk-answer-reveal" aria-label="Метаданные ответа">
      <VkFlowLogo />
      {answerId === 'accept' ? (
        <div className="vk-photo-reveal-image vk-photo-reveal-image--accept" role="img" aria-label={vkCopy.digitizeAccept}>
          <span className="vk-photo-accept-face">{vkCopy.digitizeAccept}</span>
        </div>
      ) : (
        <img className="vk-photo-reveal-image vk-photo-reveal-image--skip" src={photoSkip} alt={vkCopy.digitizeSkip} />
      )}
      <MetadataBubbles metadata={metadata} origin={`photo-${answerId}`} />
    </section>
  )
}
