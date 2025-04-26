import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

export const useMediaPermission = (type = 'camera') => {
  const [status, setStatus] = useState('prompt');

  useEffect(() => {
    const permissionName = type === 'camera' ? 'camera' : 'microphone';

    navigator.permissions?.query({ name: permissionName })
      .then((result) => {
        setStatus(result.state);
        result.onchange = () => setStatus(result.state);
      })
      .catch((err) => {
        console.warn('Permissions API not supported or error:', err);
      });
  }, [type]);

  const requestAccess = async () => {
    const constraints = type === 'camera' ? { video: true } : { audio: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());
      setStatus('granted');
    } catch (err) {
      console.error(`${type} access denied`, err);
      setStatus('denied');
    }
  };

  return { status, requestAccess };
};

function App() {
  const mic = useMediaPermission('microphone');
  const cam = useMediaPermission('camera');
  const [cookies, setCookie, removeCookie] = useCookies(['name']);
  
  const [ipAddress, setIpAddress] = useState('');

    useEffect(() => {
      const getLocalIP = async () => {
        const ipSet = new Set();
  
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
  
        pc.createDataChannel(''); // needed to trigger ICE gathering
  
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            const match = ipRegex.exec(candidate);
            if (match) {
              ipSet.add(match[1]);
              console.log('Found IP:', match[1]);
              setIpAddress(match[1]);
            }
          }
        };
  
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
        } catch (err) {
          console.error('Error creating offer:', err);
        }
  
        // Wait for ICE gathering
        setTimeout(() => {
          pc.close();
          console.log('All gathered IPs:', [...ipSet]);
        }, 1000); // Wait a bit to gather all ICE candidates
      };
  
      getLocalIP();
    }, []);


  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>IP gathered using WebRTC</h1>

      <div>
        <h2> IP Address found:</h2>
        <p> {ipAddress} </p>
      </div>
      <h1>Media Permissions Test</h1>

      <div>
        <h2>Microphone</h2>
        <p>Status: {mic.status}</p>
        <button onClick={mic.requestAccess}>Request Microphone Access</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Camera</h2>
        <p>Status: {cam.status}</p>
        <button onClick={cam.requestAccess}>Request Camera Access</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Cookie</h2>
        <p>Status: {cookies.name}</p>
        <button onClick={setCookie('name', 'cookie set')}>SetCookie</button>
      </div>
    </div>
  );
}

export default App;
