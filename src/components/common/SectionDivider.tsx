import React from 'react';
import { NeonDivider, type NeonDividerProps } from '../motion/NeonDivider';

export interface SectionDividerProps extends NeonDividerProps {}

export const SectionDivider: React.FC<SectionDividerProps> = (props) => {
  return <NeonDivider {...props} />;
};

export default SectionDivider;
