const galleryClassName = 'gallery';
const lineNodeClassName = 'gallery-line';
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

    constructor(containerNode, options = {}) {
        this.settings = {
            spaceBetweenSlides: options.spaceBetweenSlides || 0,
            initialSlide: options.initialSlide || 0,
            dots: options.dots || false,
            arrows: options.arrows || false,
            timeBetweenSlides: options.timeBetweenSlides || 500,
            vertical: options.vertical || false
        }
        this.containerNode = document.querySelector(containerNode);
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
        this.moveAfterDotClicked = this.moveAfterDotClicked.bind(this);
        this.addArrows = this.addArrows.bind(this);
        this.lineNodeTranslatePropName = this.settings.vertical ? 'translateY' : 'translateX';
        this.severalSlidesChangingAfterDotClicked = false;
        this.handleHtml();
        this.setSize();
        if(this.settings.dots) {
            this.addDots();
        }
        if(this.settings.arrows) {
            this.addArrows();
        }
        this.setEvents();
        this.removeLineNodeTransitionDebounced = debounce(this.removeLineNodeTransition.bind(this), this.settings.timeBetweenSlides);
    }

    handleHtml() {
        this.containerNode.innerHTML = `
            <div class="${lineNodeClassName} ${this.settings.vertical ? verticalLineNodeClassName : ''}">
                ${this.containerNode.innerHTML}
            </div>`
        this.containerNode.classList.add(galleryClassName);
        this.lineNode = this.containerNode.querySelector(`.${lineNodeClassName}`);
        this.slideNodes = Array.from(this.lineNode.children).map(node => {
            return wrapElementIntoDiv(slideClassName, node);
        });
        if(!this.settings.vertical) {
            this.slideNodes.forEach(node => node.style.marginRight = `${this.settings.spaceBetweenSlides}px`)
        }else {
            this.slideNodes.forEach(node => node.style.marginBottom = `${this.settings.spaceBetweenSlides}px`)
        }
        const pictures = Array.from(this.containerNode.querySelectorAll('img'));
        pictures.forEach(e => e.setAttribute('draggable', 'false'));
    }

    setSize() {
        this.containerSizes = this.containerNode.getBoundingClientRect();
        console.log(this.containerNode.offsetWidth);
        console.log(this.containerSizes);
        this.size = this.slideNodes.length;
        let lineNodePosition;
        if(!this.settings.vertical) {
            this.lineNode.style.width = ((this.containerSizes.width * this.size) + this.settings.spaceBetweenSlides * this.size) + 'px'
            this.maxDraggingValue = this.lineNode.getBoundingClientRect().width - (this.containerSizes.width + this.settings.spaceBetweenSlides)
            lineNodePosition = this.currentSlide * (this.containerSizes.width + this.settings.spaceBetweenSlides);
        }else {
            this.containerNode.style.height = `${this.slideNodes[0].offsetHeight}px`
            this.containerSizes = this.containerNode.getBoundingClientRect();
            this.maxDraggingValue = this.lineNode.getBoundingClientRect().height - (this.slideNodes[0].offsetHeight + this.settings.spaceBetweenSlides)
            lineNodePosition = this.currentSlide * (this.slideNodes[0].offsetHeight + this.settings.spaceBetweenSlides);
        }
        this.slideNodes.forEach(slide => {
            return slide.style.width = this.containerSizes.width + 'px'
        })
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
            if(this.dotsNodes) {
                this.dotsNodes.forEach(dot => {
                    dot.classList.remove(activeDotName);
                })
                this.dotsNodes[this.currentSlide].classList.add(activeDotName);
            }
            this.handleArrowsState();
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
        if(this.dotsNodes) {
            this.dotsNodes.forEach(dot => {
                dot.classList.remove(activeDotName);
            })
            this.dotsNodes[this.currentSlide].classList.add(activeDotName);
        }
        this.handleArrowsState();
        this.removeLineNodeTransitionDebounced();
    }

    addDots() {
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = dotsContainerName;
        this.dotsNodes = [];
        for (let i = 0; i < this.slideNodes.length; i++) {
            const dot = document.createElement('div');
            dot.className = dotName;
            if(this.settings.initialSlide === i) {
                dot.classList.add(activeDotName);
            }
            this.dotsNodes.push(dot);
            this.dotsContainer.append(dot);
        }
        this.containerNode.append(this.dotsContainer);
    }

    addArrows() {
        this.arrowsContainer = document.createElement('div');
        this.arrowsContainer.className = arrowsContainerName;
        this.containerNode.append(this.arrowsContainer);
        const createArrow = (classToAdd) => {
           this[classToAdd] = document.createElement('div');
           this[classToAdd].className = arrowName;
           this[classToAdd].classList.add(classToAdd);
           this.arrowsContainer.append(this[classToAdd]);
        }
        createArrow(prevArrowName);
        createArrow(nextArrowName);
        this.handleArrowsState();
    }

    handleArrowsState() {
        const isLastSlide = this.currentSlide === (this.size - 1);
        const isFirstSlide = this.currentSlide === 0;
        this[nextArrowName].classList.remove(disabledArrowName);
        this[prevArrowName].classList.remove(disabledArrowName);
        if(isLastSlide) {
            return this[nextArrowName].classList.add(disabledArrowName);
        }
        if(isFirstSlide) {
            this[prevArrowName].classList.add(disabledArrowName)
        }
    }

    moveAfterDotClicked(clickedDot) {
        let clickedDotIndex;
        for (let i = 0; i < this.dotsNodes.length; i++) {
            const dot = this.dotsNodes[i];
            if(dot === clickedDot) {
                clickedDotIndex = i
                break
            }
        }
        this.dotsNodes.forEach(node => {
            node.classList.remove(activeDotName);
        })
        this.dotsNodes[clickedDotIndex].classList.add(activeDotName);
        let differenceBetweenIndexes = clickedDotIndex - this.currentSlide;
        // if we need to change slide with second or previous
        if(differenceBetweenIndexes === -1) return this.changeSlide('previous');
        if(differenceBetweenIndexes === 1) return this.changeSlide('next');
        // if there's at least one slide between current slide and slide to change with
        this.containerNode.style.pointerEvents = 'none';
        let transitionTime = this.settings.timeBetweenSlides * Math.abs(differenceBetweenIndexes);
        if(transitionTime > 3) transitionTime = 3;
        this.lineNode.style.transition = `all ${transitionTime}s`;
        this.currentSlide += differenceBetweenIndexes;
        const newPos = ((this.settings.vertical ?
            -this.containerSizes.height : -this.containerSizes.width) * this.currentSlide) 
            - (this.settings.spaceBetweenSlides * this.currentSlide);
        this.initialLineNodePosition = newPos;
        this.lineNode.style.transform = `${this.lineNodeTranslatePropName}(${newPos}px)`;
        this.handleArrowsState();
        this.severalSlidesChangingAfterDotClicked = true;
        setTimeout(() => {
            this.lineNode.style.removeProperty('transition');
            this.containerNode.style.removeProperty('pointer-events');
            this.severalSlidesChangingAfterDotClicked = false;
        }, (transitionTime * 1000)); 
    }

    removeLineNodeTransition() {
        if(this.severalSlidesChangingAfterDotClicked) return 
        this.lineNode.style.removeProperty('transition');
        console.log('fired');
    }
}

const firstSlider = new Gallery('#landscape-slider',
    {
        spaceBetweenSlides: 50,
        initialSlide: 0,
        dots: true,
        arrows: true,
        timeBetweenSlides: 1000,
    });

const verticalSlider = new Gallery('#vertical-slider',
    {
        spaceBetweenSlides: 20,
        initialSlide: 2,
        dots: true,
        arrows: true,
        timeBetweenSlides: 500,
        vertical: true,
    });

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

// trying to get familiar with working with few branches :)