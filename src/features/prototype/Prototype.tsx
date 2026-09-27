import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ChevronRight,
  Play,
  RotateCcw,
  UserRound,
} from 'lucide-react'
import digitalSolutionsLogo from '../../assets/images/home/digital-solutions.png'
import homeMaxButton from '../../assets/images/home/max-button.png'
import homePointer from '../../assets/images/home/pointer.png'
import homeVkButton from '../../assets/images/home/vk-video-button.png'
import maxChatImage from '../../assets/images/results/max-chat.png'
import { BackButton } from '../../components/BackButton'
import { ProductMark } from '../../components/ProductMark'
import { QuestionScreen } from '../../components/QuestionScreen'
import {
  maxAudienceOptions,
  maxGoalOptions,
  maxMissionDescriptions,
  maxMissionLabels,
  maxTransitionPrompt,
} from '../../content/max'
import { vkQuestions } from '../../content/vkVideo'
import type {
  MaxAudience,
  MaxGoal,
  MaxMission,
  VkTheme,
} from '../../types/prototype'
import { getMaxMission, selectTopThemes } from './logic'

type ScreenState =
  | { type: 'home' }
  | { type: 'max-audience' }
  | { type: 'max-goal'; audience: MaxAudience }
  | { type: 'max-result'; mission: MaxMission }
  | { type: 'vk-question'; index: number; answers: string[] }
  | { type: 'vk-digitize'; answers: string[]; themes: VkTheme[] }
  | { type: 'vk-scanning'; themes: VkTheme[] }
  | { type: 'vk-final'; themes: VkTheme[] }

const homeState: ScreenState = { type: 'home' }
const canvasWidth = 1080
const canvasHeight = 1920

export function Prototype() {
  const [screen, setScreen] = useState<ScreenState>(homeState)
  const [canvasScale, setCanvasScale] = useState(1)
  const cursorRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const fitCanvas = () => {
      setCanvasScale(
        Math.min(
          window.innerWidth / canvasWidth,
          window.innerHeight / canvasHeight,
        ),
      )
    }

    fitCanvas()
    window.addEventListener('resize', fitCanvas)

    return () => window.removeEventListener('resize', fitCanvas)
  }, [])

  useEffect(() => {
    if (screen.type !== 'vk-scanning') return

    const timeout = window.setTimeout(() => {
      setScreen({ type: 'vk-final', themes: screen.themes })
    }, 2400)

    return () => window.clearTimeout(timeout)
  }, [screen])

  const reset = () => setScreen(homeState)

  const goBack = () => {
    switch (screen.type) {
      case 'max-audience':
      case 'vk-question':
        if (screen.type === 'vk-question' && screen.index > 0) {
          setScreen({
            type: 'vk-question',
            index: screen.index - 1,
            answers: screen.answers.slice(0, -1),
          })
        } else {
          reset()
        }
        break
      case 'max-goal':
        setScreen({ type: 'max-audience' })
        break
      case 'vk-digitize':
        setScreen({
          type: 'vk-question',
          index: vkQuestions.length - 1,
          answers: screen.answers.slice(0, -1),
        })
        break
      default:
        break
    }
  }

  const selectVkAnswer = (answerId: string) => {
    if (screen.type !== 'vk-question') return

    const answers = [...screen.answers, answerId]
    const nextIndex = screen.index + 1

    if (nextIndex < vkQuestions.length) {
      setScreen({ type: 'vk-question', index: nextIndex, answers })
      return
    }

    setScreen({
      type: 'vk-digitize',
      answers,
      themes: selectTopThemes(answers),
    })
  }

  const backgroundVariant = screen.type === 'home'
    ? 'home'
    : screen.type.startsWith('max-')
      ? 'max'
      : 'vk'

  return (
    <div
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
            <h1 id="home-title">Что тебе сейчас ближе?</h1>
            <div className="product-choices">
              <button
                className="product-choice product-choice--video"
                type="button"
                aria-label="Исследовать внешний мир с VK Видео"
                onClick={() =>
                  setScreen({ type: 'vk-question', index: 0, answers: [] })
                }
              >
                <img
                  className="product-choice__export"
                  src={homeVkButton}
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <button
                className="product-choice product-choice--max"
                type="button"
                aria-label="Исследовать свои возможности в MAX"
                onClick={() => setScreen({ type: 'max-audience' })}
              >
                <img
                  className="product-choice__export"
                  src={homeMaxButton}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
            <img
              className="digital-solutions-mark"
              src={digitalSolutionsLogo}
              alt="Цифровые решения"
            />
          </section>
        )}

        {screen.type === 'max-audience' && (
          <QuestionScreen
            product="max"
            prompt="Какие возможности ты хочешь освоить?"
            options={maxAudienceOptions}
            onSelect={(audience) => setScreen({ type: 'max-goal', audience })}
            onBack={goBack}
          />
        )}

        {screen.type === 'max-goal' && (
          <QuestionScreen
            product="max"
            prompt="Какой цели хочешь достичь?"
            options={maxGoalOptions}
            onSelect={(goal: MaxGoal) =>
              setScreen({
                type: 'max-result',
                mission: getMaxMission(screen.audience, goal),
              })
            }
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
              Миссия «{maxMissionLabels[screen.mission]}»
            </h1>
            <p className="result-copy result-copy--description">
              {maxMissionDescriptions[screen.mission]}
            </p>
            <p className="result-copy result-copy--direction">
              {maxTransitionPrompt}
            </p>
            <button
              className="icon-button result-reset"
              type="button"
              aria-label="Вернуться в начало"
              onClick={reset}
            >
              <RotateCcw aria-hidden="true" />
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
            <h1 id="digitize-title">Хочешь, мы тебя оцифруем?</h1>
            <div className="digitize-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  setScreen({ type: 'vk-scanning', themes: screen.themes })
                }
              >
                Да, давайте
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  setScreen({ type: 'vk-final', themes: screen.themes })
                }
              >
                Пропустить
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
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
            <h1 id="vk-result-title">Загружаем в Дискавери</h1>
            <p className="result-copy">Пройди к левой стене</p>
            <button
              className="icon-button result-reset"
              type="button"
              aria-label="Вернуться в начало"
              onClick={reset}
            >
              <RotateCcw aria-hidden="true" />
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
