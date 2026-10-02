import vkBackground from '../assets/images/vk-flow/background.png'
import vkOnboardingBackground from '../assets/images/onboarding/vk-video/background.png'
import vkQuestionOption1 from '../assets/images/vk-flow/question-1-option-1.png'
import vkQuestionOption2 from '../assets/images/vk-flow/question-1-option-2.png'
import vkQuestionOption3 from '../assets/images/vk-flow/question-1-option-3.png'
import vkQuestionOption4 from '../assets/images/vk-flow/question-1-option-4.png'
import maxBackground from '../assets/images/backgrounds/max.webp'
import backButton from '../assets/images/controls/back.png'
import maxOption from '../assets/images/controls/max-option.png'
import maxChat from '../assets/images/results/max-chat.png'

export function preloadNextScreenImages() {
  for (const src of [vkOnboardingBackground, vkBackground, vkQuestionOption1, vkQuestionOption2, vkQuestionOption3, vkQuestionOption4, maxBackground, backButton, maxOption, maxChat]) {
    const image = new Image()
    image.fetchPriority = 'low'
    image.src = src
    // Warm both the network cache and decoder without delaying interaction.
    void image.decode().catch(() => undefined)
  }
}
