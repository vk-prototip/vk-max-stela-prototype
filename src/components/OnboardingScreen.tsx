import { Mic } from 'lucide-react'
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
      <p className="onboarding-welcome">{onboardingCopy.welcome}</p>
      <h1 id="onboarding-title">{onboardingCopy.headline}</h1>
      <p className="onboarding-description">{onboardingDescriptions[product]}</p>
      <div className="onboarding-voice">
        <Mic aria-hidden="true" />
        <p>{onboardingCopy.voice}</p>
      </div>
      <p className="onboarding-touch">{onboardingCopy.touch}</p>
      <button className="primary-button onboarding-start" type="button" onClick={onStart}>
        {onboardingCopy.start}
      </button>
      <BackButton onClick={onBack} />
    </section>
  )
}
