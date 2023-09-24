import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import ScanningSucceed from './ScanningSucceed'; 
import './QRCodeScanner.css'
function QRCodeScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [scanning, setScanning] = useState(false);

  const mediaStreamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };
  

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    let scanInterval;

    const scanQRCode = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) {
        console.log('QR Code Data:', code.data);
        setScannedData(code.data);
        clearInterval(scanInterval);
        setScanning(false);
        stopCamera();
      }
    };

    if (scanning) {
      startCamera(); // Start the camera only when scanning begins
      scanInterval = setInterval(scanQRCode, 100);
    } else {
      // Stop the camera when scanning stops
      stopCamera();
    }

    return () => {
      clearInterval(scanInterval);
      stopCamera();
    };
  }, [scanning]);

  const handleScanClick = () => {
    setScannedData(null);
    setScanning(true); // Start scanning when the button is clicked
  };
 
  const stopScanning = () =>{
    setScanning(false);
    stopCamera()
  }
  return (
    <div className='scanningArea'>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!scannedData ? (
        <>
        {scanning && <video ref={videoRef} autoPlay playsInline muted />}
        <button onClick={handleScanClick} disabled={scanning}>
        {scanning ? 'Scanning...' : 'Scan QR Code'}
        </button>
        {scanning && <button onClick={stopScanning}>Stop Scanning</button>}
        </>
      ) : (
        <div>
         {scanning===false ? (<ScanningSucceed/>):(<video ref={videoRef} autoPlay playsInline muted />)} 
          <p>Scanned QR Code Data: {scannedData}</p>
          <button onClick={handleScanClick}>Scan Again</button>
        </div>
      )}
    </div>
  );
}

export default QRCodeScanner;
