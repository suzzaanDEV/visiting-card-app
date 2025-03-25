// KonvaRenderer.jsx
import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image'; // Hook for loading images in Konva
// import Konva from 'konva'; // Import if needed for filters etc.

// --- Helper Component to Render Konva Image ---
const URLImage = ({ nodeData }) => {
    // Basic validation for src before passing to useImage
    const validSrc = typeof nodeData.src === 'string' && nodeData.src.trim() !== ''
        ? nodeData.src
        : 'https://placehold.co/100x100/cccccc/969696?text=No+Src'; // Placeholder for missing/invalid src

    const [image, status] = useImage(validSrc, 'Anonymous'); // Use Anonymous for CORS if needed

    // Handle Loading State
    if (status === 'loading') {
        // Render a placeholder rectangle while loading
        return (
             <Rect
                x={nodeData.x || 0}
                y={nodeData.y || 0}
                width={nodeData.width || 50} // Use provided size or fallback
                height={nodeData.height || 50}
                fill="#f0f0f0" // Light grey fill
                cornerRadius={nodeData.attrs?.cornerRadius} // Apply cornerRadius if present in attrs
                listening={false} // Placeholders usually aren't interactive
             />
        );
    }

    // Handle Failed State
    if (status === 'failed') {
        console.error(`KonvaRenderer: Failed to load image: ${validSrc.substring(0, 100)}...`);
        // Render an error indicator rectangle
        return (
             <Rect
                x={nodeData.x || 0}
                y={nodeData.y || 0}
                width={nodeData.width || 50}
                height={nodeData.height || 50}
                fill="#fee2e2" // Light red fill
                stroke="#ef4444" // Red stroke
                strokeWidth={1}
                cornerRadius={nodeData.attrs?.cornerRadius}
                listening={false} // Error indicators usually aren't interactive
             />);
    }

    // Handle Loaded State - Render the actual KonvaImage
    // Use image dimensions as fallback if width/height not specified in nodeData
    const displayWidth = nodeData.width || image?.width || 50;
    const displayHeight = nodeData.height || image?.height || 50;

    return (
        <KonvaImage
            image={image} // The loaded image object
            // Core Konva Props from nodeData
            x={nodeData.x || 0}
            y={nodeData.y || 0}
            width={displayWidth}
            height={displayHeight}
            draggable={nodeData.draggable || false} // Default draggable to false
            rotation={nodeData.rotation || 0}
            scaleX={nodeData.scaleX || 1}
            scaleY={nodeData.scaleY || 1}
            opacity={nodeData.opacity === undefined ? 1 : nodeData.opacity}
            // Spread any additional Konva attributes from nodeData.attrs
            {...(nodeData.attrs || {})}
            // Accessibility / Debugging
            alt={nodeData.alt || "Konva Image"} // Use alt text if provided
            // Pass through other potential props needed by parent (like onClick, onDragEnd if used directly on URLImage)
            onClick={nodeData.onClick}
            onTap={nodeData.onTap}
            onDragEnd={nodeData.onDragEnd}
            id={nodeData.id} // Pass ID for selection if needed
        />
    );
};


