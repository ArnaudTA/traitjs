/** 
 * @typedef {Object} Link
 * @property {string | undefined} src The user's full name.
 * @property {HTMLElement | undefined} srcEl The user's age in days. We use days
 * @property {string | undefined} dest The user's age in days. We use days
 * @property {HTMLElement | undefined} destEl The user's age in days. We use days
 * @property {string | undefined} dest The user's age in days. We use days
 * @property {string | undefined} text The user's age in days. We use days
 * @property {string | undefined} style The user's age in days. We use days
 * @property {any | undefined} width The user's age in days. We use days
 */

// Options de l'observateur (quelles sont les mutations à observer)
const observerConfig = {
  attributes: true,
  attributeFilter: [
    'clientHeight',
    'clientTop',
    'clientLeft',
    'clientHeight',
    'trait',
    'style'
  ]
}

function setTraitProperties() {
  /** @type {HTMLDivElement & { srcEl: HTMLDivElement, destEl: HTMLDivElement}} */
  const el = (this instanceof MutationObserver) ? this.trait : this

  const srcRect = el.srcEl.getBoundingClientRect()
  const destRect = el.destEl.getBoundingClientRect()
  const srcConnector = {
    y: srcRect.top + srcRect.height / 2,
    x: srcRect.left + srcRect.width / 2
  }
  const destConnector = {
    y: destRect.top + destRect.height / 2,
    x: destRect.left + destRect.width / 2
  }

  const hypo = calcHypothenuse(srcConnector, destConnector)
  el.style.top = `${srcConnector.y}px`
  el.style.left = `${srcConnector.x}px`
  el.style.width = `${hypo.len}px`
  el.style.transform = 'rotate(' + hypo.angleRad + 'rad)'
  if (hypo.backward) setTransformStyle(el, 'rotate(' + hypo.angleRad + 'rad) scale(-1) translate(0,-100%)')
  else setTransformStyle(el, 'rotate(' + hypo.angleRad + 'rad) scale(1) translate(0)')
  if (el.childNodes[0]) {
    if (!hypo.backward) setTransformStyle(el.childNodes[0], 'rotate(0turn)')
    if (hypo.backward) setTransformStyle(el.childNodes[0], 'rotate(0.5turn)')
  }
}

function calcHypothenuse(src, dest) {
  const ydiff = Math.ceil(dest.y - src.y)
  const xdiff = Math.ceil(dest.x - src.x)
  let angleRad = Math.atan(ydiff / xdiff)

  return {
    len: Math.sqrt((xdiff * xdiff) + (ydiff * ydiff)),
    angleRad,
    upsidedown: ydiff < 0,
    backward: xdiff < 0,
  }
}

function setTransformStyle(el, value) {
  el.style['-moz-transform'] = value
  el.style['-webkit-transform'] = value
  el.style['-o-transform'] = value
  el.style['-ms-transform'] = value
  el.style.transform = value
}

export class Trait {
  /** @type {HTMLElement} */
  pageElement

  /**
  * @param {canvaId} @type {string} a constructor/class that extends View
  * @return Trait a new Trait instance
  * */
  constructor(canvaId) {
    this.pageElement = document.getElementById(canvaId)
    window.addEventListener('resize', this.resizeAllTraits)
    this.pageElement.addEventListener('resize', this.resizeAllTraits)
    this.pageElement.addEventListener('load', this.resizeAllTraits)
    this.pageElement.addEventListener('wheel', this.resizeAllTraits)
    this.pageElement.addEventListener('scroll', this.resizeAllTraits)
  }

  /**
   * @param {Link} link 
   */
  createTrait() {
    const t = document.createElement('trait')
    t.classList.add('trait')
    return t
  }

  /** @type {Array.<Link>} */
  links = []

  /**
   * @param {Link} link 
   */
  addTrait(link) {
    const srcElement = link.srcEl ? link.srcEl : document.getElementById(link.src)
    const destElement = link.destEl ? link.destEl : document.getElementById(link.dest)

    link.srcEl = link.srcEl ? link.srcEl : document.getElementById(link.src)
    link.destEl = link.destEl ? link.destEl : document.getElementById(link.dest)
    // create trait
    const trait = this.createTrait()
    trait.srcEl = srcElement
    trait.destEl = destElement
    trait.calcHypothenuse = calcHypothenuse
    trait.setProperties = setTraitProperties
    trait.setTransformStyle = setTransformStyle
    if (link.color) trait.style.borderColor = link.color
    if (link.style) trait.style.borderStyle = link.style
    if (link.width) trait.style.borderBottomWidth = link.width
    if (link.text) {
      const span = document.createElement('span')
      span.classList.add('traitText')
      span.textContent = link.text
      trait.appendChild(span)
    }

    // Créé une instance de l'observateur lié à la fonction de callback
    const srcObserver = new MutationObserver(trait.setProperties);
    const destObserver = new MutationObserver(trait.setProperties);
    srcObserver.trait = trait
    destObserver.trait = trait
    // Commence à observer le noeud cible pour les mutations précédemment configurées
    srcObserver.observe(srcElement, observerConfig);
    destObserver.observe(destElement, observerConfig);
    trait.setProperties()

    // display it
    this.pageElement.appendChild(trait)
    this.links.push(link)
  }









  resizeAllTraits() {
    const traits = document.getElementsByTagName('trait')
    Array.from(traits).forEach(trait => trait.setProperties())
  }
}
