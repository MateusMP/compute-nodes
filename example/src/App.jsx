import React from 'react';

import { Dashboard } from './Dashboard';
import 'compute-nodes/dist/index.css';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const App = () => {
    return (< DndProvider backend={HTML5Backend} >
        <Dashboard />
    </DndProvider>)
}

export default App