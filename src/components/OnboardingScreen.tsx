import { onboardingCopy, onboardingIntroductions } from '../content/onboarding'
import type { Product } from '../types/prototype'
import { MaxFlowButton, MaxFlowLogo } from './MaxFlowScreen'
import vkVideoLogo from '../assets/images/onboarding/vk-video/logo.png'
import vkVideoHighlight from '../assets/images/onboarding/vk-video/highlight.png'
import vkVideoStart from '../assets/images/onboarding/vk-video/start.png'

interface OnboardingScreenProps {
  product: Product
  onStart: () => void
  onBack: () => void
}

export function OnboardingScreen({ product, onStart }: OnboardingScreenProps) {
  const introduction = onboardingIntroductions[product]
  const [maxVoiceBefore, maxVoiceAfter] = onboardingCopy.maxVoice.split('ПОЕХАЛИ')
  const [vkVoiceBefore, vkVoiceAfter] = onboardingCopy.voice.split('«ПОЕХАЛИ»')

  if (product === 'vk-video') {
    return (
      <section className="screen screen--vk-onboarding" aria-labelledby="onboarding-title">
        <img className="vk-onboarding-logo" src={vkVideoLogo} alt="VK Видео" />
        <h1 id="onboarding-title">{introduction.title}</h1>
        <ol className="vk-onboarding-steps">
          {introduction.steps.map((step, index) => (
            <li className="vk-onboarding-step" key={step}>
              {index === 1 && <img className="vk-onboarding-highlight" src={vkVideoHighlight} alt="" />}
              <span className="vk-onboarding-number" aria-hidden="true">{index + 1}</span>
              <span className="vk-onboarding-step-text">{step}</span>
            </li>
          ))}
        </ol>
        <p className="vk-onboarding-voice">{vkVoiceBefore}<strong>«ПОЕХАЛИ»</strong>{vkVoiceAfter}</p>
        <button className="vk-onboarding-start" type="button" aria-label="Начать" onClick={onStart}>
          <img src={vkVideoStart} alt="" />
        </button>
        <p className="vk-onboarding-touch">{onboardingCopy.touch}</p>
      </section>
    )
  }

  return (
    <section className="screen max-flow-screen max-flow-onboarding" aria-label="Онбординг MAX">
      <MaxFlowLogo />
        <ol className="max-flow-steps">
          {introduction.steps.map((step, index) => (
            <li className="max-flow-step" key={step}>
              <span className="max-flow-number" aria-hidden="true">{index + 1}</span>
              <span className="max-flow-step-text">{step}</span>
            </li>
          ))}
        </ol>
      <p className="max-flow-voice">{maxVoiceBefore}<strong>ПОЕХАЛИ</strong>{maxVoiceAfter}</p>
      <MaxFlowButton variant="start" onClick={onStart}>{onboardingCopy.maxStart}</MaxFlowButton>
      <p className="max-flow-touch">{onboardingCopy.touch}</p>
    </section>
  )
}
