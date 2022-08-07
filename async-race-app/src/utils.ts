import { drive, startEngine, stopEngine } from './api';
import { state } from './store';

const models = ['Acura', 'Alfa Romeo', 'Alpine', 'Apollo', 'Apple', 'Aston Martin', 'Audi', 'Automobili Pininfarina', 'Bentley', 'BMW', 'Bollinger', 'Brilliance', 'Bugatti', 'Buick', 'BYD', 'Cadillac', 'Chana', 'Chery', 'Chevrolet', 'Chrysler', 'Citroen', 'Continental', 'CUPRA', 'Dacia', 'Daewoo', 'Daihatsu', 'Datsun', 'Detroit Electric', 'Dodge', 'DS Automobiles', 'FAW', 'Ferrari', 'Fiat', 'Fisker', 'Ford', 'Foxtron', 'Geely', 'Genesis', 'GMC', 'Great Wall', 'Haval', 'Honda', 'Hummer', 'Hyundai', 'Ineos', 'Infiniti', 'Iran Khodro', 'JAC', 'Jaguar', 'Jeep', 'JETOUR', 'KIA', 'Koenigsegg', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Lifan', 'Lincoln', 'Lordstown', 'Lotus', 'Lucid', 'LvChi', 'Lynk & Co', 'Maserati', 'Maybach', 'Mazda', 'MCLaren', 'Mercedes-Benz', 'MG', 'MINI', 'Mitsubishi', 'Nikola', 'NIO', 'Nissan', 'Opel', 'Pagani', 'Peugeot', 'Polestar', 'Porsche', 'Qoros', 'Range Rover', 'Ravon', 'Renault', 'Rimac', 'Rivian', 'Rolls-Royce', 'Saab', 'Saipa', 'SEAT', 'Skoda', 'Smart', 'SsangYong', 'SSC North America', 'Stellantis', 'Subaru', 'Suzuki', 'Tata', 'Tesla', 'Torsus', 'Toyota', 'VinFast', 'Volkswagen', 'Volvo', 'Xpeng', 'Zotye',];

const names = ['Durango', 'Ram', 'Challenger', 'Charger', 'Grand Caravan', 'X7', 'X5', 'X3', 'X6 M', 'X6', 'X1', 'X4', 'C3 Aircross', 'C5 Aircross', 'Duster', 'CR-V', 'Corolla', 'C4 Cactus', 'DS3 Crossback', 'C1', 'C3', 'Berlingo Multispace', 'DS4 Crossback', 'UX 250h', 'NX 300h', 'LC 500', 'RX 350/200t', 'Rapid', 'Largus', 'IS 200t', 'LS 500h', 'RX', 'ES 200/250/350', 'Hatchback', 'CX-5', 'Sedan', 'CX-30', 'CX-9', 'CX-3', 'MX-5 Roadster', 'Phantom', 'Camry', 'Polo', 'Cullinan', 'Ghost', 'Dawn', 'Duster', 'Arkana', 'Sandero', 'Logan', 'Trafic Fourgon', 'Logan MCV', 'Captur', 'Kadjar', 'RAV4', 'Rio', 'Creta', 'Solaris',];

const GENERATE_CARS = 100;

const getRandomName = () => {
  const model = models[Math.floor(Math.random() * models.length)];
  const name = names[Math.floor(Math.random() * names.length)]; 
  return `${model} ${name}`;
};

const getRandomColor = () => {
  const letters = '0123456789abcdef';
  let color = '#'; 
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const generateRandomCars = (count = GENERATE_CARS) => new Array(count).fill(1).map(_ => ({ name: getRandomName(), color: getRandomColor() }));

export function animation(car: HTMLElement, distance: number, animationTime: number) {
  let start = 0;
  const state: {'id'?: number} = {};

  function step(timestamp: number) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const passed = Math.round(time * (distance / animationTime));
    car.style.transform = `translateX(${Math.min(passed, distance)}px)`;

    if (passed < distance) {
      state.id = window.requestAnimationFrame(step) as number;
    }
  }
  state.id = window.requestAnimationFrame(step);
  
  return state;
}

export const startDriving = async (id: string) => {
  (document.querySelector(`.btn-start[data-carid="${id}"]`) as HTMLButtonElement).disabled = true;
  const { velocity, distance } = await startEngine(id);
  const time = Math.round(distance / velocity);
  (document.querySelector(`.btn-stop[data-carid="${id}"]`) as HTMLButtonElement).disabled = false;
  const car = document.querySelector(`.car-item__img[data-carid="${id}"]`) as HTMLElement
  const flag = document.querySelector(`.car-item__finish[data-carid="${id}"]`) as HTMLElement
  const dist = flag.offsetLeft - 25;
  state.animation[id] = animation(car, dist, time) as { 'id': number };
  const { success } = await drive(id);
  if (!success) window.cancelAnimationFrame(state.animation[id].id);
  return { time };
};

export const stopDriving = async (id: string) => {
  (document.querySelector(`.btn-stop[data-carid="${id}"]`) as HTMLButtonElement).disabled = true;
  await stopEngine(id);
  (document.querySelector(`.btn-start[data-carid="${id}"]`) as HTMLButtonElement).disabled = false;
  const car = document.querySelector(`.car-item__img[data-carid="${id}"]`) as HTMLElement;
  car.style.transform = 'translateX(0)';
  if (state.animation[id]) window.cancelAnimationFrame(state.animation[id].id);
  (document.querySelector(`.btn-start[data-carid="${id}"]`) as HTMLButtonElement).disabled = false;
};
  