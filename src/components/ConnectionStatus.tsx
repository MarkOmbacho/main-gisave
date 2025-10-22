import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon } from '@radix-ui/react-icons';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [details, setDetails] = useState<any>(null);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      const response = await api.get('/health');
      setDetails(response.data);
      setStatus('connected');
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <Alert>
        <ReloadIcon className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Connection</AlertTitle>
        <AlertDescription>Verifying connection to backend services...</AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          Unable to connect to backend services. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  if (import.meta.env.DEV) {
    return (
      <Alert>
        <AlertTitle>Connected</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Backend URL: {details?.api_base_url}</p>
          <p>Environment: {details?.environment}</p>
          <p>Version: {details?.version}</p>
          <p>CORS Status: {details?.cors_enabled ? 'Enabled' : 'Disabled'}</p>
          <p>Database: {details?.database_connected ? 'Connected' : 'Disconnected'}</p>
        </AlertDescription>
      </Alert>
    );
  }

  return null; // Don't show in production unless there's an error
}