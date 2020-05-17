import { CanvasNode } from "./CanvasNode";

export type LinkDataType = string[] | string;

interface AInputFormat {
    type: LinkDataType,
    visualName?: string,
}

export interface InputFormat {
    [key: string]: AInputFormat
}


/**
 * Basic fields of a node definition
 */
export interface NodeTypeDefinition {
    /**
     * Type name
     */
    Type: string;

    /**
     * Node input information
     */
    InputFormat: InputFormat | undefined;

    /**
     * Node output information
     */
    OutputFormat: InputFormat | undefined;

    /**
     * A method to construct the object
     */
    Construct(args: any): CanvasNode;

    /**
     * Renders a node
     * @param node the node
     */
    Render(node: CanvasNode): any;
}

/**
 * Holds information about node types
 */
export class NodeRegistry<ExtraDefProps = {}> {
    nodeTypes: { [key: string]: NodeTypeDefinition & ExtraDefProps } = {};

    /**
     * Register a new node type
     * @param info the node definition information
     * @param moreProps extra properties appended to info
     */
    registerType(info: NodeTypeDefinition & ExtraDefProps, moreProps?: any) {
        if (moreProps) {
            info = { ...info, ...moreProps };
        }
        this.nodeTypes[info.Type] = info;
    }

    /**
     * Instantiate a new node
     * @param type the node type, must have been registered
     * @param args properties passed to the constructed object
     */
    instantiateNewNode(type: string, args: any) {
        if (!args.id) {
            args = { ...args, id: this.generateId() }
        }
        const info = this.nodeTypes[type];
        const obj = info.Construct(args);
        obj.type = info.Type;
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

    /**
     * Calls the render method based on node type
     * @param node the node to be rendered
     */
    renderNode<T extends CanvasNode>(node: T) {
        return this.nodeTypes[node.type].Render(node);
    }

    /**
     * Retrieves the node type definition
     * @param type a type that is registered
     */
    getNodeTypeInfo(type: string): NodeTypeDefinition & ExtraDefProps {
        return this.nodeTypes[type];
    }
}