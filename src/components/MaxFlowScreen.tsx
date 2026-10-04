import audienceBusiness from '../assets/images/max-flow/audience-business.webp'
import audiencePersonal from '../assets/images/max-flow/audience-personal.webp'
import audienceBadge from '../assets/images/max-flow/audience-badge.webp'
import goalAccess from '../assets/images/max-flow/goal-access.webp'
import goalConnection from '../assets/images/max-flow/goal-connection.webp'
import goalVisibility from '../assets/images/max-flow/goal-visibility.webp'
import logo from '../assets/images/max-flow/logo.webp'
import start from '../assets/images/max-flow/start.webp'
import thanks from '../assets/images/max-flow/thanks.webp'
import back from '../assets/images/max-flow/back.webp'
import audienceBack from '../assets/images/max-flow/audience-back.webp'
import {
  maxAudienceOptions, maxGoalOptions, maxMissionDescriptions,
  maxMissionLabels, maxPrompts, maxTransitionPrompt, maxBack, maxMissionHeading, maxReturnToStart, maxThanks,
} from '../content/max'
import type { MaxAudience, MaxGoal, MaxMission } from '../types/prototype'
import { MetadataBubbles } from './MetadataBubbles'

export function MaxFlowLogo({ large = false }: { large?: boolean }) {
  return <img className={`max-flow-logo${large ? ' max-flow-logo--large' : ''}`} src={logo} alt="MAX" draggable={false} />
}

export function MaxFlowButton({ variant, children, onClick, audience = false }: {
  variant: 'start' | 'back' | 'thanks'
  children: string
  onClick: () => void
  audience?: boolean
}) {
  const texture = variant === 'back' && audience ? audienceBack : { start, back, thanks }[variant]
  return (
    <button className={`max-flow-button max-flow-button--${variant}`} type="button" onClick={onClick}>
      <img src={texture} alt="" draggable={false} />
      <span>{children}</span>
    </button>
  )
}

type MaxQuestionProps = {
  kind: 'audience'
  onSelect: (id: MaxAudience) => void
  onBack: () => void
} | {
  kind: 'goal'
  onSelect: (id: MaxGoal) => void
  onBack: () => void
}

const textures = {
  business: audienceBusiness, personal: audiencePersonal,
  access: goalAccess, connection: goalConnection, visibility: goalVisibility,
}

export function MaxFlowQuestion(props: MaxQuestionProps) {
  const options = props.kind === 'audience' ? maxAudienceOptions : maxGoalOptions
  return (
    <section className={`screen max-flow-screen max-flow-question max-flow-question--${props.kind}`} aria-labelledby="max-question-title">
      <MaxFlowLogo large={props.kind === 'goal'} />
      <h1 id="max-question-title">{maxPrompts[props.kind]}</h1>
      <div className="max-flow-options">
        {options.map(option => (
          <button className={`max-flow-card max-flow-card--${option.id}`} type="button" key={option.id}
            onClick={() => {
              if (props.kind === 'audience') props.onSelect(option.id as MaxAudience)
              else props.onSelect(option.id as MaxGoal)
            }}
          >
            <img src={textures[option.id]} alt="" draggable={false} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      {props.kind === 'audience' && <img className="max-flow-audience-badge" src={audienceBadge} alt="" aria-hidden="true" />}
      <MaxFlowButton variant="back" audience={props.kind === 'audience'} onClick={props.onBack}>{maxBack}</MaxFlowButton>
    </section>
  )
}

export function MaxFlowResult({ mission, onReset }: { mission: MaxMission; onReset: () => void }) {
  return (
    <section className={`screen max-flow-screen max-flow-result${mission === 'digital-id' ? ' max-flow-result--digital-id' : ''}`} aria-labelledby="max-result-title">
      <MaxFlowLogo large />
      <h1 id="max-result-title"><span className="max-flow-mission-label">{maxMissionHeading}</span><span>«{maxMissionLabels[mission]}»</span></h1>
      <p className="max-flow-description">{mission === 'digital-id'
        ? maxMissionDescriptions[mission].split('\n').map((line, index) => (
          <span className="max-flow-description-line" key={line}>{line}{index < 2 ? '\n' : ''}</span>
        ))
        : maxMissionDescriptions[mission]}</p>
      <p className="max-flow-direction">{maxTransitionPrompt}</p>
      <button className="max-flow-reset" type="button" tabIndex={-1} aria-label={maxReturnToStart} onClick={onReset} />
      <MaxFlowButton variant="thanks" onClick={onReset}>{maxThanks}</MaxFlowButton>
    </section>
  )
}

export function MaxAnswerReveal({ kind, answerId, metadata }: {
  kind: 'audience' | 'goal'
  answerId: MaxAudience | MaxGoal
  metadata: string[]
}) {
  const options = kind === 'audience' ? maxAudienceOptions : maxGoalOptions
  const option = options.find(({ id }) => id === answerId)!
  return (
    <section className={`screen max-flow-screen max-flow-question max-flow-question--${kind} max-flow-answer-reveal`} aria-label="Метаданные ответа MAX">
      <MaxFlowLogo large={kind === 'goal'} />
      <div className={`max-flow-card max-flow-card--${answerId}`}>
        <img src={textures[answerId]} alt="" draggable={false} />
        <span>{option.label}</span>
      </div>
      {answerId === 'personal' && <img className="max-flow-audience-badge" src={audienceBadge} alt="" aria-hidden="true" />}
      <MetadataBubbles metadata={metadata} origin={answerId} variant="max" />
    </section>
  )
}
