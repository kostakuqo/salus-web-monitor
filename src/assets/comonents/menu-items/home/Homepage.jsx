import React from 'react';
import { useNavigate } from 'react-router-dom';
import UtaContainer from '../../content/uta/UtaContainer';
import ChillerContainer from '../../content/chiller/ChillerContainer';
import KaldajaContainer from '../../content/kaldaja/KaldajaContainer';


export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-grid">
            <UtaContainer onUtaClick={() => navigate("/uta")} />
            <ChillerContainer onChillerClick={() => navigate("/chiller")} />
            <KaldajaContainer onKaldajaClick={() => navigate("/kaldaja")} />
        </div>
    );
}