import { drawCars, drawWinners, updateStateGarage, updateStateWinners } from './draw';
import { state, ICarData, IWinData } from './store';

const BASE_URL = 'http://127.0.0.1:3000';
const garage = `${BASE_URL}/garage`;
const winners = `${BASE_URL}/winners`;
const engine = `${BASE_URL}/engine`;
const LIMIT_CARS = 7;
const LIMIT_WINNERS = 10;

const getSortOrder = (sort: string, order: string) => {
  if (sort && order) return `&_sort=${sort}&_order=${order}`;
  return '';
};

export const getCar = async (id: string) => (await fetch (`${garage}/${id}`)).json();

export const getCars = async (page = state.garagePage, limit = LIMIT_CARS) => {
  const response = await fetch(`${garage}?_page=${page}&_limit=${limit}`);
  const data = await response.json();
  const count = response.headers.get('X-Total-Count') as string;
  (document.querySelector('.cars') as HTMLElement).innerHTML = '';
  state.carsCount = +count;
  updateStateGarage();
  drawCars(data);
};

export const createCar = async (body: ICarData) => (await fetch (garage, {
  method: 'POST',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json'
  },
})).json();

export const updateCar = async (id: string, body: ICarData) => (await fetch (`${garage}/${id}`, {
  method: 'PUT',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json'
  },
})).json();

export const deleteCar = async (id: string) => (await fetch(`${garage}/${id}`, { method: 'DELETE' })).json();

export const startEngine = async (id: string) => (await fetch(`${engine}?id=${id}&status=started`, { method: 'PATCH' })).json();

export const stopEngine = async (id: string) => (await fetch (`${engine}?id=${id}&status=stopped`, { method: 'PATCH' })).json();

export const drive = async (id: string) => {
  const res = await fetch(`${engine}?id=${id}&status=drive`, { method: 'PATCH' }).catch();
  if (res.status === 200 && state.winId === '') {
    state.winId = id;
  }
  return res.status !== 200 ? { success: false } : { ...(await res.json()) };
};

export const getWinners = async (page = state.winnerPage, limit = LIMIT_WINNERS, sort = state.sort, order = state.order) => {
  const response = await fetch(`${winners}?_page=${page}&_limit=${limit}${getSortOrder(sort, order)}`);
  const data = await response.json();
  const count = response.headers.get('X-Total-Count') as string;
  state.winnersCount = +count;
  updateStateWinners();
  drawWinners(data);
}

export const getWinner = async (id: string) => (await fetch (`${winners}/${id}`)).json();

const createWinner = async (body: IWinData) => (await fetch (winners, { 
  method: 'POST',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
  }
})).json();

export const deleteWinner = async (id: string) => (await fetch (`${winners}/${id}`, { method: 'DELETE' })).json();

export const getWins = async () => {
  const response = await fetch(winners);
  const data = await response.json();
  const arrId = data.map((el: ICarData) => el.id)
  return arrId;
}

const updateWinner = async (id: string, body: IWinData) => (await fetch (`${winners}/${id}`, {
  method: 'PUT',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json'
  },
})).json();

export const updateWinnerList = async (id: string, time: number) => {
  const body: IWinData = {};
  const carsId = await getWins();
  if (carsId.includes(+id)) {
    const winData = await getWinner(id);
    body.wins = ++winData.wins;
    body.time = time < winData.time ? time : winData.time;

    await updateWinner(id, body);
  } else {
    body.id = +id;
    body.wins = 1;
    body.time = time;

    await createWinner(body);
  }

  await getWinners();
}
