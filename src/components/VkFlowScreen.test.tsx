import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { vkPhotoOptions, vkQuestions } from '../content/vkVideo'
import { VkAnswerReveal, VkDiscoveryActivation, VkFlowQuestion, VkPhotoReveal, VkScanningScreen } from './VkFlowScreen'

describe('VK question and reveal markup', () => {
  it('renders the three scanning phases in source order within one text-free screen', () => {
    const html = renderToStaticMarkup(<VkScanningScreen />)
    expect(html).toContain('aria-label="Имитация оцифровки"')
    expect(html.match(/<section /g)).toHaveLength(1)
    expect(html.match(/<img /g)).toHaveLength(3)
    const frames = [...html.matchAll(/<img [^>]+src="([^"]+)"/g)].map(match => match[1])
    expect(frames[0]).toContain('scan-background-final.webp')
    expect(frames[1]).toContain('scan-light-contour-scenario.webp')
    expect(frames[2]).toContain('scan-white-particles-scenario.webp')
    expect(html).not.toContain('<h1')
    expect(html).not.toContain('<p')
    expect(html).not.toContain('Смотри в камеру')
    expect(html).not.toContain('vk-activation-tag')
    expect(html).not.toContain('class="vk-flow-logo"')
  })

  it('renders the new Figma activation copy as live text with actual collected metadata', () => {
    const metadata = ['документальное кино', 'научпоп', 'знания']
    const html = renderToStaticMarkup(<VkDiscoveryActivation metadata={metadata} />)
    expect(html).toContain('aria-label="Активация Discovery"')
    expect(html).toContain('discovery-activation-figma-clean.webp')
    expect(html).not.toContain('discovery-activation-scenario.png')
    expect(html.match(/<img /g)).toHaveLength(1)
    expect(html).toContain('class="vk-activation-title"')
    expect(html).toContain('left:122.184px;top:0')
    expect(html).toContain('left:266.91px;top:83px')
    expect(html).toContain('Технологии Discovery </span>')
    expect(html).toContain('>активированы</span>')
    expect(html).toContain('class="vk-activation-description"')
    expect(html).toContain('left:255.339px;top:0')
    expect(html).toContain('left:311.779px;top:39px')
    expect(html).toContain('Технологии персонализации Discovery </span>')
    expect(html).toContain('>уже начали собирать подборку.</span>')
    expect(html.match(/class="vk-activation-tag[ "-]/g)).toHaveLength(3)
    for (const tag of metadata) expect(html).toContain(`>${tag}</span>`)
    expect(html).not.toContain('>сериал</span>')
    expect(html).not.toContain('>премьера</span>')
    expect(html).not.toContain('>тренды</span>')
    expect(html).not.toContain('class="vk-flow-logo"')
  })

  it('limits activation visuals to ten unique tags without modifying or truncating metadata', () => {
    const metadata = ['tag0', 'tag0', ...Array.from({ length: 12 }, (_, index) => `tag${index + 1}`)]
    const original = [...metadata]
    const html = renderToStaticMarkup(<VkDiscoveryActivation metadata={metadata} />)
    expect(html.match(/class="vk-activation-tag[ "-]/g)).toHaveLength(10)
    expect(html.match(/>tag0<\/span>/g)).toHaveLength(1)
    expect(html).toContain('>tag9</span>')
    expect(html).not.toContain('>tag10</span>')
    expect(metadata).toEqual(original)
    expect(html).not.toContain('<button')
  })

  it('does not invent preview metadata when no tags were collected', () => {
    const html = renderToStaticMarkup(<VkDiscoveryActivation metadata={[]} />)
    expect(html).not.toContain('class="vk-activation-tag ')
    expect(html).not.toContain('class="vk-activation-tag"')
    expect(html).toContain('class="vk-activation-title"')
  })

  it('assigns long activation labels to wider native slots without changing payload or DOM order', () => {
    const metadata = ['обсуждения', 'сериал', 'премьера', 'популярное', 'драйв', 'азарт', 'игры', 'авто', 'рекомендации', 'для меня']
    const original = [...metadata]
    const html = renderToStaticMarkup(<VkDiscoveryActivation metadata={metadata} />)
    const labels = [...html.matchAll(/<div class="vk-activation-tag[^>]+width:([\d.]+)px[^>]*><span[^>]*>([^<]+)<\/span>/g)]
      .map(match => ({ width: Number(match[1]), label: match[2] }))
    expect(labels.map(({ label }) => label)).toEqual(metadata)
    expect(labels.find(({ label }) => label === 'рекомендации')?.width).toBe(329.635)
    expect(labels.find(({ label }) => label === 'для меня')?.width).toBe(184.232)
    expect(labels.find(({ label }) => label === 'авто')?.width).toBe(100.467)
    expect(metadata).toEqual(original)
  })

  it('uses the widest slot for a single long tag and preserves its full spelling', () => {
    const label = 'высокопроизводительные вычисления'
    const html = renderToStaticMarkup(<VkDiscoveryActivation metadata={[label]} />)
    expect(html).toContain('left:579.141px;top:1433.28px;width:329.635px;height:142.503px')
    expect(html).toContain(`>${label}</span>`)
    expect(html.match(/class="vk-activation-tag[ "-]/g)).toHaveLength(1)
  })

  it('preserves all ten native activation bubble frames from Figma 4788:10640', () => {
    const html = renderToStaticMarkup(<VkDiscoveryActivation metadata={Array.from({ length: 10 }, (_, index) => `tag${index}`)} />)
    const expectedFrames = [
      [212.792, 1103.47, 234.932, 112.25, 44.4159],
      [611.091, 1101.38, 184.232, 68.4349, 27.0543],
      [165.467, 1197.95, 100.467, 52.3141, 20.6914],
      [480.063, 1193.81, 306.914, 95.7672, 37.8579],
      [831.418, 1212.38, 130.611, 42.5632, 16.8134],
      [392.536, 1344.15, 245.99, 113.085, 57.0048],
      [124.321, 1446.69, 128.407, 65.9871, 26.5691],
      [579.141, 1433.28, 329.635, 142.503, 57.3448],
      [301.865, 1519.51, 100.467, 52.3141, 20.6914],
      [426.988, 1571.92, 173.588, 90.389, 35.7508],
    ]
    for (const [x, y, width, height, fontSize] of expectedFrames) {
      expect(html).toContain(`left:${x}px;top:${y}px;width:${width}px;height:${height}px`)
      expect(html).toContain(`font-size:${fontSize}px`)
    }
    expect(html.match(/class="vk-activation-tag vk-activation-tag--blurred"/g)).toHaveLength(1)
  })

  it.each([0, 1, 2])('renders four selectable cards and Back for question %i', index => {
    const html = renderToStaticMarkup(<VkFlowQuestion index={index} onSelect={() => {}} onBack={() => {}} />)
    expect(html.match(/<button /g)).toHaveLength(5)
    expect(html.match(/class="vk-flow-card/g)).toHaveLength(4)
    expect(html).toContain('aria-label="Назад"')
    expect(html).toContain('id="vk-question-title"')
    expect(html).not.toContain('screen--gender')
  })

  it.each([0, 1, 2])('uses the same selected card image during question %i reveal', questionIndex => {
    for (const [optionIndex, option] of vkQuestions[questionIndex].options.entries()) {
      const question = renderToStaticMarkup(<VkFlowQuestion index={questionIndex} onSelect={() => {}} onBack={() => {}} />)
      const html = renderToStaticMarkup(<VkAnswerReveal questionIndex={questionIndex} optionIndex={optionIndex} label={option.label} metadata={option.metadata} />)
      const questionImages = [...question.matchAll(/style="background-image:([^;"]+)/g)].map(match => match[1])
      const selectedImage = html.match(/<div class="vk-flow-card[^"]*" style="background-image:([^;"]+)/)?.[1]
      expect(new Set(questionImages).size).toBe(4)
      expect(selectedImage).toBe(questionImages[optionIndex])
      expect(html.match(/class="vk-flow-card /g)).toHaveLength(1)
      expect(html.match(/class="vk-metadata-tag /g)).toHaveLength(option.metadata.length)
      expect(html).toContain(`vk-flow-card--position-${optionIndex + 1}`)
      expect(html).not.toContain('<button')
      expect(html).not.toContain('<h1')
    }
  })

  it('keeps the approved photo acceptance as live text', () => {
    const option = vkPhotoOptions.find(({ id }) => id === 'accept')!
    const html = renderToStaticMarkup(<VkPhotoReveal answerId="accept" metadata={option.metadata} />)
    expect(html).toContain('<span class="vk-photo-accept-face">Да, давайте</span>')
    expect(html.match(/class="vk-metadata-tag /g)).toHaveLength(option.metadata.length)
    expect(html).not.toContain('<button')
  })

  it('reveals the skip image without invented metadata or a gender control', () => {
    const option = vkPhotoOptions.find(({ id }) => id === 'skip')!
    const html = renderToStaticMarkup(<VkPhotoReveal answerId="skip" metadata={option.metadata} />)
    expect(html).toContain('alt="Пропустить"')
    expect(html).not.toContain('class="vk-metadata-tag ')
    expect(html).not.toContain('gender')
    expect(html).not.toContain('<button')
  })
})
