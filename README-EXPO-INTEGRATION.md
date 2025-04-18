# Intégration Expo avec le Backend Next.js

Ce document décrit les modifications apportées pour rendre le backend Next.js compatible avec une application mobile Expo.

## Modifications apportées

### 1. Support CORS

Création d'un middleware CORS pour permettre les requêtes depuis l'application mobile :
- `app/api/cors-middleware.ts` - Fournit des en-têtes CORS pour toutes les réponses API.
- Chaque point d'API inclut maintenant un gestionnaire OPTIONS pour les requêtes préliminaires.

### 2. Authentification mobile

Ajout du support d'authentification par jeton Bearer pour les clients mobiles :
- `lib/supabase/server.ts` - Nouvelle fonction `validateToken()` pour valider les jetons d'authentification.
- Chaque point d'API vérifie à la fois les cookies (web) et les jetons d'autorisation (mobile).

### 3. Réponses API adaptées

Modification des réponses API pour répondre différemment selon le type de client :
- Detection de l'agent utilisateur pour identifier les clients Expo/React Native.
- Pour l'API de chat : JSON standard pour mobile, réponses en streaming pour web.
- Ajout des en-têtes CORS à toutes les réponses.

## Utilisation depuis une application Expo

### Configuration Expo

1. Créez des utilitaires API dans votre projet Expo :

```typescript
// utils/api.ts
import Constants from 'expo-constants';

// URL du backend 
export const API_URL = 'https://phanganpirate.vercel.com';

// Générer l'URL complète pour les points d'API
export const generateAPIUrl = (relativePath: string) => {
  return `${API_URL}${relativePath}`;
};

// En-têtes avec authentification
export const getAuthHeaders = async (authToken: string | null) => {
  return {
    'Content-Type': 'application/json',
    'User-Agent': `Expo/${Constants.expoConfig?.version || '1.0.0'}`,
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
  };
};
```

2. Configurez les polyfills nécessaires :

```javascript
// polyfills.js
import { Platform } from 'react-native';
import structuredClone from '@ungap/structured-clone';

if (Platform.OS !== 'web') {
  const setupPolyfills = async () => {
    const { polyfillGlobal } = await import(
      'react-native/Libraries/Utilities/PolyfillFunctions'
    );

    const { TextEncoderStream, TextDecoderStream } = await import(
      '@stardazed/streams-text-encoding'
    );

    if (!('structuredClone' in global)) {
      polyfillGlobal('structuredClone', () => structuredClone);
    }

    polyfillGlobal('TextEncoderStream', () => TextEncoderStream);
    polyfillGlobal('TextDecoderStream', () => TextDecoderStream);
  };

  setupPolyfills();
}

export {};
```

3. Configurez Metro pour les exports de packages :

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support des exports de packages pour AI SDK
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
```

### Exemples d'utilisation

#### 1. Authentification

```typescript
import { supabase } from '../lib/supabase';
import { getAuthHeaders } from '../utils/api';

// Connexion
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Récupération du jeton d'authentification
const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

// Exemple de requête authentifiée
const fetchChatHistory = async () => {
  const authToken = await getAuthToken();
  const response = await fetch(`https://phanganpirate.vercel.com/api/history`, {
    method: 'GET',
    headers: await getAuthHeaders(authToken),
  });
  
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};
```

#### 2. Utilisation de l'API de chat

```jsx
import React from 'react';
import { View, TextInput, Button, ActivityIndicator } from 'react-native';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { generateAPIUrl, getAuthHeaders } from '../utils/api';
import '../polyfills';

export default function ChatScreen() {
  const [authToken, setAuthToken] = React.useState(null);
  
  React.useEffect(() => {
    const getToken = async () => {
      const token = await getAuthToken();
      setAuthToken(token);
    };
    getToken();
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    fetch: expoFetch,
    api: generateAPIUrl('/api/chat'),
    body: {
      id: 'your-chat-id', // Générer dynamiquement
      modelId: 'gpt-4o', // Ou votre modèle préféré
    },
    headers: async () => await getAuthHeaders(authToken),
    onError: (err) => console.error('Chat error:', err),
    maxSteps: 5, // Pour les appels d'outils multi-étapes
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Vos composants d'interface utilisateur de chat existants */}
      
      {/* Formulaire d'envoi de message */}
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, padding: 8, borderRadius: 4 }}
          value={input}
          placeholder="Tapez un message..."
          onChangeText={(text) => 
            handleInputChange({ target: { value: text } })
          }
        />
        <Button
          title={isLoading ? "..." : "Envoyer"}
          onPress={() => handleSubmit()}
          disabled={isLoading || !input.trim()}
        />
      </View>
      
      {isLoading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
}
```

## Dépendances requises

Pour Expo :
- `ai`, `@ai-sdk/react`, `@ai-sdk/openai` 
- `expo-fetch`
- `@ungap/structured-clone`
- `@stardazed/streams-text-encoding`
- Pour l'authentification : `@supabase/supabase-js`

## Test et débogage

1. Vérifiez les en-têtes CORS dans les réponses API à l'aide des outils de développement.
2. Testez l'authentification avec des jetons d'accès.
3. Vérifiez que les réponses sont formatées correctement pour les clients mobiles.
4. Testez sur des appareils iOS et Android réels pour confirmer le bon fonctionnement. 