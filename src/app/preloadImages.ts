import vkBackground from '../assets/images/vk-flow/background.webp'
import vkSelectedDriveBackground from '../assets/images/vk-flow/selected-drive-background.svg'
import vkScanBackground from '../assets/images/vk-flow/scan-background-final.webp'
import vkScanLightContour from '../assets/images/vk-flow/scan-light-contour-scenario.webp'
import vkScanWhiteParticles from '../assets/images/vk-flow/scan-white-particles-scenario.webp'
import vkDiscoveryActivation from '../assets/images/vk-flow/discovery-activation-figma-clean.webp'
import vkMetadataBubble from '../assets/images/vk-flow/metadata-bubble-final-clean.png'
import vkFinalBackground from '../assets/images/vk-flow/final-background-polina.webp'
import vkOnboardingBackground from '../assets/images/onboarding/vk-video/background.webp'
import vkQuestionOption1 from '../assets/images/vk-flow/question-1-option-1.png'
import vkQuestionOption2 from '../assets/images/vk-flow/question-1-option-2.png'
import vkQuestionOption3 from '../assets/images/vk-flow/question-1-option-3.png'
import vkQuestionOption4 from '../assets/images/vk-flow/question-1-option-4.png'
import maxBackground from '../assets/images/max-flow/background.webp'
import maxLogo from '../assets/images/max-flow/logo.webp'
import vkLogo from '../assets/images/vk-flow/logo.png'
import maxThanks from '../assets/images/max-flow/thanks.webp'
import maxStart from '../assets/images/max-flow/start.webp'
import maxBusiness from '../assets/images/max-flow/audience-business.webp'
import maxPersonal from '../assets/images/max-flow/audience-personal.webp'
import maxAccess from '../assets/images/max-flow/goal-access.webp'
import maxConnection from '../assets/images/max-flow/goal-connection.webp'
import maxVisibility from '../assets/images/max-flow/goal-visibility.webp'
import maxFinal from '../assets/images/max-flow/final-background.webp'

export function preloadNextScreenImages() {
  for (const src of [vkSelectedDriveBackground, vkOnboardingBackground, vkBackground, vkQuestionOption1, vkQuestionOption2, vkQuestionOption3, vkQuestionOption4, maxBackground, maxLogo, vkLogo, maxThanks, maxStart, maxBusiness, maxPersonal, maxAccess, maxConnection, maxVisibility, maxFinal, vkMetadataBubble, vkScanBackground, vkScanLightContour, vkScanWhiteParticles, vkDiscoveryActivation, vkFinalBackground]) {
    const image = new Image()
    image.fetchPriority = 'low'
    image.src = src
    // Warm both the network cache and decoder without delaying interaction.
    void image.decode().catch(() => undefined)
  }
}
