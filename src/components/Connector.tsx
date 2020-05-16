import React from 'react';

export default function Connector({ startPoint, endPoint }: { startPoint: number[], endPoint: number[] }) {

    // const startPoint = [25, 25];
    // const endPoint = [25, 325];

    const firstControlPoint = [startPoint[0] + 90, startPoint[1]];
    const secondControlPoint = [endPoint[0] - 90, endPoint[1]];

    const instructions = `
        M ${startPoint}
        C ${firstControlPoint}
        ${secondControlPoint}
        ${endPoint}
    `;

    return (
        <path d={instructions} className="node-link" />
    );
}