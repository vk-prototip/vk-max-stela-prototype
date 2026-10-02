import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  X,
} from 'lucide-react'
import homePointer from '../../assets/images/home/pointer.png'
import firstScreenMax from '../../assets/images/home/first-screen/max.png'
import firstScreenVkVideo from '../../assets/images/home/first-screen/vk-video.png'
import maxChatImage from '../../assets/images/results/max-chat.png'
import photoAcceptImage from '../../assets/images/vk-flow/photo-accept.png'
import photoSkipImage from '../../assets/images/vk-flow/photo-skip.png'
import cameraIcon from '../../assets/images/vk-flow/camera-icon.png'
import scanSilhouette from '../../assets/images/vk-flow/scan-silhouette.png'
import thanksImage from '../../assets/images/vk-flow/thanks.png'
import { OnboardingScreen } from '../../components/OnboardingScreen'
import { ProductMark } from '../../components/ProductMark'
import { QuestionScreen } from '../../components/QuestionScreen'
import { VkAnswerReveal, VkFlowBack, VkFlowLogo, VkFlowQuestion, VkPhotoReveal } from '../../components/VkFlowScreen'
import {
  maxAudienceOptions,
  maxChooseAnotherMission,
  maxGoalOptions,
  maxMissionDescriptions,
  maxMissionLabels,
  maxPrompts,
  maxTransitionPrompt,
} from '../../content/max'
import { onboardingCopy } from '../../content/onboarding'
import { discoveryRules, vkCopy, vkGenderOptions, vkPhotoOptions, vkQuestions } from '../../content/vkVideo'
import type {
  MaxAudience,
  MaxGoal,
  MaxMission,
  VkGender,
  VkTheme,
} from '../../types/prototype'
import { calculateThemeScores, getMaxMission, rankThemes } from './logic'
import { createBrowserEventSink, createEventPublisher } from './events'

