import { useState, useRef, useCallback, useEffect } from 'react'
import PublicNavbar from '../../components/PublicNavbar.jsx'

const WASTE_GUIDE = [
  { type: 'Biodegradable', color: '#4CAF50', icon: '🌿',
    desc: 'Organic waste like food scraps, garden waste' },
  { type: 'Recyclable',    color: '#3b82f6', icon: '♻️',
    desc: 'Plastic, paper, metal, glass items' },
  { type: 'Hazardous',     color: '#ef4444', icon: '⚠️',
    desc: 'Batteries, chemicals, e-waste' },
  { type: 'Mixed Waste',   color: '#f59e0b', icon: '🗑️',
    desc: 'Unsorted or mixed waste items' },
]

export default function SwachhAI() {
  const [file,      setFile]      = useState(null)
  const [preview,   setPreview]   = useState(null)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [mode,      setMode]      = useState('upload') // 'upload' | 'camera'
  const [camType,   setCamType]   = useState('hardware') // Default to hardware
  const [cameraOn,  setCameraOn]  = useState(false)
  const [hardwarePreview, setHardwarePreview] = useState(null) // Live ESP32 stream
  const [autoMode, setAutoMode] = useState(false)
  const [lastTimestamp, setLastTimestamp] = useState(0)


  // Feedback / correction state
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackLabel, setFeedbackLabel] = useState(null)

  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const streamRef  = useRef(null)

  // Attach stream to <video> element once cameraOn triggers a re-render
  // (the <video> is conditionally rendered, so videoRef is null until cameraOn=true)
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(e => console.error('Play failed:', e))
    }
  }, [cameraOn])

  // ── ESP32 Stream simulation ──
  useEffect(() => {
    let interval = null
    if (camType === 'hardware' && mode === 'camera' && !preview && !result) {
      const fetchFrame = async () => {
        try {
          // Just get model info to check if hardware is actually connected
          const res = await fetch('/api/waste-ai/health')
          const data = await res.json()
          if (!data.model_loaded) return
          
          // Note: In real ESP32 stream, 192.168.43.84/stream:81 would be better
          // but here we just ping to show the camera status is 'live'
        } catch {}
      }
      fetchFrame()
      interval = setInterval(fetchFrame, 3000)
    }
    return () => clearInterval(interval)
  }, [camType, mode, preview, result])


  // ── Auto-Detection Polling ───────────────────────
  useEffect(() => {
    let interval = null;
    if (autoMode) {
      const pollLatest = async () => {
        try {
          const res = await fetch('/api/waste-ai/latest-auto-result');
          const data = await res.json();
          
          if (data && data.timestamp && data.timestamp > lastTimestamp) {
            setLastTimestamp(data.timestamp);
            if (data.image) {
              setPreview(`data:image/jpeg;base64,${data.image}`);
            }
            setResult({
              type:  data.waste_type   || 'Unknown',
              color: data.color        || '#6b7280',
              icon:  data.icon         || '❓',
              conf:  Math.round((data.confidence || 0) * 100),
              tip:   data.tip          || 'No suggestion available.',
              bin:   data.bin          || 'Check locally',
              points: data.points      || 0,
              demo:  data.demo_mode    || false,
              raw:   data.raw_class    || '',
              scores: data.all_scores  || {},
              detections: data.all_detections || [],
              mixStatus: data.mix_status || null,
            });
          }
        } catch (err) {
          console.error('Auto-poll error:', err);
        }
      };
      
      pollLatest();
      interval = setInterval(pollLatest, 3000);
    }
    return () => clearInterval(interval);
  }, [autoMode, lastTimestamp]);

  const toggleAutoMode = async () => {
    const newState = !autoMode;
    setAutoMode(newState);
    
    try {
      await fetch('/api/waste-ai/toggle-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: newState ? 0.5 : 0 })
      });
    } catch (err) {
      console.error('Failed to toggle auto loop on server:', err);
    }
  };


  // ── File Upload ──────────────────────────────────
  const handleFile = f => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
  }

  // ── Analyze (Upload mode) ────────────────────────
  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('token')
      const res = await fetch('/api/waste-ai/predict', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Prediction failed')
      }

      setResult({
        type:  data.waste_type   || 'Unknown',
        color: data.color        || '#6b7280',
        icon:  data.icon         || '❓',
        conf:  Math.round((data.confidence || 0) * 100),
        tip:   data.tip          || 'No suggestion available.',
        bin:   data.bin          || 'Check locally',
        points: data.points      || 0,
        demo:  data.demo_mode    || false,
        raw:   data.raw_class    || '',
        scores: data.all_scores  || {},
        detections: data.all_detections || [],
        mixStatus: data.mix_status || null,
      })
    } catch (err) {
      console.error('Prediction error:', err)
      setError(err.message || 'Failed to analyze image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [devices,    setDevices]    = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)

  // ── Camera ───────────────────────────────────────
  const startCamera = useCallback(async (forcedIdx = null) => {
    try {
      setError(null)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      // 1. Kickstart permissions (some browsers need this to see labels/IDs)
      let initialStream;
      try {
        initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (e) {
        throw new Error("Could not access any camera. Please check your browser permissions.");
      }

      // 2. Now list devices properly
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);

      if (videoDevices.length === 0) {
        // Fallback to the stream we already got if enumeration fails
        streamRef.current = initialStream;
      } else {
        const activeIdx = forcedIdx !== null ? forcedIdx : currentIdx;
        const targetDevice = videoDevices[activeIdx % videoDevices.length];

        if (targetDevice && targetDevice.deviceId) {
           // If we are choosing a specific device, stop the initial one and start the specific one
           initialStream.getTracks().forEach(t => t.stop());
           const stream = await navigator.mediaDevices.getUserMedia({
             video: { 
               deviceId: { exact: targetDevice.deviceId },
               width: { ideal: 1280 }, 
               height: { ideal: 720 } 
             },
           });
           streamRef.current = stream;
        } else {
           streamRef.current = initialStream;
        }
      }

      // Set cameraOn=true so the <video> element renders;
      // the useEffect above will attach streamRef to it after mount.
      setCameraOn(true)
    } catch (err) {
      console.error('Camera error:', err)
      setError(`Camera Error: ${err.message || "Failed to start"}`);
    }
  }, [currentIdx])

  const switchCamera = () => {
    const nextIdx = currentIdx + 1;
    setCurrentIdx(nextIdx);
    startCamera(nextIdx);
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraOn(false)
  }, [])

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video  = videoRef.current
    const canvas = canvasRef.current
    
    // Attempt capture even if readyState is low (fallback)
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera stream has no visual data yet. Please wait a few more seconds for the video to appear.')
      return
    }

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    // Show preview
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setPreview(dataUrl)

    // Convert to blob for upload
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to capture frame from buffer.')
        return
      }

      setLoading(true)
      setError(null)
      setResult(null)
      stopCamera()

      try {
        const formData = new FormData()
        formData.append('image', blob, 'camera_capture.jpg')

        const token = localStorage.getItem('token')
        const res = await fetch('/api/waste-ai/predict', {
          method: 'POST',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Prediction failed')

        setResult({
          type:  data.waste_type   || 'Unknown',
          color: data.color        || '#6b7280',
          icon:  data.icon         || '❓',
          conf:  Math.round((data.confidence || 0) * 100),
          tip:   data.tip          || 'No suggestion available.',
          bin:   data.bin          || 'Check locally',
          points: data.points      || 0,
          demo:  data.demo_mode    || false,
          raw:   data.raw_class    || '',
          scores: data.all_scores  || {},
          detections: data.all_detections || [],
          mixStatus: data.mix_status || null,
        })
      } catch (err) {
        console.error('Camera prediction error:', err)
        setError(err.message || 'Failed to analyze captured image.')
      } finally {
        setLoading(false)
      }
    }, 'image/jpeg', 0.9)
  }, [stopCamera])

  // ── Hardware Camera (ESP32) ──────────────────────
  const handleHardwareCapture = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setPreview(null)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/waste-ai/capture-hardware', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Hardware capture failed')

      // Set preview from base64 if provided
      if (data.image) {
        setPreview(`data:image/jpeg;base64,${data.image}`)
      }

      setResult({
        type:  data.waste_type   || 'Unknown',
        color: data.color        || '#6b7280',
        icon:  data.icon         || '❓',
        conf:  Math.round((data.confidence || 0) * 100),
        tip:   data.tip          || 'No suggestion available.',
        bin:   data.bin          || 'Check locally',
        points: data.points      || 0,
        demo:  data.demo_mode    || false,
        raw:   data.raw_class    || '',
        scores: data.all_scores  || {},
        detections: data.all_detections || [],
        mixStatus: data.mix_status || null,
      })
    } catch (err) {
      console.error('Hardware capture error:', err)
      setError(err.message || 'ESP32 Camera could not be reached or failed to capture.')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    stopCamera()
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setShowFeedback(false)
    setFeedbackSent(false)
    setFeedbackLabel(null)
  }

  // ── Feedback / Correction ──────────────────────────
  const FEEDBACK_TYPES = [
    { label: 'Biodegradable', color: '#4CAF50', icon: '🌿' },
    { label: 'Recyclable',    color: '#3b82f6', icon: '♻️' },
    { label: 'Hazardous',     color: '#ef4444', icon: '⚠️' },
  ]

  const handleFeedback = async (correctLabel) => {
    setFeedbackLoading(true)
    setFeedbackLabel(correctLabel)
    try {
      const token = localStorage.getItem('token')

      // Send the preview image (base64) + correct label
      const res = await fetch('/api/waste-ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          correct_label: correctLabel,
          image_base64:  preview || '',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Feedback failed')

      setFeedbackSent(true)
      console.log('Feedback saved:', data)
    } catch (err) {
      console.error('Feedback error:', err)
      setError(err.message || 'Failed to send feedback')
    } finally {
      setFeedbackLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden pt-24 pb-12">
      <PublicNavbar />

      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 fade-in text-center md:text-left">
          <h1 className="font-baloo font-bold text-4xl text-gray-900 tracking-tight">
            🤖 Swachh AI
          </h1>
          <p className="text-gray-500 font-dm mt-2 text-lg">
            Upload a waste image or use your camera for instant AI classification
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
          <button
            onClick={() => { resetAll(); setMode('upload') }}
            className="px-5 py-2.5 rounded-xl font-dm font-semibold text-sm transition-all shadow-sm"
            style={{
              background: mode === 'upload' ? 'linear-gradient(135deg,#4CAF50,#388E3C)' : '#f3f4f6',
              color: mode === 'upload' ? 'white' : '#6b7280',
              border: mode === 'upload' ? 'none' : '1px solid #e5e7eb',
            }}
          >
            📁 Upload File
          </button>
          <button
            onClick={() => { resetAll(); setMode('camera'); setCamType('local'); }}
            className="px-5 py-2.5 rounded-xl font-dm font-semibold text-sm transition-all shadow-sm"
            style={{
              background: (mode === 'camera' && camType === 'local') ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : '#f3f4f6',
              color: (mode === 'camera' && camType === 'local') ? 'white' : '#6b7280',
              border: (mode === 'camera' && camType === 'local') ? 'none' : '1px solid #e5e7eb',
            }}
          >
            💻 Laptop Camera
          </button>
          <button
            onClick={() => { resetAll(); setMode('camera'); setCamType('hardware'); }}
            className="px-5 py-2.5 rounded-xl font-dm font-semibold text-sm transition-all shadow-sm"
            style={{
              background: (mode === 'camera' && camType === 'hardware') ? 'linear-gradient(135deg,#10b981,#059669)' : '#f3f4f6',
              color: (mode === 'camera' && camType === 'hardware') ? 'white' : '#6b7280',
              border: (mode === 'camera' && camType === 'hardware') ? 'none' : '1px solid #e5e7eb',
            }}
          >
            🗼 ESP32 Hardware Module
          </button>

          <button
            onClick={toggleAutoMode}
            className="px-5 py-2.5 rounded-xl font-dm font-bold text-sm transition-all shadow-sm border-2 animate-pulse"
            style={{
              borderColor: autoMode ? '#10b981' : '#e5e7eb',
              background: autoMode ? '#f0fdf4' : 'transparent',
              color: autoMode ? '#059669' : '#6b7280',
            }}
          >
            {autoMode ? '🟢 Auto-Detect: ON' : '⚪ Auto-Detect: OFF'}
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 fade-in">
            <p className="text-sm font-dm text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Left Panel: Upload / Camera ── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-dm font-semibold text-gray-700">
                  {mode === 'upload' ? '📤 Upload Waste Image' : '📷 Camera Capture'}
                </h2>
                
                {mode === 'camera' && (
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => { resetAll(); setCamType('local'); }}
                      className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${camType === 'local' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                    >
                      PC Cam
                    </button>
                    <button 
                      onClick={() => { resetAll(); setCamType('hardware'); }}
                      className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${camType === 'hardware' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                    >
                      ESP32 Cam
                    </button>
                  </div>
                )}
              </div>

              {/* ── Upload Mode ── */}
              {mode === 'upload' && (
                <>
                  <div
                    className="border-2 border-dashed rounded-2xl cursor-pointer transition-all"
                    style={{
                      borderColor: preview ? '#4CAF50' : '#d1fae5',
                      background:  preview ? '#f0fdf4' : '#fafff9',
                    }}
                    onClick={() => document.getElementById('swachh-file').click()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
                    onDragOver={e => e.preventDefault()}
                  >
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Uploaded waste"
                          className="w-full h-56 object-cover rounded-xl" />
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-dm">
                          ✓ Uploaded
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <p className="text-5xl mb-3">📷</p>
                        <p className="font-dm font-semibold text-gray-600">
                          Drop image here or click to browse
                        </p>
                        <p className="text-gray-400 text-sm mt-1 font-dm">
                          Supports JPG, PNG, WEBP
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="swachh-file" type="file" accept="image/*"
                    className="hidden"
                    onChange={e => handleFile(e.target.files[0])}
                  />
                  {file && (
                    <p className="mt-3 text-sm text-gray-500 font-dm truncate">📎 {file.name}</p>
                  )}
                </>
              )}

              {/* ── Camera Mode ── */}
              {mode === 'camera' && (
                <div className="space-y-4">
                  {/* LOCAL CAMERA UI */}
                  {camType === 'local' && (
                    <>
                      {!cameraOn && !preview && (
                        <div
                          className="border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer transition-all"
                          style={{ background: '#f0f7ff' }}
                          onClick={startCamera}
                        >
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <p className="text-5xl mb-3">📹</p>
                            <p className="font-dm font-semibold text-gray-600">
                              Click to start laptop camera
                            </p>
                            <p className="text-gray-400 text-sm mt-1 font-dm">
                              Use your computer's built-in webcam
                            </p>
                          </div>
                        </div>
                      )}

                      {cameraOn && (
                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            onClick={() => videoRef.current && videoRef.current.play()}
                            className="w-full h-full object-cover rounded-2xl cursor-pointer"
                          />
                          
                          <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-2">
                             {devices.length > 1 && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); switchCamera(); }}
                                 className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/30 transition-all border border-blue-400"
                               >
                                 🔄 Try Next Camera ({currentIdx % devices.length + 1}/{devices.length})
                               </button>
                             )}
                            <span className="bg-black/80 text-white text-[10px] px-3 py-1 rounded-full font-dm border border-white/20 backdrop-blur-sm">
                              🔴 {devices[currentIdx % devices.length]?.label || 'Standard Camera'}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* HARDWARE CAMERA UI */}
                  {camType === 'hardware' && !preview && !loading && (
                    <div
                      className="group relative border-2 border-dashed border-green-200 rounded-2xl cursor-pointer overflow-hidden transition-all hover:border-green-400"
                      style={{ background: '#f0fdf4' }}
                    >
                      {autoMode ? (
                        <div className="relative aspect-video bg-black">
                           <img 
                             src="/api/waste-ai/video-feed" 
                             alt="Live Tray Stream" 
                             className="w-full h-full object-cover"
                             onError={(e) => {
                               e.target.src = "https://placehold.co/600x400/000/fff?text=Waiting+for+AI+Stream...";
                             }}
                           />
                           <div className="absolute top-2 left-2 flex items-center gap-2">
                             <span className="flex h-2 w-2">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                             </span>
                             <span className="text-[10px] text-white font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                               Live Tray Monitoring
                             </span>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center" onClick={handleHardwareCapture}>
                          <div className="relative mb-4">
                            <p className="text-6xl animate-pulse">🗼</p>
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                          </div>
                          <p className="font-dm font-bold text-gray-700 text-lg">
                            External AI Camera
                          </p>
                          <p className="text-gray-500 text-sm mt-1 font-dm max-w-[200px]">
                            Using ESP32 IoT Module at 192.168.43.84
                          </p>
                          
                          <div className="mt-6 flex flex-col items-center gap-3">
                            <button className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-dm font-bold 
                                               shadow-lg shadow-green-200 group-hover:scale-105 transition-all">
                              📸 Capture & Analyze
                            </button>
                            <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">
                              Ready to Scan
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                  {/* PREVIEW IMAGE (Used by both) */}
                  {preview && (
                    <div className="relative fade-in">
                      <img src={preview} alt="Captured frame"
                        className="w-full h-56 object-cover rounded-2xl" />
                      <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-dm">
                        ✓ Captured
                      </span>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="px-6 pb-6">
              {mode === 'upload' && (
                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="w-full py-4 rounded-2xl font-dm font-semibold text-white
                             flex items-center justify-center gap-3 transition-all"
                  style={{
                    background: file && !loading
                      ? 'linear-gradient(135deg,#4CAF50,#388E3C)' : '#e5e7eb',
                    color:  file && !loading ? 'white' : '#9ca3af',
                    cursor: file && !loading ? 'pointer' : 'not-allowed',
                    boxShadow: file && !loading ? '0 4px 20px rgba(76,175,80,0.35)' : 'none',
                  }}
                >
                  {loading
                    ? <><div className="spinner" /> Analyzing…</>
                    : '🔍 Analyze Waste'
                  }
                </button>
              )}

              {mode === 'camera' && (
                <div className="flex gap-3">
                  {/* LOCAL BUTTONS */}
                  {camType === 'local' && (
                    <>
                      {cameraOn ? (
                        <>
                          <button
                            onClick={captureFrame}
                            disabled={loading}
                            className="flex-1 py-4 rounded-2xl font-dm font-semibold text-white
                                       flex items-center justify-center gap-2 transition-all"
                            style={{
                              background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                              boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
                            }}
                          >
                            📸 Capture & Analyze
                          </button>
                          <button
                            onClick={stopCamera}
                            className="px-5 py-4 rounded-2xl font-dm font-semibold text-gray-500
                                       bg-gray-100 hover:bg-gray-200 transition-all"
                          >
                            ✕
                          </button>
                        </>
                      ) : !preview ? (
                        <button
                          onClick={startCamera}
                          className="w-full py-4 rounded-2xl font-dm font-semibold text-white
                                     flex items-center justify-center gap-3 transition-all"
                          style={{
                            background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                            boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
                          }}
                        >
                          📷 Start PC Camera
                        </button>
                      ) : (
                        <button
                          onClick={resetAll}
                          disabled={loading}
                          className="w-full py-4 rounded-2xl font-dm font-semibold text-gray-500
                                     bg-gray-100 hover:bg-gray-200 transition-all font-baloo"
                        >
                          {loading
                            ? <><div className="spinner" /> Analyzing…</>
                            : '🔄 Capture Again'
                          }
                        </button>
                      )}
                    </>
                  )}

                  {/* HARDWARE BUTTONS */}
                  {camType === 'hardware' && (
                    <button
                      onClick={handleHardwareCapture}
                      disabled={loading}
                      className="w-full py-4 rounded-2xl font-dm font-semibold text-white
                                 flex items-center justify-center gap-3 transition-all"
                      style={{
                        background: 'linear-gradient(135deg,#10b981,#059669)',
                        boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                      }}
                    >
                      {loading
                        ? <><div className="spinner" /> Fetching from ESP32Cam…</>
                        : preview ? '🔄 Capture Again' : '🔭 Fetch from Hardware'
                      }
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Panel: Result ── */}
          <div>
            {!result && !loading && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div className="text-center text-gray-400">
                  <p className="text-5xl mb-3">🔬</p>
                  <p className="font-dm font-medium">AI result will appear here</p>
                  <p className="text-sm mt-1 font-dm">Upload an image or capture from camera</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div className="text-center">
                  <p className="text-5xl mb-4">🤖</p>
                  <p className="font-dm font-semibold text-gray-700">AI is analysing your image…</p>
                  <p className="text-sm text-gray-400 font-dm mt-1">Using YOLOv8 waste detection model</p>
                  <div className="mt-4 flex gap-1 justify-center">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} className="w-2 h-2 bg-green-400 rounded-full pulse-ring"
                        style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden fade-in"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

                {/* Header */}
                <div className="p-5" style={{ background: result.color + '12' }}>
                  <div className="flex items-center gap-3">
                    <p className="text-4xl">{result.icon}</p>
                    <div>
                      <p className="text-xs font-dm text-gray-500 uppercase tracking-wide">
                        Waste Type Detected
                      </p>
                      <p className="font-baloo font-bold text-2xl" style={{ color: result.color }}>
                        {result.type}
                      </p>
                      {result.raw && (
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                          Model Label: "{result.raw}"
                        </p>
                      )}
                    </div>
                  </div>
                  {result.demo && (
                    <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs
                                    font-dm rounded-full inline-block">
                      ⚠️ Demo Mode — AI server offline
                    </div>
                  )}
                  {result.mixStatus && (
                    <div className="mt-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs
                                    font-dm font-semibold rounded-full inline-flex items-center gap-1"
                         style={{ border: '1px solid #f59e0b30' }}>
                      🔀 {result.mixStatus}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {/* Confidence */}
                  <div>
                    <div className="flex justify-between text-sm font-dm mb-2">
                      <span className="text-gray-600 font-medium">Confidence Level</span>
                      <span className="font-bold" style={{ color: result.color }}>
                        {result.conf}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="h-3 rounded-full transition-all duration-1000"
                        style={{
                          width: `${result.conf}%`,
                          background: `linear-gradient(90deg,${result.color}88,${result.color})`,
                        }} />
                    </div>
                  </div>

                  {/* Bin Recommendation */}
                  <div className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background: result.color + '10', border: `1px solid ${result.color}25` }}>
                    <span className="text-2xl">🗂️</span>
                    <div>
                      <p className="font-dm text-xs text-gray-500 uppercase">Dispose In</p>
                      <p className="font-dm font-semibold text-sm" style={{ color: result.color }}>
                        {result.bin}
                      </p>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div className="rounded-xl p-4"
                    style={{ background: result.color + '10', border: `1px solid ${result.color}30` }}>
                    <p className="font-dm font-semibold text-gray-700 text-sm mb-2">
                      💡 AI Suggestion
                    </p>
                    <p className="text-gray-600 text-sm font-dm leading-relaxed">{result.tip}</p>
                  </div>

                  {/* Confidence Breakdown (All Categories) */}
                  {result.scores && Object.keys(result.scores).length > 0 && (
                    <div className="rounded-xl p-4 bg-gray-50 border border-gray-100">
                      <p className="font-dm font-semibold text-gray-700 text-xs uppercase tracking-wider mb-3">
                        📊 Confidence Breakdown
                      </p>
                      <div className="space-y-3">
                        {Object.entries(result.scores)
                          .sort(([, a], [, b]) => b - a)
                          .map(([label, score]) => (
                            <div key={label}>
                              <div className="flex justify-between text-xs font-dm mb-1">
                                <span className="text-gray-500 capitalize">{label.replace(' data', '')}</span>
                                <span className="font-bold text-gray-700">{Math.round(score * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${score * 100}%`,
                                    background: label === result.raw ? result.color : '#9ca3af'
                                  }} />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Detections count */}
                  {result.detections && result.detections.length > 1 && (
                    <div className="rounded-xl p-3 bg-blue-50 border border-blue-100">
                      <p className="text-sm font-dm text-blue-700 font-medium">
                        🔎 {result.detections.length} waste items detected in image
                      </p>
                      <div className="mt-2 space-y-1">
                        {result.detections.slice(0, 5).map((d, i) => (
                          <div key={i} className="flex justify-between text-xs font-dm text-blue-600">
                            <span className="capitalize">{d.class}</span>
                            <span>{Math.round(d.confidence * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Points earned */}
                  <div className="rounded-xl p-3 bg-green-50 flex items-center gap-2">
                    <span>🏆</span>
                    <span className="text-sm font-dm text-green-700 font-medium">
                      +{result.points} Swachh Points earned for this report!
                    </span>
                  </div>

                  {/* ── Wrong Prediction Feedback ── */}
                  {!feedbackSent && (
                    <div className="rounded-xl border border-orange-200 overflow-hidden">
                      {!showFeedback ? (
                        <button
                          onClick={() => setShowFeedback(true)}
                          className="w-full px-4 py-3 text-sm font-dm font-medium text-orange-600
                                     bg-orange-50 hover:bg-orange-100 transition-all
                                     flex items-center justify-center gap-2"
                        >
                          ❌ Wrong prediction? Click to correct
                        </button>
                      ) : (
                        <div className="p-4 bg-orange-50">
                          <p className="text-sm font-dm font-semibold text-gray-700 mb-3 text-center">
                            🎯 Select the correct waste type:
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {FEEDBACK_TYPES.map(ft => (
                              <button
                                key={ft.label}
                                onClick={() => handleFeedback(ft.label)}
                                disabled={feedbackLoading}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-xl
                                           border-2 transition-all hover:scale-105
                                           disabled:opacity-50 disabled:cursor-wait"
                                style={{
                                  borderColor: feedbackLoading && feedbackLabel === ft.label
                                    ? ft.color : ft.color + '40',
                                  background: feedbackLoading && feedbackLabel === ft.label
                                    ? ft.color + '20' : 'white',
                                }}
                              >
                                <span className="text-2xl">{ft.icon}</span>
                                <span className="text-[11px] font-dm font-bold"
                                  style={{ color: ft.color }}>
                                  {ft.label}
                                </span>
                                {feedbackLoading && feedbackLabel === ft.label && (
                                  <div className="spinner" style={{ width: 14, height: 14 }} />
                                )}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setShowFeedback(false)}
                            className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 font-dm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback success */}
                  {feedbackSent && (
                    <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-200
                                    flex items-center gap-2 fade-in">
                      <span>✅</span>
                      <span className="text-sm font-dm text-emerald-700 font-medium">
                        Thank you! Your correction ({feedbackLabel}) has been saved for model improvement.
                      </span>
                    </div>
                  )}

                  <button
                    onClick={resetAll}
                    className="w-full py-2.5 rounded-xl font-dm font-medium text-gray-500
                               bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                  >
                    Analyze Another Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── How It Works ── */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 className="font-baloo font-bold text-xl text-gray-800 mb-4">
            ⚙️ How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[
              { step: '1', icon: '📷', title: 'Capture / Upload', desc: 'Take a photo of waste using camera or upload an image' },
              { step: '2', icon: '🤖', title: 'AI Analysis', desc: 'YOLOv8 model detects and classifies waste type instantly' },
              { step: '3', icon: '♻️', title: 'Get Guidance', desc: 'Receive disposal instructions and earn Swachh Points' },
            ].map(s => (
              <div key={s.step} className="rounded-xl p-4 bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold font-dm
                                text-sm flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="font-dm font-semibold text-gray-700 text-sm">{s.title}</p>
                <p className="text-gray-400 text-xs font-dm mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Waste Classification Guide ── */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 className="font-baloo font-bold text-xl text-gray-800 mb-4">
            📚 Waste Classification Guide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WASTE_GUIDE.map(w => (
              <div key={w.type} className="rounded-xl p-4 text-center transition-transform hover:scale-105"
                style={{ background: w.color + '12' }}>
                <p className="text-3xl mb-2">{w.icon}</p>
                <p className="font-dm font-semibold text-sm" style={{ color: w.color }}>
                  {w.type}
                </p>
                <p className="text-xs text-gray-500 font-dm mt-1">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Info Banner */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100 p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🚛</span>
            <div>
              <h3 className="font-baloo font-bold text-lg text-gray-800">
                AI Smart Kachra Vahan
              </h3>
              <p className="text-sm text-gray-600 font-dm mt-1 leading-relaxed">
                Our waste segregation vehicles are equipped with camera modules that use
                the same YOLOv8 AI model to automatically classify waste as it's disposed.
                The vehicle's camera identifies waste in real-time, ensuring proper segregation
                at the point of collection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
