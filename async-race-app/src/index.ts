import { createPage, changeTab } from './draw';
import { getCars, getWinners } from './api';
import { listen } from './listener';
import './css/normalize.css';
import './css/style.css';

createPage();
changeTab();
getCars();
getWinners();
listen();
