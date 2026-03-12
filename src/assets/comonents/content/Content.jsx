import React from 'react';
import './Content.css';
import Uta from './Uta';
import Chiller from './Chiller';
import Kaldaja from './Kaldaja';
import UtaContainer from './UtaContainer';
import ChillerContainer from './ChillerContainer';
import KaldajaContainer from './KaldajaContainer';


export default function Content() {
  return (
    <div className="content-grid">
      {/* <Uta/> */}
      <UtaContainer/>
      <ChillerContainer/>
      <KaldajaContainer/>
      
      {/* <Chiller/>
      <Kaldaja/> */}
    </div>
  );
}