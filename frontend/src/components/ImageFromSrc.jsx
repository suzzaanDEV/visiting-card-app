import React, { useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer, Image as KonvaImage } from 'react-konva';
import { SketchPicker } from 'react-color'; 
import { FiSquare, FiCircle, FiType, FiImage, FiSave, FiTrash2, FiLoader, FiEyeOff } from 'react-icons/fi';
import useImage from 'use-image'; 




const ImageFromSrc = ({ shapeProps, onSelect, onChange }) => {
    const shapeRef = useRef();
    const [image] = useImage(shapeProps.src, 'Anonymous'); // Load image from src attribute

    // Use KonvaImage component to render the loaded image
    return (
        <KonvaImage
            ref={shapeRef}
            {...shapeProps} // Spread common props like x, y, id, draggable etc.
            image={image} // The loaded image object
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => {
                onChange({
                    ...shapeProps,
                    x: e.target.x(),
                    y: e.target.y(),
                });
            }}
            onTransformEnd={() => {
                 // Transformer is changing scale, rotation, position
                const node = shapeRef.current;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                // Reset scale to avoid affecting future transforms
                node.scaleX(1);
                node.scaleY(1);
                onChange({
                    ...shapeProps,
                    x: node.x(),
                    y: node.y(),
                    // Update width and height based on scale
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(5, node.height() * scaleY),
                    rotation: node.rotation(),
                });
            }}
        />
    );
};

 export default ImageFromSrc;