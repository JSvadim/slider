const galleryClassName = 'gallery';
const lineNodeClassName = 'gallery-line';
const galleryWrapperClassName = 'gallery-wrapper';
const verticalLineNodeClassName = 'gallery-line-vertical';
const slideClassName = 'gallery-slide';

const dotName = 'gallery-dot';
const activeDotName = 'gallery-dot-active';
const dotsContainerName = 'gallery-dots';

const arrowsContainerName = 'gallery-arrows';
const arrowName = 'gallery-arrow';
const prevArrowName = 'gallery-arrow-prev';
const nextArrowName = 'gallery-arrow-next';
const disabledArrowName = 'gallery-arrow-disabled';
const clickedArrowName = 'gallery-arrow-clicked';


class Gallery {

    constructor(selector, options = {}) {
        this.settings = {
            spaceBetweenSlides: options.spaceBetweenSlides || 0,
            initialSlide: options.initialSlide || 0,
            dots: options.dots || false,
            arrows: options.arrows || false,
            timeBetweenSlides: options.timeBetweenSlides || 500,
            vertical: options.vertical || false
        }
        this.containerNode = document.querySelector(selector);
        this.currentSlide = this.settings.initialSlide;
        this.initialLineNodePosition = 0;
        this.handleHtml = this.handleHtml.bind(this);
        this.setSize = this.setSize.bind(this);
        this.setEvents = this.setEvents.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.dragging = this.dragging.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.changeSlide = this.changeSlide.bind(this);
        this.addDots = this.addDots.bind(this);
        this.handleDotsState = this.handleDotsState.bind(this);
        this.moveAfterDotClicked = this.moveAfterDotClicked.bind(this);
        this.addArrows = this.addArrows.bind(this);
        this.handleArrowsState = this.handleArrowsState.bind(this);
        this.setSlidesTabIndex = this.setSlidesTabIndex.bind(this);
        this.lineNodeTranslatePropName = this.settings.vertical ? 'translateY' : 'translateX';
        this.severalSlidesChangingAfterDotClicked = false;
        this.createDivForScreenReader = this.createDivForScreenReader.bind(this);
        this.screenReaderTellsActiveSlideContent = this.screenReaderTellsActiveSlideContent.bind(this);
        this.handleHtml();
        this.setSize();
        this.createDivForScreenReader();
        if(this.settings.arrows) {
            this.addArrows();
        }
        if(this.settings.dots) {
            this.addDots();
        }
        this.setEvents();
        this.removeLineNodeTransitionDebounced = debounce(this.removeLineNodeTransition.bind(this), this.settings.timeBetweenSlides);
    }

    handleHtml() {
        this.containerNode.innerHTML = `
            <div class="${galleryWrapperClassName}">
                <div class="${lineNodeClassName} ${this.settings.vertical ? verticalLineNodeClassName : ''}">
                    ${this.containerNode.innerHTML}
                </div>
            </div>`
        this.containerNode.classList.add(galleryClassName);
        this.lineNode = this.containerNode.querySelector(`.${lineNodeClassName}`);
        this.galleryWrapper = this.containerNode.querySelector(`.${galleryWrapperClassName}`);
        this.slideNodes = Array.from(this.lineNode.children).map(node => {
            return wrapElementIntoDiv(slideClassName, node);
        });
        this.setSlidesTabIndex(true);
        if(!this.settings.vertical) {
            this.slideNodes.forEach(node => node.style.marginRight = `${this.settings.spaceBetweenSlides}px`)
        }else {
            this.slideNodes.forEach(node => node.style.marginBottom = `${this.settings.spaceBetweenSlides}px`)
        }
        const pictures = Array.from(this.containerNode.querySelectorAll('img'));
        pictures.forEach(e => e.setAttribute('draggable', 'false'));
    }