type ScreenState =
  | { type: 'home' }
  | { type: 'max-onboarding' }
  | { type: 'vk-onboarding' }
  | { type: 'max-audience' }
  | { type: 'max-goal'; audience: MaxAudience }
  | { type: 'max-result'; mission: MaxMission }
  | { type: 'vk-question'; index: number; answers: string[] }
  | { type: 'vk-answer-reveal'; questionIndex: number; optionIndex: number; label: string; metadata: string[]; next: ScreenState }
  | { type: 'vk-photo-reveal'; answerId: 'accept' | 'skip'; metadata: string[]; next: ScreenState }
  | { type: 'vk-digitize'; answers: string[]; rankedThemes: VkTheme[] }
  | { type: 'vk-gender'; answers: string[]; rankedThemes: VkTheme[] }
  | { type: 'vk-camera'; themes: VkTheme[] }
  | { type: 'vk-scanning'; themes: VkTheme[] }
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
    if (screen.type !== 'vk-answer-reveal' && screen.type !== 'vk-photo-reveal') return

    const duration = screen.type === 'vk-photo-reveal' && screen.metadata.length === 0 ? 650 : 2300
    const timeout = window.setTimeout(() => setScreen(screen.next), duration)
    return () => window.clearTimeout(timeout)
  }, [screen])

  useEffect(() => {
    if (screen.type !== 'vk-camera') return

    const timeout = window.setTimeout(() => {
      setScreen({ type: 'vk-scanning', themes: screen.themes })
    }, 1800)

    return () => window.clearTimeout(timeout)
  }, [screen])

  useEffect(() => {
    if (screen.type !== 'vk-scanning') return

    const timeout = window.setTimeout(() => {
      setScreen({ type: 'vk-final', themes: screen.themes })
    }, 2400)

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

  const startProduct = (product: 'max' | 'vk-video') => {
    publisher.start(product)
    setScreen({ type: product === 'max' ? 'max-onboarding' : 'vk-onboarding' })
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
      case 'vk-gender':
        publisher.clear('vk-video', 'photo')
        setScreen({ type: 'vk-digitize', answers: screen.answers, rankedThemes: screen.rankedThemes })
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
      publisher.answer('vk-video', question.id, weightedOption, { [weightedOption.plusTwo]: 2, [weightedOption.plusOne]: 1 })
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
    if (answerId === 'hero') {
      setScreen({
        type: 'vk-answer-reveal', questionIndex: screen.index,
        optionIndex: question.options.findIndex(({ id }) => id === answerId), label: option.label, metadata: option.metadata,
        next: { type: 'vk-digitize', answers: screen.answers, rankedThemes },
      })
      return
    }
    publisher.recommendation(calculateThemeScores(screen.answers), rankedThemes, answerId, discoveryRules[answerId], 'not-requested')
    setScreen({
      type: 'vk-answer-reveal', questionIndex: screen.index,
      optionIndex: question.options.findIndex(({ id }) => id === answerId), label: option.label, metadata: option.metadata,
      next: { type: 'vk-final', themes: rankedThemes.slice(0, 3) },
    })
  }

  const selectPhoto = (answerId: 'accept' | 'skip') => {
    if (screen.type !== 'vk-digitize') return
    const option = vkPhotoOptions.find(({ id }) => id === answerId)!
    publisher.answer('vk-video', 'photo', option)
    if (answerId === 'accept') {
      setScreen({
        type: 'vk-photo-reveal', answerId, metadata: option.metadata,
        next: { type: 'vk-gender', answers: screen.answers, rankedThemes: screen.rankedThemes },
      })
      return
    }
    publisher.recommendation(calculateThemeScores(screen.answers), screen.rankedThemes, 'hero', discoveryRules.hero, 'skipped')
    setScreen({
      type: 'vk-photo-reveal', answerId, metadata: option.metadata,
      next: { type: 'vk-final', themes: screen.rankedThemes.slice(0, 3) },
    })
  }

  const selectGender = (gender: VkGender) => {
    if (screen.type !== 'vk-gender') return
    const option = vkGenderOptions.find(({ id }) => id === gender)!
    publisher.answer('vk-video', 'gender', option)
    publisher.recommendation(calculateThemeScores(screen.answers), screen.rankedThemes, 'hero', discoveryRules.hero, 'included', gender)
    setScreen({ type: 'vk-camera', themes: screen.rankedThemes.slice(0, 3) })
  }

  const backgroundVariant = screen.type === 'home'
    ? 'home'
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
          <QuestionScreen
            product="max"
            prompt={maxPrompts.audience}
            options={maxAudienceOptions}
            onSelect={(audience) => {
              const option = maxAudienceOptions.find(({ id }) => id === audience)!
              publisher.answer('max', 'audience', option)
              setScreen({ type: 'max-goal', audience })
            }}
            onBack={goBack}
          />
        )}

        {screen.type === 'max-goal' && (
          <QuestionScreen
            product="max"
            prompt={maxPrompts.goal}
            options={maxGoalOptions}
            onSelect={(goal: MaxGoal) => {
              const option = maxGoalOptions.find(({ id }) => id === goal)!
              publisher.answer('max', 'goal', option)
              setScreen({
                type: 'max-result',
                mission: getMaxMission(screen.audience, goal),
              })
            }}
            onBack={goBack}
          />
        )}

        {screen.type === 'max-result' && (
          <section className="screen screen--result" aria-labelledby="max-result-title">
            <ProductMark product="max" />
            <div className="result-orbit result-orbit--max" aria-hidden="true">
              <img src={maxChatImage} alt="" />
            </div>
            <h1 id="max-result-title">
              <span className="mission-label">Миссия</span>{' '}
              <span className="mission-name">
                «{maxMissionLabels[screen.mission]}»
              </span>
            </h1>
            <p className="result-copy result-copy--description">
              {maxMissionDescriptions[screen.mission]}
            </p>
            <p className="result-copy result-copy--direction">
              {maxTransitionPrompt}
            </p>
            <button
              className="secondary-button result-reset"
              type="button"
              onClick={() => {
                const nextPublisher = createEventPublisher(crypto.randomUUID(), sink)
                nextPublisher.start('max')
                setPublisher(nextPublisher)
                setScreen({ type: 'max-audience' })
              }}
            >
              {maxChooseAnotherMission}
            </button>
          </section>
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
                <img src={photoAcceptImage} alt="" />
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
          <section
            className="screen screen--scanning"
            aria-label="Имитация оцифровки"
          >
            <img className="vk-scan-silhouette" src={scanSilhouette} alt="" />
          </section>
        )}

        {screen.type === 'vk-gender' && (
          <section className="screen screen--gender" aria-labelledby="gender-title">
            <VkFlowLogo />
            <div className="gender-panel">
              <h1 id="gender-title">{vkCopy.genderPrompt}</h1>
              <div className="gender-options">
                {vkGenderOptions.map((option) => (
                  <button
                    className="gender-option"
                    type="button"
                    key={option.id}
                    aria-label={option.id === 'male' ? 'Мужской' : 'Женский'}
                    onClick={() => selectGender(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <VkFlowBack onClick={goBack} />
          </section>
        )}

        {screen.type === 'vk-final' && (
          <section className="screen screen--vk-final" aria-labelledby="vk-result-title">
            <VkFlowLogo />
            <h1 id="vk-result-title">{vkCopy.finalTitle}</h1>
            <p className="result-copy">{vkCopy.finalDirection}</p>
            <button
              className="vk-final-thanks"
              type="button"
              aria-label={vkCopy.thanks}
              onClick={reset}
            >
              <img src={thanksImage} alt="" />
            </button>
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
