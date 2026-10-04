import { readFileSync } from 'node:fs'
import { parse } from 'postcss'
import { describe, expect, it } from 'vitest'
import { maxTransitionPrompt } from '../src/content/max'

const stylesheet = parse(readFileSync(new URL('../src/styles/max-flow.css', import.meta.url), 'utf8'))

function declarations(selector) {
  const values = {}
  stylesheet.walkRules(selector, rule => {
    rule.walkDecls(declaration => { values[declaration.prop] = declaration.value })
  })
  return values
}

describe('MAX native layout regressions', () => {
  it('keeps the panel direction on one line at the Figma baseline', () => {
    expect(maxTransitionPrompt).not.toMatch(/[\n\r\u2028]/)
    expect(declarations('.max-flow-direction')).toMatchObject({
      top: '986.23px', left: '251.73px', width: '574px',
      'font-size': '30px', 'font-weight': '500', 'line-height': '39px',
      opacity: '.72', 'white-space': 'nowrap',
    })
  })

  it.each([
    ['audience', '408.84px', '864.664px'],
    ['goal', '409.051px', '1192.08px'],
  ])('preserves the %s Back hit area', (kind, left, top) => {
    expect(declarations(`.max-flow-question--${kind} .max-flow-button--back`))
      .toMatchObject({ left, top, width: '262.319px' })
    expect(declarations('.max-flow-button--back'))
      .toMatchObject({ height: '120px', overflow: 'hidden' })
    expect(declarations('.max-flow-button--back span'))
      .toMatchObject({ left: '92.44px', top: '38px', width: '108px', height: '44px' })
  })

  it('clips the native Glass crops without stretching them', () => {
    expect(declarations('.max-flow-question--audience .max-flow-button--back img'))
      .toMatchObject({ width: '264px', left: '-.84px', top: '-.664px' })
    expect(declarations('.max-flow-button--back img'))
      .toMatchObject({ width: '263px', height: '121px', left: '-.051px', top: '-.08px' })
    expect(declarations('.max-flow-button--thanks img'))
      .toMatchObject({ width: '580px', height: '121px', top: '-.41px' })
  })

  it('keeps Thanks and Start at the verified source positions', () => {
    expect(declarations('.max-flow-button--thanks'))
      .toMatchObject({ top: '1051.41px', left: '250px', width: '580px', height: '120px', overflow: 'hidden' })
    expect(declarations('.max-flow-button--start'))
      .toMatchObject({ top: '1084.46142578125px', left: '360px', width: '360px', height: '140px' })
  })
})
