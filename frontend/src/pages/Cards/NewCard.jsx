import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Stage, Layer, Rect, Circle, Text, Transformer, Image as KonvaImage, Group, Star, Line } from 'react-konva';
import { SketchPicker } from 'react-color';
import {
    FiSquare, FiCircle, FiType, FiImage, FiSave, FiTrash2, FiLoader, FiLayers, FiGrid, FiCopy,
    FiArrowUp, FiArrowDown, FiEye, FiEyeOff, FiLock, FiUnlock, FiCornerUpLeft, FiCornerUpRight,
    FiAlignCenter, FiAlignLeft, FiAlignRight, FiMaximize, FiMinimize, FiPlus, FiMinus, FiChevronsUp, FiChevronsDown,
    FiStar, FiMaximize2, FiMinimize2, FiColumns, FiSidebar, FiEdit, FiCrop, FiRotateCw, FiZoomIn, FiZoomOut,
    FiCheckSquare, FiLink, FiLink2
} from 'react-icons/fi';
import { FaSlash, FaObjectGroup, FaObjectUngroup, FaBold, FaItalic, FaUnderline, FaEraser, FaMagic, FaFillDrip, FaPaintBrush } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import useImage from 'use-image';
import { createCard, updateCard } from '../../features/cards/cardsThunks';
// import { createCard, updateCard } from '../../features/cards/cardsThunks';

// --- Redux Actions (Import your actual thunks) ---
// import { createCard, updateCard } from '../../features/cards/cardsThunks'; // Adjust path
// Placeholder for dispatch simulation



// --- Helper: Image Component ---
const ImageFromSrc = ({ shapeProps, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef();
    const [image, status] = useImage(shapeProps.src, 'Anonymous');

    useEffect(() => { /* Transformer handled by parent */ }, [isSelected]);

    if (status === 'loading') return <Rect x={shapeProps.x} y={shapeProps.y} width={shapeProps.width || 100} height={shapeProps.height || 100} fill="#f0f4f8" listening={false} cornerRadius={shapeProps.cornerRadius} />;
    if (status === 'failed') return <Rect x={shapeProps.x} y={shapeProps.y} width={shapeProps.width || 100} height={shapeProps.height || 100} fill="#fee2e2" stroke="#ef4444" strokeWidth={1} listening={false} cornerRadius={shapeProps.cornerRadius} />;

    return (
        <KonvaImage
            ref={shapeRef}
            {...shapeProps}
            image={image}
            onClick={onSelect} // Propagate select event
            onTap={onSelect}   // Propagate select event for touch
            onDragEnd={(e) => { onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() }); }}
            onTransformEnd={(e) => {
                const node = shapeRef.current; if (!node) return;
                const scaleX = node.scaleX(); const scaleY = node.scaleY();
                node.scaleX(1); node.scaleY(1);
                onChange({
                    ...shapeProps, x: node.x(), y: node.y(),
                    width: Math.max(5, node.width() * scaleX), height: Math.max(5, node.height() * scaleY),
                    rotation: node.rotation(),
                });
            }}
        />
    );
};

// --- Custom Filter Effects ---
const FilterPreview = ({ filter, onClick }) => {
    const size = 40;
    const sampleRef = useRef();

    return (
        <div
            className="filter-preview relative cursor-pointer hover:scale-110 transition-transform"
            onClick={onClick}
        >
            <div
                ref={sampleRef}
                className="w-10 h-10 rounded border border-gray-300 overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    filter: filter.css
                }}
            ></div>
            <span className="block text-center text-xs mt-1 truncate w-12">{filter.name}</span>
        </div>
    );
};

