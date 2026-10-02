import { onboardingCopy, onboardingIntroductions } from '../content/onboarding'
import type { Product } from '../types/prototype'
import { BackButton } from './BackButton'
import { ProductMark } from './ProductMark'
import vkVideoLogo from '../assets/images/onboarding/vk-video/logo.png'
import vkVideoHighlight from '../assets/images/onboarding/vk-video/highlight.png'
import vkVideoStart from '../assets/images/onboarding/vk-video/start.png'

interface OnboardingScreenProps {
  product: Product
  onStart: () => void
  onBack: () => void
}

export function OnboardingScreen({ product, onStart, onBack }: OnboardingScreenProps) {
  const introduction = onboardingIntroductions[product]

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
        <p className="vk-onboarding-voice">{onboardingCopy.voice}</p>
        <button className="vk-onboarding-start" type="button" aria-label="Начать" onClick={onStart}>
          <img src={vkVideoStart} alt="" />
        </button>
        <p className="vk-onboarding-touch">{onboardingCopy.touch}</p>
      </section>
    )
  }

  return (
    <section className="screen screen--onboarding" aria-labelledby="onboarding-title">
      <ProductMark product={product} />
      <div className="onboarding-intro">
        <h1 id="onboarding-title">{introduction.title}</h1>
        <ol className="onboarding-steps">
          {introduction.steps.map((step, index) => (
            <li className="onboarding-step" key={step}>
              <span className="onboarding-step__label">Шаг {index + 1}.</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="onboarding-actions">
        <p className="onboarding-voice">{onboardingCopy.voice}</p>
        <p className="onboarding-touch">{onboardingCopy.touch}</p>
        <button className="primary-button onboarding-start" type="button" onClick={onStart}>
          {onboardingCopy.start}
        </button>
      </div>
      <BackButton onClick={onBack} />
    </section>
  )
}
