import React, { useState } from 'react';
import { RegistrationWizard } from '../components/registration/RegistrationWizard';
import { RegistrationClosedView } from '../components/registration/RegistrationClosedView';
import { usePortalSettings } from '../config/portalSettings';

interface RegistrationPageProps {
  onGoHome?: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onGoHome }) => {
  const portalSettings = usePortalSettings();
  const [hasCompletedInSession, setHasCompletedInSession] = useState(false);

  // Respect Admin toggle (isRegistrationOpen) and Auto-Close Timestamp (isAutoClosedByTimestamp)
  if (!portalSettings.isRegistrationOpen && !hasCompletedInSession) {
    return (
      <div>
        <RegistrationClosedView onGoHome={onGoHome} />
      </div>
    );
  }

  return (
    <div>
      <RegistrationWizard
        onGoHome={onGoHome}
        onRegistrationCompleted={() => setHasCompletedInSession(true)}
      />
    </div>
  );
};
