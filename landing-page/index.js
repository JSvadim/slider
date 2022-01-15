const header = document.querySelector(".header");
const headerMenuItems = document.querySelectorAll(".header__menu-item");
const headerBurgerButton = document.querySelector(".header__burger-btn");

document.addEventListener("click", e => {
    if(e.target.classList.contains("header__burger-btn")) {
        return toggleBurgerMenu();
    }
    if(e.target.classList.contains("header__menu-link")) {
        e.preventDefault();
        if(header.classList.contains("burger-active")) {
            toggleBurgerMenu();
            return setTimeout(() => {
                smoothScroll(e.target, e);
            }, 500);
        }
        smoothScroll(e.target, e);
    }
})

let lastScrollPos = 0;
document.addEventListener("scroll", e => {
    if(lastScrollPos < window.scrollY) {
        header.classList.add('visible');
        return lastScrollPos = window.scrollY
    }
    if(lastScrollPos > window.scrollY) {
        header.classList.remove('visible');
        lastScrollPos = window.scrollY;
    }
})

const smoothScroll = function(element, event) {
	let isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;
	if(isSmoothScrollSupported) {
		if(event) {
			event.preventDefault();
		}
		document.querySelector(element.getAttribute('href')).scrollIntoView({behavior: "smooth", block: "start"});    
	}
};

function toggleBurgerMenu() {
    freezeBurgerBtn(1000);
    if(header.classList.contains("burger-active")) {
        header.classList.remove("burger-active");
        document.body.classList.remove("lock");
        return  animateMenuItems(500, false);

    }
    header.classList.add("burger-active");
    document.body.classList.add("lock");
    animateMenuItems(500);
}

function freezeBurgerBtn(freezeTime) {
    headerBurgerButton.style.pointerEvents = "none";
    setTimeout(() => {
        headerBurgerButton.style.removeProperty("pointer-events")
    }, freezeTime);
}

function animateMenuItems(startingTime, isAnimating = true ) {
    if(!isAnimating) {
        return setTimeout(() => {
            headerMenuItems.forEach(item => {
                item.style.removeProperty("animation-name");
                item.style.removeProperty("animation-duration");
                item.style.removeProperty("animation-delay");
                item.style.removeProperty("animation-fill-mode");
            })
        }, startingTime)
    }
    for (let i = 0; i < headerMenuItems.length; i++) {
        const item = headerMenuItems[i];
        item.style.animationName = "header-menu-item";
        item.style.animationDuration = "0.5s";
        item.style.animationDelay = startingTime/1000 + (0.3 * i) + "s";
        item.style.animationFillMode = "forwards";
    }
}


//SLIDERS INITIALIZING START
const sliderSpaceBetween = new Gallery("#spaceBetween", {
    spaceBetweenSlides: 20,
    arrows: true,
    timeBetweenSlides: 1000,
});
const screenReader = new Gallery("#screenReader", {
    spaceBetweenSlides: 20,
    arrows: true,
    dots: true,
    timeBetweenSlides: 1000,
    initialSlide: 2,
});
const sliderVerticalAlign = new Gallery("#verticalAlign", {
    spaceBetweenSlides: 30,
    vertical: true,
    arrows: true,
    timeBetweenSlides: 1000,
});
const sliderDots = new Gallery("#dots", {
    spaceBetweenSlides: 30,
    dots: true,
});
//SLIDERS INITIALIZING END


const animatedItems = document.querySelectorAll('[data-scroll]');
const animatedClassAdderOptions = {rootMargin: '0px 0px -100px 0px',};

const animatedClassAdder = new IntersectionObserver(function(animatedItems, animatedClassAdderOptions) {
    animatedItems.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('scroll-animated');
            animatedClassAdder.unobserve(entry.target);
        }
    });
}, animatedClassAdderOptions);

animatedItems.forEach( item => animatedClassAdder.observe(item));