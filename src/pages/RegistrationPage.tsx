import React from 'react';
import { RegistrationWizard } from '../components/registration/RegistrationWizard';

interface RegistrationPageProps {
  onGoHome?: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onGoHome }) => {
  return (
    <div>
      <RegistrationWizard onGoHome={onGoHome} />
    </div>
  );
};