// --- Main Editor Component ---
const NewCard = () => {
    const { isLoading: isSaving, error: saveError } = useSelector((state) => state.cards || { isLoading: false, error: null });

    // --- State ---
    const [elements, setElements] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [historyStack, setHistoryStack] = useState([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [cardTitle, setCardTitle] = useState('My New Card');
    const [cardId, setCardId] = useState(null); // To track existing card ID for updates
    const [isPublic, setIsPublic] = useState(true);
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [showElementColorPicker, setShowElementColorPicker] = useState(null); // { type: 'fill' | 'stroke' }
    const [layers, setLayers] = useState([{ id: uuidv4(), name: 'Layer 1', visible: true, locked: false }]);
    const [activeLayerIndex, setActiveLayerIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [isShiftDown, setIsShiftDown] = useState(false); // State for Shift key
    const [isAltDown, setIsAltDown] = useState(false); // State for Alt key
    const [isSpaceDown, setIsSpaceDown] = useState(false); // For panning
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawMode, setDrawMode] = useState(null); // null | 'brush' | 'eraser'
    const [brushSize, setBrushSize] = useState(5);
    const [brushColor, setBrushColor] = useState('#000000');
    const [showBrushPicker, setShowBrushPicker] = useState(false);
    const [currentPathPoints, setCurrentPathPoints] = useState([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetId: null });
    const [editingTextId, setEditingTextId] = useState(null);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [gridSize, setGridSize] = useState(20);
    const [showRulers, setShowRulers] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 480 });
    const [lastSaved, setLastSaved] = useState(null);
    const [showEffectsPanel, setShowEffectsPanel] = useState(false);
    const [activeTab, setActiveTab] = useState('layers'); // 'layers', 'effects', 'filters'
    const [filterPresets, setFilterPresets] = useState([
        { id: 'none', name: 'None', css: 'none' },
        { id: 'grayscale', name: 'Grayscale', css: 'grayscale(1)' },
        { id: 'sepia', name: 'Sepia', css: 'sepia(0.7)' },
        { id: 'invert', name: 'Invert', css: 'invert(0.8)' },
        { id: 'blur', name: 'Blur', css: 'blur(2px)' },
        { id: 'contrast', name: 'Contrast', css: 'contrast(1.5)' },
        { id: 'saturate', name: 'Saturate', css: 'saturate(2)' },
        { id: 'hue', name: 'Hue Shift', css: 'hue-rotate(90deg)' }
    ]);
    const [tooltipText, setTooltipText] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [showTooltip, setShowTooltip] = useState(false);

    // Add form state for card details
    const [showCardForm, setShowCardForm] = useState(true);
    const [cardFormData, setCardFormData] = useState({
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        website: '',
        company: '',
        address: '',
        bio: ''
    });
    
    // Add some default elements when the form is submitted
    const initializeDefaultElements = () => {
        const defaultElements = [
            {
                id: uuidv4(),
                type: 'Text',
                x: 50,
                y: 50,
                text: cardFormData.fullName || 'Your Name',
                fontSize: 24,
                fill: '#2D3748',
                fontFamily: 'Arial',
                draggable: true,
                layerIndex: 0
            },
            {
                id: uuidv4(),
                type: 'Text',
                x: 50,
                y: 80,
                text: cardFormData.jobTitle || 'Job Title',
                fontSize: 16,
                fill: '#4A5568',
                fontFamily: 'Arial',
                draggable: true,
                layerIndex: 0
            },
            {
                id: uuidv4(),
                type: 'Text',
                x: 50,
                y: 110,
                text: cardFormData.company || 'Company',
                fontSize: 14,
                fill: '#718096',
                fontFamily: 'Arial',
                draggable: true,
                layerIndex: 0
            }
        ];
        setElements(defaultElements);
        saveToHistory(defaultElements);
    };

    // Refs
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const isDirtyRef = useRef(false);
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);
    const textEditAreaRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const rulerHorizontalRef = useRef(null);
    const rulerVerticalRef = useRef(null);

    // --- History Management ---
    const saveToHistory = useCallback((newElementsState) => {
        const newStack = historyStack.slice(0, historyIndex + 1);
        const limitedStack = newStack.length > 50 ? newStack.slice(newStack.length - 50) : newStack;
        setHistoryStack([...limitedStack, newElementsState]);
        setHistoryIndex(limitedStack.length);
        isDirtyRef.current = true;
    }, [historyStack, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            console.log("Undo");
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setElements(historyStack[prevIndex]);
            setSelectedIds([]);
            isDirtyRef.current = true;
        }
    }, [historyIndex, historyStack]);

    const redo = useCallback(() => {
        if (historyIndex < historyStack.length - 1) {
            console.log("Redo");
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setElements(historyStack[nextIndex]);
            setSelectedIds([]);
            isDirtyRef.current = true;
        }
    }, [historyIndex, historyStack]);

    // --- Element Management Callbacks ---
    const updateElement = useCallback((id, newAttrs) => {
        const newElements = elements.map(el => (el.id === id ? { ...el, ...newAttrs } : el));
        setElements(newElements);
        saveToHistory(newElements); // Save state after update
    }, [elements, saveToHistory]);

    const deleteSelectedElements = useCallback(() => {
        if (selectedIds.length === 0 || layers[activeLayerIndex]?.locked) return;
        const newElements = elements.filter(el => !selectedIds.includes(el.id));
        setElements(newElements);
        saveToHistory(newElements);
        setSelectedIds([]);
    }, [elements, selectedIds, activeLayerIndex, layers, saveToHistory]);

    const moveSelectedElements = useCallback((dx, dy) => {
        if (selectedIds.length === 0 || layers[activeLayerIndex]?.locked) return;

        // Apply snap to grid if enabled
        if (snapToGrid) {
            dx = Math.round(dx / gridSize) * gridSize;
            dy = Math.round(dy / gridSize) * gridSize;
        }

        const newElements = elements.map(el => {
            if (selectedIds.includes(el.id)) {
                let newX = el.x + dx;
                let newY = el.y + dy;

                // Apply snap to grid for position if enabled
                if (snapToGrid) {
                    newX = Math.round(newX / gridSize) * gridSize;
                    newY = Math.round(newY / gridSize) * gridSize;
                }

                return { ...el, x: newX, y: newY };
            }
            return el;
        });

        setElements(newElements);
        saveToHistory(newElements);
    }, [elements, selectedIds, activeLayerIndex, layers, saveToHistory, snapToGrid, gridSize]);

    const duplicateSelectedElements = useCallback(() => {
        if (selectedIds.length === 0 || layers[activeLayerIndex]?.locked) return;

        const selectedElements = elements.filter(el => selectedIds.includes(el.id));
        const newDuplicatedElements = selectedElements.map(el => ({
            ...el,
            id: uuidv4(), // Generate new ID
            x: el.x + 20, // Offset a bit
            y: el.y + 20
        }));

        const newElements = [...elements, ...newDuplicatedElements];
        setElements(newElements);
        saveToHistory(newElements);

        // Select the duplicated elements
        setSelectedIds(newDuplicatedElements.map(el => el.id));
    }, [elements, selectedIds, activeLayerIndex, layers, saveToHistory]);

    // --- Apply Filter to Selected Elements ---
    const applyFilterToSelection = useCallback((filterId) => {
        if (selectedIds.length === 0) return;

        const filterToApply = filterPresets.find(f => f.id === filterId);
        if (!filterToApply) return;

        const newElements = elements.map(el => {
            if (selectedIds.includes(el.id)) {
                // Store the CSS filter string in the element data
                return { ...el, filter: filterId, filterCss: filterToApply.css };
            }
            return el;
        });

        setElements(newElements);
        saveToHistory(newElements);
    }, [elements, selectedIds, filterPresets, saveToHistory]);

    // Group/Ungroup elements
    const groupSelectedElements = useCallback(() => {
        if (selectedIds.length <= 1 || layers[activeLayerIndex]?.locked) return;

        const groupId = uuidv4();
        // Get bounding box of all selected elements
        const selectedElems = elements.filter(el => selectedIds.includes(el.id));

        // Find bounding box
        let minX = Math.min(...selectedElems.map(el => el.x));
        let minY = Math.min(...selectedElems.map(el => el.y));
        let maxX = Math.max(...selectedElems.map(el => el.x + (el.width || el.radius * 2 || 0)));
        let maxY = Math.max(...selectedElems.map(el => el.y + (el.height || el.radius * 2 || 0)));

        // Create group object
        const groupElement = {
            id: groupId,
            type: 'Group',
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            children: selectedIds,
            draggable: true,
            opacity: 1,
            layerIndex: activeLayerIndex
        };

        // Update child elements to be relative to group
        const updatedElements = elements.map(el => {
            if (selectedIds.includes(el.id)) {
                return {
                    ...el,
                    groupId: groupId,
                    originalX: el.x,
                    originalY: el.y,
                    x: el.x - minX, // Make positions relative to group
                    y: el.y - minY
                };
            }
            return el;
        });

        // Add group to elements
        const newElements = [...updatedElements, groupElement];
        setElements(newElements);
        saveToHistory(newElements);
        setSelectedIds([groupId]); // Select the group
    }, [elements, selectedIds, activeLayerIndex, layers, saveToHistory]);

    const ungroupSelectedElements = useCallback(() => {
        if (selectedIds.length !== 1 || layers[activeLayerIndex]?.locked) return;

        const groupId = selectedIds[0];
        const groupElement = elements.find(el => el.id === groupId && el.type === 'Group');

        if (!groupElement) return;

        // Update children to remove group association and restore original positions
        const newElements = elements
            .filter(el => el.id !== groupId) // Remove the group
            .map(el => {
                if (el.groupId === groupId) {
                    const groupX = groupElement.x;
                    const groupY = groupElement.y;

                    return {
                        ...el,
                        groupId: undefined,
                        x: el.x + groupX, // Restore absolute positions
                        y: el.y + groupY
                    };
                }
                return el;
            });

        setElements(newElements);
        saveToHistory(newElements);
        setSelectedIds(groupElement.children || []); // Select all children
    }, [elements, selectedIds, activeLayerIndex, layers, saveToHistory]);

    const dispatch = useDispatch();
    // --- Save Logic ---
    const handleSave = useCallback(async () => {
        console.log("Save triggered");
        
        // Validate required fields
        if (!cardFormData.fullName || cardFormData.fullName.trim() === '') {
            alert('Full name is required');
            return;
        }
        
        if (!stageRef.current) return;
        transformerRef.current?.hide();
        stageRef.current.batchDraw();

        // Serialize the current elements state along with background
        const designData = {
            width: canvasSize.width,
            height: canvasSize.height,
            backgroundColor: backgroundColor,
            layers: layers,
            elements: elements
        };
        const designJsonString = JSON.stringify(designData);
        console.log("Serialized Design JSON:", designJsonString.substring(0, 100) + "...");

        transformerRef.current?.show();
        stageRef.current.batchDraw();

        const cardDataPayload = {
            id: cardId, // Include ID for updates
            title: cardTitle,
            isPublic: isPublic,
            designJson: designJsonString,
            // Include card form data
            fullName: cardFormData.fullName,
            jobTitle: cardFormData.jobTitle,
            email: cardFormData.email,
            phone: cardFormData.phone,
            website: cardFormData.website,
            company: cardFormData.company,
            address: cardFormData.address,
            bio: cardFormData.bio
        };
        console.log(`Dispatching ${cardId ? 'updateCard' : 'createCard'} with payload:`, cardDataPayload);

        try {
            // Actual dispatch
            if (cardId) {
                const result = await dispatch(updateCard({ cardId, cardData: cardDataPayload })).unwrap();
                console.log('Update result:', result);
                setLastSaved(new Date());
            } else {
                const result = await dispatch(createCard(cardDataPayload)).unwrap();
                console.log('Create result:', result);
                setCardId(result.card?._id || result._id);
                setLastSaved(new Date());
            }

            alert(`Card ${cardId ? 'updated' : 'saved'} successfully!`);
            isDirtyRef.current = false;
        } catch (err) {
            console.error("Failed to save card:", err);
            alert(`Error saving card: ${err?.message || 'Unknown error'}`);
        }
    }, [dispatch, cardId, cardTitle, isPublic, elements, backgroundColor, layers, canvasSize, cardFormData]);


    // --- Keyboard Shortcuts & Key State Handling ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Shift') setIsShiftDown(true);
            if (e.key === 'Alt') setIsAltDown(true);
            if (e.key === ' ') setIsSpaceDown(true); // Space bar for panning

            const targetTagName = e.target.tagName.toLowerCase();
            const isInputFocused = targetTagName === 'input' || targetTagName === 'textarea';

            // Allow basic text editing shortcuts even in inputs
            if (isInputFocused && !((e.metaKey || e.ctrlKey) && ['z', 'y', 'Z', 'c', 'v', 'x', 'a', 'd'].includes(e.key))) {
                return;
            }

            // Undo/Redo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Z') { e.preventDefault(); redo(); }

            // Select all
            if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !isInputFocused) {
                e.preventDefault();
                const selectableElements = elements.filter(el =>
                    el.layerIndex === activeLayerIndex &&
                    !layers[el.layerIndex]?.locked
                );
                setSelectedIds(selectableElements.map(el => el.id));
            }

            // Delete selected
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0 && !isInputFocused) {
                e.preventDefault(); // Prevent browser back navigation on backspace
                deleteSelectedElements();
            }

            // Duplicate selected (Ctrl+D)
            if ((e.metaKey || e.ctrlKey) && e.key === 'd' && !isInputFocused) {
                e.preventDefault();
                duplicateSelectedElements();
            }

            // Group/Ungroup (Ctrl+G / Ctrl+Shift+G)
            if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
                e.preventDefault();
                if (e.shiftKey) {
                    ungroupSelectedElements();
                } else {
                    groupSelectedElements();
                }
            }

            // Toggle snap to grid (Ctrl+')
            if ((e.metaKey || e.ctrlKey) && e.key === "'") {
                e.preventDefault();
                setSnapToGrid(!snapToGrid);
            }

            // Arrow keys to move selected elements
            const moveDistance = e.shiftKey ? 10 : 1;
            if (selectedIds.length > 0 && !isInputFocused) {
                let dx = 0, dy = 0;
                switch (e.key) {
                    case 'ArrowUp': dy = -moveDistance; e.preventDefault(); break;
                    case 'ArrowDown': dy = moveDistance; e.preventDefault(); break;
                    case 'ArrowLeft': dx = -moveDistance; e.preventDefault(); break;
                    case 'ArrowRight': dx = moveDistance; e.preventDefault(); break;
                    default: break;
                }
                if (dx !== 0 || dy !== 0) moveSelectedElements(dx, dy);
            }

            // Escape to deselect
            if (e.key === 'Escape') {
                setSelectedIds([]);
                setShowElementColorPicker(null);
                setShowBgPicker(false);
                setShowBrushPicker(false);
                setDrawMode(null);
                setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
            }

            // Save (Ctrl+S)
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Shift') setIsShiftDown(false);
            if (e.key === 'Alt') setIsAltDown(false);
            if (e.key === ' ') setIsSpaceDown(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [undo, redo, selectedIds, elements, activeLayerIndex, layers, deleteSelectedElements,
        moveSelectedElements, duplicateSelectedElements, groupSelectedElements,
        ungroupSelectedElements, snapToGrid, handleSave]);

    // --- Transformer Logic ---
    useEffect(() => {
        if (transformerRef.current) {
            const stage = stageRef.current;
            const nodes = selectedIds
                .map(id => stage.findOne('#' + id))
                .filter(node => node && !layers[node.attrs.layerIndex]?.locked); // Check layer lock here too

            if (nodes.length > 0) {
                transformerRef.current.nodes(nodes);
                transformerRef.current.getLayer()?.batchDraw();
            } else {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        }
    }, [selectedIds, layers]);

    // --- Layer Management ---
    const addLayer = () => {
        const newLayer = { id: uuidv4(), name: `Layer ${layers.length + 1}`, visible: true, locked: false };
        setLayers([...layers, newLayer]);
        setActiveLayerIndex(layers.length); // Activate the new layer
    };

    const selectLayer = (index) => {
        setActiveLayerIndex(index);
        setSelectedIds([]); // Deselect elements when changing layer
    };

    const toggleLayerVisibility = (index) => {
        const newLayers = layers.map((l, i) => i === index ? { ...l, visible: !l.visible } : l);
        setLayers(newLayers);
        if (activeLayerIndex === index && !newLayers[index].visible) setSelectedIds([]);
    };

    const toggleLayerLock = (index) => {
        const newLayers = layers.map((l, i) => i === index ? { ...l, locked: !l.locked } : l);
        setLayers(newLayers);
        if (activeLayerIndex === index && newLayers[index].locked) setSelectedIds([]);
    };

    const renameLayer = (index, name) => {
        const newLayers = [...layers];
        newLayers[index].name = name || `Layer ${index + 1}`; // Provide default name
        setLayers(newLayers);
    };

    const deleteLayer = (index) => {
        if (layers.length <= 1) return; // Must have at least one layer

        // Remove elements on this layer
        const newElements = elements.filter(el => el.layerIndex !== index);

        // Update layer indices for elements on layers above the deleted one
        const adjustedElements = newElements.map(el => {
            if (el.layerIndex > index) {
                return { ...el, layerIndex: el.layerIndex - 1 };
            }
            return el;
        });

        // Remove the layer
        const newLayers = layers.filter((_, i) => i !== index);

        // Adjust active layer
        let newActiveLayer = activeLayerIndex;
        if (index === activeLayerIndex) {
            newActiveLayer = Math.max(0, index - 1);
        } else if (index < activeLayerIndex) {
            newActiveLayer = activeLayerIndex - 1;
        }

        setLayers(newLayers);
        setElements(adjustedElements);
        setActiveLayerIndex(newActiveLayer);
        saveToHistory(adjustedElements);
    };

    const moveLayer = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === layers.length - 1)) return;

        const newLayers = [...layers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newLayers[index], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[index]]; // Swap

        // Update elements' layer indices to maintain the correct associations
        const newElements = elements.map(el => {
            if (el.layerIndex === index) {
                return { ...el, layerIndex: targetIndex };
            } else if (el.layerIndex === targetIndex) {
                return { ...el, layerIndex: index };
            }
            return el;
        });

        setLayers(newLayers);
        setElements(newElements);
        if (activeLayerIndex === index) setActiveLayerIndex(targetIndex);
        else if (activeLayerIndex === targetIndex) setActiveLayerIndex(index);
        isDirtyRef.current = true;
        saveToHistory(newElements);
    };

    // --- Element Creation (Add Element) ---
    const addElement = (type) => {
        if (layers[activeLayerIndex]?.locked) return;
        const stage = stageRef.current; if (!stage) return;
        const container = containerRef.current;
        const containerRect = container?.getBoundingClientRect() || { width: 800, height: 480 };
        const viewCenterX = containerRect.width / 2;
        const viewCenterY = containerRect.height / 2;
        const stageCenterPos = { x: (viewCenterX - stagePos.x) / zoom, y: (viewCenterY - stagePos.y) / zoom };

        const commonProps = {
            id: uuidv4(), x: stageCenterPos.x - 50, y: stageCenterPos.y - 25,
            draggable: true, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1,
            layerIndex: activeLayerIndex,
        };
        let newElement;
        switch (type) {
            case 'rect': newElement = { ...commonProps, type: 'Rect', width: 120, height: 70, fill: '#A0AEC0', stroke: '#4A5568', strokeWidth: 1, cornerRadius: 0 }; break;
            case 'circle': newElement = { ...commonProps, type: 'Circle', radius: 50, fill: '#FBB6CE', stroke: '#E53E3E', strokeWidth: 1 }; break;
            case 'text': newElement = { ...commonProps, type: 'Text', text: 'New Text', fontSize: 28, fill: '#2D3748', fontFamily: 'Arial' }; break;
            case 'star': newElement = { ...commonProps, type: 'Star', numPoints: 5, innerRadius: 20, outerRadius: 50, fill: '#FFD700', stroke: '#FF8C00', strokeWidth: 1 }; break;
            case 'line': newElement = { ...commonProps, type: 'Line', points: [0, 0, 100, 0], stroke: '#2D3748', strokeWidth: 4, lineCap: 'round', tension: 0 }; break;
            default: return;
        }
        const newElements = [...elements, newElement];
        setElements(newElements);
        saveToHistory(newElements);
        setSelectedIds([newElement.id]);
    };

    // --- Drawing Mode ---
    const startDrawing = (e) => {
        if (!drawMode || layers[activeLayerIndex]?.locked) return;

        const stage = stageRef.current;
        if (!stage) return;

        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        // Convert to stage coordinates
        const stageX = (pointerPos.x - stagePos.x) / zoom;
        const stageY = (pointerPos.y - stagePos.y) / zoom;

        setIsDrawing(true);
        setCurrentPathPoints([stageX, stageY]);
    };

    const continueDrawing = (e) => {
        if (!isDrawing || !drawMode) return;

        const stage = stageRef.current;
        if (!stage) return;

        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        // Convert to stage coordinates
        const stageX = (pointerPos.x - stagePos.x) / zoom;
        const stageY = (pointerPos.y - stagePos.y) / zoom;

        setCurrentPathPoints([...currentPathPoints, stageX, stageY]);
    };

    const finishDrawing = () => {
        if (!isDrawing || !drawMode || currentPathPoints.length < 4) {
            setIsDrawing(false);
            setCurrentPathPoints([]);
            return;
        }

        // Create a new path element
        const newPath = {
            id: uuidv4(),
            type: 'Line',
            points: currentPathPoints,
            stroke: drawMode === 'brush' ? brushColor : backgroundColor, // Eraser uses background color
            strokeWidth: brushSize,
            lineCap: 'round',
            lineJoin: 'round',
            tension: 0.5, // For smoother curves
            draggable: true,
            opacity: drawMode === 'eraser' ? 1 : 1, // Could make eraser strokes less opaque if needed
            layerIndex: activeLayerIndex
        };

        const newElements = [...elements, newPath];
        setElements(newElements);
        saveToHistory(newElements);

        // Reset drawing state
        setIsDrawing(false);
        setCurrentPathPoints([]);
    };

    // --- Stage Interaction ---
    const handleStageClick = (e) => {
        // If in drawing mode, don't handle click events normally
        if (drawMode) return;

        const clickedOnEmpty = e.target === e.target.getStage() || e.target.attrs.id === 'stage-background';
        const clickedOnTransformer = e.target.getParent()?.className === 'Transformer';

        if (clickedOnEmpty) {
            if (!e.evt.shiftKey) setSelectedIds([]);
            setShowElementColorPicker(null);
            setEditingTextId(null);
            handleTextEditBlur();
            return;
        }
        if (clickedOnTransformer) return;

        const id = e.target.id();
        const element = elements.find(el => el.id === id);

        if (element) {
            const layerLocked = layers[element.layerIndex]?.locked;
            if (layerLocked) { setSelectedIds([]); return; }

            const isSelected = selectedIds.includes(id);
            const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;

            if (!metaPressed) setSelectedIds([id]);
            else {
                if (isSelected) setSelectedIds(selectedIds.filter(sid => sid !== id));
                else setSelectedIds([...selectedIds, id]);
            }
        } else {
            if (!e.evt.shiftKey) setSelectedIds([]);
        }
    };

    // --- Canvas Resizing ---
    const updateCanvasSize = (newWidth, newHeight) => {
        setCanvasSize({
            width: Math.max(100, parseInt(newWidth) || 800),
            height: Math.max(100, parseInt(newHeight) || 480)
        });
    };

    // Context Menu Handler
    const handleContextMenu = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current; if (!stage) return;
        const pointerPos = stage.getPointerPosition();
        const containerRect = containerRef.current?.getBoundingClientRect();
        const menuX = (e.evt.clientX - (containerRect?.left || 0));
        const menuY = (e.evt.clientY - (containerRect?.top || 0));
        const id = e.target.id();
        const element = elements.find(el => el.id === id);
        setContextMenu({ visible: true, x: menuX, y: menuY, targetId: element ? id : null });
    };

    // Close context menu effect
    useEffect(() => {
        const handleClickOutside = (e) => { setContextMenu(prev => ({ ...prev, visible: false })); };
        if (contextMenu.visible) document.addEventListener('click', handleClickOutside);
        else document.removeEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenu.visible]);

    // --- Text Editing ---
    const handleTextDblClick = (e, element) => {
        if (layers[element.layerIndex]?.locked || drawMode) return;

        const textNode = e.target;
        textNode.hide();
        transformerRef.current?.hide();
        setEditingTextId(element.id);

        const textPosition = textNode.absolutePosition();
        const stageBox = stageRef.current.container().getBoundingClientRect();
        const areaPosition = {
            x: stageBox.left + textPosition.x * zoom + stagePos.x,
            y: stageBox.top + textPosition.y * zoom + stagePos.y,
        };

        const textarea = textEditAreaRef.current;
        if (!textarea) return;

        textarea.value = element.text;
        textarea.style.display = 'block';
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = textNode.width() * textNode.scaleX() * zoom + 'px';
        textarea.style.height = textNode.height() * textNode.scaleY() * zoom + 'px';
        textarea.style.fontSize = (element.fontSize || 16) * zoom + 'px';
        textarea.style.border = '1px solid #6366f1';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'white';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = String(textNode.lineHeight() || 1.2);
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = textNode.align();
        textarea.style.color = textNode.fill();
        textarea.style.transform = `rotateZ(${textNode.rotation()}deg)`;
        textarea.focus();
        textarea.select();
    };

    const handleTextEditBlur = () => {
        if (editingTextId && textEditAreaRef.current) {
            const newText = textEditAreaRef.current.value;
            updateElement(editingTextId, { text: newText });

            textEditAreaRef.current.style.display = 'none';
            const stage = stageRef.current;
            const textNode = stage.findOne('#' + editingTextId);
            textNode?.show();
            transformerRef.current?.show();
            stage?.batchDraw();
            setEditingTextId(null);
        }
    };

    const handleTextareaKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextEditBlur(); }
        if (e.key === 'Escape') { textEditAreaRef.current.value = elements.find(el => el.id === editingTextId)?.text || ''; handleTextEditBlur(); }
    };

    // --- Properties Panel ---
    const selectedElement = elements.find(el => el.id === selectedIds[0]) || null; // Get first selected
    const handlePropertyChange = (prop, value) => {
        if (selectedIds.length === 0) return;
        const numericProps = ['fontSize', 'strokeWidth', 'opacity', 'cornerRadius', 'radius', 'numPoints', 'innerRadius', 'outerRadius'];
        const finalValue = numericProps.includes(prop) ? parseFloat(value) || 0 : value;
        const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, [prop]: finalValue } : el);
        setElements(newElements);
        saveToHistory(newElements);
    };

    const handleColorChangeComplete = (color) => {
        if (selectedIds.length > 0 && showElementColorPicker?.type) {
            const prop = showElementColorPicker.type;
            const newElements = elements.map(el => {
                if (selectedIds.includes(el.id)) {
                    if ((prop === 'fill' && ['Rect', 'Circle', 'Text', 'Star'].includes(el.type)) ||
                        (prop === 'stroke' && ['Rect', 'Circle', 'Star', 'Line'].includes(el.type))) {
                        return { ...el, [prop]: color.hex };
                    }
                } return el;
            });
            setElements(newElements);
            saveToHistory(newElements);
        }
    };

    // --- Alignment Helpers ---
    const alignSelectedElements = (alignment) => {
        if (selectedIds.length <= 1 || layers[activeLayerIndex]?.locked) return;

        const selectedElems = elements.filter(el => selectedIds.includes(el.id));

        // Calculate bounds for alignment reference
        let left = Math.min(...selectedElems.map(el => el.x));
        let right = Math.max(...selectedElems.map(el => el.x + (el.width || el.radius * 2 || 0)));
        let top = Math.min(...selectedElems.map(el => el.y));
        let bottom = Math.max(...selectedElems.map(el => el.y + (el.height || el.radius * 2 || 0)));
        let centerX = (left + right) / 2;
        let centerY = (top + bottom) / 2;

        const newElements = elements.map(el => {
            if (selectedIds.includes(el.id)) {
                const width = el.width || (el.radius ? el.radius * 2 : 0);
                const height = el.height || (el.radius ? el.radius * 2 : 0);

                switch (alignment) {
                    case 'left': return { ...el, x: left };
                    case 'center': return { ...el, x: centerX - width / 2 };
                    case 'right': return { ...el, x: right - width };
                    case 'top': return { ...el, y: top };
                    case 'middle': return { ...el, y: centerY - height / 2 };
                    case 'bottom': return { ...el, y: bottom - height };
                    case 'distribute-horizontally': {
                        // For distribute we need more complex logic
                        // First sort all elements by x position
                        const sorted = [...selectedElems].sort((a, b) => a.x - b.x);
                        const index = sorted.findIndex(item => item.id === el.id);
                        const totalWidth = right - left;
                        const step = totalWidth / (sorted.length - 1 || 1);
                        return { ...el, x: left + index * step };
                    }
                    case 'distribute-vertically': {
                        const sorted = [...selectedElems].sort((a, b) => a.y - b.y);
                        const index = sorted.findIndex(item => item.id === el.id);
                        const totalHeight = bottom - top;
                        const step = totalHeight / (sorted.length - 1 || 1);
                        return { ...el, y: top + index * step };
                    }
                    default: return el;
                }
            }
            return el;
        });

        setElements(newElements);
        saveToHistory(newElements);
    };

    // --- Image Upload ---
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    const stage = stageRef.current;
                    const stageWidth = stage?.getAttr('width') / zoom || canvasSize.width;
                    const stageHeight = stage?.getAttr('height') / zoom || canvasSize.height;
                    const scale = Math.min(1, 200 / img.width, 150 / img.height);
                    const newImageElement = {
                        id: uuidv4(), type: 'Image',
                        x: (stageWidth / 2) - (img.width * scale / 2),
                        y: (stageHeight / 2) - (img.height * scale / 2),
                        src: e.target.result, width: img.width * scale, height: img.height * scale,
                        draggable: true, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1,
                        layerIndex: activeLayerIndex,
                        imgWidth: img.width, imgHeight: img.height,
                    };
                    const newElements = [...elements, newImageElement];
                    setElements(newElements);
                    saveToHistory(newElements);
                    setSelectedIds([newImageElement.id]);
                };
                img.onerror = () => alert("Failed to load image dimensions.");
                img.src = e.target.result;
            };
            reader.onerror = () => alert("Failed to read file.");
            reader.readAsDataURL(file);
        } else { alert("Please select a valid image file."); }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const triggerImageUpload = () => fileInputRef.current?.click();


    // --- Auto Save ---
    useEffect(() => {
        // Set up auto-save timer (every 20 seconds)
        if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setInterval(() => {
            if (isDirtyRef.current && cardId) {
                console.log("Auto-saving changes...");
                handleSave();
            }
        }, 20000); // Auto-save every 20 seconds

        return () => {
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, [handleSave, cardId]);

    // --- Zoom Logic ---
    const handleWheel = (e) => {
        e.evt.preventDefault();

        if (e.evt.ctrlKey || e.evt.metaKey) {
            // Zoom with ctrl/cmd + wheel
            const scaleBy = 1.05;
            const stage = stageRef.current;
            const oldScale = zoom;

            const pointerPos = stage.getPointerPosition();
            const mousePointTo = {
                x: (pointerPos.x - stagePos.x) / oldScale,
                y: (pointerPos.y - stagePos.y) / oldScale,
            };

            // Calculate new scale
            const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
            const limitedScale = Math.max(0.1, Math.min(10, newScale));

            // Calculate new position
            const newPos = {
                x: pointerPos.x - mousePointTo.x * limitedScale,
                y: pointerPos.y - mousePointTo.y * limitedScale,
            };

            setZoom(limitedScale);
            setStagePos(newPos);
        } else if (isSpaceDown) {
            // Pan with space + wheel
            setStagePos({
                x: stagePos.x - e.evt.deltaX,
                y: stagePos.y - e.evt.deltaY,
            });
        } else {
            // Normal scrolling (vertical)
            setStagePos({
                x: stagePos.x,
                y: stagePos.y - e.evt.deltaY,
            });
        }
    };

    const zoomInOut = (factor) => {
        const newZoom = zoom * factor;
        const limitedZoom = Math.max(0.1, Math.min(10, newZoom));

        // Adjust position to zoom toward center
        const stage = stageRef.current;
        if (stage) {
            const oldScale = zoom;
            const newScale = limitedZoom;

            const stageWidth = stage.width();
            const stageHeight = stage.height();

            // Calculate center point
            const centerX = stageWidth / 2;
            const centerY = stageHeight / 2;

            // Calculate new position to maintain center
            const newPos = {
                x: centerX - (centerX - stagePos.x) * (newScale / oldScale),
                y: centerY - (centerY - stagePos.y) * (newScale / oldScale),
            };

            setZoom(limitedZoom);
            setStagePos(newPos);
        } else {
            setZoom(limitedZoom);
        }
    };

    const zoomIn = () => zoomInOut(1.2);
    const zoomOut = () => zoomInOut(1 / 1.2);

    const resetZoom = () => {
        const stage = stageRef.current;
        if (stage) {
            const centerPos = {
                x: (stage.width() - canvasSize.width) / 2,
                y: (stage.height() - canvasSize.height) / 2
            };
            setZoom(1);
            setStagePos(centerPos);
        }
    };
// Get konva filter
    const getKonvaFilter = (filterId) => {
        switch (filterId) {
            case 'grayscale': return Konva.Filters.Grayscale;
            case 'sepia':     return Konva.Filters.Sepia;
            case 'invert':    return Konva.Filters.Invert;
            case 'blur':      return Konva.Filters.Blur;
            // NOTE: Konva might handle Contrast, Saturate, HueRotate differently.
            // You might need Konva.Filters.Contrast, Konva.Filters.Saturate, Konva.Filters.HSL
            // Check Konva docs for how to apply these specific values.
            // For now, we'll map the ones that have direct equivalents.
            default:          return null;
        }
    };
    // --- Layer Order (Z-index Management) ---
    const moveElementLayer = (direction) => {
        if (selectedIds.length !== 1 || layers[activeLayerIndex]?.locked) return;

        const selectedId = selectedIds[0];
        const elementsInSameLayer = elements.filter(el => el.layerIndex === activeLayerIndex);
        const currentIndex = elementsInSameLayer.findIndex(el => el.id === selectedId);

        if (currentIndex === -1) return;

        let newElements = [...elements];
        const currentElement = newElements.find(el => el.id === selectedId);
        const elementsOfLayer = newElements.filter(el => el.layerIndex === activeLayerIndex);

        // Remove from current position
        newElements = newElements.filter(el => el.id !== selectedId);

        // Determine target position
        let targetElements = [...elementsOfLayer];
        targetElements = targetElements.filter(el => el.id !== selectedId);

        let targetIndex;
        if (direction === 'forward') {
            targetIndex = Math.min(currentIndex + 1, targetElements.length);
        } else if (direction === 'backward') {
            targetIndex = Math.max(currentIndex - 1, 0);
        } else if (direction === 'front') {
            targetIndex = targetElements.length;
        } else if (direction === 'back') {
            targetIndex = 0;
        }

        // Insert at new position based on how the elements array is organized
        // This depends on your specific rendering order strategy
        targetElements.splice(targetIndex, 0, currentElement);

        // Rebuild full elements list with ordered layer elements
        const newElementsWithLayerOrder = [];
        let layerElementsAdded = false;

        for (let i = 0; i < layers.length; i++) {
            if (i === activeLayerIndex) {
                newElementsWithLayerOrder.push(...targetElements);
                layerElementsAdded = true;
            } else {
                newElementsWithLayerOrder.push(...newElements.filter(el => el.layerIndex === i));
            }
        }

        if (!layerElementsAdded) {
            newElementsWithLayerOrder.push(...targetElements);
        }

        setElements(newElementsWithLayerOrder);
        saveToHistory(newElementsWithLayerOrder);
    };

    // --- Tooltip management ---
    const showTooltipFor = (tool, event) => {
        if (!tool) return;

        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipText(tool);
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 5
        });
        setShowTooltip(true);
    };

    const hideTooltip = () => {
        setShowTooltip(false);
    };

    // --- Render ---
    const stageWidth = canvasSize.width;
    const stageHeight = canvasSize.height;
    const themeColor = 'indigo'; // Use Tailwind color name

    return (
        <div className="flex flex-col h-screen bg-gray-200 overflow-hidden font-sans">
            {/* Card Form Modal */}
            {showCardForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Information</h2>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (cardFormData.fullName.trim()) {
                                setCardTitle(cardFormData.fullName + "'s Card");
                                setShowCardForm(false);
                                // Initialize default elements after form is submitted
                                setTimeout(() => {
                                    initializeDefaultElements();
                                }, 100);
                            } else {
                                alert('Full name is required');
                            }
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={cardFormData.fullName}
                                        onChange={(e) => setCardFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Bikash Kumar Tamang"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={cardFormData.jobTitle}
                                        onChange={(e) => setCardFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Software Engineer"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={cardFormData.email}
                                        onChange={(e) => setCardFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="bikash.tamang@cardly.com"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={cardFormData.phone}
                                        onChange={(e) => setCardFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="+(977) 9xxxxxxxxx"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={cardFormData.company}
                                        onChange={(e) => setCardFormData(prev => ({ ...prev, company: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Company Name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={cardFormData.website}
                                        onChange={(e) => setCardFormData(prev => ({ ...prev, website: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="www.yourwebsite.com"
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    value={cardFormData.address}
                                    onChange={(e) => setCardFormData(prev => ({ ...prev, address: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="123 Thamel Marg, Kathmandu&#10;Nepal 44600"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    value={cardFormData.bio}
                                    onChange={(e) => setCardFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Start Editing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Top Toolbar */}
            <div className="bg-white border-b border-gray-300 px-3 py-1 flex items-center gap-2 shadow-sm z-10 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-600 mr-4">Editor</span>

                {/* History Controls */}
                <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    title="Undo (Ctrl+Z)"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => showTooltipFor("Undo (Ctrl+Z)", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiCornerUpLeft size={18} />
                </button>
                <button
                    onClick={redo}
                    disabled={historyIndex >= historyStack.length - 1}
                    title="Redo (Ctrl+Y)"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => showTooltipFor("Redo (Ctrl+Y)", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiCornerUpRight size={18} />
                </button>

                <span className="border-l h-5 mx-2"></span>

                {/* Zoom Controls */}
                <button
                    onClick={zoomOut}
                    title="Zoom Out"
                    className="p-1 rounded hover:bg-gray-200"
                    onMouseEnter={(e) => showTooltipFor("Zoom Out", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiMinus size={18} />
                </button>
                <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button
                    onClick={zoomIn}
                    title="Zoom In"
                    className="p-1 rounded hover:bg-gray-200"
                    onMouseEnter={(e) => showTooltipFor("Zoom In", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiPlus size={18} />
                </button>
                <button
                    onClick={resetZoom}
                    title="Reset Zoom"
                    className="p-1 rounded hover:bg-gray-200"
                    onMouseEnter={(e) => showTooltipFor("Reset Zoom", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiMaximize2 size={18} />
                </button>

                <span className="border-l h-5 mx-2"></span>

                {/* Arrange Controls */}
                <button
                    onClick={() => moveElementLayer('forward')}
                    disabled={selectedIds.length !== 1 || layers[activeLayerIndex]?.locked}
                    title="Bring Forward"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => showTooltipFor("Bring Forward", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiArrowUp size={18} />
                </button>
                <button
                    onClick={() => moveElementLayer('backward')}
                    disabled={selectedIds.length !== 1 || layers[activeLayerIndex]?.locked}
                    title="Send Backward"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => showTooltipFor("Send Backward", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiArrowDown size={18} />
                </button>
                <button
                    onClick={() => moveElementLayer('front')}
                    disabled={selectedIds.length !== 1 || layers[activeLayerIndex]?.locked}
                    title="Bring to Front"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => showTooltipFor("Bring to Front", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiChevronsUp size={18} />
                </button>
                <button
                    onClick={() => moveElementLayer('back')}
                    disabled={selectedIds.length !== 1 || layers[activeLayerIndex]?.locked}
                    title="Send to Back"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => showTooltipFor("Send to Back", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiChevronsDown size={18} />
                </button>

                <span className="border-l h-5 mx-2"></span>

                {/* Alignment Tools */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => alignSelectedElements('left')}
                        disabled={selectedIds.length <= 1 || layers[activeLayerIndex]?.locked}
                        title="Align Left"
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onMouseEnter={(e) => showTooltipFor("Align Left", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FiAlignLeft size={18} />
                    </button>
                    <button
                        onClick={() => alignSelectedElements('center')}
                        disabled={selectedIds.length <= 1 || layers[activeLayerIndex]?.locked}
                        title="Align Center"
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onMouseEnter={(e) => showTooltipFor("Align Center", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FiAlignCenter size={18} />
                    </button>
                    <button
                        onClick={() => alignSelectedElements('right')}
                        disabled={selectedIds.length <= 1 || layers[activeLayerIndex]?.locked}
                        title="Align Right"
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onMouseEnter={(e) => showTooltipFor("Align Right", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FiAlignRight size={18} />
                    </button>
                </div>

                <span className="border-l h-5 mx-2"></span>

                {/* Group/Ungroup */}
                <button
                    onClick={groupSelectedElements}
                    disabled={selectedIds.length <= 1 || layers[activeLayerIndex]?.locked}
                    title="Group Elements (Ctrl+G)"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => showTooltipFor("Group Elements (Ctrl+G)", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FaObjectGroup size={16} />
                </button>
                <button
                    onClick={ungroupSelectedElements}
                    disabled={selectedIds.length !== 1 || layers[activeLayerIndex]?.locked ||
                        !elements.find(el => el.id === selectedIds[0] && el.type === 'Group')}
                    title="Ungroup Elements (Ctrl+Shift+G)"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => showTooltipFor("Ungroup Elements (Ctrl+Shift+G)", e)}
                    onMouseLeave={hideTooltip}
                >
                    <FaObjectUngroup size={16} />
                </button>

                <span className="border-l h-5 mx-2"></span>

                {/* Grid Control */}
                <button
                    onClick={() => setSnapToGrid(!snapToGrid)}
                    title={`${snapToGrid ? 'Disable' : 'Enable'} Snap to Grid`}
                    className={`p-1 rounded ${snapToGrid ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}
                    onMouseEnter={(e) => showTooltipFor(`${snapToGrid ? 'Disable' : 'Enable'} Snap to Grid`, e)}
                    onMouseLeave={hideTooltip}
                >
                    <FiGrid size={18} />
                </button>

                {/* Canvas Size Controls */}
                <div className="flex items-center gap-1 ml-3">
                    <span className="text-xs text-gray-500">Canvas:</span>
                    <input
                        type="number"
                        value={canvasSize.width}
                        onChange={(e) => updateCanvasSize(e.target.value, canvasSize.height)}
                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded"
                        min="100"
                    />
                    <span className="text-xs text-gray-500">×</span>
                    <input
                        type="number"
                        value={canvasSize.height}
                        onChange={(e) => updateCanvasSize(canvasSize.width, e.target.value)}
                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded"
                        min="100"
                    />
                </div>

                <div className="flex-grow"></div>

                {/* Last Saved Indicator */}
                {lastSaved && (
                    <span className="text-xs text-gray-500 mr-2">
                        Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    title="Save Card (Ctrl+S)"
                    className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded shadow-sm transition-colors ${isSaving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : `bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${themeColor}-500`}`}
                    onMouseEnter={(e) => showTooltipFor("Save Card (Ctrl+S)", e)}
                    onMouseLeave={hideTooltip}
                >
                    {isSaving ? <FiLoader className="animate-spin h-4 w-4" /> : <FiSave size={16} />}
                    {isSaving ? 'Saving...' : 'Save Card'}
                </button>
            </div>

            <div className="flex flex-grow overflow-hidden">
                {/* Toolbox Panel (Left) */}
                <div className={`w-16 bg-white p-2 flex flex-col items-center gap-1 border-r border-gray-300 shadow-sm text-gray-700 pt-3 flex-shrink-0 overflow-y-auto`}>
                    {/* Tool Buttons */}
                    <button
                        onClick={() => addElement('rect')}
                        title="Add Rectangle"
                        className={`p-2 w-full rounded hover:bg-${themeColor}-100 focus:bg-${themeColor}-100 focus:outline-none ring-offset-1 focus:ring-2 focus:ring-${themeColor}-400 transition-colors text-${themeColor}-700`}
                        onMouseEnter={(e) => showTooltipFor("Add Rectangle", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FiSquare className="mx-auto" size={20} />
                    </button>
                    <button
                        onClick={() => addElement('circle')}
                        title="Add Circle"
                        className={`p-2 w-full rounded hover:bg-${themeColor}-100 focus:bg-${themeColor}-100 focus:outline-none ring-offset-1 focus:ring-2 focus:ring-${themeColor}-400 transition-colors text-${themeColor}-700`}
                        onMouseEnter={(e) => showTooltipFor("Add Circle", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FiCircle className="mx-auto" size={20} />
                    </button>
                    <button
                        onClick={() => addElement('text')}
                        title="Add Text"
                        className={`p-2 w-full rounded hover:bg-${themeColor}-100 focus:bg-${themeColor}-100 focus:outline-none ring-offset-1 focus:ring-2 focus:ring-${themeColor}-400 transition-colors text-${themeColor}-700`}
                        onMouseEnter={(e) => showTooltipFor("Add Text", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FiType className="mx-auto" size={20} />
                    </button>
                    <button
                        onClick={triggerImageUpload}
                        title="Add Image"
                        className={`p-2 w-full rounded hover:bg-${themeColor}-100 focus:bg-${themeColor}-100 focus:outline-none ring-offset-1 focus:ring-2 focus:ring-${themeColor}-400 transition-colors text-${themeColor}-700`}
                        onMouseEnter={(e) => showTooltipFor("Add Image", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FiImage className="mx-auto" size={20} />
                    </button>
                    <button
                        onClick={() => addElement('star')}
                        title="Add Star"
                        className={`p-2 w-full rounded hover:bg-${themeColor}-100 focus:bg-${themeColor}-100 focus:outline-none ring-offset-1 focus:ring-2 focus:ring-${themeColor}-400 transition-colors text-${themeColor}-700`}
                        onMouseEnter={(e) => showTooltipFor("Add Star", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FiStar className="mx-auto" size={20} />
                    </button>
                    <button
                        onClick={() => addElement('line')}
                        title="Add Line"
                        className={`p-2 w-full rounded hover:bg-${themeColor}-100 focus:bg-${themeColor}-100 focus:outline-none ring-offset-1 focus:ring-2 focus:ring-${themeColor}-400 transition-colors text-${themeColor}-700`}
                        onMouseEnter={(e) => showTooltipFor("Add Line", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FaSlash className="mx-auto" size={20} />
                    </button>

                    <div className="w-full border-t border-gray-200 my-2"></div>

                    {/* Drawing Tools */}
                    <button
                        onClick={() => setDrawMode(drawMode === 'brush' ? null : 'brush')}
                        title="Brush Tool"
                        className={`p-2 w-full rounded ${drawMode === 'brush' ? `bg-${themeColor}-200 text-${themeColor}-800` : `hover:bg-${themeColor}-100 text-${themeColor}-700`} focus:outline-none ring-offset-1 focus:ring-2 focus:ring-${themeColor}-400 transition-colors`}
                        onMouseEnter={(e) => showTooltipFor("Brush Tool", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FaPaintBrush className="mx-auto" size={20} />
                    </button>
                    <button
                        onClick={() => setDrawMode(drawMode === 'eraser' ? null : 'eraser')}
                        title="Eraser Tool"
                        className={`p-2 w-full rounded ${drawMode === 'eraser' ? `bg-${themeColor}-200 text-${themeColor}-800` : `hover:bg-${themeColor}-100 text-${themeColor}-700`} focus:outline-none ring-offset-1 focus:ring-2 focus:ring-${themeColor}-400 transition-colors`}
                        onMouseEnter={(e) => showTooltipFor("Eraser Tool", e)}
                        onMouseLeave={hideTooltip}
                    >
                        <FaEraser className="mx-auto" size={20} />
                    </button>

                    {/* Brush Settings (shown when brush is active) */}
                    {drawMode === 'brush' && (
                        <div className="my-1 w-full">
                            <div className="relative">
                                <div
                                    className="w-8 h-8 mx-auto rounded border border-gray-300 cursor-pointer"
                                    style={{ backgroundColor: brushColor }}
                                    onClick={() => setShowBrushPicker(!showBrushPicker)}
                                ></div>
                                {showBrushPicker && (
                                    <div className="absolute left-full ml-2 z-10 shadow-xl" style={{ top: '-100px' }}>
                                        <SketchPicker
                                            color={brushColor}
                                            onChangeComplete={(color) => setBrushColor(color.hex)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-1 px-1">
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="block text-center text-xs mt-1">{brushSize}px</span>
                            </div>
                        </div>
                    )}

                    {/* File Input for Images */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Canvas Area (Center) */}
                <div
                    ref={containerRef}
                    className="flex-grow flex items-center justify-center p-4 overflow-auto bg-gray-300 relative"
                    onMouseMove={(e) => {
                        if (isDrawing) {
                            continueDrawing(e);
                        }
                    }}
                >
                    {/* Container to center the stage */}
                    <div className={`absolute shadow-lg border border-gray-400 bg-white overflow-hidden ${isDrawing ? 'cursor-crosshair' : drawMode ? 'cursor-crosshair' : ''}`} style={{ width: stageWidth, height: stageHeight }}>
                        <Stage
                            ref={stageRef}
                            width={stageWidth}
                            height={stageHeight}
                            onClick={drawMode ? startDrawing : handleStageClick}
                            onTap={drawMode ? startDrawing : handleStageClick}
                            onWheel={handleWheel}
                            onMouseDown={drawMode ? startDrawing : undefined}
                            onMouseUp={drawMode ? finishDrawing : undefined}
                            onMouseLeave={drawMode ? finishDrawing : undefined}
                            onTouchStart={drawMode ? startDrawing : undefined}
                            onTouchEnd={drawMode ? finishDrawing : undefined}
                            draggable={isSpaceDown && !drawMode}
                            x={stagePos.x}
                            y={stagePos.y}
                            onDragEnd={(e) => setStagePos(e.target.position())}
                            scaleX={zoom}
                            scaleY={zoom}
                            onContextMenu={handleContextMenu}
                        >
                            <Layer>
                                {/* Background Color Rect */}
                                <Rect id="stage-background" x={0} y={0} width={stageWidth} height={stageHeight} fill={backgroundColor} listening={true} />
                                
                                {/* Test element to verify canvas is working */}
                                <Text 
                                    x={100} 
                                    y={100} 
                                    text="Test Canvas" 
                                    fontSize={20} 
                                    fill="#000000" 
                                    listening={false}
                                />

                                {/* Grid Lines (if snap is enabled) */}
                                {snapToGrid && (
                                    <>
                                        {/* Horizontal grid lines */}
                                        {Array.from({ length: Math.ceil(stageHeight / gridSize) }).map((_, i) => (
                                            <Line
                                                key={`h-grid-${i}`}
                                                points={[0, i * gridSize, stageWidth, i * gridSize]}
                                                stroke="#d1d5db"
                                                strokeWidth={0.5}
                                                listening={false}
                                            />
                                        ))}
                                        {/* Vertical grid lines */}
                                        {Array.from({ length: Math.ceil(stageWidth / gridSize) }).map((_, i) => (
                                            <Line
                                                key={`v-grid-${i}`}
                                                points={[i * gridSize, 0, i * gridSize, stageHeight]}
                                                stroke="#d1d5db"
                                                strokeWidth={0.5}
                                                listening={false}
                                            />
                                        ))}
                                    </>
                                )}



                                {/* Render elements grouped by layer index */}
                                {layers.map((layer, index) => (
                                    layer.visible && (
                                        <Group key={layer.id} name={`layer-${index}`}>
                                            {elements
                                                .filter(el => el.layerIndex === index)
                                                .map((el) => {
                                                    const isSelected = selectedIds.includes(el.id);
                                                    // Pass necessary props for rendering and interaction
                                                    const shapeProps = {
                                                        ...el,
                                                        key: el.id,
                                                        draggable: !layer.locked && el.draggable !== false && !drawMode,
                                                        onClick: drawMode ? undefined : handleStageClick,
                                                        onTap: drawMode ? undefined : handleStageClick,
                                                        onDblClick: (e) => { if (el.type === 'Text' && !layer.locked && !drawMode) handleTextDblClick(e, el); },
                                                        onDblTap: (e) => { if (el.type === 'Text' && !layer.locked && !drawMode) handleTextDblClick(e, el); },
                                                        onDragEnd: (e) => {
                                                            if (!layer.locked) {
                                                                let newX = e.target.x();
                                                                let newY = e.target.y();

                                                                // Apply snap to grid if enabled
                                                                if (snapToGrid) {
                                                                    newX = Math.round(newX / gridSize) * gridSize;
                                                                    newY = Math.round(newY / gridSize) * gridSize;
                                                                    e.target.position({ x: newX, y: newY });
                                                                }

                                                                updateElement(el.id, { x: newX, y: newY });
                                                            } else {
                                                                e.target.position({ x: el.x, y: el.y });
                                                                stageRef.current?.batchDraw();
                                                            }
                                                        },
                                                        onTransformEnd: (e) => {
                                                            if (layer.locked) return;
                                                            const node = e.target;
                                                            const scaleX = node.scaleX();
                                                            const scaleY = node.scaleY();
                                                            node.scaleX(1);
                                                            node.scaleY(1);

                                                            // Get new dimensions
                                                            let newAttrs = {
                                                                x: node.x(),
                                                                y: node.y(),
                                                                rotation: node.rotation(),
                                                            };

                                                            // Type-specific attributes
                                                            if (el.type === 'Rect' || el.type === 'Image' || el.type === 'Group') {
                                                                newAttrs.width = Math.max(5, node.width() * scaleX);
                                                                newAttrs.height = Math.max(5, node.height() * scaleY);
                                                            } else if (el.type === 'Circle') {
                                                                newAttrs.radius = Math.max(5, (el.radius || 0) * ((scaleX + scaleY) / 2));
                                                            } else if (el.type === 'Star') {
                                                                newAttrs.outerRadius = Math.max(5, (el.outerRadius || 0) * ((scaleX + scaleY) / 2));
                                                                newAttrs.innerRadius = Math.max(2, (el.innerRadius || 0) * ((scaleX + scaleY) / 2));
                                                            } else if (el.type === 'Text') {
                                                                newAttrs.fontSize = Math.max(5, (el.fontSize || 16) * ((scaleX + scaleY) / 2));
                                                            }

                                                            // Apply snap to grid if enabled
                                                            if (snapToGrid) {
                                                                newAttrs.x = Math.round(newAttrs.x / gridSize) * gridSize;
                                                                newAttrs.y = Math.round(newAttrs.y / gridSize) * gridSize;

                                                                if (newAttrs.width) {
                                                                    newAttrs.width = Math.round(newAttrs.width / gridSize) * gridSize;
                                                                }
                                                                if (newAttrs.height) {
                                                                    newAttrs.height = Math.round(newAttrs.height / gridSize) * gridSize;
                                                                }
                                                            }

                                                            updateElement(el.id, newAttrs);
                                                        },
                                                        // !! REMOVED filters from here !!
                                                        // filterRendering: 'faster' // filterRendering might not be a standard prop
                                                    };

                                                    // --- Calculate Konva Filters (NEW) ---
                                                    const konvaFilterInstance = getKonvaFilter(el.filter); // Use the filter ID (e.g., 'grayscale')
                                                    const filtersProp = konvaFilterInstance ? [konvaFilterInstance] : [];

                                                    // Add filter-specific props if needed (NEW)
                                                    const filterProps = {};
                                                    if (el.filter === 'blur') {
                                                        filterProps.blurRadius = 5; // Example blur radius, adjust as needed
                                                    }
                                                    // Add more filter-specific props here based on Konva docs if needed


                                                    // --- Keep this useEffect commented out or DELETE it ---
                                                    // // Apply CSS filter via the node's container
                                                    // useEffect(() => {
                                                    //     if (el.filterCss) {
                                                    //         const node = stageRef.current?.findOne(`#${el.id}`);
                                                    //         if (node) {
                                                    //             const container = node.getCanvas().getContext()._context.canvas;
                                                    //             container.style.filter = el.filterCss;
                                                    //         }
                                                    //     }
                                                    // }, [el.filterCss]);


                                                    // --- MODIFIED Switch Statement ---
                                                    switch (el.type) {
                                                        case 'Rect':
                                                            return <Rect {...shapeProps} filters={filtersProp} {...filterProps} />;
                                                        case 'Circle':
                                                            return <Circle {...shapeProps} filters={filtersProp} {...filterProps} />;
                                                        case 'Text':
                                                            return <Text {...shapeProps} filters={filtersProp} {...filterProps} visible={editingTextId !== el.id} />;
                                                        case 'Image':
                                                            // ImageFromSrc needs internal adaptation to accept/apply Konva filters
                                                            return <ImageFromSrc
                                                                shapeProps={shapeProps} // Pass base props
                                                                // Pass filters/filterProps if ImageFromSrc is modified:
                                                                // konvaFilters={filtersProp}
                                                                // konvaFilterProps={filterProps}
                                                                isSelected={isSelected}
                                                                onSelect={drawMode ? undefined : () => { if (!layer.locked) setSelectedIds([el.id]); }}
                                                                onChange={(attrs) => updateElement(el.id, attrs)} />;
                                                        case 'Star':
                                                            return <Star {...shapeProps} filters={filtersProp} {...filterProps} />;
                                                        case 'Line':
                                                            // Check Konva docs for filter support on Lines
                                                            return <Line {...shapeProps} filters={filtersProp} {...filterProps} />;
                                                        case 'Group':
                                                            // Filters usually applied to children, not the Group container itself
                                                            return (
                                                                <Group {...shapeProps}>
                                                                    <Rect
                                                                        width={el.width}
                                                                        height={el.height}
                                                                        fill="transparent"
                                                                        stroke="#9ca3af"
                                                                        strokeWidth={1}
                                                                        strokeScaleEnabled={false}
                                                                        dash={[4, 4]}
                                                                        listening={false} // Added listening={false} for group background
                                                                    />
                                                                    {/* Group label */}
                                                                    <Text
                                                                        text="Group"
                                                                        fontSize={12}
                                                                        fill="#4b5563"
                                                                        x={5}
                                                                        y={5}
                                                                        listening={false} // Added listening={false} for label
                                                                    />
                                                                </Group>
                                                            );
                                                        default: return null;
                                                    }
                                                })
                                            }
                                        </Group>
                                    )
                                ))}


                                {/* Current Drawing Path Preview */}
                                {isDrawing && currentPathPoints.length >= 2 && (
                                    <Line
                                        points={currentPathPoints}
                                        stroke={drawMode === 'brush' ? brushColor : backgroundColor}
                                        strokeWidth={brushSize}
                                        lineCap="round"
                                        lineJoin="round"
                                        tension={0.5}
                                        listening={false}
                                    />
                                )}

                                {/* Transformer */}
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox}
                                    anchorStroke={`#${themeColor}-600`}
                                    anchorFill={`#${themeColor}-200`}
                                    anchorSize={8}
                                    borderStroke={`#${themeColor}-600`}
                                    borderDash={[4, 4]}
                                    keepRatio={isShiftDown}
                                    rotateEnabled={true}
                                    visible={!drawMode && selectedIds.length > 0}
                                />
                            </Layer>
                        </Stage>
                        {/* Inline Textarea for Editing */}
                        <textarea
                            ref={textEditAreaRef}
                            onBlur={handleTextEditBlur}
                            onKeyDown={handleTextareaKeyDown}
                            style={{ display: 'none', position: 'absolute', zIndex: 1000 }}
                        />
                    </div>

                    {/* Context Menu */}
                    {contextMenu.visible && (
                        <div className="absolute bg-white border border-gray-300 rounded shadow-lg py-1 z-50 text-xs" style={{ top: contextMenu.y + 5, left: contextMenu.x + 5 }}>
                            {contextMenu.targetId && (
                                <>
                                    <button onClick={() => moveElementLayer('forward')} className="block w-full text-left px-3 py-1 hover:bg-gray-100">Bring Forward</button>
                                    <button onClick={() => moveElementLayer('backward')} className="block w-full text-left px-3 py-1 hover:bg-gray-100">Send Backward</button>
                                    <button onClick={() => moveElementLayer('front')} className="block w-full text-left px-3 py-1 hover:bg-gray-100">Bring to Front</button>
                                    <button onClick={() => moveElementLayer('back')} className="block w-full text-left px-3 py-1 hover:bg-gray-100">Send to Back</button>
                                    <div className="border-t my-1"></div>
                                    <button onClick={duplicateSelectedElements} className="block w-full text-left px-3 py-1 hover:bg-gray-100">Duplicate</button>
                                    <div className="border-t my-1"></div>
                                    <button onClick={deleteSelectedElements} className="block w-full text-left px-3 py-1 text-red-600 hover:bg-red-50">Delete</button>
                                </>
                            )}
                            {!contextMenu.targetId && (
                                <span className="block px-3 py-1 text-gray-400 italic">Canvas Options</span>
                            )}
                        </div>
                    )}

                    {/* Tooltip */}
                    {showTooltip && (
                        <div
                            className="absolute bg-gray-800 text-white text-xs rounded px-2 py-1 z-50"
                            style={{
                                left: tooltipPosition.x - 50,
                                top: tooltipPosition.y,
                                transform: 'translateX(50%)',
                                pointerEvents: 'none'
                            }}
                        >
                            {tooltipText}
                            <div
                                className="absolute w-2 h-2 bg-gray-800 transform rotate-45"
                                style={{
                                    left: '50%',
                                    top: '-4px',
                                    marginLeft: '-4px'
                                }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* Properties & Layers Panel (Right) */}
                <div className="w-full lg:w-72 bg-white flex flex-col border-t lg:border-l border-gray-300 shadow-sm flex-shrink-0">
                    {/* Tabs Navigation */}
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 px-4 py-2 text-xs font-medium ${activeTab === 'layers' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('layers')}
                        >
                            Layers
                        </button>
                        <button
                            className={`flex-1 px-4 py-2 text-xs font-medium ${activeTab === 'properties' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('properties')}
                        >
                            Properties
                        </button>
                        <button
                            className={`flex-1 px-4 py-2 text-xs font-medium ${activeTab === 'effects' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('effects')}
                        >
                            Effects
                        </button>
                    </div>

                    {/* Properties Tab Content */}
                    {activeTab === 'properties' && (
                        <div className="p-3 overflow-y-auto flex-grow">
                            {/* General Card Settings */}
                            <div className='pb-3 mb-3 border-b'>
                                <h3 className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wider">Card</h3>
                                <div className="mb-2">
                                    <label htmlFor="cardTitle" className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                                    <div className="flex gap-1">
                                        <input
                                            type="text"
                                            id="cardTitle"
                                            value={cardTitle}
                                            onChange={(e) => { setCardTitle(e.target.value); isDirtyRef.current = true; }}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <button
                                            onClick={() => setShowCardForm(true)}
                                            title="Edit Card Information"
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                                        >
                                            <FiEdit size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-2 relative">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
                                    <div
                                        onClick={() => setShowBgPicker(s => !s)}
                                        className="w-full h-6 rounded border border-gray-300 cursor-pointer"
                                        style={{ backgroundColor: backgroundColor }}
                                    ></div>
                                    {showBgPicker && (
                                        <div className="absolute z-10 right-0 mt-1 shadow-xl" onMouseLeave={() => setShowBgPicker(false)}>
                                            <SketchPicker
                                                color={backgroundColor}
                                                onChangeComplete={(c) => { setBackgroundColor(c.hex); isDirtyRef.current = true; }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isPublic}
                                            onChange={(e) => { setIsPublic(e.target.checked); isDirtyRef.current = true; }}
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 border-gray-300"
                                        />
                                        <span className="text-xs text-gray-700">Make Public</span>
                                    </label>
                                </div>
                            </div>

                            {/* Selected Element Properties */}
                            <h3 className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wider">Selection ({selectedIds.length})</h3>
                            {selectedElement ? (
                                <div className="space-y-2 text-xs">
                                    {/* Type Indicator */}
                                    <div className="text-xs text-gray-500 mb-1">
                                        Type: <span className="font-medium">{selectedElement.type}</span>
                                    </div>

                                    {/* Position & Dimensions */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">X</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.x)}
                                                onChange={(e) => handlePropertyChange('x', e.target.value)}
                                                className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Y</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.y)}
                                                onChange={(e) => handlePropertyChange('y', e.target.value)}
                                                className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Width & Height (for applicable elements) */}
                                    {(selectedElement.type === 'Rect' || selectedElement.type === 'Image' || selectedElement.type === 'Group') && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Width</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(selectedElement.width || 0)}
                                                    onChange={(e) => handlePropertyChange('width', e.target.value)}
                                                    className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Height</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(selectedElement.height || 0)}
                                                    onChange={(e) => handlePropertyChange('height', e.target.value)}
                                                    className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Radius (for circles) */}
                                    {selectedElement.type === 'Circle' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Radius</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.radius || 0)}
                                                onChange={(e) => handlePropertyChange('radius', e.target.value)}
                                                className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    )}

                                    {/* Star Properties */}
                                    {selectedElement.type === 'Star' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Points</label>
                                                <input
                                                    type="number"
                                                    min="3"
                                                    max="20"
                                                    value={selectedElement.numPoints || 5}
                                                    onChange={(e) => handlePropertyChange('numPoints', e.target.value)}
                                                    className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Inner Radius</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(selectedElement.innerRadius || 0)}
                                                    onChange={(e) => handlePropertyChange('innerRadius', e.target.value)}
                                                    className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500">Outer Radius</label>
                                                <input
                                                    type="number"
                                                    value={Math.round(selectedElement.outerRadius || 0)}
                                                    onChange={(e) => handlePropertyChange('outerRadius', e.target.value)}
                                                    className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Corner Radius (for rectangles) */}
                                    {selectedElement.type === 'Rect' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Corner Radius</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={selectedElement.cornerRadius || 0}
                                                onChange={(e) => handlePropertyChange('cornerRadius', e.target.value)}
                                                className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    )}

                                    {/* Rotation for all elements */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Rotation (°)</label>
                                        <div className="flex items-center">
                                            <input
                                                type="range"
                                                min="0"
                                                max="360"
                                                value={Math.round(selectedElement.rotation || 0)}
                                                onChange={(e) => handlePropertyChange('rotation', e.target.value)}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="ml-2 w-8 text-right">{Math.round(selectedElement.rotation || 0)}°</span>
                                        </div>
                                    </div>

                                    {/* Opacity for all elements */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Opacity</label>
                                        <div className="flex items-center">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={selectedElement.opacity ?? 1}
                                                onChange={(e) => handlePropertyChange('opacity', e.target.value)}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="ml-2 w-8 text-right">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                                        </div>
                                    </div>

                                    {/* Fill Color */}
                                    {(selectedElement.type === 'Rect' || selectedElement.type === 'Circle' || selectedElement.type === 'Text' || selectedElement.type === 'Star') && (
                                        <div className="relative">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Fill</label>
                                            <div
                                                onClick={() => setShowElementColorPicker(prev => prev?.type === 'fill' ? null : { type: 'fill' })}
                                                className="w-full h-6 rounded border border-gray-300 cursor-pointer"
                                                style={{ backgroundColor: selectedElement.fill }}
                                            ></div>
                                            {showElementColorPicker?.type === 'fill' && (
                                                <div className="absolute z-20 right-0 mt-1 shadow-xl" onMouseLeave={() => setShowElementColorPicker(null)}>
                                                    <SketchPicker color={selectedElement.fill} onChangeComplete={handleColorChangeComplete} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Stroke Color & Width */}
                                    {(selectedElement.type === 'Rect' || selectedElement.type === 'Circle' || selectedElement.type === 'Star' || selectedElement.type === 'Line') && (
                                        <div className="relative grid grid-cols-3 gap-2 items-end">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Stroke</label>
                                                <div
                                                    onClick={() => setShowElementColorPicker(prev => prev?.type === 'stroke' ? null : { type: 'stroke' })}
                                                    className="w-full h-6 rounded border border-gray-300 cursor-pointer"
                                                    style={{ backgroundColor: selectedElement.stroke || 'transparent' }}
                                                ></div>
                                                {showElementColorPicker?.type === 'stroke' && (
                                                    <div className="absolute z-20 left-0 mt-1 shadow-xl" onMouseLeave={() => setShowElementColorPicker(null)}>
                                                        <SketchPicker
                                                            color={selectedElement.stroke || '#000000'}
                                                            onChangeComplete={(color) => updateElement(selectedElement.id, { stroke: color.hex })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Width</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={selectedElement.strokeWidth || 0}
                                                    onChange={(e) => handlePropertyChange('strokeWidth', e.target.value)}
                                                    className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Text Properties */}
                                    {selectedElement.type === 'Text' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Text</label>
                                                <textarea
                                                    value={selectedElement.text}
                                                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Font Size</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={selectedElement.fontSize}
                                                        onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
                                                        className="w-full px-2 py-0.5 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
                                                    <select
                                                        value={selectedElement.fontFamily || 'Arial'}
                                                        onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 leading-tight"
                                                    >
                                                        <option>Arial</option>
                                                        <option>Verdana</option>
                                                        <option>Times New Roman</option>
                                                        <option>Georgia</option>
                                                        <option>Courier New</option>
                                                        <option>Poppins</option>
                                                        <option>Impact</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Text alignment */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Alignment</label>
                                                <div className="flex border border-gray-300 rounded">
                                                    <button
                                                        className={`flex-1 p-1 ${selectedElement.align === 'left' || !selectedElement.align ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                                                        onClick={() => handlePropertyChange('align', 'left')}
                                                    >
                                                        <FiAlignLeft className="mx-auto" size={14} />
                                                    </button>
                                                    <button
                                                        className={`flex-1 p-1 ${selectedElement.align === 'center' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                                                        onClick={() => handlePropertyChange('align', 'center')}
                                                    >
                                                        <FiAlignCenter className="mx-auto" size={14} />
                                                    </button>
                                                    <button
                                                        className={`flex-1 p-1 ${selectedElement.align === 'right' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                                                        onClick={() => handlePropertyChange('align', 'right')}
                                                    >
                                                        <FiAlignRight className="mx-auto" size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Text styling */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Style</label>
                                                <div className="flex border border-gray-300 rounded">
                                                    <button
                                                        className={`flex-1 p-1 ${selectedElement.fontStyle === 'bold' || selectedElement.fontStyle?.includes('bold') ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                                                        onClick={() => {
                                                            const current = selectedElement.fontStyle || '';
                                                            const hasBold = current.includes('bold');
                                                            const newStyle = hasBold
                                                                ? current.replace('bold', '').trim()
                                                                : (current + ' bold').trim();
                                                            handlePropertyChange('fontStyle', newStyle || null);
                                                        }}
                                                    >
                                                        <FaBold className="mx-auto" size={14} />
                                                    </button>
                                                    <button
                                                        className={`flex-1 p-1 ${selectedElement.fontStyle === 'italic' || selectedElement.fontStyle?.includes('italic') ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                                                        onClick={() => {
                                                            const current = selectedElement.fontStyle || '';
                                                            const hasItalic = current.includes('italic');
                                                            const newStyle = hasItalic
                                                                ? current.replace('italic', '').trim()
                                                                : (current + ' italic').trim();
                                                            handlePropertyChange('fontStyle', newStyle || null);
                                                        }}
                                                    >
                                                        <FaItalic className="mx-auto" size={14} />
                                                    </button>
                                                    <button
                                                        className={`flex-1 p-1 ${selectedElement.textDecoration === 'underline' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                                                        onClick={() => {
                                                            const newDecoration = selectedElement.textDecoration === 'underline' ? null : 'underline';
                                                            handlePropertyChange('textDecoration', newDecoration);
                                                        }}
                                                    >
                                                        <FaUnderline className="mx-auto" size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Delete and Duplicate Buttons */}
                                    <div className="pt-3 mt-3 border-t flex space-x-2">
                                        <button
                                            onClick={deleteSelectedElements}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium rounded shadow-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-400 transition-colors"
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                        <button
                                            onClick={duplicateSelectedElements}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium rounded shadow-sm bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-400 transition-colors"
                                        >
                                            <FiCopy /> Duplicate
                                        </button>
                                    </div>
                                </div>
                            ) : (<p className="text-xs text-gray-500 italic">Select element(s) to edit.</p>)}

                            {saveError && (
                                <div className="mt-4 p-2 bg-red-100 border border-red-300 text-red-700 text-xs rounded">
                                    Save Error: {saveError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Layers Tab Content */}
                    {activeTab === 'layers' && (
                        <div className="p-3 overflow-y-auto flex-grow">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layers</h3>
                                <button
                                    onClick={addLayer}
                                    title="Add Layer"
                                    className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                >
                                    <FiPlus size={16} />
                                </button>
                            </div>

                            <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                                {layers.map((layer, index) => (
                                    <div
                                        key={layer.id}
                                        className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer border ${activeLayerIndex === index ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                        onClick={() => selectLayer(index)}
                                    >
                                        <span className="flex-grow truncate text-gray-700 font-medium">{layer.name}</span>

                                        <div className="flex items-center gap-1">
                                            {/* Edit Layer Name */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newName = prompt('Enter layer name:', layer.name);
                                                    if (newName !== null) renameLayer(index, newName);
                                                }}
                                                title="Rename Layer"
                                                className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
                                            >
                                                <FiEdit size={12} />
                                            </button>

                                            {/* Lock/Unlock Layer */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLayerLock(index); }}
                                                title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                                                className={`p-0.5 rounded hover:bg-gray-200 ${layer.locked ? 'text-red-500' : 'text-gray-400'}`}
                                            >
                                                {layer.locked ? <FiLock size={12} /> : <FiUnlock size={12} />}
                                            </button>

                                            {/* Show/Hide Layer */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(index); }}
                                                title={layer.visible ? "Hide Layer" : "Show Layer"}
                                                className={`p-0.5 rounded hover:bg-gray-200 ${layer.visible ? 'text-gray-500' : 'text-gray-400'}`}
                                            >
                                                {layer.visible ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                                            </button>

                                            {/* Move Layer Up */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveLayer(index, 'up'); }}
                                                disabled={index === 0}
                                                title="Move Layer Up"
                                                className={`p-0.5 rounded hover:bg-gray-200 text-gray-400 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <FiArrowUp size={12} />
                                            </button>

                                            {/* Move Layer Down */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveLayer(index, 'down'); }}
                                                disabled={index === layers.length - 1}
                                                title="Move Layer Down"
                                                className={`p-0.5 rounded hover:bg-gray-200 text-gray-400 ${index === layers.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <FiArrowDown size={12} />
                                            </button>

                                            {/* Delete Layer (only if more than one layer exists) */}
                                            {layers.length > 1 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete layer "${layer.name}"?`)) {
                                                            deleteLayer(index);
                                                        }
                                                    }}
                                                    title="Delete Layer"
                                                    className="p-0.5 rounded hover:bg-red-100 text-red-400"
                                                >
                                                    <FiTrash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Effects Tab Content */}
                    {activeTab === 'effects' && (
                        <div className="p-3 overflow-y-auto flex-grow">
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wider">Filters</h3>
                                {selectedIds.length > 0 ? (
                                    <>
                                        <p className="text-xs text-gray-500 mb-2">Apply visual effects to selected element(s):</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {filterPresets.map(filter => (
                                                <FilterPreview
                                                    key={filter.id}
                                                    filter={filter}
                                                    onClick={() => applyFilterToSelection(filter.id)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">Select element(s) to apply effects</p>
                                )}
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wider">Display Settings</h3>

                                {/* Grid Controls */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium text-gray-600">Snap to Grid</label>
                                        <button
                                            onClick={() => setSnapToGrid(!snapToGrid)}
                                            className={`relative inline-flex ${snapToGrid ? 'bg-indigo-600' : 'bg-gray-200'} items-center h-4 rounded-full w-8 transition-colors ease-in-out duration-200`}
                                        >
                                            <span
                                                className={`inline-block w-3 h-3 transform bg-white rounded-full transition ease-in-out duration-200 ${snapToGrid ? 'translate-x-4' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>

                                    {snapToGrid && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <label className="text-xs text-gray-500">Grid Size:</label>
                                            <input
                                                type="range"
                                                min="5"
                                                max="50"
                                                step="5"
                                                value={gridSize}
                                                onChange={(e) => setGridSize(Number(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-xs text-gray-500 w-8 text-right">{gridSize}px</span>
                                        </div>
                                    )}
                                </div>

                                {/* Rulers Toggle */}
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-medium text-gray-600">Show Rulers</label>
                                    <button
                                        onClick={() => setShowRulers(!showRulers)}
                                        className={`relative inline-flex ${showRulers ? 'bg-indigo-600' : 'bg-gray-200'} items-center h-4 rounded-full w-8 transition-colors ease-in-out duration-200`}
                                    >
                                        <span
                                            className={`inline-block w-3 h-3 transform bg-white rounded-full transition ease-in-out duration-200 ${showRulers ? 'translate-x-4' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewCard;