let nextButton = document.getElementById('nexts')
let prevButton = document.getElementById('prevs')
let list = [].slice.call(document.querySelector('.container_text-anim').children)

function findActiveList() {
  let activeList = list.findIndex((e) => {
    return e.classList.contains('actives')
  })
  
  list[activeList].classList.remove('actives', 'fadeInRight', 'fadeInLext', 'animated')
  
  return activeList
}

function slideShow() {
  let activeList = findActiveList()
  
  activeList++
  activeList = activeList === list.length ? 0 : activeList
  
  list[activeList].classList.add('actives', 'fadeInRight', 'animated')
}


nextButton.addEventListener('click', slideShow)

prevButton.addEventListener('click', () => {
  let activeList = findActiveList()
  
  activeList--
  activeList = activeList === -1 ? list.length - 1 : activeList
  
  list[activeList].classList.add('actives', 'fadeInLeft', 'animated')
})




const timeCoverter = {
  toMS(originalDuration) {
    if (typeof originalDuration !== 'string') return 0
    const duration = originalDuration.replace(/[A-Za-z]/g, "")
    if(originalDuration.includes("ms")) return parseInt(duration)
    if(originalDuration.includes("s")) return parseInt(parseFloat(duration) * 1000)
    return 0
  }
}

const isDesktop = () => window.innerWidth > 992

class Slider {
  constructor(element, config = {}) {
    if(element instanceof Element) this._element = element
    else if(typeof element === 'string') this._element = document.querySelector(element) 
    else throw new Error('Slider constructor requires an element or selector')
    
    this._config = typeof config === 'object' ? config : {}
    this._init()
  }

  _init() {
    this._getContainer()
    this._getListItem()
    if(this._totalItem === 0) return
    this._setupItem()
    this._getTransitionItem()
    if(this._config.autoplay) this._startAutoplay()
  }

  _getContainer() {
    this._container = this._element.querySelector(".slider-list")
    this._containerGap = getComputedStyle(this._container).gap
    if(this._config.reverse) this._container.style.justifyContent = "end"
  }
  
  _getListItem() {
    this._sliderItems = this._container.querySelectorAll('.slider-item')
    this._totalItem = this._sliderItems.length
  }

  _setupItem() {
    if(this._totalItem === 1) {
      this._container.style.gridAutoColumns = "100%"
      this._container.appendChild(this._sliderItems[0].cloneNode(true))
      this._sliderItems = this._element.querySelectorAll('.slider-item')
      this._totalItem = this._sliderItems.length
    }
    if(this._totalItem === 2) this._container.style.gridAutoColumns = "100%"
    if(!isDesktop()) return
    if(this._totalItem === 3) this._container.style.gridAutoColumns = "50%"
    if(this._totalItem === 4) this._container.style.gridAutoColumns = "33.33333333%"
    if(this._totalItem >= 5) this._container.style.gridAutoColumns = "25%"
  }

  _getTransitionItem() {
    this._originalTransitionDuration = getComputedStyle(this._container).transitionDuration
    this._transitionDuration = timeCoverter.toMS(this._originalTransitionDuration) ?? 0
  }

  update() {
    this._getListItem()
    this._setupItem()
  }
  
  _startAutoplay() {
    const repeat = (direction = null) => {
      this._move().then(() => {
        repeat()
      })
    }
    repeat()
  }
  
  _move(direction = null) {
    const resetTime = 20
    setTimeout(() => {
      this._container.style.transitionDuration = this._originalTransitionDuration
      if(this._config.reverse || direction === 'prev') {
        this._container.style.transform = `translateX(calc(${this._sliderItems[0]?.offsetWidth}px + ${this._containerGap}))`
      } else {
        this._container.style.transform = `translateX(calc(-${this._sliderItems[0]?.offsetWidth}px - ${this._containerGap}))`
      }
    }, resetTime)
    return new Promise(resolve => {
      this._swap(direction)
      setTimeout(() => {
        this._container.style.transitionDuration = "0s"
        this._container.style.transform = `translateX(0px)`
        this._pause = false
        resolve(true)
      }, this._transitionDuration)
    })
  }
  
  _swap(direction = null) {
    if(this._config.reverse || direction === 'prev') {
      const firstChild = this._sliderItems[0]
      const lastChild = this._sliderItems[this._totalItem - 1]
      this._container.insertBefore(lastChild, firstChild)
      this.update()
    } else {
      this.update()
      const firstChild = this._sliderItems[0]
      this._container.removeChild(firstChild)
      this._container.appendChild(firstChild)
    }
  }
}

const slider = new Slider('.slider', {
  autoplay: true,
  reverse: true
})

document.addEventListener("click", function(e) {
  if(!e.target.matches('[data-toggle="slider-action"]')) return
  if(!e.target.matches('[data-direction]')) return
  const direction = e.target.dataset.direction
  // if(direction === "next") slider.next()
  // if(direction === "prev") slider.prev()
})