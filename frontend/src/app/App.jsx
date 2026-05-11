import './App.css'
import {Editor} from '@monaco-editor/react'
import {MonacoBinding} from 'y-monaco'
import * as Y from 'yjs'
import { SocketIOProvider } from 'y-socket.io'
import { useRef, useEffect, useState } from 'react'

function resolveSocketUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  const { hostname, protocol } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3001`;
  }

  return window.location.origin;
}

function App() {
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const ydocRef = useRef(new Y.Doc());
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('username') || '';
    } catch (err) {
      console.error('Error reading username from URL:', err);
      return '';
    }
  } );
  const [connectedUsers, setConnectedUsers] = useState([]);

  const ydoc = ydocRef.current;
  const yText = ydoc.getText('monaco');

  // Initialize provider on component mount
  useEffect(() => {
    console.log('Initializing Yjs provider...');
    
    try {
      // Create provider once
      providerRef.current = new SocketIOProvider(
        resolveSocketUrl(),
        'monaco-demo',
        ydoc,
        { autoConnect: true }
      );
      console.log('✅ SocketIOProvider created successfully');

      // Debug connection
      providerRef.current.on('sync', (isSynced) => {
        console.log('🔄 Synced with server:', isSynced);
      });

      providerRef.current.on('status', ({ status }) => {
        console.log('📡 Provider status:', status);
      });

      providerRef.current.on('connection-error', (error) => {
        console.error('❌ Connection error:', error);
        setError('Connection failed. Please check if backend is running on port 3001');
      });

      providerRef.current.awareness.on('change', (changes) => {
        console.log('👥 Awareness change:', changes);
      });
    } catch (err) {
      console.error('❌ Failed to create provider:', err);
      setError('Failed to initialize provider: ' + err.message);
    }

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up provider...');
      if (providerRef.current) {
        providerRef.current.disconnect();
        providerRef.current = null;
      }
    };
  }, [ydoc]);

  // Setup binding once editor and provider are ready
  useEffect(() => {
    if (!isEditorReady || !editorRef.current || !providerRef.current) {
      console.log('Waiting for editor and provider...', { isEditorReady, editor: !!editorRef.current, provider: !!providerRef.current });
      return;
    }

    try {
      console.log('Setting up MonacoBinding...');
      bindingRef.current = new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        providerRef.current.awareness
      );
      console.log('✅ MonacoBinding initialized successfully');
    } catch (err) {
      console.error('❌ Error setting up binding:', err);
    }

    // Cleanup
    return () => {
      if (bindingRef.current) {
        console.log('Destroying binding...');
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [isEditorReady, yText]);

  const handleMount = (editor) => {
    try {
      console.log('📝 Editor mounted');
      editorRef.current = editor;
      setIsEditorReady(true);
    } catch (err) {
      console.error('Error mounting editor:', err);
      setError('Failed to mount editor: ' + err.message);
    }
  }
  
  const handelJoin = (e) => {
    try {
      e.preventDefault();
      const newUsername = e.target.username.value.trim();
      if (!newUsername) {
        setError('Username cannot be empty');
        return;
      }
      setError(null);
      setUsername(newUsername);
      window.history.pushState({}, '', "?username=" + encodeURIComponent(newUsername));
    } catch (err) {
      console.error('Error joining:', err);
      setError('Error joining: ' + err.message);
    }
  }

  useEffect(() => {
    if(!username || !providerRef.current) {
      console.log('Waiting for username and provider...', { username, provider: !!providerRef.current });
      return;
    }

    console.log('Setting user awareness for:', username);
    
    // Set this user's awareness state
    const userColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    providerRef.current.awareness.setLocalStateField('user', {
      name: username,
      color: userColor
    });

    // Listen to all awareness changes (including other users)
    const handleAwarenessChange = () => {
      try {
        const states = Array.from(providerRef.current.awareness.getStates().values());
        // Only show users that have a valid name (active users)
        const users = states
          .filter(state => state && state.user && state.user.name)
          .map(state => state.user);
        console.log('👥 Connected users:', users);
        setConnectedUsers(users);
      } catch (err) {
        console.error('Error processing awareness change:', err);
      }
    };

    providerRef.current.awareness.on('change', handleAwarenessChange);
    
    // Trigger initial update
    handleAwarenessChange();

    function handleBeforeUnload() {
      if (providerRef.current) {
        providerRef.current.awareness.setLocalStateField('user', null);
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (providerRef.current) {
        providerRef.current.awareness.off('change', handleAwarenessChange);
        handleBeforeUnload(); // Clear user on unmount too
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [username]);

  if(error) {
    return (
      <div className='h-screen w-full bg-gray-950 text-white flex items-center justify-center'>
        <div className='bg-red-900 p-6 rounded-lg max-w-md'>
          <h2 className='text-xl mb-4 text-red-300'>❌ Error</h2>
          <p className='mb-4 text-sm'>{error}</p>
          <button 
            className='w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition'
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if(!username) {
    return (
      <div className='h-screen w-full bg-gray-950 text-white flex items-center justify-center'>
        <form
        onSubmit={handelJoin}
        className='bg-gray-900 p-6 rounded-lg'>
          <h2 className='text-xl mb-4'>Enter your username</h2>
          <input 
            type="text" 
            className='w-full p-2 mb-4 rounded bg-gray-800 text-white' 
            name='username'
            placeholder="Your name"
            autoFocus
          />
          <button 
            className='w-full bg-amber-500 text-gray-900 py-2 rounded hover:bg-amber-600 transition' 
            type="submit"
          >
            Join
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
    <main className='h-screen w-full bg-gray-950 text-white flex gap-4 p-4'>
      <aside className='w-1/4 bg-gray-900 p-4 rounded-lg'>
        <h2 className='text-xl mb-4'>Connected Users ({connectedUsers.length})</h2>
        <ul>
          {connectedUsers.map((user, idx) => (
            <li key={idx} className='mb-2 flex items-center gap-2'>
              <span 
                className='w-3 h-3 rounded-full inline-block'
                style={{ backgroundColor: user.color }}
              ></span>
              <span className='text-sm'>{user.name}</span>
            </li>
          ))}
          {connectedUsers.length === 0 && (
            <li className='text-gray-500 text-sm'>Waiting for users...</li>
          )}
        </ul>
      </aside>
      <section className='w-3/4 p-4 rounded-lg bg-amber-50 text-gray-900'>
        <Editor
          height="90vh"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          onMount={handleMount}
        />
      </section>
    </main>
    </>
  )
}

export default App;
