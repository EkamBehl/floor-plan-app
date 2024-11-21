// Carousel.tsx
import React from 'react';
import { useDrag } from 'react-dnd';

const ItemTypes = {
  OBJECT: 'object',
};

const objects = [
  { id: 1, name: 'Chair', modelPath: '/models/chair.glb' },
  { id: 2, name: 'Table', modelPath: '/models/table.glb' },
  // Add more objects as needed
];

interface DraggableObjectProps {
  object: { id: number; name: string; modelPath: string };
}

export function DraggableObject({ object }: DraggableObjectProps) {
    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: ItemTypes.OBJECT,
        item: { type: ItemTypes.OBJECT, object },
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
        }),
      }),
      [object]
    );
  
    return drag(
      <div
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          padding: '10px',
          border: '1px solid #ccc',
          margin: '5px',
        }}
      >
        <img
          src={`/thumbnails/${object.name}.png`}
          alt={object.name}
          style={{ width: '100px', height: '100px' }}
        />
        <p>{object.name}</p>
      </div>
    );
  }

function Carousel() {
  return (
    <div
      style={{
        width: '200px',
        overflowY: 'auto',
        borderRight: '1px solid #ccc',
        height: '100vh',
      }}
    >
      {objects.map((object) => (
        <DraggableObject key={object.id} object={object} />
      ))}
    </div>
  );
}

export default Carousel;
