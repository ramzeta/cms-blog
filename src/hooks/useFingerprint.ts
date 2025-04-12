import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    async function getFingerprint() {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    }

    getFingerprint();
  }, []);

  return fingerprint;
}

export default useFingerprint;