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

export function screenToSvg(
  svg: SVGSVGElement,
  g: SVGGElement,
  x: number,
  y: number
) {
  var pt = svg.createSVGPoint()
  pt.x = x
  pt.y = y
  const p = pt.matrixTransform(g.getScreenCTM()!.inverse())
  return [p.x, p.y]
}

export function snapped(x: number, size = 16) {
  return Math.round(x / size) * size
}

export function shouldAllowInputEvent(el: any) {
  let i = 0
  while (i < 20 && el) {
    if (el instanceof HTMLInputElement) {
      return false
    }
    if (el.classList && el.classList.contains('node-noglobals')) {
      return false
    }
    el = el.parentNode
    i++
  }
  return true
}
