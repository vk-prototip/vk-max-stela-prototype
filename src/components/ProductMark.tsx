import maxLogo from '../assets/images/brands/max.png'
import vkVideoLogo from '../assets/images/brands/vk-video.png'
import type { Product } from '../types/prototype'

interface ProductMarkProps {
  product: Product
}

export function ProductMark({ product }: ProductMarkProps) {
  const isVideo = product === 'vk-video'

  return (
    <div className={`product-mark product-mark--${product}`}>
      <img
        className="product-mark__image"
        src={isVideo ? vkVideoLogo : maxLogo}
        alt={isVideo ? 'VK Видео' : 'MAX'}
      />
    </div>
  )
}
