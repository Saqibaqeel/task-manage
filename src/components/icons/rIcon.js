import React from 'react';
import Rregistory, { VectorLibraries } from './rRegistory';

const RIcon = ({
  name,
  size = 24,
  fill = 'black',
  rotate = 0,
  style = {},
  ...props
}) => {
  if (!name) return null;

  const rotation =
    typeof rotate === 'number' ? `${rotate}deg` : rotate;

  const prefix = name.split('_')[0];
  const iconName = Rregistory[name.toUpperCase()];
  const Library = VectorLibraries[prefix];

  if (!Library) {
    console.warn(`RIcon: Vector library "${prefix}" not found.`);
    return null;
  }

  if (!iconName) {
    console.warn(`RIcon: Icon "${name}" not found in Rregistory.`);
    return null;
  }

  return (
    <Library
      name={iconName}
      size={size}
      color={fill}
      style={[
        {
          transform: [{ rotate: rotation }],
        },
        style,
      ]}
      {...props}
    />
  );
};

export default RIcon;