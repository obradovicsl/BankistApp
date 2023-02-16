'use strict';

///////////////////////////////////////
// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

btnScrollTo.addEventListener('click', function (e) {
  /*
    getBoundingClientReact() - metoda koja vraca objekat u kome se nalaze informacije o polozaju elementa, nad kojim je pozvana, na strani
    npr imamo x: i y: polje, koje nam govore koliko je dati element udaljen horizontalno i vertikalno od viewport-a
  */
  const s1coords = section1.getBoundingClientRect();
  console.log(s1coords);

  // console.log(e.target.getBoundingClientRect());

  /*
    window.pageXOffset i window.pageYOffset - brojevi koji oznacavaju gde se nalazimo na stranici(dokle smo skrolovali), (porede vrh stranice sa trenutnim viewportom)
  */
  // console.log(window.pageXOffset, window.pageYOffset);

  /*
    sirina i visina viewporta - jedan pojedinacan broj
  */
  // console.log(document.documentElement.clientHeight, document.documentElement.clientWidth);

  /*
    scrollTo
    skroluje na zadate koordinate - u ovom slucaju prosledjene left i top vrednosti se stalno menjaju u zavisnosti od polozaja viewporta u odnosu na section1, tako da moramo da dodamo trenutni skrol(ako smo skrolovali 100 na dole onda se i section1.top pomerio/smanjio za 100, tako da moramo da na taj broj section1.top da dodamo trenutni skroll)
  */
  //window.scrollTo(s1coords.left + window.pageXOffset, s1coords.top + window.pageYOffset);

  //Ukoliko zelimo 'smooth' skrol(da se ne dogodi instant), u scrollTo metodu prosledjujemo objekat

  //OLD SCHOOL NACIN
  window.scrollTo({
    left: s1coords.left + window.pageXOffset,
    top: s1coords.top + window.pageYOffset,
    behavior: 'smooth'
  });

  //MODERAN NACIN
  section1.scrollIntoView({ behavior: 'smooth' });
});



//Navigation 


/*
  Na ovaj nacin 'zakacimo' eventListener na svaki link pojedinacno - pravimo nepotrebne kopije. Da imamo 10.000 elemenata, imali bi 10.000 kopija, pametnije resenje je da 
  zakacimo JEDAN eventListener na 'parent element' od svih nama vaznih elemenata
  I onda zbog bubbling efekta, klik na bilo koji od linkova, ce trigerovati funkciju koju zakacimo na listener na parent el.  
*/

//POGRESAN NACIN - PRAVIMO NEPOTREBNIH N KOPIJA LISTENERA
// document.querySelectorAll('.nav__link').forEach(link => link.addEventListener('click', function (e) {
//   e.preventDefault();
//   const id = this.getAttribute('href');
//   document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
// }));

//POSTOJI SAMO JEDAN EVENT LISTENER
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

//Tabbed

const tabsContainer = document.querySelector('.operations__tab-container');
const tabs = [...document.querySelectorAll('.operations__tab')];
const tabsContent = [...document.querySelectorAll('.operations__content')];
let activeTab = 1;

tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');
  if (clicked.classList.contains('operations__tab')) {

    tabs[activeTab - 1].classList.remove('operations__tab--active');
    tabsContent[activeTab - 1].classList.remove('operations__content--active');

    activeTab = clicked.getAttribute('data-tab');
    tabs[activeTab - 1].classList.add('operations__tab--active');
    tabsContent[activeTab - 1].classList.add('operations__content--active');
  }
});

//Menu fade animation
const links = [...document.querySelectorAll('.nav__link')];
const nav = document.querySelector('.nav');
const linksContainer = document.querySelector('.nav__links');

const handlerFunction = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = [...link.closest('.nav').querySelectorAll('.nav__link')];
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el != link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
}

linksContainer.addEventListener('mouseover', handlerFunction.bind(0.5));
linksContainer.addEventListener('mouseout', handlerFunction.bind(1));

//Sticky nav bar

/*
  prvi nacin je da sa eventListenerom 'slusamo' SCROLL event, i kada korisnik skroluje do pocetka sekcije1, onda zakacimo klasu .sticky, na nav element. 
  Ali problem sa ovim jeste to sto se na svaki skrol aktivira eventListener i funkcija - lose performanse. 

  tako da koristimo drugi nacin - IntersectionObserverAPI
  IO pokrece funkciju iskljucivo kada se desi ono sto nama treba(kako mu zadamo)
*/

//call back funkcija koju prosledjujemo konstruktoru IO, prima polje entries - za svaki threshold koji smo definisali u objektu options po jedan entry.