// --- Recursive Node Rendering Function ---
const renderNode = (nodeData) => {
    // Basic validation for node data
    if (!nodeData || typeof nodeData !== 'object' || !nodeData.type || !nodeData.id) {
        console.warn("KonvaRenderer: Skipping invalid node data (missing type, id, or not an object):", nodeData);
        return null;
    }

    // Common properties extracted for clarity
    const commonProps = {
        key: nodeData.id, // React key
        id: nodeData.id, // Konva ID - CRUCIAL for stage.findOne()
        x: nodeData.x || 0,
        y: nodeData.y || 0,
        // Only include dimension props if they exist in nodeData
        ...(nodeData.width !== undefined && { width: nodeData.width }),
        ...(nodeData.height !== undefined && { height: nodeData.height }),
        // Styling props with defaults
        fill: nodeData.fill,
        stroke: nodeData.stroke,
        strokeWidth: nodeData.strokeWidth,
        rotation: nodeData.rotation || 0,
        scaleX: nodeData.scaleX || 1,
        scaleY: nodeData.scaleY || 1,
        opacity: nodeData.opacity === undefined ? 1 : nodeData.opacity,
        draggable: nodeData.draggable || false, // Default draggable to false
        // Spread other potential Konva attributes (like shadow, cornerRadius etc.)
        ...(nodeData.attrs || {})
        // Add event handlers if needed directly here (though often handled by parent)
        // onClick: nodeData.onClick,
        // onDragEnd: nodeData.onDragEnd,
    };

    // Render based on node type
    switch (nodeData.type.toLowerCase()) {
        case 'rect':
            // Ensure width/height have fallbacks if not included/removed above
            return <Rect {...commonProps} width={commonProps.width || 100} height={commonProps.height || 50} />;
        case 'circle':
            // Circle uses radius, not width/height for size typically
            return <Circle {...commonProps} radius={nodeData.radius || 30} />;
        case 'text':
            // Specific props for Text
            return (
                <Text
                    {...commonProps} // Includes x, y, width, height, styling etc.
                    text={nodeData.text || ''} // Default to empty string
                    fontSize={nodeData.fontSize || 16}
                    fontFamily={nodeData.fontFamily || 'Arial'}
                    align={nodeData.align || 'left'} // Default alignment
                    verticalAlign={nodeData.verticalAlign || 'top'} // Default alignment
                    lineHeight={nodeData.lineHeight} // Konva default is usually okay
                    // Width and height are important for text wrapping and alignment
                    width={commonProps.width}   // Use width from commonProps
                    height={commonProps.height} // Use height from commonProps
                />
            );
        case 'image':
             // Image rendering delegated to URLImage component
             if (!nodeData.src) {
                 console.warn("KonvaRenderer: Skipping Image node due to missing 'src':", nodeData);
                 // Optionally render an error placeholder
                 return <Rect x={nodeData.x || 0} y={nodeData.y || 0} width={nodeData.width || 50} height={nodeData.height || 50} fill="#ccc" stroke="red"/>;
             }
            // Pass the whole nodeData to URLImage
            // Make sure URLImage receives necessary props like id, onClick, onDragEnd if needed
            return <URLImage key={commonProps.key} nodeData={nodeData} />;
        case 'group':
            // Render a Group and recursively render its children
            return (
                <Group {...commonProps}>
                    {nodeData.children && Array.isArray(nodeData.children)
                        ? nodeData.children.map(childNode => renderNode(childNode)) // Recursively render children
                        : null /* Render nothing if children are missing or not an array */}
                </Group>
            );
        default:
            // Log unsupported types but don't crash
            console.warn(`KonvaRenderer: Unsupported Konva node type: ${nodeData.type}`);
            return null;
    }
};

