const lineNodeClassName = 'gallery-line';
const slideClassName = 'gallery-slide';


class Gallery {
    constructor(containerNode, options = {}) {
        this.containerNode = document.querySelector(containerNode);
        this.currentSlide = 0;
        this.initialLineNodePosition = 0;
        this.handleHtml = this.handleHtml.bind(this);
        this.setSize = this.setSize.bind(this);
        this.setEvents = this.setEvents.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.dragging = this.dragging.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.changeSlide = this.changeSlide.bind(this);
        this.handleHtml();
        this.setSize();
        this.setEvents();
    }

    handleHtml() {
        this.containerNode.innerHTML = `
            <div class="${lineNodeClassName}">
                ${this.containerNode.innerHTML}
            </div>
        `
        this.lineNode = this.containerNode.querySelector(`.${lineNodeClassName}`);
        this.slideNodes = Array.from(this.lineNode.children).map(node => {
            return wrapElementIntoDiv(slideClassName, node);
        });
        const pictures = Array.from(this.containerNode.querySelectorAll('img'));
        pictures.forEach(e => e.setAttribute('draggable', 'false'));
    }

    setSize() {
        this.containerSizes = this.containerNode.getBoundingClientRect();
        this.size = this.slideNodes.length;
        this.slideNodes.forEach(slide => {
            return slide.style.width = this.containerSizes.width + 'px'
        })
        this.lineNode.style.width = this.containerSizes.width * this.size + 'px'
        this.maxDraggingValue = this.lineNode.getBoundingClientRect().width - this.containerSizes.width
    }

    setEvents() {
        window.addEventListener('resize', e => this.setSize());
        this.lineNode.addEventListener('pointerdown', e => this.startDrag());

    }

    startDrag() {
        this.clickPosition = event.clientX;
        window.addEventListener('pointermove', this.dragging);
        window.addEventListener('pointerup', this.stopDrag);
        document.body.style.cursor = 'grab';
    }

    dragging() {
        this.shift = event.clientX - this.clickPosition;
        this.currentLineNodePosition = this.shift + this.initialLineNodePosition;
        if(this.currentLineNodePosition > 0 ||
            this.currentLineNodePosition < -this.maxDraggingValue) {
            return this.lineNode.style.transform = `translateX(${(this.shift / 5) + this.initialLineNodePosition}px)`;
        }
        this.lineNode.style.transform = `translateX(${this.currentLineNodePosition}px)`;
        console.log(this.shift)
    }

    stopDrag() {
        window.removeEventListener('pointermove', this.dragging);
        window.removeEventListener('pointerup', this.stopDrag);
        document.body.style.removeProperty('cursor');
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
        if(slideToChangeWith === 'next') {
            this.currentSlide += 1;
            const newPos = -this.containerSizes.width * this.currentSlide;
            this.initialLineNodePosition = newPos;
            this.lineNode.style.transform = `translateX(${newPos}px)`;
            return setTimeout(() => {
                this.lineNode.style.removeProperty('transition');
            }, 500); 
        }
        this.currentSlide -= 1;
        const newPos = -this.containerSizes.width * this.currentSlide;
        this.initialLineNodePosition = newPos;
        this.lineNode.style.transform = `translateX(${newPos}px)`;
        setTimeout(() => {
            this.lineNode.style.removeProperty('transition');
        }, 500); 
    }
}

const firstSlider = new Gallery('#landscape-slider');

function wrapElementIntoDiv(divClass, el) {
    const wrapper = document.createElement('div');
    wrapper.className = divClass;
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    return wrapper
}
