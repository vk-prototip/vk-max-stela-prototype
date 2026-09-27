import vkBackground from '../assets/images/backgrounds/vk-video.webp'
import maxBackground from '../assets/images/backgrounds/max.webp'
import backButton from '../assets/images/controls/back.png'
import maxOption from '../assets/images/controls/max-option.png'
import maxChat from '../assets/images/results/max-chat.png'

export function preloadNextScreenImages() {
  for (const src of [vkBackground, maxBackground, backButton, maxOption, maxChat]) {
    const image = new Image()
    image.fetchPriority = 'low'
    image.src = src
    // Warm both the network cache and decoder without delaying interaction.
    void image.decode().catch(() => undefined)
  }
}
