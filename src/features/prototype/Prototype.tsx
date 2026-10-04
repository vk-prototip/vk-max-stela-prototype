import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  X,
} from 'lucide-react'
import homePointer from '../../assets/images/home/pointer.png'
import firstScreenMax from '../../assets/images/home/first-screen/max.png'
import firstScreenVkVideo from '../../assets/images/home/first-screen/vk-video.png'
import photoSkipImage from '../../assets/images/vk-flow/photo-skip.png'
import cameraIcon from '../../assets/images/vk-flow/camera-icon.png'
import { OnboardingScreen } from '../../components/OnboardingScreen'
import { TextRenderingFilters } from '../../components/TextRenderingFilters'
import { ProductIntroScreen, productIntroDuration } from '../../components/ProductIntroScreen'
import { MaxAnswerReveal, MaxFlowQuestion, MaxFlowResult } from '../../components/MaxFlowScreen'
import { VkAnswerReveal, VkDiscoveryActivation, VkFlowLogo, VkFlowQuestion, VkPhotoReveal, VkScanningScreen } from '../../components/VkFlowScreen'
import {
  maxAudienceOptions,
  getMaxGoalOption,
} from '../../content/max'
import { onboardingCopy } from '../../content/onboarding'
import { discoveryRules, vkCopy, vkPhotoOptions, vkQuestions } from '../../content/vkVideo'
import type {
  MaxAudience,
  MaxGoal,
  MaxMission,
  Product,
  AiCoverAllocation,
  VkTheme,
} from '../../types/prototype'
import { calculateThemeScores, createAiCoverAllocation, getAiCoverDelta, getMaxMission, rankThemes } from './logic'
import { createBrowserEventSink, createEventPublisher } from './events'

type ScreenState =
  | { type: 'home' }
  | { type: 'product-intro'; product: Product }
  | { type: 'max-onboarding' }
  | { type: 'vk-onboarding' }
  | { type: 'max-audience' }
  | { type: 'max-goal'; audience: MaxAudience }
  | { type: 'max-result'; mission: MaxMission }
  | { type: 'max-answer-reveal'; kind: 'audience' | 'goal'; answerId: MaxAudience | MaxGoal; metadata: string[]; next: ScreenState }
  | { type: 'vk-question'; index: number; answers: string[] }
  | { type: 'vk-answer-reveal'; questionIndex: number; optionIndex: number; label: string; metadata: string[]; next: ScreenState }
  | { type: 'vk-photo-reveal'; answerId: 'accept' | 'skip'; metadata: string[]; next: ScreenState }
  | { type: 'vk-digitize'; answers: string[]; rankedThemes: VkTheme[]; coverAllocation: AiCoverAllocation }
  | { type: 'vk-camera'; themes: VkTheme[]; metadata: string[] }
  | { type: 'vk-scanning'; themes: VkTheme[]; metadata: string[] }
  | { type: 'vk-discovery-activation'; themes: VkTheme[]; metadata: string[] }
  | { type: 'vk-final'; themes: VkTheme[] }

const homeState: ScreenState = { type: 'home' }
const canvasWidth = 1080
const canvasHeight = 1920

