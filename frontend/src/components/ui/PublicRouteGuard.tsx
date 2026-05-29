import React from 'react';

// This component was previously used to forcefully override React Router
// but it caused infinite redirect loops. The actual issue with zombie sessions
// has been resolved at the Redux Persist level in sessionValidator.ts
const PublicRouteGuard: React.FC = () => {
  return null;
};

export default PublicRouteGuard;

