import { ArrowRight } from 'lucide-react'
import type { Product } from '../types/prototype'
import { BackButton } from './BackButton'
import { ProductMark } from './ProductMark'

interface QuestionOption<T extends string> {
  id: T
  label: string
}

interface QuestionScreenProps<T extends string> {
  product: Product
  prompt: string
  options: Array<QuestionOption<T>>
  onSelect: (id: T) => void
  onBack: () => void
}

export function QuestionScreen<T extends string>({
  product,
  prompt,
  options,
  onSelect,
  onBack,
}: QuestionScreenProps<T>) {
  return (
    <section className="screen screen--question" aria-labelledby="screen-title">
      <ProductMark product={product} />
      <h1 id="screen-title">{prompt}</h1>
      <div className="options">
        {options.map((option) => (
          <button
            className="option-button"
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
          >
            <span>{option.label}</span>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>
      <BackButton onClick={onBack} />
    </section>
  )
}