export function Prototype() {
  const [screen, setScreen] = useState<ScreenState>(homeState)
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsMounted, setTermsMounted] = useState(false)
  const [canvasScale, setCanvasScale] = useState(1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLImageElement>(null)
  const termsTriggerRef = useRef<HTMLButtonElement>(null)
  const termsCloseRef = useRef<HTMLButtonElement>(null)
  const termsCloseTimeoutRef = useRef<number | null>(null)
  const [sink] = useState(createBrowserEventSink)
  const [publisher, setPublisher] = useState(() => createEventPublisher(crypto.randomUUID(), sink))

  useLayoutEffect(() => {
    const fitCanvas = () => {
      const viewport = viewportRef.current
      if (!viewport) return
      const style = window.getComputedStyle(viewport)
      const width = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      const height = viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      setCanvasScale(
        Math.min(
          width / canvasWidth,
          height / canvasHeight,
        ),
      )
    }

    fitCanvas()
    const observer = new ResizeObserver(fitCanvas)
    if (viewportRef.current) observer.observe(viewportRef.current)
    window.addEventListener('resize', fitCanvas)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', fitCanvas)
    }
  }, [])

  useEffect(() => {
    if (screen.type !== 'product-intro') return

    const timeout = window.setTimeout(() => {
      setScreen({ type: screen.product === 'max' ? 'max-onboarding' : 'vk-onboarding' })
    }, productIntroDuration)
    return () => window.clearTimeout(timeout)
  }, [screen])

  useEffect(() => {
    if (screen.type !== 'vk-answer-reveal' && screen.type !== 'vk-photo-reveal' && screen.type !== 'max-answer-reveal') return

    const duration = screen.type === 'vk-photo-reveal' && screen.metadata.length === 0 ? 650 : 2300
    const timeout = window.setTimeout(() => setScreen(screen.next), duration)
    return () => window.clearTimeout(timeout)
  }, [screen])

  useEffect(() => {
    if (screen.type !== 'vk-camera') return

    const timeout = window.setTimeout(() => {
      setScreen({ type: 'vk-scanning', themes: screen.themes, metadata: screen.metadata })
    }, 1800)

    return () => window.clearTimeout(timeout)
  }, [screen])

  useEffect(() => {
    if (screen.type !== 'vk-scanning') return

    const timeout = window.setTimeout(() => {
      setScreen({ type: 'vk-discovery-activation', themes: screen.themes, metadata: screen.metadata })
    }, 2400)

    return () => window.clearTimeout(timeout)
  }, [screen])

  useEffect(() => {
    if (screen.type !== 'vk-discovery-activation') return

    const timeout = window.setTimeout(() => {
      setScreen({ type: 'vk-final', themes: screen.themes })
    }, 3200)

    return () => window.clearTimeout(timeout)
  }, [screen])

  useEffect(() => {
    // Focusing a control in the sliding sheet must not scroll the scaled canvas.
    if (termsOpen) termsCloseRef.current?.focus({ preventScroll: true })
  }, [termsOpen])

  useEffect(() => {
    if (!termsMounted) return
    const frame = window.requestAnimationFrame(() => setTermsOpen(true))
    return () => window.cancelAnimationFrame(frame)
  }, [termsMounted])

  useEffect(() => () => {
    if (termsCloseTimeoutRef.current !== null) window.clearTimeout(termsCloseTimeoutRef.current)
  }, [])

  const closeTerms = () => {
    setTermsOpen(false)
    if (termsCloseTimeoutRef.current !== null) window.clearTimeout(termsCloseTimeoutRef.current)
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220
    termsCloseTimeoutRef.current = window.setTimeout(() => {
      setTermsMounted(false)
      window.requestAnimationFrame(() => termsTriggerRef.current?.focus({ preventScroll: true }))
      termsCloseTimeoutRef.current = null
    }, duration)
  }

  const reset = () => {
    if (termsCloseTimeoutRef.current !== null) window.clearTimeout(termsCloseTimeoutRef.current)
    setTermsOpen(false)
    setTermsMounted(false)
    setPublisher(createEventPublisher(crypto.randomUUID(), sink))
    setScreen(homeState)
  }

  const startProduct = (product: Product) => {
    publisher.start(product)
    setScreen({ type: 'product-intro', product })
  }

  const goBack = () => {
    switch (screen.type) {
      case 'max-onboarding':
      case 'vk-onboarding':
        reset()
        break
      case 'max-audience':
      case 'vk-question':
        if (screen.type === 'vk-question' && screen.index > 0) {
          publisher.clear('vk-video', vkQuestions[screen.index - 1].id)
          setScreen({
            type: 'vk-question',
            index: screen.index - 1,
            answers: screen.answers.slice(0, -1),
          })
        } else {
          setScreen({ type: screen.type === 'max-audience' ? 'max-onboarding' : 'vk-onboarding' })
        }
        break
      case 'max-goal':
        publisher.clear('max', 'audience')
        setScreen({ type: 'max-audience' })
        break
      case 'vk-digitize':
        publisher.clear('vk-video', 'discovery')
        setScreen({
          type: 'vk-question',
          index: 2,
          answers: screen.answers,
        })
        break
      default:
        break
    }
  }

  const selectVkAnswer = (answerId: string) => {
    if (screen.type !== 'vk-question') return

    const question = vkQuestions[screen.index]
    const option = question.options.find(({ id }) => id === answerId)
    if (!option) return

    if (screen.index < 2) {
      const weightedQuestion = screen.index === 0 ? vkQuestions[0] : vkQuestions[1]
      const weightedOption = weightedQuestion.options.find(({ id }) => id === answerId)!
      const themeDelta = { [weightedOption.plusTwo]: 2 }
      themeDelta[weightedOption.plusOne] = (themeDelta[weightedOption.plusOne] ?? 0) + 1
      publisher.answer('vk-video', question.id, weightedOption, themeDelta, getAiCoverDelta(question.id, answerId))
      setScreen({
        type: 'vk-answer-reveal',
        questionIndex: screen.index,
        optionIndex: question.options.findIndex(({ id }) => id === answerId),
        label: option.label,
        metadata: option.metadata,
        next: { type: 'vk-question', index: screen.index + 1, answers: [...screen.answers, answerId] },
      })
      return
    }

    publisher.answer('vk-video', question.id, option)
    const rankedThemes = rankThemes(screen.answers)
    // The scenario selects three themes; Discovery applies the third answer separately.
    const themes = rankedThemes.slice(0, 3)
    const coverAllocation = createAiCoverAllocation(screen.answers, themes)
    if (answerId === 'hero') {
      setScreen({
        type: 'vk-answer-reveal', questionIndex: screen.index,
        optionIndex: question.options.findIndex(({ id }) => id === answerId), label: option.label, metadata: option.metadata,
        next: { type: 'vk-digitize', answers: screen.answers, rankedThemes, coverAllocation },
      })
      return
    }
    publisher.recommendation(calculateThemeScores(screen.answers), rankedThemes, answerId, discoveryRules[answerId], 'not-requested', coverAllocation)
    const metadata = [...screen.answers, answerId].flatMap((selectedId, index) =>
      vkQuestions[index].options.find(({ id }) => id === selectedId)?.metadata ?? [],
    )
    setScreen({
      type: 'vk-answer-reveal', questionIndex: screen.index,
      optionIndex: question.options.findIndex(({ id }) => id === answerId), label: option.label, metadata: option.metadata,
      next: { type: 'vk-discovery-activation', themes, metadata },
    })
  }

  const selectPhoto = (answerId: 'accept' | 'skip') => {
    if (screen.type !== 'vk-digitize') return
    const option = vkPhotoOptions.find(({ id }) => id === answerId)!
    publisher.answer('vk-video', 'photo', option)
    const themes = screen.coverAllocation.themeSelections.map(({ theme }) => theme)
    const metadata = [...screen.answers, 'hero'].flatMap((selectedId, index) =>
      vkQuestions[index].options.find(({ id }) => id === selectedId)?.metadata ?? [],
    )
    if (answerId === 'accept') {
      publisher.recommendation(calculateThemeScores(screen.answers), screen.rankedThemes, 'hero', discoveryRules.hero, 'included', screen.coverAllocation)
      setScreen({
        type: 'vk-photo-reveal', answerId, metadata: option.metadata,
        next: { type: 'vk-camera', themes, metadata: [...metadata, ...option.metadata] },
      })
      return
    }
    publisher.recommendation(calculateThemeScores(screen.answers), screen.rankedThemes, 'hero', discoveryRules.hero, 'skipped', screen.coverAllocation)
    setScreen({
      type: 'vk-photo-reveal', answerId, metadata: option.metadata,
      next: { type: 'vk-discovery-activation', themes, metadata },
    })
  }

  const backgroundVariant = screen.type === 'home'
    ? 'home'
    : screen.type === 'product-intro'
      ? screen.product === 'max' ? 'max' : 'vk'
    : screen.type.startsWith('max-')
      ? 'max'
      : screen.type === 'vk-onboarding'
        ? 'vk-onboarding'
        : 'vk'

  return (
    <div
      ref={viewportRef}
      className="prototype-viewport"
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse' || !cursorRef.current) return
        cursorRef.current.style.opacity = '1'
        cursorRef.current.style.transform = `translate3d(${event.clientX - 116 * canvasScale}px, ${event.clientY - 42 * canvasScale}px, 0)`
      }}
      onPointerLeave={() => {
        if (cursorRef.current) cursorRef.current.style.opacity = '0'
      }}
    >
      <TextRenderingFilters />
      <div
        className="prototype-canvas"
        style={{
          width: canvasWidth * canvasScale,
          height: canvasHeight * canvasScale,
        }}
      >
        <main
          className={`experience experience--${backgroundVariant}`}
          style={{ zoom: canvasScale }}
        >
          <div className="experience__content" key={screen.type}>
        {screen.type === 'home' && (
          <section className="screen screen--home" aria-labelledby="home-title">
            <h1 id="home-title">{onboardingCopy.homeQuestion}</h1>
            <div className="product-choices">
              <button
                className="product-choice product-choice--video"
                type="button"
                aria-label="VK Видео"
                onClick={() => startProduct('vk-video')}
              >
                <img src={firstScreenVkVideo} alt="" draggable={false} />
              </button>
              <button
                className="product-choice product-choice--max"
                type="button"
                aria-label="MAX"
                onClick={() => startProduct('max')}
              >
                <img src={firstScreenMax} alt="" draggable={false} />
              </button>
            </div>
          </section>
        )}

        {screen.type === 'product-intro' && <ProductIntroScreen product={screen.product} />}

        {(screen.type === 'max-onboarding' || screen.type === 'vk-onboarding') && (
          <OnboardingScreen
            product={screen.type === 'max-onboarding' ? 'max' : 'vk-video'}
            onStart={() => setScreen(screen.type === 'max-onboarding'
              ? { type: 'max-audience' }
              : { type: 'vk-question', index: 0, answers: [] })}
            onBack={goBack}
          />
        )}

        {screen.type === 'max-audience' && (
          <MaxFlowQuestion
            kind="audience"
            onSelect={(audience) => {
              const option = maxAudienceOptions.find(({ id }) => id === audience)!
              publisher.answer('max', 'audience', option)
              setScreen({
                type: 'max-answer-reveal', kind: 'audience', answerId: audience, metadata: option.metadata,
                next: { type: 'max-goal', audience },
              })
            }}
            onBack={goBack}
          />
        )}

        {screen.type === 'max-goal' && (
          <MaxFlowQuestion
            kind="goal"
            onSelect={(goal: MaxGoal) => {
              const option = getMaxGoalOption(screen.audience, goal)
              publisher.answer('max', 'goal', option)
              setScreen({
                type: 'max-answer-reveal', kind: 'goal', answerId: goal, metadata: option.metadata,
                next: { type: 'max-result', mission: getMaxMission(screen.audience, goal) },
              })
            }}
            onBack={goBack}
          />
        )}

        {screen.type === 'max-result' && (
          <MaxFlowResult mission={screen.mission} onReset={reset} />
        )}

        {screen.type === 'max-answer-reveal' && (
          <MaxAnswerReveal kind={screen.kind} answerId={screen.answerId} metadata={screen.metadata} />
        )}

        {screen.type === 'vk-question' && (
          <VkFlowQuestion index={screen.index} onSelect={selectVkAnswer} onBack={goBack} />
        )}

        {screen.type === 'vk-answer-reveal' && (
          <VkAnswerReveal
            questionIndex={screen.questionIndex}
            optionIndex={screen.optionIndex}
            label={screen.label}
            metadata={screen.metadata}
          />
        )}

        {screen.type === 'vk-photo-reveal' && (
          <VkPhotoReveal answerId={screen.answerId} metadata={screen.metadata} />
        )}

        {screen.type === 'vk-digitize' && (
          <section className="screen screen--digitize" aria-labelledby="digitize-title" inert={termsMounted}>
            <VkFlowLogo />
            <h1 id="digitize-title">{vkCopy.digitizeQuestion}</h1>
            <p className="digitize-description">{vkCopy.digitizeDescription}</p>
            <div className="digitize-actions">
              <button
                className="vk-photo-button vk-photo-button--accept"
                type="button"
                aria-label={vkCopy.digitizeAccept}
                onClick={() => selectPhoto('accept')}
              >
                <span className="vk-photo-accept-face">{vkCopy.digitizeAccept}</span>
              </button>
              <button
                className="vk-photo-button vk-photo-button--skip"
                type="button"
                aria-label={vkCopy.digitizeSkip}
                onClick={() => selectPhoto('skip')}
              >
                <img src={photoSkipImage} alt="" />
              </button>
            </div>
            <button
              ref={termsTriggerRef}
              className="digitize-notice"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={termsMounted}
              onClick={() => setTermsMounted(true)}
            >
              {vkCopy.digitizeNoticePrefix}
              <span className="digitize-terms-link">{vkCopy.digitizeNoticeAction}</span>
              .
            </button>
          </section>
        )}

        {screen.type === 'vk-digitize' && termsMounted && (
          <div
            className="terms-overlay"
            data-open={termsOpen}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeTerms()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeTerms()
              if (event.key === 'Tab') event.preventDefault()
            }}
          >
            <div className="terms-panel">
              <div className="terms-header">
                <h2 id="terms-title">{vkCopy.digitizeTermsTitle}</h2>
                <button
                  ref={termsCloseRef}
                  className="terms-close"
                  type="button"
                  aria-label="Закрыть"
                  title="Закрыть"
                  onClick={closeTerms}
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="terms-body">
                <p className="terms-draft-label">Демонстрационный макет</p>
                <div className="terms-document">
                <section>
                  <h3>1. Общие положения</h3>
                  <p>{vkCopy.digitizeTermsPlaceholder}</p>
                  <p>{vkCopy.digitizeTermsPlaceholder} {vkCopy.digitizeTermsPlaceholder}</p>
                </section>
                <section>
                  <h3>2. Какие данные используются</h3>
                  <p>{vkCopy.digitizeTermsPlaceholder} {vkCopy.digitizeTermsPlaceholder}</p>
                  <ul>
                    <li>{vkCopy.digitizeTermsPlaceholder}</li>
                    <li>{vkCopy.digitizeTermsPlaceholder}</li>
                    <li>{vkCopy.digitizeTermsPlaceholder}</li>
                  </ul>
                </section>
                <section>
                  <h3>3. Цели и порядок использования</h3>
                  <p>{vkCopy.digitizeTermsPlaceholder} {vkCopy.digitizeTermsPlaceholder}</p>
                  <p>{vkCopy.digitizeTermsPlaceholder} {vkCopy.digitizeTermsPlaceholder}</p>
                </section>
                <section>
                  <h3>4. Хранение и защита данных</h3>
                  <p>{vkCopy.digitizeTermsPlaceholder} {vkCopy.digitizeTermsPlaceholder}</p>
                  <ul>
                    <li>{vkCopy.digitizeTermsPlaceholder}</li>
                    <li>{vkCopy.digitizeTermsPlaceholder}</li>
                  </ul>
                </section>
                <section>
                  <h3>5. Права пользователя</h3>
                  <p>{vkCopy.digitizeTermsPlaceholder} {vkCopy.digitizeTermsPlaceholder}</p>
                  <p>{vkCopy.digitizeTermsPlaceholder}</p>
                </section>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen.type === 'vk-camera' && (
          <section className="screen screen--vk-camera" aria-label="Подготовка к фото">
            <VkFlowLogo />
            <h1>Смотри в камеру выше!</h1>
            <img className="vk-camera-icon" src={cameraIcon} alt="" />
          </section>
        )}

        {screen.type === 'vk-scanning' && (
          <VkScanningScreen />
        )}

        {screen.type === 'vk-discovery-activation' && (
          <VkDiscoveryActivation metadata={screen.metadata} />
        )}

        {screen.type === 'vk-final' && (
          <section className="screen screen--vk-final" aria-labelledby="vk-result-title">
            <VkFlowLogo />
            <h1 id="vk-result-title">{vkCopy.finalDirection}</h1>
            <div className="vk-final-qr" role="img" aria-label="QR-код VK Видео" />
            <p className="vk-final-qr-caption">{vkCopy.finalQrCaption}</p>
          </section>
        )}
          </div>
        </main>
      </div>
      <img
        ref={cursorRef}
        className="custom-cursor"
        src={homePointer}
        alt=""
        aria-hidden="true"
        style={{
          width: 233 * canvasScale,
          height: 197 * canvasScale,
        }}
      />
    </div>
  )
}
