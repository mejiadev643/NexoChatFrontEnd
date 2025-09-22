import Pusher from 'pusher-js';
import Echo from 'laravel-echo';

let echoInstance: Echo | null = null;

export const initializeEcho = (token: string): Echo | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  try {
    // ✅ CORREGIR: Usar la URL completa con el puerto 8000 para la autenticación
    const authEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/broadcasting/auth`;
    
    console.log('🔐 Configurando Echo con:', {
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
      authEndpoint: authEndpoint
    });

    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'hsdpoiwejroiwejroiwejroiwejroiwej',
      {
        // ✅ WebSocket connection (puerto 8080)
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
        wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
        wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        cluster: '',
        
        // ✅ HTTP authentication (puerto 8000 - Laravel)
        authEndpoint: authEndpoint,
        auth: {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            //'Content-Type': 'application/json',
          }
        },
        authTransport: 'ajax',
      }
    );

    echoInstance = new Echo({
      broadcaster: 'reverb',
      client: pusher,
    });

    console.log('✅ Echo inicializado correctamente');
    return echoInstance;

  } catch (error) {
    console.error('❌ Error al inicializar Echo:', error);
    return null;
  }
};