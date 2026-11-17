import '@testing-library/jest-dom/vitest'

class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub

Object.defineProperties(HTMLElement.prototype, {
  clientWidth: { configurable: true, get: () => 800 },
  clientHeight: { configurable: true, get: () => 320 },
})

HTMLElement.prototype.getBoundingClientRect = () => ({
  width: 800,
  height: 320,
  top: 0,
  right: 800,
  bottom: 320,
  left: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
})
