import React from 'react'
import { useDrop, useDrag, DragObjectWithType } from 'react-dnd'
import { ItemTypes } from '../core/Constants'
import { buildPinId } from '../core/utils'
import { NodeResolver } from '../core/NodeResolver'
import { LinkDataType } from '../core/NodeRegistry'

export interface PinDropItem {
  type: ItemTypes
  [key: string]: any
}

export class StopMouseDownPropagation extends React.Component {
  ref: React.RefObject<HTMLDivElement>
  listener: EventListener

  constructor(props: any) {
    super(props)
    this.ref = React.createRef()

    this.listener = (e: Event) => e.stopPropagation()
  }

  componentDidMount() {
    this.ref.current!.parentNode!.addEventListener('mousedown', this.listener)
  }

  componentWillUnmount() {
    this.ref.current!.parentNode!.addEventListener('mousedown', this.listener)
  }

  render() {
    return <div ref={this.ref} />
  }
}

interface OutputPinProps {
  nodeId: string
  name: string
  visualName?: string
  dataType: LinkDataType
}

export interface PinDropItem extends DragObjectWithType {
  dataType: LinkDataType
  pinId: string
}

export function OutputPin({
  nodeId,
  name,
  visualName,
  dataType
}: OutputPinProps) {
  const pinId = buildPinId(nodeId, name)

  const [{ dragging }, dragRef] = useDrag<PinDropItem, any, any>({
    item: { type: ItemTypes.VARIABLE_INPUT, dataType: dataType, pinId: pinId },
    collect: (monitor: any) => ({
      dragging: monitor.isDragging()
    })
  })

  const activeClasses = dragging ? 'pin dragging' : 'pin'
  const hideName = !visualName || visualName === ''

  return (
    <div className='output-pin'>
      {hideName ? null : <span>{name}</span>}
      <div id={pinId} ref={dragRef} className={activeClasses}>
        <StopMouseDownPropagation />
      </div>
    </div>
  )
}

interface InputPinProps {
  nodeId: string
  name: string
  visualName?: string
  dataType: LinkDataType
  error: boolean
  resolver: NodeResolver
}

/**
 * A generic input pin
 * @param param0
 */
export function InputPin({
  nodeId,
  name,
  visualName,
  dataType,
  error,
  resolver
}: InputPinProps) {
  const pinId = buildPinId(nodeId, name)
  const [, ref] = useDrop<PinDropItem, any, any>({
    accept: ItemTypes.VARIABLE_INPUT,
    canDrop: (item, _monitor) => item.dataType === dataType,
    drop: (e: any) => resolver.createPinConnection(e.pinId, pinId),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
      clientOffset: monitor.getClientOffset()
    })
  })

  const classes = `pin ${error ? 'error' : ''}`

  const displayName = visualName === undefined ? name : visualName

  return (
    <div className='input-pin'>
      <div id={pinId} ref={ref} className={classes} />
      <span>{displayName}</span>
    </div>
  )
}
