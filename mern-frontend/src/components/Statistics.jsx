import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Statistics = ({ month }) => {
    const [statistics, setStatistics] = useState({});

    useEffect(() => {
        fetchStatistics();
    }, [month]);

    const fetchStatistics = async () => {
        const response = await axios.get(`http://localhost:3000/api/statistics`, {
            params: { month }
        });
        setStatistics(response.data);
    };

    return (
        <div>
            <h2>Statistics</h2>
            <p>Total Sale Amount: {statistics.totalAmount}</p>
            <p>Total Sold Items: {statistics.soldItems}</p>
            <p>Total Not Sold Items: {statistics.notSoldItems}</p>
        </div>
    );
};

export default Statistics;
