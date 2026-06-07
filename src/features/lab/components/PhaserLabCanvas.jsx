import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Phaser from 'phaser';
import LabScene from '../phaser/LabScene';

const PhaserLabCanvas = ({ placedItems }) => {
  const gameRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (gameRef.current && placedItems) {
      const scene = gameRef.current.scene?.getScene('LabScene');
      if (scene) {
        scene.events.emit('UPDATE_CONTAINERS', placedItems);
      }
    }
  }, [placedItems]);

  useEffect(() => {
    if (!gameRef.current && containerRef.current) {
      const config = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: '100%',
        height: '100%',
        transparent: true,
        physics: {
          default: 'matter',
          matter: {
            gravity: { y: 1 },
            debug: false // Tắt viền vật lý sau khi đã căn chỉnh chuẩn xác
          }
        },
        scene: [LabScene]
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '600px' }} />;
};

PhaserLabCanvas.displayName = 'PhaserLabCanvas';

export default PhaserLabCanvas;
