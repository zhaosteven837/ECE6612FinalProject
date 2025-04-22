import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';

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
  const [cookies, setCookie] = useCookies(['test']);
  

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Media Permissions Checker</h1>

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
        <button onClick={setCookie('test', 'true')}>SetCookie</button>
      </div>
    </div>
  );
}

export default App;
