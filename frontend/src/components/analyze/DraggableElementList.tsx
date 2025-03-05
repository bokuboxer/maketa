import { Draggable, DraggableProvided, Droppable, DroppableProvided } from "@hello-pangea/dnd";
import { DraggableElementListProps } from "./types";

// Draggable element list component
export const DraggableElementList = ({ 
  elementType, 
  elements, 
  droppableId, 
  emptyMessage, 
  isDragging 
}: DraggableElementListProps) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided: DroppableProvided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="w-full"
          style={{ minHeight: 36 }}
        >
          {elements.length > 0 ? (
            elements.map(
              (dndElement, index) => (
                <Draggable
                  key={`${dndElement.element.id}-${droppableId.split('-')[0]}`}
                  draggableId={`${dndElement.element.id}-${droppableId.split('-')[0]}`}
                  index={index}
                >
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white border rounded-lg p-2 mb-1 shadow-sm hover:shadow transition-shadow cursor-move min-h-[36px] flex items-center"
                    >
                      <p className="text-black text-sm leading-normal break-words">
                        {dndElement.element.description}
                      </p>
                    </div>
                  )}
                </Draggable>
              ),
            )
          ) : !isDragging ? (
            <div className="text-gray-400 text-sm p-2 border border-dashed border-gray-300 rounded bg-white h-[36px] flex items-center justify-center">
              {emptyMessage}
            </div>
          ) : null}
          {!isDragging && provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}; 