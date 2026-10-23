const scanBtn = document.getElementById('scanBtn');
const barcodePanel = document.getElementById('barcodePanel');
const scannerArea = document.getElementById('reader');
const scannerStatus = document.getElementById('scanner-status');

let barcodeScanner = null;
let scannerBusy = false;
let lastCode = '';
let lastCodeTime = 0;

function getScannerConfig() {
  return {
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39
    ],
    useBarCodeDetectorIfSupported: true
  };
}

function getStartConfig() {
  return {
    fps: 10,
    qrbox: { width: 280, height: 140 }
  };
}

function toggleScanner() {
  if (scannerBusy) return;

  if (barcodePanel.classList.contains('active')) {
    stopScanner();
  } else {
    startScanner();
  }
}

async function startScanner() {
  scannerBusy = true;

  barcodePanel.classList.add('active');
  scannerArea.textContent = '';
  scannerStatus.textContent = 'Starting camera...';

  try {
    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('The scanner library did not load.');
    }

    if (!navigator.mediaDevices) {
      throw new Error('Camera needs https or localhost.');
    }

    barcodeScanner = new Html5Qrcode('reader', getScannerConfig());

    await barcodeScanner.start(
      { facingMode: 'environment' },
      getStartConfig(),
      onScanSuccess
    );

    scannerStatus.textContent = 'Point the camera at the barcode.';
  } catch (error) {
    console.error(error);

    barcodeScanner = null;
    scannerArea.textContent = 'Scanner area';
    scannerStatus.textContent = error && error.message && !/Permission|NotAllowed|NotFound/i.test(String(error))
      ? error.message
      : 'Camera not available. Allow camera access (needs https or localhost).';
  }

  scannerBusy = false;
}

async function stopScanner() {
  barcodePanel.classList.remove('active');

  if (barcodeScanner === null) return;

  try {
    await barcodeScanner.stop();
    barcodeScanner.clear();
  } catch (error) {
    console.error(error);
  }

  barcodeScanner = null;
  scannerArea.textContent = 'Scanner area';
  scannerStatus.textContent = 'Point the camera at the barcode.';
}

function onScanSuccess(decodedText) {
  const now = Date.now();

  if (decodedText === lastCode && now - lastCodeTime < 3000) return;

  lastCode = decodedText;
  lastCodeTime = now;

  handleBarcode(decodedText);
}

scanBtn.addEventListener('click', toggleScanner);
