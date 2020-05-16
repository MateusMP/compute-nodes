export function buildPinId(node: string, pinName: string) {
    return `${node}-${pinName}`;
}

export function destructPinId(pinId: string) {
    const parts = pinId.split("-");
    const dataNode = parts[0];
    const dataNodePinName = parts[1];
    return { nodeId: dataNode, pin: dataNodePinName }
}