import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDrop, useDrag, DragObjectWithType } from 'react-dnd';
import { ItemTypes } from '../core/Constants';
import { buildPinId } from '../core/utils';
import { NodeResolver } from '../core/NodeResolver';

export interface PinDropItem {
    type: ItemTypes;
    [key: string]: any;
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
    const pinId = buildPinId(nodeId, name);

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

interface InputPinProps {
    nodeId: string
    name: string
    visualName?: string
    accept: any
    error: boolean
    resolver: NodeResolver
}

export function InputPin({ nodeId, name, visualName, accept, error, resolver }: InputPinProps) {
    const pinId = buildPinId(nodeId, name);
    const [, ref] = useDrop<InputPinDrop, any, any>({
        accept: accept,
        drop: (e: any) => resolver.createPinConnection(e.pinId, pinId),
        collect: (monitor: any) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
            clientOffset: monitor.getClientOffset(),
        }),
    });

    const classes = `pin  adasd ${error ? 'error' : ''}`;

    const displayName = visualName === undefined ? name : visualName;

    return <Row className="input-pin">
        <div id={pinId} ref={ref} className={classes}></div><span>{displayName}</span>
    </Row>
}

export function VariableInputPin({ nodeId, name, visualName, resolver, error = false }: any) {
    return <InputPin nodeId={nodeId} resolver={resolver} name={name} visualName={visualName} accept={ItemTypes.VARIABLE_INPUT} error={error}/>
}