const stickyNav = function (entries) {
  const [entry] = entries;
  if (entry.isIntersecting === false) {
    nav.classList.add('sticky');
  } else {
    nav.classList.remove('sticky');
  }
}
//root: null - znaci da se posmatra preklapanje sa viewportom
//threshold: 0-1(0-100%) - to je procenat preklapanja koji je potreban da se pokrene f-ja
//rootMargin: - ukoliko zelimo da se f-ja pokrene pre nego sto se dodje do threshholda
// na primer zelimo da se slike krenu ucitavati pre nego sto dodjemo do njih(sam threshold je ogranicavajuci jer ide od '0-100%', ne mozemo njegovim podesavanjem da odredimo da se funkcija pozove pre nego sto se preklopi)
const options = {
  root: null,
  threshold: 0,
  rootMargin: `-${nav.getBoundingClientRect().height}px`
}

//prosledjujemo callback f-ju i options objekat
const headerObserver = new IntersectionObserver(stickyNav, options);

const header = document.querySelector('.header  ');

//Nad IO koji smo napravili pozivamo observe metodu, i prosledjujemo target element - element za koji zelimo da posmatramo preklapanje
headerObserver.observe(header);

//Reveal sections

const allSections = document.querySelectorAll('.section');

const revealSection = function (entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  sectionObserver.unobserve(entry.target);
}

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15
});

allSections.forEach(section => {
  section.classList.add('section--hidden');
  sectionObserver.observe(section);
});

//lazy loading images

/*
  Neki korisnici imaju spor internet, ili spor telefon, tako da bi slike visoke rezolucije oduzimale mnogo vremena prilikom ucitavanja.

  Ukoliko stavimo na pocetku slike male rezolucije koje se brzo ucitavaju(i preko njih blur filter da se ne primeti da su niske rezolucije), i onda kada korisnik skroluje do njih, zamenimo te male slike sa slikama originalne rezolucije, dobijamo bolje performanse - korisnici sa slabim internetom ce lako ucitati sajt, i tek u pozadini ucitati slike visoke rezolucije
*/

const images = document.querySelectorAll('.features__img');
console.log(images);
const lazyLoad = function (entries) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  imageObserver.unobserve(entry.target);

  /*
  Kada se izvrsi entry.target.src = entry.target.dataset.src;
  JS u pozadini menja slike, i kada se zamenska slika do kraja ucita, aktivira se
  event - 'load', i mi zatim zakacimo na sliku eventListener koji ceka da se slika 
  do kraja ucita, i onda skida klasu ('lazy-img') (blur)
  Podsecanje - unutar callBack funkcije entry.target je dostupan zbog klauzule
  */
  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });
}
const imageObserver = new IntersectionObserver(lazyLoad, {
  root: null,
  threshold: 0,
  rootMargin: '200px' //ucitavanje slike krece pre nego sto se skroluje do nje
});

images.forEach(img => imageObserver.observe(img));


//Slider

const slider = document.querySelector('.slider');
const slides = [...document.querySelectorAll('.slide')];
const dotsContainer = document.querySelector('.dots');

const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');

let currSlide = 0;
const maxSlide = slides.length;


//FUNCTIONS

const createDots = function () {
  slides.forEach((_, i) => {
    dotsContainer.insertAdjacentHTML('beforeend', `<button class="dots__dot" data-slide="${i}"> </button>`);
  });
}

const showActiveDot = function (slide) {
  document.querySelectorAll('.dots__dot').forEach(dot => dot.classList.remove('dots__dot--active'));
  document.querySelector(`.dots__dot[data-slide="${slide}"]`).classList.add('dots__dot--active');
}

const moveSlide = function (currSlide) {
  slides.forEach((slide, i) => {
    slide.style.transform = `translateX(${100 * (i - currSlide)}%)`;
  });
  showActiveDot(currSlide);
}

const nextSlide = function () {
  if (currSlide === maxSlide - 1) {
    currSlide = 0;
  } else {
    currSlide++;
  }
  moveSlide(currSlide);
}

const prevSlide = function () {
  if (currSlide === 0) {
    currSlide = maxSlide - 1;
  } else {
    currSlide--;
  }
  moveSlide(currSlide);
}


const init = function () {
  createDots();
  moveSlide(0);
  // showActiveDot(0);
}
init();
//EVENT LISTENERS

//BUTTONS
btnRight.addEventListener('click', nextSlide);
btnLeft.addEventListener('click', prevSlide);

//KEYBOARD
document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft') {
    prevSlide();
  }
  if (e.key === 'ArrowRight') {
    nextSlide();
  }
});

//DOTS
dotsContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('dots__dot')) {
    moveSlide(e.target.dataset.slide);
    showActiveDot(e.target.dataset.slide);
  }
});















///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

