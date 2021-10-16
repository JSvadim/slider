const lineNodeClassName = 'gallery-line';
const slideClassName = 'gallery-slide';


class Gallery {
    constructor(containerNode, options = {}) {
        this.containerNode = document.querySelector(containerNode);
        this.initialLineNodePosition = 0;
        this.handleHtml = this.handleHtml.bind(this);
        this.setSize = this.setSize.bind(this);
        this.setEvents = this.setEvents.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.dragging = this.dragging.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
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
        this.size = this.slideNodes.length;
        this.slideNodes.forEach(slide => {
            return slide.style.width = this.containerNode.getBoundingClientRect().width + 'px'
        })
        this.lineNode.style.width = this.containerNode.getBoundingClientRect().width * this.size + 'px'
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
        this.lineNode.style.transform = `translateX(${this.shift + this.initialLineNodePosition}px)`;
    }

    stopDrag() {
        this.initialLineNodePosition += this.shift;
        window.removeEventListener('pointermove', this.dragging);
        window.removeEventListener('pointerup', this.stopDrag);
        document.body.style.removeProperty('cursor');
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
