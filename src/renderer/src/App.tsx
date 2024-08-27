import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
const MEDIA = React.lazy(() => import('./components/MediaShow'));
const HANDLE = React.lazy(() => import('./components/WaitHandle'));
const SERIAL = React.lazy(() => import('./components/WaitSerial'));

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  
  return (
    <> 
    <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<SERIAL />} />
        <Route path="/media" element={<MEDIA />} />
        <Route path="/handle" element={<HANDLE />} />
      </Routes>
    </Suspense>
  </Router>
    </>
  )
}

export default App
