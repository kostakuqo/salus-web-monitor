import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './assets/comonents/Header/Header'
import "./App.css";
import Content from './assets/comonents/content/content';
import Menu from './assets/comonents/menu-left/Menu';




export default function App() {
    return (
        <>
            <Header />

            <div className="main-layout">
                <Menu />

                <div className="content">
                    <Content/>
                     
                </div>
            </div>
        </>
    );
}
