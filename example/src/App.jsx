import React from 'react';

import { Dashboard } from './Dashboard';
import 'node-machine/dist/index.css';

import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

const App = () => {
    return (< DndProvider backend={Backend} >
        <Dashboard />
    </DndProvider>)
}

export default App