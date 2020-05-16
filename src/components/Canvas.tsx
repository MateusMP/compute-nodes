import React from 'react';
import { ItemTypes } from '../Constants'
import { useDrop, XYCoord } from 'react-dnd'
import Connector from './Connector';

import * as d3 from "d3";

import { ConnectionMap, NodeResolver, NodeMap } from '../adapters/NodeResolver';
import { connToPinId } from '../nodes/CanvasNode';

interface SvgCanvasProps {
    children: React.ReactNode;
    canvas: Canvas;
}

interface CanvasDropItem {
    type: ItemTypes;
    [key: string]: any;
}

function SvgCanvas({ canvas, children }: SvgCanvasProps) {
    const [{ isOver }, ref] = useDrop({
        accept: [ItemTypes.VISUAL_NODE],
        drop: (e: CanvasDropItem, monitor: any) => {
            canvas.variableDropped(e, monitor.getClientOffset()!)
        },
        collect: (monitor: any) => ({
            isOver: !!monitor.isOver(),
            clientOffset: monitor.getClientOffset(),
        }),
    });

    return (<svg ref={ref} id="canvas" width="100%" height="100vh">
        {isOver ? <text x={20} y={20}>Drop do create node!</text> : null}
        {children}
    </svg>);
}

interface OwnProps {
    resolver: NodeResolver;
}
interface State {
    nodes: NodeMap;
    connections: ConnectionMap;
}
interface Transform {
    x: number;
    y: number;
    zoom: number;
}

export default class Canvas extends React.Component<OwnProps, State> {
    transform: Transform;
    mainGroup: React.RefObject<SVGGElement>;
    dragG: React.RefObject<SVGGElement>;
    shouldRenderConnections = false;


    constructor(props: OwnProps) {
        super(props);

        this.state = {
            nodes: {},
            connections: {}
        };

        this.variableDropped = this.variableDropped.bind(this);
        this.mainGroup = React.createRef<SVGGElement>();
        this.dragG = React.createRef<SVGGElement>();
        this.transform = { x: 0, y: 0, zoom: 1 };

        this.resolverStateChanged.bind(this);
    }

    resolverStateChanged(nodes: any, connections: any) {
        this.setState({ nodes, connections });
    }

    variableDropped(e: CanvasDropItem, offset: XYCoord) {
        const p = this.svgPoint(offset.x, offset.y);
        this.props.resolver.createNode(e.nodeType, { x: p[0], y: p[1], ...e });
    }

    svgPoint(x: number, y: number) {
        if (this.mainGroup.current !== null) {
            const svg: SVGSVGElement = this.mainGroup.current.parentNode as SVGSVGElement;
            var pt = svg.createSVGPoint();

            pt.x = x;
            pt.y = y;

            const p = pt.matrixTransform(this.mainGroup.current.getScreenCTM()!.inverse());
            return [p.x, p.y];
        }
        throw new Error("Invalid G group");
    }

    renderConnections() {
        const PIN_HSIZE = 20 / 2;
        const VISUAL_OFFSET = PIN_HSIZE * this.transform.zoom;

        const connections = Object.entries(this.state.connections);
        const list: any[] = [];
        connections.forEach(([id, connection]) => {
            // TODO: Consider going through element id only once to avoid multiple getBoundingClientRect on same element?
            let bA = document.getElementById(connToPinId(connection.from))?.getBoundingClientRect();
            let bB = document.getElementById(connToPinId(connection.to))?.getBoundingClientRect();
            if (!!!bA) {
                console.warn(`Bad pin connection: From: ${connToPinId(connection.from)} missing`);
                return;
            }
            if (!!!bB) {
                console.warn(`Bad pin connection: To: ${connToPinId(connection.to)} missing`);
                return;
            }
            const posA = this.svgPoint(bA.x + VISUAL_OFFSET, bA.y + VISUAL_OFFSET);
            const posB = this.svgPoint(bB.x + VISUAL_OFFSET, bB.y + VISUAL_OFFSET);

            list.push(<Connector key={id} startPoint={posA} endPoint={posB} />);
        });
        return list;
    }

    renderNodes() {
        const entries = Object.entries(this.state.nodes);
        const a = Array.from(entries, ([id, node]) => {
            return <React.Fragment key={id}>{this.props.resolver.render(node)}</React.Fragment>;
        });
        return a;
    }

    componentWillUnmount() {
        this.props.resolver.unbind('new-node', this.resolverStateChanged);
    }

    componentDidMount() {
        this.props.resolver.on('new-node', this.resolverStateChanged);

        if (this.mainGroup.current && this.dragG.current) {
            const that = this;
            const g = d3.select(this.mainGroup.current);
            d3.select(this.dragG.current).call(d3.zoom<SVGGElement, any>().on("zoom", function () {
                that.transform = { x: d3.event.transform.x, y: d3.event.transform.y, zoom: d3.event.transform.k };
                g.attr("transform", d3.event.transform);
            }));

            // Force update because the links can only be rendered
            // after node pins are in the dom, thus we re-render
            // so that connections components are actually displayed
            setTimeout(() => {
                this.shouldRenderConnections = true;
                this.forceUpdate();
            }, 10);
        }
    }

    componentDidUpdate(_prevProps: OwnProps, prevState: State) {
        if (this.state.connections !== prevState.connections) {
            this.shouldRenderConnections = false;
            setTimeout(() => {
                this.shouldRenderConnections = true;
                this.forceUpdate();
            }, 10);
        }
    }

    render() {
        return (<SvgCanvas canvas={this}>
            <g ref={this.dragG}>
                <rect x="0" y="0" width="100%" height="100%" fill="white" style={{ visibility: "hidden", pointerEvents: "all" }} />
            </g>
            <g ref={this.mainGroup} transform="translate(0,0) scale(1)">
                <g>{this.shouldRenderConnections ? this.renderConnections() : null}</g>
                <g>{this.renderNodes()}</g>
            </g>
        </SvgCanvas>);
    }
}