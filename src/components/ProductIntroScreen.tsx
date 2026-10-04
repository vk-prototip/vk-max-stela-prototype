import maxLogo from '../assets/images/max-flow/logo.webp'
import vkLogo from '../assets/images/vk-flow/logo.png'
import type { Product } from '../types/prototype'

// Prototype timing only: the Figma frames do not specify an after-delay action.
export const productIntroDuration = 1200

export function ProductIntroScreen({ product }: { product: Product }) {
  const isMax = product === 'max'
  return (
    <section className={`screen product-intro product-intro--${isMax ? 'max' : 'vk'}`}>
      <img src={isMax ? maxLogo : vkLogo} alt={isMax ? 'MAX' : 'VK Видео'} draggable={false} />
    </section>
  )
}
