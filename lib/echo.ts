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
    // Configuración para el entorno de desarrollo
    const wsHost = process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname;
    const wsPort = parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '3001');
    
    const authEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/broadcasting/auth`;

    console.log('	Configurando Echo con:', {
      wsHost,
      wsPort,
      authEndpoint
    });

    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'tu_clave_de_app_pusher',
      {
        wsHost,
        wsPort,
        wssPort: wsPort,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        cluster: '',
        authEndpoint,
        auth: {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        },
        authTransport: 'ajax',
      }
    );

    echoInstance = new Echo({
      broadcaster: 'reverb',
      client: pusher,
    });

    console.log('	Echo inicializado correctamente');
    return echoInstance;

  } catch (error) {
    console.error('	Error al inicializar Echo:', error);
    return null;
  }
};
