const lineNodeClassName = 'gallery-line';
const slideClassName = 'gallery-slide';
const galleryClassName = 'gallery';
const dotsContainerName = 'gallery-dots';
const dotName = 'gallery-dot';
const activeDotName = 'gallery-dot-active';

class Gallery {

    constructor(containerNode, options = {}) {
        this.settings = {
            spaceBetweenSlides: options.spaceBetweenSlides || 0,
            initialSlide: options.initialSlide || 0,
            dots: options.dots || false
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
        this.handleHtml();
        this.setSize();
        if(this.settings.dots) {
            this.addDots();
        }
        this.setEvents();
    }

    handleHtml() {
        this.containerNode.innerHTML = `
            <div class="${lineNodeClassName}">
                ${this.containerNode.innerHTML}
            </div>`
        this.containerNode.classList.add(galleryClassName);
        this.lineNode = this.containerNode.querySelector(`.${lineNodeClassName}`);
        this.slideNodes = Array.from(this.lineNode.children).map(node => {
            return wrapElementIntoDiv(slideClassName, node);
        });
        this.slideNodes.forEach(node => node.style.marginRight = `${this.settings.spaceBetweenSlides}px`)
        const pictures = Array.from(this.containerNode.querySelectorAll('img'));
        pictures.forEach(e => e.setAttribute('draggable', 'false'));
    }

    setSize() {
        this.containerSizes = this.containerNode.getBoundingClientRect();
        this.size = this.slideNodes.length;
        this.slideNodes.forEach(slide => {
            return slide.style.width = this.containerSizes.width + 'px'
        })
        this.lineNode.style.width = ((this.containerSizes.width * this.size) + this.settings.spaceBetweenSlides * this.size) + 'px'
        this.maxDraggingValue = this.lineNode.getBoundingClientRect().width - (this.containerSizes.width + this.settings.spaceBetweenSlides)
        const lineNodePosition = this.currentSlide * (this.containerSizes.width + this.settings.spaceBetweenSlides);
        this.lineNode.style.transform = `translateX(${-lineNodePosition}px)`
        this.initialLineNodePosition = -lineNodePosition;
    }

    setEvents() {
        window.addEventListener('resize', debounce(this.setSize, 400));
        this.lineNode.addEventListener('pointerdown', e => this.startDrag());
        if(this.dotsContainer) {
            this.dotsContainer.addEventListener('click', e => {
                if(e.target.classList.contains(dotName)) this.moveAfterDotClicked(e.target)
            })
        }
    }

    startDrag() {
        this.clickPosition = event.clientX;
        this.lineNode.classList.add('dragging');
        window.addEventListener('pointermove', this.dragging);
        window.addEventListener('pointerup', this.stopDrag);
    }

    dragging() {
        this.shift = event.clientX - this.clickPosition;
        this.currentLineNodePosition = this.shift + this.initialLineNodePosition;
        if(this.currentLineNodePosition > 0 ||
            this.currentLineNodePosition < -this.maxDraggingValue) {
            return this.lineNode.style.transform = `translateX(${(this.shift / 5) + this.initialLineNodePosition}px)`;
        }
        this.lineNode.style.transform = `translateX(${this.currentLineNodePosition}px)`;
    }

    stopDrag() {
        window.removeEventListener('pointermove', this.dragging);
        window.removeEventListener('pointerup', this.stopDrag);
        this.lineNode.classList.remove('dragging');
        // if overflow left
        if(this.currentLineNodePosition > 0) {
            this.lineNode.style.transition = "all 0.5s";
            this.lineNode.style.transform = `translateX(0px)`;
            this.initialLineNodePosition = 0;
            return setTimeout(() => {
                this.lineNode.style.removeProperty('transition');
            }, 500);
        }
        // if overflow right
        if(this.currentLineNodePosition < -this.maxDraggingValue) {
            this.lineNode.style.transition = "all 0.5s";
            this.lineNode.style.transform = `translateX(${-this.maxDraggingValue}px)`;
            this.initialLineNodePosition = -this.maxDraggingValue;
            return setTimeout(() => {
                this.lineNode.style.removeProperty('transition');
            }, 500); 
        }
        // if swipe was not enough to change slide
        if(this.shift < 50 && this.shift > -50) {
            this.lineNode.style.transition = "all 0.5s";
            this.lineNode.style.transform = `translateX(${this.initialLineNodePosition}px)`;
            return setTimeout(() => {
                this.lineNode.style.removeProperty('transition');
            }, 500); 
        }
        // next slide
        if(this.shift < 0) {
            return this.changeSlide('next');
        }
        // previous slide
        if(this.shift > 0) {
            return this.changeSlide('previous')
        }
    }

    changeSlide(slideToChangeWith) {
        this.lineNode.style.transition = "all 0.5s";
        this.containerNode.style.pointerEvents = 'none';
        if(slideToChangeWith === 'next') {
            this.currentSlide += 1;
            const newPos = (-this.containerSizes.width * this.currentSlide) - (this.settings.spaceBetweenSlides * this.currentSlide);
            this.initialLineNodePosition = newPos;
            this.lineNode.style.transform = `translateX(${newPos}px)`;
            if(this.dotsNodes) {
                this.dotsNodes.forEach(dot => {
                    dot.classList.remove(activeDotName);
                })
                this.dotsNodes[this.currentSlide].classList.add(activeDotName);
            }
            return setTimeout(() => {
                this.lineNode.style.removeProperty('transition');
                this.containerNode.style.removeProperty('pointer-events');
            }, 500); 
        }
        this.currentSlide -= 1;
        const newPos = (-this.containerSizes.width * this.currentSlide) - (this.settings.spaceBetweenSlides * this.currentSlide);
        this.initialLineNodePosition = newPos;
        this.lineNode.style.transform = `translateX(${newPos}px)`;
        if(this.dotsNodes) {
            this.dotsNodes.forEach(dot => {
                dot.classList.remove(activeDotName);
            })
            this.dotsNodes[this.currentSlide].classList.add(activeDotName);
        }
        setTimeout(() => {
            this.lineNode.style.removeProperty('transition');
            this.containerNode.style.removeProperty('pointer-events');
        }, 500); 
    }

    addDots() {
        // add dots container
        // add dots into dots container
        // listen dots container
        // move line node
        // if line node is moving through two or more slides, transition time should be longer
        // change active dot
        // if line node position is changing while dragging change active dot either
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
        let transitionTime = 0.5 * Math.abs(differenceBetweenIndexes);
        if(transitionTime > 2) transitionTime = 2;
        this.lineNode.style.transition = `all ${transitionTime}s`;
        this.containerNode.style.pointerEvents = 'none';
        this.currentSlide += differenceBetweenIndexes;
        const newPos = (-this.containerSizes.width * this.currentSlide) - (this.settings.spaceBetweenSlides * this.currentSlide);
        this.initialLineNodePosition = newPos;
        this.lineNode.style.transform = `translateX(${newPos}px)`;
        setTimeout(() => {
            this.lineNode.style.removeProperty('transition');
            this.containerNode.style.removeProperty('pointer-events');
        }, (transitionTime * 1000)); 
    }

}

const firstSlider = new Gallery('#landscape-slider',
    {
        spaceBetweenSlides: 50,
        initialSlide: 2,
        dots: true,
    }
 );

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
