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