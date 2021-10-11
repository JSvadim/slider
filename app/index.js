const lineNodeClassName = 'gallery-line';
const slideClassName = 'gallery-slide';


class Gallery {
    constructor(containerNode, options = {}) {
        this.containerNode = document.querySelector(containerNode);
        this.handleHtml = this.handleHtml.bind(this);
        this.setSize = this.setSize.bind(this);
        this.setEvents = this.setEvents.bind(this);
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
        console.log(this.slideNodes)
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
        this.clickPos = event.clientX;
        console.log(this.clickPos);
        window.addEventListener('pointermove', e => this.dragging());
    }
}

const firstSlider = new Gallery('#landscape-slider');

function wrapElementIntoDiv(divClass, el) {
    const slideNode = document.createElement('div');
    slideNode.className = divClass;
    el.parentNode.insertBefore(slideNode, el);
    slideNode.appendChild(el);
    return slideNode
}
