import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';


interface ObjectLoaderProps {
    scene: THREE.Scene;
    objectUrl: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    material: THREE.Material;
}

const ObjectLoader: React.FC<ObjectLoaderProps> = ({ scene, objectUrl, position, rotation, scale, material }) => {
    useEffect(() => {
        const loader = new OBJLoader();
        loader.load(objectUrl, obj => {
            obj.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });
            obj.position.copy(position);
            obj.rotation.copy(rotation);
            obj.scale.copy(scale);
            scene.add(obj);
        });

        return () => {
            // Remove all objects from the scene
            scene.children.forEach(child => scene.remove(child));
        };
    }, [scene, objectUrl, position, rotation, scale, material]);

    return null;
};

export default ObjectLoader;
