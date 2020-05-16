import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDrop, useDrag, DragObjectWithType } from 'react-dnd';
import { ItemTypes } from '../core/Constants';

export interface PinDropItem {
    type: ItemTypes;
    [key: string]: any;
}

export function generatePinId(nodeId: string, pinName: string) {
    return `${nodeId}-${pinName}`;
}

export class StopMouseDownPropagation extends React.Component {
    ref: React.RefObject<HTMLDivElement>;
    listener: EventListener;

    constructor(props: any) {
        super(props);
        this.ref = React.createRef();

        this.listener = (e: Event) => e.stopPropagation();
    }
    componentDidMount() {
        this.ref.current!.parentNode!.addEventListener("mousedown", this.listener)
    }
    componentWillUnmount() {
        this.ref.current!.parentNode!.addEventListener("mousedown", this.listener)
    }
    render() {
        return <div ref={this.ref} />
    }
}

interface OutputPinProps {
    nodeId: string;
    name: string;
    type: ItemTypes;
    visualName: string;
}

export function OutputPin({ nodeId, name, type, visualName }: OutputPinProps) {
    const pinId = generatePinId(nodeId, name);

    const [{ dragging }, dragRef] = useDrag<PinDropItem, any, any>({
        item: { type: type, name, pinId: pinId },
        collect: (monitor: any) => ({
            dragging: monitor.isDragging(),
        }),
    });

    const activeClasses = dragging ? "pin dragging" : "pin";
    const hideName = !!!visualName || visualName === '';

    return (<Row>
        {hideName ? null : <Col md={9} className="identifier output">{name}</Col>}
        <Col md={hideName ? 12 : 3} className="pin-container output">
            <div id={pinId} ref={dragRef} className={activeClasses}><StopMouseDownPropagation /></div>
        </Col>
    </Row>);
}

export function VariableOutputPin({ nodeId, name, ...props }: any) {
    return <OutputPin {...props} nodeId={nodeId} name={name} type={ItemTypes.VARIABLE_INPUT} />
}

interface InputPinDrop extends DragObjectWithType {
    pinId: string,
}

export function InputPin({ nodeId, name, visualName, accept, error, resolver }: any) {
    const pinId = generatePinId(nodeId, name);
    const [, ref] = useDrop<InputPinDrop, any, any>({
        accept: accept,
        drop: (e: any) => resolver.createConnection(e.pinId, pinId),
        collect: (monitor: any) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
            clientOffset: monitor.getClientOffset(),
        }),
    });

    const classes = `pin ${error ? 'error' : ''}`;

    const displayName = visualName === undefined ? name : visualName;

    return <Row className="input-pin">
        <div id={pinId} ref={ref} className={classes}></div><span>{displayName}</span>
    </Row>
}

export function VariableInputPin({ nodeId, name, visualName, error = false }: any) {
    return <InputPin nodeId={nodeId} name={name} visualName={visualName} accept={ItemTypes.VARIABLE_INPUT} error={error}>
    </InputPin>
}