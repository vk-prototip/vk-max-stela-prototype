import { onboardingCopy, onboardingIntroductions } from '../content/onboarding'
import type { Product } from '../types/prototype'
import { BackButton } from './BackButton'
import { ProductMark } from './ProductMark'

interface OnboardingScreenProps {
  product: Product
  onStart: () => void
  onBack: () => void
}

export function OnboardingScreen({ product, onStart, onBack }: OnboardingScreenProps) {
  const introduction = onboardingIntroductions[product]
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
