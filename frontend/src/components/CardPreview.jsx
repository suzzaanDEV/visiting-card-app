import React, { useEffect, useRef } from 'react';
// Import Konva or other rendering library if needed
// import { Stage, Layer, Text, Rect } from 'react-konva';

/**
 * Component to render a static preview of a card design.
 * Props:
 * - designJson: The JSON object representing the card design.
 * - width: The desired width of the preview canvas/container.
 * - height: The desired height of the preview canvas/container.
 * - className: Additional CSS classes for the container.
 */
const CardPreview = ({ designJson, width = 350, height = 200, className = '', fullScreen = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // --- Placeholder Rendering Logic ---
    // This is where you would integrate Konva.js or another library
    // to parse the designJson and render the elements onto a canvas
    // within the containerRef.

    console.log("Rendering Card Preview with design:", designJson);
    const container = containerRef.current;
    if (!container) return;

    // Example: Simple rendering of background color and title
    container.innerHTML = ''; // Clear previous content
    
    if (fullScreen) {
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '100vh';
    } else {
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
    }
    
    container.style.border = '1px solid #e1ecf2';
    container.style.borderRadius = '8px';
    container.style.padding = fullScreen ? '2rem' : '1rem';
    container.style.position = 'relative'; // For potential absolute positioning of elements

    let bgColor = '#ffffff'; // Default background
    let titleText = 'Card Preview'; // Default title

    if (designJson) {
      try {
        // Attempt to parse if it's a string
        const design = typeof designJson === 'string' ? JSON.parse(designJson) : designJson;
        bgColor = design.backgroundColor || '#ffffff';
        // Find a title element if structure is known (example)
        const titleElement = design.elements?.find(el => el.type === 'Text' && el.isTitle);
        if (titleElement) {
            titleText = titleElement.text || 'Card Preview';
        } else if (design.elements?.length > 0 && design.elements[0].type === 'Text') {
            // Fallback to first text element
            titleText = design.elements[0].text || 'Card Preview';
        }

      } catch (e) {
        console.error("Error parsing designJson in preview:", e);
        bgColor = '#fde0e0'; // Indicate error with background
        titleText = 'Invalid Design';
      }
    }

    container.style.backgroundColor = bgColor;

    // Add simple title element
    const titleDiv = document.createElement('div');
    titleDiv.textContent = titleText;
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.fontSize = fullScreen ? '3rem' : '1.2rem';
    titleDiv.style.color = '#1a3a63'; // Use theme color
    titleDiv.style.marginBottom = fullScreen ? '2rem' : '0.5rem';
    titleDiv.style.textAlign = 'center';
    container.appendChild(titleDiv);

    const placeholderText = document.createElement('p');
    placeholderText.textContent = '(Visual elements render here)';
    placeholderText.style.fontSize = fullScreen ? '1.5rem' : '0.8rem';
    placeholderText.style.color = '#6b7280';
    placeholderText.style.textAlign = 'center';
    placeholderText.style.marginTop = fullScreen ? '4rem' : '2rem';
    container.appendChild(placeholderText);

    // --- End Placeholder Rendering Logic ---

  }, [designJson, width, height, fullScreen]); // Rerun when design or dimensions change

  return (
    <div 
      ref={containerRef} 
      className={`card-preview-container ${className} ${fullScreen ? 'w-full h-full min-h-screen' : ''}`}
    >
      {/* Canvas or rendering elements will be added here by useEffect */}
    </div>
  );
};

export default CardPreview;