    setSize() {
        this.containerSizes = this.galleryWrapper.getBoundingClientRect();
        this.size = this.slideNodes.length;
        let lineNodePosition;
        this.slideNodes.forEach(slide => slide.style.overflow = 'hidden');
        if(!this.settings.vertical) {
            this.lineNode.style.width = ((this.containerSizes.width * this.size) + this.settings.spaceBetweenSlides * this.size) + 'px'
            this.slideNodes.forEach(slide => {
                slide.style.height = this.containerSizes.height + 'px';
                return slide.style.width = this.containerSizes.width + 'px'
            })
            this.maxDraggingValue = this.lineNode.getBoundingClientRect().width - (this.containerSizes.width + this.settings.spaceBetweenSlides)
            lineNodePosition = this.currentSlide * (this.containerSizes.width + this.settings.spaceBetweenSlides);
        }else {
            this.lineNode.style.height = ((this.containerSizes.height * this.size) + this.settings.spaceBetweenSlides * this.size) + 'px'
            this.slideNodes.forEach(slide => {
                slide.style.width = this.containerSizes.width + 'px';
                return slide.style.height = this.containerSizes.height + 'px'
            })
            this.maxDraggingValue = this.lineNode.getBoundingClientRect().height - (this.slideNodes[0].offsetHeight + this.settings.spaceBetweenSlides)
            lineNodePosition = this.currentSlide * (this.slideNodes[0].offsetHeight + this.settings.spaceBetweenSlides);
        }
        this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${-lineNodePosition}px)`
        this.initialLineNodePosition = -lineNodePosition;
    }

    setEvents() {
        window.addEventListener('resize', debounce(this.setSize, 400));
        this.lineNode.addEventListener('pointerdown', this.startDrag);
        if(this.dotsContainer || this.arrowsContainer) {
            this.containerNode.addEventListener('click', e => {
                if(e.target.classList.contains(dotName)) this.moveAfterDotClicked(e.target);
                if(e.target.classList.contains(prevArrowName)) {
                    this[prevArrowName].classList.add(clickedArrowName);
                    this.changeSlide('previous');
                    setTimeout(() => {
                        this[prevArrowName].classList.remove(clickedArrowName);
                    }, this.settings.timeBetweenSlides);
                }; 
                if(e.target.classList.contains(nextArrowName)) {
                    this[nextArrowName].classList.add(clickedArrowName);
                    this.changeSlide('next');
                    setTimeout(() => {
                        this[nextArrowName].classList.remove(clickedArrowName);
                    }, this.settings.timeBetweenSlides);
                }; 
            })
        }
    }

    startDrag() {
        if(event.target.classList.contains(arrowName)) return
        this.clickPosition = this.settings.vertical ?
            this.clickPosition = event.clientY :
            this.clickPosition = event.clientX;
        this.lineNode.classList.add('dragging');
        window.addEventListener('pointermove', this.dragging);
        window.addEventListener('pointerup', this.stopDrag);
    }

    dragging() {
        if(!this.settings.vertical) {
            this.shift = event.clientX - this.clickPosition;
        }else if(this.settings.vertical) {
            this.shift = event.clientY - this.clickPosition;
        }
        this.currentLineNodePosition = this.shift + this.initialLineNodePosition;
        if(this.currentLineNodePosition > 0 ||
            this.currentLineNodePosition < -this.maxDraggingValue) {
            this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${(this.shift / 5) + this.initialLineNodePosition}px)`;
            return
        }
        this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${this.currentLineNodePosition}px)`;
    }

    stopDrag() {
        window.removeEventListener('pointermove', this.dragging);
        window.removeEventListener('pointerup', this.stopDrag);
        this.lineNode.classList.remove('dragging');
        // if overflow left
        if(this.currentLineNodePosition > 0) {
            this.containerNode.style.pointerEvents = 'none';
            this.lineNode.style.transition = `all 0.5s`;
            this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(0px)`;
            this.initialLineNodePosition = 0;
            return setTimeout(() => {
                this.lineNode.style.removeProperty('transition');
                this.containerNode.style.removeProperty('pointer-events');
                this.currentLineNodePosition = 0;
                this.shift = 0;
            }, 500);
        }
        // if overflow right
        if(this.currentLineNodePosition < -this.maxDraggingValue) {
            this.containerNode.style.pointerEvents = 'none';
            this.lineNode.style.transition = `all 0.5s`;
            this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${-this.maxDraggingValue}px)`;
            this.initialLineNodePosition = -this.maxDraggingValue;
            return setTimeout(() => {
                this.lineNode.style.removeProperty('transition');
                this.containerNode.style.removeProperty('pointer-events');
                this.currentLineNodePosition = 0;
                this.shift = 0;
            }, 500); 
        }
        // if swipe was not enough to change slide
        if(this.shift < 50 && this.shift > -50) {
            this.lineNode.style.transition = `all 0.5s`;
            this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${this.initialLineNodePosition}px)`;
            this.shift = 0;
            return setTimeout(() => {
                this.lineNode.style.removeProperty('transition');
            }, 500); 
        }
        // next slide
        if(this.shift < 0) {
            this.shift = 0;
            return this.changeSlide('next');
        }
        // previous slide
        if(this.shift > 0) {
            this.shift = 0;
            return this.changeSlide('previous')
        }
    }

    changeSlide(slideToChangeWith) {
        if(slideToChangeWith === 'next') {
            if(this.currentSlide === this.size - 1) return
            this.lineNode.style.transition = `all ${this.settings.timeBetweenSlides/1000}s`;
            this.currentSlide += 1;
            const newPos = ((this.settings.vertical ?
                -this.containerSizes.height : -this.containerSizes.width) * this.currentSlide) 
                - (this.settings.spaceBetweenSlides * this.currentSlide);
            this.initialLineNodePosition = newPos;
            this.currentLineNodePosition = newPos;
            this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${newPos}px)`;
            this.setSlidesTabIndex();
            if(this.settings.arrows) {
                this.handleArrowsState();
            }
            if(this.settings.dots) {
                this.handleDotsState();
            }
            return this.removeLineNodeTransitionDebounced();
        }
        if(this.currentSlide === 0) return
        this.lineNode.style.transition = `all ${this.settings.timeBetweenSlides/1000}s`;
        this.currentSlide -= 1;
        const newPos = ((this.settings.vertical ?
            -this.containerSizes.height : -this.containerSizes.width) * this.currentSlide) 
            - (this.settings.spaceBetweenSlides * this.currentSlide);
        this.initialLineNodePosition = newPos;
        this.currentLineNodePosition = newPos;
        this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${newPos}px)`;
        this.setSlidesTabIndex();
        if(this.settings.arrows) {
            this.handleArrowsState();
        }
        if(this.settings.dots) {
            this.handleDotsState();
        }
        this.removeLineNodeTransitionDebounced();
    }

    addDots() {
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = dotsContainerName;
        this.dotsNodes = [];
        for (let i = 0; i < this.slideNodes.length; i++) {
            const dot = document.createElement('button');
            dot.className = dotName;
            if(this.settings.initialSlide === i) {
                dot.classList.add(activeDotName);
            }
            this.dotsNodes.push(dot);
            this.dotsContainer.append(dot);
        }
        // for accessibility start
        this.dotsNodes.forEach((node,index) => {
            node.setAttribute('aria-label', `slide ${index + 1}`);
            if(index !== this.currentSlide) {
                node.setAttribute('aria-pressed', `false`);
            }else {
                node.setAttribute('aria-pressed', `true`);
            }
        })
        this.dotsContainer.setAttribute('role', 'toolbar');
        // for accessibility finish
        this.containerNode.append(this.dotsContainer);
    }

    addArrows() {
        this.arrowsContainer = document.createElement('div');
        this.arrowsContainer.className = arrowsContainerName;
        // for accessibility start
        this.arrowsContainer.setAttribute('role', 'toolbar');
        this.arrowsContainer.setAttribute('aria-label', 'slider arrows');
        // for accessibility end
        this.containerNode.append(this.arrowsContainer);
        const createArrow = (classToAdd) => {
            this[classToAdd] = document.createElement('button');
            this[classToAdd].className = arrowName;
            this[classToAdd].classList.add(classToAdd);
            // for accessibility start
            if(classToAdd === 'gallery-arrow-prev') {
                this[classToAdd].setAttribute('aria-label', 'previous slide');
            }else {
                this[classToAdd].setAttribute('aria-label', 'next slide');
            } 
            // for accessibility end
            this.arrowsContainer.append(this[classToAdd]);
        }
        createArrow(prevArrowName);
        createArrow(nextArrowName);
        this.handleArrowsState();
    }

    handleArrowsState() {
        const isLastSlide = this.currentSlide === (this.size - 1);
        const isFirstSlide = this.currentSlide === 0;
        this[nextArrowName].setAttribute('aria-label', 'next slide');
        this[prevArrowName].setAttribute('aria-label', 'previous slide');
        if(isLastSlide) {
            return this[nextArrowName].setAttribute('aria-label', 'next slide. It is the last slide')
        }
        if(isFirstSlide) {
            return this[prevArrowName].setAttribute('aria-label', 'previous slide. It is the first slide')
        }
    }

    handleDotsState() {
        this.dotsNodes.forEach(node => {
            node.classList.remove(activeDotName);
            node.setAttribute('aria-pressed', 'false');
        })
        this.dotsNodes[this.currentSlide].classList.add(activeDotName);
        this.dotsNodes[this.currentSlide].setAttribute('aria-pressed', 'true');
    }

    moveAfterDotClicked(clickedDot) {
        let clickedDotIndex = this.dotsNodes.indexOf(clickedDot);
        let differenceBetweenIndexes = clickedDotIndex - this.currentSlide;
        // if we need to change slide with second or previous
        if(differenceBetweenIndexes === -1) return this.changeSlide('previous');
        if(differenceBetweenIndexes === 1) return this.changeSlide('next');
        // if there's at least one slide between current slide and slide to change with
        this.containerNode.style.pointerEvents = 'none';
        let transitionTime = this.settings.timeBetweenSlides * Math.abs(differenceBetweenIndexes);
        if(transitionTime > 3000) transitionTime = 3000;
        this.lineNode.style.transition = `all ${transitionTime/1000}s`;
        this.currentSlide += differenceBetweenIndexes;
        const newPos = ((this.settings.vertical ?
            -this.containerSizes.height : -this.containerSizes.width) * this.currentSlide) 
            - (this.settings.spaceBetweenSlides * this.currentSlide);
        this.initialLineNodePosition = newPos;
        this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${newPos}px)`;
        if(this.settings.arrows) {
            this.handleArrowsState();
        }
        if(this.settings.dots) {
            this.handleDotsState();
        }
        this.severalSlidesChangingAfterDotClicked = true;
        this.setSlidesTabIndex();
        setTimeout(() => {
            this.lineNode.style.removeProperty('transition');
            this.containerNode.style.removeProperty('pointer-events');
            this.severalSlidesChangingAfterDotClicked = false;
        }, transitionTime); 
    }

    removeLineNodeTransition() {
        if(this.severalSlidesChangingAfterDotClicked) return 
        this.lineNode.style.removeProperty('transition');
    }

    createDivForScreenReader() {
        this.screenReaderDiv = document.querySelector('.screen-reader-div');
        if(this.screenReaderDiv) return;
        this.screenReaderDiv = document.createElement("div");
        this.screenReaderDiv.style.position = 'fixed';
        this.screenReaderDiv.style.width = '0px';
        this.screenReaderDiv.style.height = '0px';
        this.screenReaderDiv.style.padding = '0px';
        this.screenReaderDiv.style.margin = '-1px';
        this.screenReaderDiv.style.overflow = 'hidden';
        this.screenReaderDiv.style.border = 'none';
        this.screenReaderDiv.style.fontSize = '0px';
        this.screenReaderDiv.className = 'screen-reader-div';
        this.screenReaderDiv.setAttribute('aria-live', 'assertive');
        document.body.appendChild(this.screenReaderDiv);
    }

    screenReaderTellsActiveSlideContent() {
        this.screenReaderDiv.innerHTML = this.slideNodes[this.currentSlide].innerHTML;
    }

    setSlidesTabIndex(firstCall = false) {
        this.slideNodes.forEach(el => {
            el.removeAttribute('tabindex');
            el.setAttribute('aria-hidden', 'true');
        });
        this.slideNodes[this.currentSlide].setAttribute('tabindex', '0');
        this.slideNodes[this.currentSlide].setAttribute('aria-hidden', 'false');
        if(!firstCall) {
            this.screenReaderTellsActiveSlideContent()
        }
    }

}

function wrapElementIntoDiv(divClass, el) {
    const wrapper = document.createElement('div');
    wrapper.className = divClass;
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    return wrapper
}

function debounce(clb, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(clb, delay, args);
    }
}