/*
document.documentElement nam daje ceo HTML element
<html>
<head>...</head>
<body>...</body>
</html>
// */
// console.log(document.documentElement);
// console.log(document.head); // daje nam <head>...</head> el
// console.log(document.body); // daje nam <body>...</body> el

// const header = document.querySelector('.header'); //vraca nam trazeni element(prvi)
// const allSections = document.querySelectorAll('.section');//vraca sve trazene el(Nodelist)
// //NodeList nije isto sto i Array, fali dosta metoda koje su dostupne nad array tipom.

// console.log(document.getElementById('id-1'));
// /*
//   vraca sve trazene elemente, ali u HTMLCollection tipu, sto se razlikuje od NodeList-e
//   po tome, sto je 'live', odnosno kada se desi promena, odmah bude registrovana u kolekciji. Na primer ako obrisemo neki element sa stranice(koji se nalazi u kolekciji), on ce automatski biti obrisan i iz kolekcije) 
// */
// const allButtons = document.getElementsByTagName('button');
// const btns = document.getElementsByClassName('btn'); //vraca sve trazene el-HTMLCollection


// //Creating and inserting elements

// //Prvo 'napravimo' element koji zelimo da dodamo na stranicu, zatim ga 'zakacimo' na zeljeni element(odredimo gde tacno zelimo da se nadje), i to je to
// // const el = `< div class="klasa" > Kontent</div > `;
// // header.insertAdjacentHTML('afterbegin', el);

// /*
// createElement kreira DOM element(objekat), koji i dalje nije u DOM Tree, vec moramo manuelno da ga ubacimo
// nad napravljenim elementom mozemo pozivati Node metode
// */
// const message = document.createElement('div');
// message.classList.add('cookie-message');
// // message.textContent = 'We use cookies for improved functionality and analytics';
// message.innerHTML = 'We use cookies for improved functionality and analytics <button class="btn btn--close-cookie ">Got it!</button>';

// header.append(message);

// /*
//   prepend - dodaje prosledjeni element kao 'first child' elementa nad kojim se poziva
//   append - dodaje prosledjeni element kao 'last child' elementa nad kojim se poziva

//   message je jedan objekat koji postoji u DOM-u, tako da na sledeci nacin
//     header.prepend(message);
//     header.append(message);
//   message ce biti dodat na pocetak, pa premesten na kraj
//   Ukoliko zelimo da bude i na pocetku i na kraju, moramo da "kloniramo" element
//     header.prepend(message);
//     header.append(message.cloneNode(true)); //true - svi child el. ce biti klonirani

//     (pored append i prepend, postoje i before i after metode)
// */


// //Delete elements
// /*
//   remove metoda - relativno nova metoda - pre nje mogli smo da brisemo samo child el.
//   tako da smo morali prvo da selektujemo parent el, pa tek onda obrisemo zeljeni el
//   message.parentElement.removeChild(message); //ovako se nekada radilo
// */

// //message.remove()


// //Styles

// message.style.backgroundColor = '#37383d';
// message.style.width = '120%';

// console.log(message.style.width); //Na ovaj nacin mozemo da dobijemo samo one 'stilove' koje smo sami dodali('inline'), ne mozemo da dobijemo stilove koji su u css fajlu

// console.log(getComputedStyle(message).color); //sa getComputedStyle mozemo da dobijemo bilo koji 'stil' koji je primenjen na prosledjeni element

// message.style.height = Number.parseFloat(getComputedStyle(message).height) + 30 + 'px';

// document.documentElement.style.setProperty('--color-primary', 'orangered');


// //Atributes

// const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// const randomColor = () => `rgb(${ randomInt(0, 255) }, ${ randomInt(0, 255) }, ${ randomInt(0, 255) })`;



// document.querySelector('.nav__link').addEventListener('click', function (e) {
//   e.preventDefault();
//   this.style.backgroundColor = randomColor();
//   console.log('LINK', e.target, e.currentTarget);
//   /*
//     e.target - element na kom se DESIO event
//     e.currentTarget - element koji je trenutno trigerovan (isti kao this keyword)  
//   */
//   e.stopPropagation(); //zaustavlja event propagaciju
// }, true); //ovaj treci parametar addEventListener metode, nam govori da li zelimo da trigerujemo 
// // funkciju u prvoj(capturing phase - true) ili u trecoj(bubbling phase - false - default)

// document.querySelector('.nav__links').addEventListener('click', function (e) {
//   e.preventDefault();
//   this.style.backgroundColor = randomColor();
//   console.log('LINKS', e.target);
// });

// document.querySelector('.nav').addEventListener('click', function (e) {
//   e.preventDefault();

//   this.style.backgroundColor = randomColor();
//   console.log('NAV', e.target);

// });