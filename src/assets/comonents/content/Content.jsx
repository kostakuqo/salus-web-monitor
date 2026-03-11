import React from 'react';
import './Content.css';
import Uta from './Uta';
import Chiller from './Chiller';
import Kaldaja from './Kaldaja';


export default function Content() {
  return (
    <div className="content-grid">
      <Uta/>
      <Chiller/>
      <Kaldaja/>
    </div>
  );
}