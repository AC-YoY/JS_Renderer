const log = console.log.bind(console)

const _e = (sel) => document.querySelector(sel)

const _es = (sel) => document.querySelectorAll(sel)

const interpolate = (a, b, factor) => a + (b - a) * factor

const random01 = () => Math.random()
