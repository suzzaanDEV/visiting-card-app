import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Stage, Layer, Rect, Circle, Text, Transformer, Image as KonvaImage } from 'react-konva';
import { SketchPicker } from 'react-color'; // Simple color picker
import { FiSquare, FiCircle, FiType, FiImage, FiSave, FiTrash2, FiLoader, FiEyeOff } from 'react-icons/fi'; // Icons
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import useImage from 'use-image'; // Hook for loading images in Konva

// --- Redux Actions (Import your actual thunks) ---
// import { createCard, updateCard } from '../../features/cards/cardsThunks'; // Adjust path
// Placeholder for dispatch simulation
const createCard = (data) => ({ type: 'cards/create/pending', payload: data }); // Example placeholder

// --- Helper Component for Rendering Images from Src ---
// This component handles loading images from a URL (like a Data URL)
// before rendering them onto the Konva stage.
const ImageFromSrc = ({ shapeProps, isSelected, onSelect, onChange }) => {
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
            onTransformEnd={(e) => {
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