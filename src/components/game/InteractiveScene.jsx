import React, { useState, useRef } from 'react';
import { StoryService } from '../../services/StoryService';
import './InteractiveScene.css';

/**
 * Composant pour afficher les scènes interactives avec zones cliquables
 */
const InteractiveScene = ({
  scene,
  gameState,
  onHotspotClick,
  onChoice
}) => {
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [showHotspots, setShowHotspots] = useState(false);
  const imageRef = useRef(null);

  // Obtenir les hotspots disponibles
  const availableHotspots = StoryService.getAvailableHotspots(scene, gameState);
  const availableChoices = StoryService.getAvailableChoices(scene, gameState);
  const sceneText = StoryService.getSceneText(scene, gameState);

  const handleHotspotClick = (hotspot) => {
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    }
  };

  const handleChoiceClick = (choice) => {
    if (onChoice) {
      onChoice(choice);
    }
  };

  const handleImageLoad = () => {
    // Image chargée, on peut maintenant positionner les hotspots
  };

  const getHotspotStyle = (hotspot) => {
    return {
      left: `${hotspot.coordinates.x}px`,
      top: `${hotspot.coordinates.y}px`,
      width: `${hotspot.coordinates.width}px`,
      height: `${hotspot.coordinates.height}px`
    };
  };

  return (
    <div className="interactive-scene">
      <h3 className='title-scene'>{scene.metadata.title}</h3>
      {/* Zone d'image interactive */}
      <div className="scene-image-container">
        <img
          ref={imageRef}
          src={scene.metadata.background}
          alt={scene.metadata.title || "Scène interactive"}
          className="scene-background"
          onLoad={handleImageLoad}
        />

        {/* Overlay pour les hotspots */}
        <div className="hotspots-overlay">
          {availableHotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className={`hotspot ${hoveredHotspot === hotspot.id ? 'hovered' : ''} ${showHotspots ? 'visible' : ''}`}
              style={getHotspotStyle(hotspot)}
              onClick={() => handleHotspotClick(hotspot)}
              onMouseEnter={() => setHoveredHotspot(hotspot.id)}
              onMouseLeave={() => setHoveredHotspot(null)}
              title={hotspot.text}
            >
              <div className="hotspot-highlight"></div>
              {hoveredHotspot === hotspot.id && (
                <div className="hotspot-tooltip">
                  {hotspot.text}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bouton pour révéler les zones interactives */}
        <button
          className="toggle-hotspots"
          onClick={() => setShowHotspots(!showHotspots)}
          title="Révéler les zones interactives"
        >
          {showHotspots ? '👁️' : '🔍'}
        </button>
      </div>
      {/* Actions disponibles */}
      {availableHotspots.length > 0 && (
        <p className="hint-text">
          💡 Cliquez sur les éléments de l'image pour interagir
        </p>
      )}
      {/* Description de la scène */}
      <div className="scene-description">
        <div className="scene-text">
          {sceneText.split('\n').map((line, index) => (
            line.trim() === '' ? 
              <br key={index} /> : 
              <p key={index}>{line}</p>
          ))}
        </div>

        {scene.content.description && (
          <div className="additional-description">
            {scene.content.description.split('\n').map((line, index) => (
              line.trim() === '' ? 
                <br key={index} /> : 
                <p key={index}>{line}</p>
            ))}
          </div>
        )}
      </div>



      {/* Choix standards (en plus des hotspots) */}
      {availableChoices.length > 0 && (
        <div className="">
          <h4>Actions disponibles :</h4>
          <div className="scene-choices">
            {availableChoices.map((choice, index) => (
              <button
                key={index}
                className="scene-choice"
                onClick={() => handleChoiceClick(choice)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Informations de debug */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <details>
            <summary>Debug Info - Scène Interactive</summary>
            <div>
              <p><strong>Hotspots disponibles:</strong> {availableHotspots.length}</p>
              <p><strong>Choix disponibles:</strong> {availableChoices.length}</p>
              <p><strong>Image:</strong> {scene.metadata.background}</p>
              <pre>{JSON.stringify(StoryService.getSceneDebugInfo(scene, gameState), null, 2)}</pre>
            </div>
          </details>
        </div>
      )} */}
    </div>
  );
};

export default InteractiveScene;