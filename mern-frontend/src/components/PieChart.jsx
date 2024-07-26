import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ month }) => {
    const [data, setData] = useState({});

    useEffect(() => {
        fetchData();
    }, [month]);

    const fetchData = async () => {
        const response = await axios.get(`http://localhost:3000/api/piechart`, {
            params: { month }
        });

        const labels = response.data.map(item => item._id);
        const values = response.data.map(item => item.count);

        setData({
            labels,
            datasets: [
                {
                    label: 'Number of Items',
                    data: values,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                    ],
                },
            ],
        });
    };

    return (
        <div>
            <h2>Pie Chart</h2>
            <Pie data={data} />
        </div>
    );
};

export default PieChart;
