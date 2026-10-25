import React from 'react';
import { RegistrationClosedView } from '../components/registration/RegistrationClosedView';

interface RegistrationPageProps {
  onGoHome?: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onGoHome }) => {
  return (
    <div>
      <RegistrationClosedView onGoHome={onGoHome} />
    </div>
  );
};
