import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ month }) => {
    const [data, setData] = useState({});

    useEffect(() => {
        fetchData();
    }, [month]);

    const fetchData = async () => {
        const response = await axios.get(`http://localhost:3000/api/barchart`, {
            params: { month }
        });

        const labels = response.data.map(item => item.range);
        const values = response.data.map(item => item.count);

        setData({
            labels,
            datasets: [
                {
                    label: 'Number of Items',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        });
    };

    return (
        <div>
            <h2>Bar Chart</h2>
            <Bar data={data} />
        </div>
    );
};

export default BarChart;
