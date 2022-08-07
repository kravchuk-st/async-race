export interface ICarData {[key: string]: string}
export interface IAnimationData {[key: string]: {[key: string]: number}}
export interface IWinData {[key: string]: number}

export const state = {
  garagePage: 1,
  carsCount: 4,
  animation: {} as IAnimationData,
  winnerPage: 1,
  winnersCount: 1,
  winId: '',
  sort: '',
  order: '',
};
