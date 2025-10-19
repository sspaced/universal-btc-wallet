import React, { useRef, useEffect, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import toast from 'react-hot-toast';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  className?: string;
  title?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  className = '',
  title = 'Scan QR Code'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        setStream(mediaStream);
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Camera access denied or unavailable:', error);
        setHasPermission(false);
        toast.error('Camera access required to scan QR codes');
      }
    };

    initCamera();

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start scanning when video is ready
  const handleVideoLoad = () => {
    if (videoRef.current && canvasRef.current) {
      setIsScanning(true);
      startScanning();
    }
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Try to decode QR code
        try {
          const qrCode = detectQRCode(imageData);
          if (qrCode) {
            handleQRCodeDetected(qrCode);
          }
        } catch (error) {
          // Silent fail - QR detection is expected to fail most of the time
        }
      }
    }, 100); // Scan every 100ms
  };

  // Simple QR code detection (in a real app, you'd use a library like jsQR)
  const detectQRCode = (imageData: ImageData): string | null => {
    // This is a simplified placeholder implementation
    // In a real app, you would use a library like jsQR:
    // import jsQR from 'jsqr';
    // const code = jsQR(imageData.data, imageData.width, imageData.height);
    // return code ? code.data : null;

    // For demo purposes, we'll simulate QR detection
    // In practice, integrate with a proper QR code library
    return null;
  };

  const handleQRCodeDetected = (data: string) => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    // Validate if it's a Bitcoin address
    const bech32Regex = /^bc1[a-z0-9]{39,59}$/;
    const p2shRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

    if (bech32Regex.test(data) || p2shRegex.test(data)) {
      onScan(data);
      toast.success('Bitcoin address detected!');
    } else {
      // Try to extract address from bitcoin: URI
      const bitcoinUriMatch = data.match(/bitcoin:([a-zA-Z0-9]+)/);
      if (bitcoinUriMatch) {
        const address = bitcoinUriMatch[1];
        if (bech32Regex.test(address) || p2shRegex.test(address)) {
          onScan(address);
          toast.success('Bitcoin address detected from URI!');
          return;
        }
      }

      toast.error('No valid Bitcoin address found in QR code');
      // Continue scanning
      setTimeout(() => {
        if (videoRef.current && canvasRef.current) {
          startScanning();
        }
      }, 1000);
    }
  };

  const handleManualInput = () => {
    const input = window.prompt('Enter Bitcoin address manually:');
    if (input && input.trim()) {
      const bech32Regex = /^bc1[a-z0-9]{39,59}$/;
      const p2shRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

      if (bech32Regex.test(input.trim()) || p2shRegex.test(input.trim())) {
        onScan(input.trim());
      } else {
        toast.error('Invalid Bitcoin address format');
      }
    }
  };

  const handleClose = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  if (hasPermission === false) {
    return (
      <Card padding="lg" className={className}>
        <div className="text-center">
          <div className="mb-4">
            <CameraOffIcon className="w-16 h-16 mx-auto" style={{ color: 'var(--apple-secondary-label)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--apple-label)' }}>
            Camera Access Required
          </h3>
          <p className="mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
            Please allow camera access to scan QR codes, or enter the address manually.
          </p>
          <div className="flex space-x-3">
            <Button variant="tertiary" size="medium" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="secondary" size="medium" onClick={handleManualInput} className="flex-1">
              Manual Input
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--apple-label)' }}>
          {title}
        </h3>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <CrossIcon className="w-5 h-5" style={{ color: 'var(--apple-secondary-label)' }} />
        </button>
      </div>

      <div className="relative">
        {/* Video Preview */}
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            onLoadedMetadata={handleVideoLoad}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />

          {/* Scanner Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scanning Border */}
              <div
                className="w-48 h-48 border-2 border-white rounded-xl relative"
                style={{
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  borderColor: isScanning ? 'var(--apple-blue)' : 'white'
                }}
              >
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>

                {/* Scanning line animation */}
                {isScanning && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
              </div>

              {/* Instructions */}
              <p className="text-white text-sm text-center mt-4 px-4">
                Position the QR code within the frame
              </p>
            </div>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-4">
        <Button variant="tertiary" size="medium" onClick={handleClose} className="flex-1">
          Cancel
        </Button>
        <Button variant="secondary" size="medium" onClick={handleManualInput} className="flex-1">
          Manual Input
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--apple-gray-6)' }}>
        <p className="text-sm text-center" style={{ color: 'var(--apple-secondary-label)' }}>
          💡 Point your camera at a Bitcoin QR code or tap "Manual Input" to type the address
        </p>
      </div>
    </Card>
  );
};

// Icon Components
const CrossIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CameraOffIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
  </svg>
);