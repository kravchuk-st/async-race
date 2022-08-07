import { getCar, getCars, createCar, updateCar, deleteCar, getWins, getWinners, updateWinnerList, deleteWinner, drive, startEngine, stopEngine } from './api';
import { generateRandomCars, animation, startDriving, stopDriving } from './utils';
import { state } from './store';

const LIMIT_CARS = 7;
const LIMIT_WINNERS = 10;
const distCorrectionValue = 25;

export const listen = () => {
  document.body.addEventListener('click', async (e: Event) => {
    const target = e.target as HTMLButtonElement;
    const id = target.dataset.carid as string;
    if (!target.classList.contains('message')) {
      (document.querySelector('.message') as HTMLElement).classList.remove('active');
    }

    if (target.classList.contains('generate-btn')) {
      target.disabled = true;
      const cars = generateRandomCars();
      await Promise.all(cars.map(async c => await createCar(c)));
      await getCars();
      target.disabled = false;
    }

    if (target.classList.contains('create-btn')) {
      const name = (document.querySelector('.create-input-text') as HTMLInputElement).value;
      const color = (document.querySelector('.create-input-color') as HTMLInputElement).value;
      const body = { name, color };
      (document.querySelector('.create-input-text') as HTMLInputElement).value = '';
      (document.querySelector('.create-input-color') as HTMLInputElement).value = '#000000';
      await createCar(body);
      await getCars();
    }

    if (target.classList.contains('update-btn')) {
      const updateText = document.querySelector('.update-input-text') as HTMLInputElement;
      const updateColor = document.querySelector('.update-input-color') as HTMLInputElement;
      const name = updateText.value;
      const color = updateColor.value;
      const body = { name, color };
      updateText.value = '';
      updateColor.value = '#000000';
      updateText.disabled = true;
      updateColor.disabled = true;
      target.disabled = true;
      await updateCar(id, body);
      await getCars();
    }

    if (target.classList.contains('btn-select')) {
      const carData = await getCar(id);
      const updateText = document.querySelector('.update-input-text') as HTMLInputElement;
      const updateColor = document.querySelector('.update-input-color') as HTMLInputElement;
      const updateBtn = document.querySelector('.update-btn') as HTMLButtonElement;
      updateText.disabled = false;
      updateText.value = carData.name;
      updateColor.disabled = false;
      updateColor.value = carData.color;
      updateBtn.disabled = false;
      updateBtn.dataset.carid = id;
    }

    if (target.classList.contains('btn-remove')) {
      --state.carsCount;
      if ((state.garagePage - 1) * LIMIT_CARS === state.carsCount && state.garagePage > 1) {
        --state.garagePage;
      }
      await deleteCar(id);
      await getCars();
      const arrId = await getWins();
      if (arrId.includes(+id)) {
        --state.winnersCount;
        if ((state.winnerPage - 1) * LIMIT_WINNERS === state.winnersCount && state.winnerPage > 1) {
          --state.winnerPage;
        }
        await deleteWinner(id);
        await getWinners();
      }
    }

    if (target.classList.contains('btn-start')) {
      target.disabled = true;
      const { velocity, distance } = await startEngine(id);
      const time = Math.round(distance / velocity);
      (document.querySelector(`.btn-stop[data-carid="${id}"]`) as HTMLButtonElement).disabled = false;
      const car = document.querySelector(`.car-item__img[data-carid="${id}"]`) as HTMLElement
      const flag = document.querySelector(`.car-item__finish[data-carid="${id}"]`) as HTMLElement
      const dist = flag.offsetLeft - distCorrectionValue;
      state.animation[id] = animation(car, dist, time) as { 'id': number };

      const { success } = await drive(id);
      if (!success) window.cancelAnimationFrame(state.animation[id].id);
    }

    if (target.classList.contains('btn-stop')) {
      target.disabled = true;
      await stopEngine(id);
      const car = document.querySelector(`.car-item__img[data-carid="${id}"]`) as HTMLElement;
      car.style.transform = 'translateX(0)';
      if (state.animation[id]) window.cancelAnimationFrame(state.animation[id].id);
      (document.querySelector(`.btn-start[data-carid="${id}"]`) as HTMLButtonElement).disabled = false;
    }

    if (target.classList.contains('race-btn')) {
      target.disabled = true;
      let counter = 0;
      state.winId = '';
      Array.from(document.querySelectorAll('.car-item__img')).forEach(async (el) => {
        const id = (el as HTMLElement).dataset.carid as string;
        const { time } = await startDriving(id);
        if (state.winId !== '' && counter === 0) {
          counter++;
          const carData = await getCar(id);
          const actualTime = (time / 1000).toFixed(2);
          const message = document.querySelector('.message') as HTMLElement;
          message.innerText = '';
          message.innerText = `${carData.name} went first (${actualTime}s)`;
          message.classList.add('active');
          await updateWinnerList(id, +actualTime);
        }
      });
      (document.querySelector('.reset-btn') as HTMLButtonElement).disabled = false;
    }

    if (target.classList.contains('reset-btn')) {
      target.disabled = true;
      const cars = Array.from(document.querySelectorAll('.car-item__img'));
      for (const el of cars) {
        const id = (el as HTMLElement).dataset.carid as string;
        await stopDriving(id);
      }
      (document.querySelector('.race-btn') as HTMLButtonElement).disabled = false;
    }

    if (target.classList.contains('sort-by-win')) {
      if(state.sort === 'time') {
        state.order = '';
        (document.querySelector('.sort-by-time') as HTMLElement).innerText = 'Best time(s)';
      }
      state.sort = 'wins';
      if (state.order === '' || state.order === 'DESC') {
        state.order = 'ASC';
        target.innerText = 'Wins ↑';
      } else {
        state.order = 'DESC';
        target.innerText = 'Wins ↓';
      }
      await getWinners();
    }

    if (target.classList.contains('sort-by-time')) {
      if(state.sort === 'wins') {
        state.order = '';
        (document.querySelector('.sort-by-win') as HTMLElement).innerText = 'Wins';
      }
      state.sort = 'time';
      if (state.order === '' || state.order === 'DESC') {
        state.order = 'ASC';
        target.innerText = 'Best time(s) ↑';
      } else {
        state.order = 'DESC';
        target.innerText = 'Best time(s) ↓';
      }
      await getWinners();
    }
    
    if (target.classList.contains('right-item')) {
      ++state.garagePage;
	    await getCars();
    }

    if (target.classList.contains('left-item')) {
      --state.garagePage;
	    await getCars();
    }

    if (target.classList.contains('win-right')) {
      ++state.winnerPage;
	    await getWinners();
    }

    if (target.classList.contains('win-left')) {
      --state.winnerPage;
	    await getWinners();
    }
  })
}
