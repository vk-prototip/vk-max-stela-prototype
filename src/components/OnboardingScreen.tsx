import { onboardingCopy, onboardingDescriptions } from '../content/onboarding'
import type { Product } from '../types/prototype'
import { BackButton } from './BackButton'
import { ProductMark } from './ProductMark'

interface OnboardingScreenProps {
  product: Product
  onStart: () => void
  onBack: () => void
}

export function OnboardingScreen({ product, onStart, onBack }: OnboardingScreenProps) {
  return (
    <section className="screen screen--onboarding" aria-labelledby="onboarding-title">
      <ProductMark product={product} />
      <div className="onboarding-intro">
        <h1 id="onboarding-title">{onboardingCopy.welcome}</h1>
        <p className="onboarding-subtitle">{onboardingCopy.headline}</p>
        <p className={`onboarding-description onboarding-description--${product}`}>
          {onboardingDescriptions[product]}
        </p>
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
