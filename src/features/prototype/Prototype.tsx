import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ChevronRight,
  Play,
  UserRound,
} from 'lucide-react'
import homePointer from '../../assets/images/home/pointer.png'
import maxChatImage from '../../assets/images/results/max-chat.png'
import { BackButton } from '../../components/BackButton'
import { OnboardingScreen } from '../../components/OnboardingScreen'
import { ProductMark } from '../../components/ProductMark'
import { QuestionScreen } from '../../components/QuestionScreen'
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
import { discoveryRules, vkCopy, vkPhotoOptions, vkQuestions } from '../../content/vkVideo'
import type {
  MaxAudience,
  MaxGoal,
  MaxMission,
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
  | { type: 'vk-digitize'; answers: string[]; rankedThemes: VkTheme[] }
  | { type: 'vk-scanning'; themes: VkTheme[] }
  | { type: 'vk-final'; themes: VkTheme[] }

const homeState: ScreenState = { type: 'home' }
const canvasWidth = 1080
const canvasHeight = 1920

export function Prototype() {
  const [screen, setScreen] = useState<ScreenState>(homeState)
  const [canvasScale, setCanvasScale] = useState(1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLImageElement>(null)
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
    if (screen.type !== 'vk-scanning') return

    const timeout = window.setTimeout(() => {
      setScreen({ type: 'vk-final', themes: screen.themes })
    }, 2400)

    return () => window.clearTimeout(timeout)
  }, [screen])

  const reset = () => {
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
      setScreen({ type: 'vk-question', index: screen.index + 1, answers: [...screen.answers, answerId] })
      return
    }

    publisher.answer('vk-video', question.id, option)
    const rankedThemes = rankThemes(screen.answers)
    if (answerId === 'hero') {
      setScreen({ type: 'vk-digitize', answers: screen.answers, rankedThemes })
      return
    }
    publisher.recommendation(calculateThemeScores(screen.answers), rankedThemes, answerId, discoveryRules[answerId], 'not-requested')
    setScreen({ type: 'vk-final', themes: rankedThemes.slice(0, 3) })
  }

  const selectPhoto = (answerId: 'accept' | 'skip') => {
    if (screen.type !== 'vk-digitize') return
    const option = vkPhotoOptions.find(({ id }) => id === answerId)!
    publisher.answer('vk-video', 'photo', option)
    publisher.recommendation(calculateThemeScores(screen.answers), screen.rankedThemes, 'hero', discoveryRules.hero, answerId === 'accept' ? 'included' : 'skipped')
    setScreen(answerId === 'accept'
      ? { type: 'vk-scanning', themes: screen.rankedThemes.slice(0, 3) }
      : { type: 'vk-final', themes: screen.rankedThemes.slice(0, 3) })
  }

  const backgroundVariant = screen.type === 'home'
    ? 'home'
    : screen.type.startsWith('max-')
      ? 'max'
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
          style={{ transform: `scale(${canvasScale})` }}
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
                <ProductMark product="vk-video" />
              </button>
              <button
                className="product-choice product-choice--max"
                type="button"
                aria-label="MAX"
                onClick={() => startProduct('max')}
              >
                <ProductMark product="max" />
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
          <QuestionScreen
            product="vk-video"
            prompt={vkQuestions[screen.index].prompt}
            options={vkQuestions[screen.index].options}
            onSelect={selectVkAnswer}
            onBack={goBack}
          />
        )}

        {screen.type === 'vk-digitize' && (
          <section className="screen screen--digitize" aria-labelledby="digitize-title">
            <ProductMark product="vk-video" />
            <div className="digitize-symbol" aria-hidden="true">
              <UserRound />
            </div>
            <h1 id="digitize-title">{vkCopy.digitizeQuestion}</h1>
            <p className="digitize-description">{vkCopy.digitizeDescription}</p>
            <div className="digitize-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => selectPhoto('accept')}
              >
                {vkCopy.digitizeAccept}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => selectPhoto('skip')}
              >
                {vkCopy.digitizeSkip}
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
            <p className="digitize-notice">{vkCopy.digitizeNotice}</p>
            <BackButton onClick={goBack} />
          </section>
        )}

        {screen.type === 'vk-scanning' && (
          <section
            className="screen screen--scanning"
            aria-label="Имитация оцифровки"
          >
            <div className="scan-figure" aria-hidden="true">
              <UserRound />
              <span className="scan-figure__line" />
            </div>
            <ProductMark product="vk-video" />
          </section>
        )}

        {screen.type === 'vk-final' && (
          <section className="screen screen--result" aria-labelledby="vk-result-title">
            <ProductMark product="vk-video" />
            <div className="result-orbit result-orbit--video" aria-hidden="true">
              <Play />
            </div>
            <h1 id="vk-result-title">{vkCopy.finalTitle}</h1>
            <p className="result-copy">{vkCopy.finalDirection}</p>
            <button
              className="primary-button result-reset result-thanks"
              type="button"
              onClick={reset}
            >
              {vkCopy.thanks}
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
