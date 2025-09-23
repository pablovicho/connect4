import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/about.css';

const About = () => {
    const navigate = useNavigate();
    return (
        <div className="about">
            <div className="title" style={{ width: '9.5rem', alignSelf: 'center', justifyContent: 'center' }}>
                <h1 className="titleName">Conecta 4</h1>
            </div>
            <div className="rules">
                <h1>Reglas del juego</h1>
                <ul>
                    <li>En cada turno cada jugador coloca una ficha de su color en una columna y esta cae hasta la primera casilla disponible.</li>
                    <li>Gana el jugador que logre conectar 4 fichas iguales de su color en una fila, columna o diagonal.</li>
                    <li>Si nadie logra conectar 4 fichas iguales de su color, la partida termina en empate.</li>
                </ul>
                <p className="gracias">¡Gracias por jugar!</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 0.4rem 0.2rem 0.4rem'}} onClick={() => navigate('/')}>
                <img src="/home.svg" alt="home" width="30px" height="30px" />
            </button>
        </div>
    );
};

export default About;
