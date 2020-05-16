import React, { Component } from 'react';

import { AutoBaseNode } from 'node-machine';

import { Row, Col } from 'react-bootstrap';
import { DataPreviewNode } from '../DataPreviewNode';


interface OwnProps extends DataPreviewNode {
    resolvedData: any
}

export default class DataPreviewGraphNode extends Component<OwnProps> {

    mapArray(array: any[]) {
        const maxRows = 30;
        let more: any = null;

        if (array.length > maxRows) {
            more = <Row><Col>{array.length - maxRows} more rows...</Col></Row>
            array = array.slice(0, maxRows);
        }

        const entries = array.map((d, i) => {
            return (
                <Row key={i}>
                    {this.getView(d)}
                </Row>);
        });

        return <>
            {entries}
            {more}
        </>;
    }

    getView(data: any) {
        const datatype = typeof data;
        switch (datatype) {
            case 'object':
                if (Array.isArray(data)) {
                    return this.mapArray(data);
                } else {
                    Object.keys(data).map(key => {
                        return (
                            <Col>{data[key]}</Col>
                        );
                    });
                }
            case 'string':
            case 'number':
                return <Col>{data}</Col>
            case 'undefined':
                return "No data";
            default:
                console.warn("unhandled type: " + datatype);
                return <span>{'' + data}</span>
        }
    }


    render() {
        return (<AutoBaseNode {...this.props}
            title="Data Preview" minWidth="200px"
            input={DataPreviewNode.InputFormat}>
            <div className="node-nodrag gn-data-preview container"
                style={{
                    maxHeight: "100px"
                }}>
                {this.getView(this.props.resolvedData.a)}
            </div>
        </AutoBaseNode>);
    }
}