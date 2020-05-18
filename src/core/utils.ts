/**
 * Builds a pin id based on a node id and a pin name
 * @param node the node id
 * @param pinName the pin name
 */
export function buildPinId(node: string, pinName: string) {
  return `${node}-${pinName}`
}

/**
 * Destruct a pin id into node and pin name.
 * PinId must be constructed using {@link buildPinId}
 * @param pinId the pin id.
 */
export function destructPinId(pinId: string) {
  const parts = pinId.split('-')
  const dataNode = parts[0]
  const dataNodePinName = parts[1]
  return { nodeId: dataNode, pin: dataNodePinName }
}
