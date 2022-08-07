import { getCar } from './api';
import { state, ICarData } from './store';
import carImg from '../img/car.svg';
import flagImg from '../img/finish.svg';

const body = document.querySelector('body') as HTMLElement;
const LIMIT_CARS = 7;
const LIMIT_WINNERS = 10;

export const createPage = () => {
  body.innerHTML =
  `<section>
    <div class="tabs">
      <div class="tabs__nav tabs-nav">
        <div class="tabs-nav__item is-active" data-tab="tab-first">TO GARAGE</div>
        <div class="tabs-nav__item" data-tab="tab-second">TO WINNERS</div>
      </div>
      <div class="tabs__content">
        <div class="tab is-active tab-first">
          <div class="menu">
            <div class="menu__create">
              <input class="create-input-text" type="text" autocomplete="off" placeholder="Auto">
              <input class="create-input-color" type="color">
              <button class="btn create-btn btn-reset">CREATE</button>
            </div>
            <div class="menu__change">
              <input class="update-input-text" type="text" autocomplete="off" disabled>
              <input class="update-input-color" type="color" disabled>
              <button class="btn update-btn btn-reset" disabled data-carId="">UPDATE</button>
            </div>
            <div class="menu__btns">
              <button class="btn race-btn btn-reset">RACE</button>
              <button class="btn reset-btn btn-reset">RESET</button>
              <button class="btn generate-btn btn-reset">GENERATE CARS</button>
            </div>
          </div>
          <div class="garage-info">
            <h1 class="garage-info__title">Garage (<span class="garage-length">${state.carsCount}</span>)</h1>
            <h2 class="garage-info__subtitle">Page #<span class="page-num">${state.garagePage}</span></h2>
          </div>
          <div class="cars"></div>
          <div class="garage-nav">
            <button class="arrow-pagin left-item" disabled>PREW</button>
            <button class="arrow-pagin right-item">NEXT</button>
          </div>
        </div>
        <div class="tab tab-second">
          <div class="winners-info">
            <h1 class="winners-info__title">Winners (<span class="winners-length">1</span>)</h1>
            <h2 class="winners-info__subtitle">Page #<span class="winners-page">1</span></h2>
          </div>
          <table class="winners-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Car</th>
                <th>Name</th>
                <th class="sort-by-win">Wins</th>
                <th class="sort-by-time">Best time(s)</th>
              </tr>
            </thead>
            <tbody class="winners-table__body">
            </tbody>
          </table>
          <div class="winners-nav">
            <button class="arrow-pagin win-left" disabled>PREW</button>
            <button class="arrow-pagin win-right">NEXT</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  <span class="message"></span>`
}

export const changeTab = () => {
	const tabNav = document.querySelectorAll('.tabs-nav__item'),
				tabContent = document.querySelectorAll('.tab');
	let tabName;

	tabNav.forEach(item => {
		item.addEventListener('click', selectTabNav)
	});

	function selectTabNav(e: Event) {
		tabNav.forEach(item => {
			item.classList.remove('is-active');
		});
	
		(e.target as HTMLElement).classList.add('is-active');
		tabName = (e.target as HTMLElement).getAttribute('data-tab');
		selectTabContent(tabName as string);
	}

	function selectTabContent(str: string) {
		tabContent.forEach(item => {
			item.classList.contains(str) ? item.classList.add('is-active') : item.classList.remove('is-active');
		})
	}
}

export const drawCars = (data: ICarData[]) => {
  const cars = document.querySelector('.cars') as HTMLDivElement;
  data.forEach((data: ICarData) => {
    const newCar = document.createElement('div');
    newCar.classList.add('car-item');
    newCar.innerHTML = `
    <div class="car-item__header">
      <button class="car-btn btn-select btn-reset" type="button" data-carId="${data.id}">SELECT</button>
      <button class="car-btn btn-remove btn-reset" type="button" data-carId="${data.id}">REMOVE</button>
      <span class="car-name">${data.name}</span>
    </div>
    <div class="car-item__body">
      <div class="car-item-btns">
        <button class="car-btn btn-start btn-reset" type="button" data-carId="${data.id}">A</button>
        <button class="car-btn btn-stop btn-reset" type="button" disabled data-carId="${data.id}">B</button>
      </div>
      <svg class="car-item__img" style="color: ${data.color};" data-carId="${data.id}">
        <use xlink:href="${carImg}#car"></use>
      </svg>
      <img class="car-item__finish" src="${flagImg}" alt="..." data-carId="${data.id}">
    </div>`;

    cars.appendChild(newCar);
})};

export const drawWinners = async (data: ICarData[]) => {
  const winners = document.querySelector('.winners-table__body') as HTMLDivElement;
  winners.innerHTML = '';
  let count = 0
  for (const el of data) {
    const carData = await getCar(el.id);
    const newWin = document.createElement('tr');
    newWin.innerHTML = `
    <td>${(state.winnerPage - 1) * LIMIT_WINNERS + ++count}</td>
    <td>
      <svg class="car-win__img" style="color: ${carData.color};" data-carId="${el.id}">
        <use xlink:href="${carImg}#car"></use>
      </svg>
    </td>
    <td>${carData.name}</td>
    <td>${el.wins}</td>
    <td>${el.time}</td>`;
    winners.appendChild(newWin);
  }
};

export const updateStateGarage = () => {
  if (state.garagePage * LIMIT_CARS >= state.carsCount) {
    (document.querySelector('.right-item') as HTMLButtonElement).disabled = true;
  } else {
    (document.querySelector('.right-item') as HTMLButtonElement).disabled = false;
  }

  if (state.garagePage > 1) {
    (document.querySelector('.left-item') as HTMLButtonElement).disabled = false;
  } else {
    (document.querySelector('.left-item') as HTMLButtonElement).disabled = true;
  }

  (document.querySelector('.garage-length') as HTMLElement).innerText = `${state.carsCount}`;
  (document.querySelector('.page-num') as HTMLElement).innerText = `${state.garagePage}`;
}

export const updateStateWinners = () => {
  if (state.winnerPage * LIMIT_WINNERS >= state.winnersCount) {
    (document.querySelector('.win-right') as HTMLButtonElement).disabled = true;
  } else {
    (document.querySelector('.win-right') as HTMLButtonElement).disabled = false;
  }

  if (state.winnerPage > 1) {
    (document.querySelector('.win-left') as HTMLButtonElement).disabled = false;
  } else {
    (document.querySelector('.win-left') as HTMLButtonElement).disabled = true;
  }

  (document.querySelector('.winners-length') as HTMLElement).innerText = `${state.winnersCount}`;
  (document.querySelector('.winners-page') as HTMLElement).innerText = `${state.winnerPage}`;
}
