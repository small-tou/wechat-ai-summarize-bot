import { useState } from 'react';

export function useConfig(){
  const [showConfigModal, setShowConfigModal] = useState(false);
  return {
    showConfigModal,
    setShowConfigModal,
  }
}