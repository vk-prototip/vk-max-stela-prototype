import vkLogo from '../assets/images/vk-flow/logo.png'
import vkBack from '../assets/images/vk-flow/back.png'
import photoAccept from '../assets/images/vk-flow/photo-accept.png'
import photoSkip from '../assets/images/vk-flow/photo-skip.png'
import q11 from '../assets/images/vk-flow/question-1-option-1.png'
import q12 from '../assets/images/vk-flow/question-1-option-2.png'
import q13 from '../assets/images/vk-flow/question-1-option-3.png'
import q14 from '../assets/images/vk-flow/question-1-option-4.png'
import q21 from '../assets/images/vk-flow/question-2-option-1.png'
import q22 from '../assets/images/vk-flow/question-2-option-2.png'
import q23 from '../assets/images/vk-flow/question-2-option-3.png'
import q24 from '../assets/images/vk-flow/question-2-option-4.png'
import q3 from '../assets/images/vk-flow/question-3-option.png'
import { vkQuestions } from '../content/vkVideo'

const cards = [[q11, q12, q13, q14], [q21, q22, q23, q24], [q3, q3, q3, q3]]

function MetadataBubbles({ metadata, origin }: { metadata: string[]; origin: string }) {
  return (
    <div className={`vk-metadata vk-metadata--${origin}`} aria-live="polite">
      {metadata.map((tag, index) => (
        <span className={`vk-metadata-tag vk-metadata-tag--${index + 1} ${tag.length < 9 ? 'vk-metadata-tag--small' : ''}`} key={`${tag}-${index}`}>
          {tag}
        </span>
      ))}
    </div>
  )
}

export function VkFlowLogo() {
  return <img className="vk-flow-logo" src={vkLogo} alt="VK Видео" draggable={false} />
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
    <section className="screen screen--vk-flow-question" aria-labelledby="vk-question-title">
      <VkFlowLogo />
      <h1 id="vk-question-title">{question.prompt}</h1>
      <div className="vk-flow-grid">
        {question.options.map((option, optionIndex) => (
          <button
            className="vk-flow-card"
            type="button"
            key={option.id}
            style={{ backgroundImage: `url(${cards[index][optionIndex]})` }}
            onClick={() => onSelect(option.id)}
          >
            <span>{option.label[0].toUpperCase() + option.label.slice(1)}</span>
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
  return (
    <section className="screen screen--vk-answer-reveal" aria-label="Метаданные ответа">
      <VkFlowLogo />
      <div
        className={`vk-flow-card vk-flow-card--selected vk-flow-card--position-${optionIndex + 1}`}
        style={{ backgroundImage: `url(${cards[questionIndex][optionIndex]})` }}
      >
        <span>{label[0].toUpperCase() + label.slice(1)}</span>
      </div>
      <MetadataBubbles metadata={metadata} origin={`position-${optionIndex + 1}`} />
    </section>
  )
}

export function VkPhotoReveal({ answerId, metadata }: { answerId: 'accept' | 'skip'; metadata: string[] }) {
  return (
    <section className="screen screen--vk-answer-reveal" aria-label="Метаданные ответа">
      <VkFlowLogo />
      <img
        className={`vk-photo-reveal-image vk-photo-reveal-image--${answerId}`}
        src={answerId === 'accept' ? photoAccept : photoSkip}
        alt={answerId === 'accept' ? 'Да, давайте' : 'Пропустить'}
      />
      <MetadataBubbles metadata={metadata} origin={`photo-${answerId}`} />
    </section>
  )
}
