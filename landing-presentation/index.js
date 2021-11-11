const header = document.querySelector('.header');

document.addEventListener('click', e => {
    if(e.target.id === 'burger' || e.target.closest('#burger')) {
        header.classList.toggle('menu-opened');
    }
})

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
    vertical: true,
});