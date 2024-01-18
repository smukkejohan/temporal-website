import type { Camera } from 'three';

export const visibleHeightAtZDepth = ( depth: number, camera: Camera ) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if ( depth < cameraOffset ) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180; 

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
};

export const visibleWidthAtZDepth = ( depth: number, camera: Camera ) => {
  const height = visibleHeightAtZDepth( depth, camera );
  return height * camera.aspect;
};

export const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
}

export const scale = (num: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
  if(num < in_min) num = in_min;
  if(num > in_max) num = in_max;

  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}