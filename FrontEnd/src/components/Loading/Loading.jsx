import React from 'react';
import './Loading.scss';
import furioso from '../../images/furioso.png';

const Loading = () => {
    return (
        <div className="message bot">
            <img src={furioso} alt="Furioso" className="furioso-img" />
            <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
            </div>
        </div>
    );
};

export default Loading;