// --- Main KonvaRenderer Component ---
const KonvaRenderer = forwardRef(({ jsonString }, forwardedRef) => {
    const [elementsToRender, setElementsToRender] = useState([]);
    const [error, setError] = useState(null);
    // Default stage size, will be overridden by JSON data if provided and valid
    const [stageSize, setStageSize] = useState({ width: 500, height: 300 });
    const internalStageRef = useRef(null); // Use an internal ref for the stage

    // Effect to parse the JSON string and update state
    useEffect(() => {
        setError(null); // Reset error on new data
        setElementsToRender([]); // Clear existing elements

        if (!jsonString) {
            return; // No data, show loading/empty state later
        }
        if (typeof jsonString !== 'string') {
             console.error("KonvaRenderer: Invalid design data type. Expected a JSON string, received:", typeof jsonString);
             setError("Invalid design data: Expected a JSON string.");
             setStageSize({ width: 500, height: 300 }); // Reset size on error
             return;
        }

        try {
            // --- Parsing and Handling Potential Double Stringification ---
            let rawParsedData = JSON.parse(jsonString);
            let finalKonvaData = rawParsedData;

            if (typeof rawParsedData === 'string') {
                finalKonvaData = JSON.parse(rawParsedData); // Parse the string again
            }

            let elementsArray = null;
            let parsedStageWidth = null;
            let parsedStageHeight = null;

            // --- Data Structure Validation and Stage Size Extraction ---
            if (Array.isArray(finalKonvaData)) {
                // Case 1: Data is directly an array of elements
                elementsArray = finalKonvaData;
                // Keep default stage size if only an array is provided
                setStageSize({ width: 500, height: 300 });
            } else if (typeof finalKonvaData === 'object' && finalKonvaData !== null) {
                // Case 2: Data is an object, check for 'elements' array
                if (Array.isArray(finalKonvaData.elements)) {
                     elementsArray = finalKonvaData.elements;

                     // --- CRUCIAL: Extract stage dimensions ---
                     // Check if stageWidth/stageHeight exist and are valid numbers
                     if (typeof finalKonvaData.stageWidth === 'number' && finalKonvaData.stageWidth > 0) {
                         parsedStageWidth = finalKonvaData.stageWidth;
                     } else {
                         console.warn("KonvaRenderer: stageWidth missing or invalid in JSON object. Using default.");
                     }
                     if (typeof finalKonvaData.stageHeight === 'number' && finalKonvaData.stageHeight > 0) {
                         parsedStageHeight = finalKonvaData.stageHeight;
                     } else {
                          console.warn("KonvaRenderer: stageHeight missing or invalid in JSON object. Using default.");
                     }

                     // Update stage size state ONLY if valid dimensions were found in JSON
                     if (parsedStageWidth !== null && parsedStageHeight !== null) {
                         setStageSize({ width: parsedStageWidth, height: parsedStageHeight });
                     } else {
                         // Reset to default if JSON provides object but no valid size
                         setStageSize({ width: 500, height: 300 });
                     }
                } else {
                    // Object structure is wrong (missing 'elements' array)
                     throw new Error("Parsed object does not contain a valid 'elements' array.");
                }
            } else {
                // Case 3: Format not recognized (not array, not valid object)
                 throw new Error("Processed JSON content is not a valid elements array or the expected object structure ({elements: [...]}).");
            }

            // --- Final Validation and State Update ---
            if (!Array.isArray(elementsArray)) {
                 throw new Error("Could not extract a valid elements array from the provided data.");
            }

             // --- DEBUGGING LOGS ---
            // Log the final stage size being used and the elements
            console.log("KonvaRenderer Determined Stage Size:", parsedStageWidth ?? stageSize.width, parsedStageHeight ?? stageSize.height);
            console.log("KonvaRenderer Elements to Render:", elementsArray);

            // Set the valid elements array to state
            setElementsToRender(elementsArray);

        } catch (e) {
            // Catch errors from JSON.parse OR structure validation
            console.error("KonvaRenderer: Failed to parse or process Konva JSON.", e);
            const message = e instanceof SyntaxError
                ? `Invalid JSON syntax (${e.message})`
                : `Invalid data structure or processing error (${e.message})`;
            setError(`Failed to load design: ${message}`);
            setElementsToRender([]); // Ensure elements are cleared on error
            setStageSize({ width: 500, height: 300 }); // Reset size on error
        }
    }, [jsonString]); // Only re-run when the jsonString changes

    // Effect to handle the forwarded ref, connecting it to the internal stage ref
     useEffect(() => {
        if (typeof forwardedRef === 'function') {
            forwardedRef(internalStageRef.current); // Call function ref
        } else if (forwardedRef && typeof forwardedRef === 'object') {
            forwardedRef.current = internalStageRef.current; // Assign to object ref
        }
     }, [forwardedRef]);


    // --- Render Logic ---

    // Render error message if parsing/validation failed
    if (error) {
        return (
            <div className="konva-renderer-error p-8 text-center text-red-600 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl shadow-lg backdrop-blur-sm">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-xl font-bold mb-2">Error Loading Design</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    // Render loading/empty message if no error but no elements yet
    // Check jsonString presence to differentiate between loading and genuinely empty
    if (!error && elementsToRender.length === 0) {
        const message = jsonString ? "Design is empty or still loading..." : "Loading design...";
        return (
             <div className="konva-renderer-placeholder p-8 text-center text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-3xl shadow-lg backdrop-blur-sm" style={{ width: stageSize.width, height: stageSize.height }}>
                 <div className="text-6xl mb-4">🎨</div>
                 <p className="text-xl font-medium">{message}</p>
             </div>
        );
    }

    // Render the Konva Stage with the elements
    // Only render if there's no error and elements are present
    return !error && elementsToRender.length > 0 ? (
        // Container div helps manage layout and potential overflow styling if needed
        // Using inline-block or similar can help the container size to the stage
        <div className="konva-renderer-container border-4 border-white/20 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-2xl backdrop-blur-sm w-full h-full flex items-center justify-center">
            {/* --- CRUCIAL: Stage uses the state 'stageSize' which is updated from JSON --- */}
            <Stage 
                ref={internalStageRef} 
                width={stageSize.width} 
                height={stageSize.height}
                className="max-w-full max-h-full object-contain rounded-2xl"
            >
                <Layer>
                    {/* Optional: Render a background color rectangle if needed */}
                    {/* <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill={design?.backgroundColor || '#ffffff'} id="background-rect" /> */}

                    {/* Map over the validated elementsToRender array */}
                    {elementsToRender.map(node => renderNode(node))}
                </Layer>
            </Stage>
        </div>
    ) : null; // Return null if error or still loading/empty after initial checks
});

// Add display name for React DevTools for better debugging
KonvaRenderer.displayName = 'KonvaRenderer';

export default KonvaRenderer;
