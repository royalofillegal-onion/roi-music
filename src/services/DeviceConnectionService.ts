
export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'bluetooth' | 'display' | 'airplay';
  status: 'connected' | 'connecting' | 'disconnected';
  battery?: number;
}

export class DeviceConnectionService {
  private connectedDevices: ConnectedDevice[] = [];
  public onDeviceChange?: (devices: ConnectedDevice[]) => void;

  constructor(onDeviceChangeCallback?: (devices: ConnectedDevice[]) => void) {
    this.onDeviceChange = onDeviceChangeCallback;
  }

  async connectBluetooth(): Promise<ConnectedDevice | null> {
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Bluetooth API not supported on this device');
      }

      // Check if user gesture is required
      if (!navigator.userActivation?.isActive) {
        throw new Error('Bluetooth connection requires user interaction');
      }

      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information', 'audio_sink']
      });

      if (!device) {
        throw new Error('No device selected');
      }

      // Try to connect
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to device GATT server');
      }

      const connectedDevice: ConnectedDevice = {
        id: device.id || `bluetooth-${Date.now()}`,
        name: device.name || 'Unknown Bluetooth Device',
        type: 'bluetooth',
        status: 'connected'
      };

      // Try to get battery level if available
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryCharacteristic.readValue();
        connectedDevice.battery = batteryValue.getUint8(0);
      } catch (error) {
        console.log('Battery level not available for this device');
      }

      this.connectedDevices.push(connectedDevice);
      this.notifyDeviceChange();

      // Handle disconnection
      device.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected:', connectedDevice.name);
        this.disconnectDevice(connectedDevice.id);
      });

      return connectedDevice;
    } catch (error: any) {
      console.error('Bluetooth connection failed:', error);
      
      // Provide more specific error messages
      if (error.name === 'NotFoundError') {
        throw new Error('No Bluetooth device found or user cancelled selection');
      } else if (error.name === 'SecurityError') {
        throw new Error('Bluetooth access denied. Please enable Bluetooth permissions.');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Bluetooth not supported on this device or browser');
      } else {
        throw new Error(error.message || 'Failed to connect to Bluetooth device');
      }
    }
  }

  async startScreenMirroring(): Promise<ConnectedDevice | null> {
    try {
      if (!('getDisplayMedia' in navigator.mediaDevices)) {
        throw new Error('Screen sharing not supported on this device or browser');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: true
      });

      if (!stream) {
        throw new Error('Failed to start screen capture');
      }

      const connectedDevice: ConnectedDevice = {
        id: 'screen-mirror-' + Date.now(),
        name: 'Screen Mirroring',
        type: 'display',
        status: 'connected'
      };

      this.connectedDevices.push(connectedDevice);
      this.notifyDeviceChange();

      // Handle stream end
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          console.log('Screen mirroring stopped by user');
          this.disconnectDevice(connectedDevice.id);
        };
      }

      return connectedDevice;
    } catch (error: any) {
      console.error('Screen mirroring failed:', error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Screen sharing permission denied');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No screen available for sharing');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Screen sharing not supported on this device');
      } else {
        throw new Error(error.message || 'Failed to start screen mirroring');
      }
    }
  }

  async connectAirPlay(): Promise<ConnectedDevice | null> {
    try {
      // Check for AirPlay availability
      const audioElement = document.createElement('audio');
      
      if ('webkitShowPlaybackTargetPicker' in audioElement) {
        // This will show the AirPlay picker
        (audioElement as any).webkitShowPlaybackTargetPicker();
        
        const connectedDevice: ConnectedDevice = {
          id: 'airplay-' + Date.now(),
          name: 'AirPlay Device',
          type: 'airplay',
          status: 'connected'
        };

        this.connectedDevices.push(connectedDevice);
        this.notifyDeviceChange();

        return connectedDevice;
      } else {
        throw new Error('AirPlay not supported on this device or browser');
      }
    } catch (error: any) {
      console.error('AirPlay connection failed:', error);
      throw new Error(error.message || 'AirPlay connection failed');
    }
  }

  disconnectDevice(deviceId: string): void {
    const deviceIndex = this.connectedDevices.findIndex(device => device.id === deviceId);
    if (deviceIndex !== -1) {
      const device = this.connectedDevices[deviceIndex];
      
      // Clean up based on device type
      if (device.type === 'display') {
        // Stop any active screen sharing
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          stream.getTracks().forEach(track => track.stop());
        }).catch(() => {
          // Ignore errors when stopping tracks
        });
      }
      
      this.connectedDevices.splice(deviceIndex, 1);
      this.notifyDeviceChange();
    }
  }

  getConnectedDevices(): ConnectedDevice[] {
    return [...this.connectedDevices];
  }

  private notifyDeviceChange(): void {
    if (this.onDeviceChange) {
      this.onDeviceChange([...this.connectedDevices]);
    }
  }

  // Enhanced audio routing for connected devices
  async routeAudioToDevice(deviceId: string): Promise<boolean> {
    const device = this.connectedDevices.find(d => d.id === deviceId);
    if (!device) {
      console.error('Device not found:', deviceId);
      return false;
    }

    try {
      switch (device.type) {
        case 'bluetooth':
          // Route audio to Bluetooth device
          if ('setSinkId' in HTMLAudioElement.prototype) {
            const audioElements = document.querySelectorAll('audio');
            const promises = Array.from(audioElements).map(async (audio) => {
              try {
                await (audio as any).setSinkId(deviceId);
                console.log('Audio routed to Bluetooth device:', device.name);
                return true;
              } catch (error) {
                console.error('Failed to route audio to Bluetooth device:', error);
                return false;
              }
            });
            
            const results = await Promise.all(promises);
            return results.some(success => success);
          } else {
            console.warn('Audio routing not supported in this browser');
            return false;
          }
        
        case 'airplay':
          // Handle AirPlay routing
          const audioElements = document.querySelectorAll('audio');
          audioElements.forEach((audio) => {
            if ('webkitSetPresentationMode' in audio) {
              try {
                (audio as any).webkitSetPresentationMode('picture-in-picture');
                console.log('Audio routed to AirPlay device');
              } catch (error) {
                console.error('Failed to set AirPlay presentation mode:', error);
              }
            }
          });
          return true;
          
        case 'display':
          // Screen mirroring doesn't need audio routing
          console.log('Screen mirroring active, audio follows display');
          return true;
          
        default:
          console.warn('Unknown device type for audio routing:', device.type);
          return false;
      }
    } catch (error) {
      console.error('Audio routing failed:', error);
      return false;
    }
  }

  // Check device support
  static checkDeviceSupport() {
    return {
      bluetooth: 'bluetooth' in navigator,
      screenShare: 'getDisplayMedia' in (navigator.mediaDevices || {}),
      airplay: 'webkitShowPlaybackTargetPicker' in HTMLAudioElement.prototype
    };
  }
}

export const deviceConnectionService = new DeviceConnectionService();
