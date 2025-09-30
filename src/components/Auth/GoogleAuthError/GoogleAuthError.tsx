import React from 'react';
import { Alert } from 'antd';
import { AlertCircle } from 'lucide-react';

interface GoogleAuthErrorProps {
    error: string | null;
    onClose?: () => void;
}

const GoogleAuthError: React.FC<GoogleAuthErrorProps> = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <Alert
            message="Google Authentication Error"
            description={error}
            type="error"
            icon={<AlertCircle className="w-4 h-4" />}
            closable={!!onClose}
            onClose={onClose}
            className="mb-4"
        />
    );
};

export default GoogleAuthError;
