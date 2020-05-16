import CanvasNode from "../nodes/CanvasNode";

interface AInputFormat {
    type: string[] | string,
    visualName?: string,
}

export interface InputFormat {
    [key: string]: AInputFormat
}


export interface NodeTypeDefinition {
    Type: string;
    InputFormat: InputFormat | undefined;
    OutputFormat: InputFormat | undefined;
    construct(args: any): CanvasNode;
    [key: string]: any;
}

export class NodeRegistry<ExtraDefProps> {
    nodeTypes: { [key: string]: NodeTypeDefinition & ExtraDefProps } = {};

    registerType(info: NodeTypeDefinition & ExtraDefProps, moreProps?: any) {
        info = { ...info, ...moreProps };
        this.nodeTypes[info.Type] = info;
    }

    instantiateNewNode(type: string, args: any) {
        if (!args.id) {
            args = { ...args, id: this.generateId() }
        }
        const info = this.nodeTypes[type];
        const obj = info.construct(args);
        obj.type = info.def.type;
        return obj;
    }

    generateId() {
        // TODO: Use something else?
        // ++__ids;
        //return '_' + __ids;
        return Array(16)
            .fill(0)
            .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
            .join('') +
            Date.now().toString(24);
    };

    renderNode<T extends CanvasNode>(node: T) {
        return this.nodeTypes[node.type].render(node);
    }

    getNodeTypeInfo(type: string): NodeTypeDefinition & ExtraDefProps {
        return this.nodeTypes[type];
    }
}

const globalNodeRegistry = new NodeRegistry()

export default globalNodeRegistry;