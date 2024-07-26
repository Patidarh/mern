import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale);

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
