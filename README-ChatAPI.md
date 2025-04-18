# ChatAPI Integration Guide

## Overview

Ce document fournit des instructions complètes pour l'intégration des fonctionnalités de chat entre :
- **Backend** : Application Next.js hébergée sur https://phanganpirate.vercel.com
- **Frontend** : Application mobile React Native construite avec Expo

## Prerequisites

### Next.js Backend (Already Set Up)
- Next.js App Router
- Supabase for authentication and database
- OpenAI or other AI providers for chat functionality
- API routes configured for chat functionality

### Expo Frontend (UI Already Configured)
- Expo SDK
- React Native
- Chat interface components

## Modifications implémentées pour l'intégration

Les modifications suivantes ont été apportées au backend pour permettre l'intégration avec Expo :

### 1. Support CORS

Un middleware CORS a été créé pour permettre les requêtes depuis l'application mobile :

```typescript
// app/api/cors-middleware.ts
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent',
  };
}

export async function OPTIONS() {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders(),
  });
}
```

Chaque point d'API inclut maintenant ce middleware pour les requêtes préliminaires OPTIONS.

### 2. Authentification multi-plateformes

Une fonction de validation des jetons a été ajoutée pour supporter l'authentification mobile :

```typescript
// lib/supabase/server.ts
export async function validateToken(token: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Pas besoin de cookies pour la validation de token
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
  
  return supabase.auth.getUser(token);
}
```

La fonction `getUser` a été mise à jour pour vérifier à la fois les cookies (web) et les jetons d'autorisation (mobile) :

```typescript
async function getUser(request: Request) {
  // Vérifier d'abord le jeton Bearer (mobile)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data, error } = await validateToken(token);
    if (!error && data.user) {
      return data.user;
    }
  }
  
  // Sinon, utiliser l'authentification basée sur les cookies (web)
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}
```

### 3. Réponses adaptatives selon la plateforme

Les points d'entrée API identifient le type de client grâce à l'en-tête User-Agent et retournent des réponses adaptées :

```typescript
// Détecter le type de plateforme
const userAgent = request.headers.get('user-agent') || '';
const isNativeMobile = userAgent.includes('Expo') || userAgent.includes('React Native');

// Plus loin dans le code...
if (isNativeMobile) {
  // Pour mobile, retourner du JSON standard au lieu d'un flux
  return new Response(JSON.stringify({
    messages: responseMessagesWithoutIncompleteToolCalls.map(message => ({
      id: generateUUID(),
      role: message.role,
      content: formatMessageContent(message),
    })),
  }), {
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    }
  });
} else {
  // Pour web, continuer à utiliser la réponse en streaming
  return result.toDataStreamResponse({
    data: streamingData,
  });
}
```

Ces modifications sont appliquées aux principaux points d'API :
- `/api/chat` : Pour les conversations IA
- `/api/history` : Pour l'historique des chats
- `/api/files/upload` : Pour le téléchargement de fichiers

## Configuration de l'application Expo

### 1. Utilitaires API

Créez un fichier d'utilitaires pour la communication API (`utils/api.ts`) :

```typescript
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

### 2. Polyfills pour les APIs web manquantes

Créez un fichier `polyfills.js` dans votre projet Expo :

```javascript
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

### 3. Configuration de Metro

Créez ou mettez à jour `metro.config.js` pour le support des exports de packages :

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support des exports de packages pour AI SDK
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
```

### 4. Authentification Supabase

Configurez Supabase dans votre application Expo :

```typescript
// lib/supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Récupération du jeton d'authentification
export const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};
```

### 5. Composant Chat

Implémentez le composant d'interface utilisateur pour le chat :

```jsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, ActivityIndicator, FlatList, Text } from 'react-native';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { generateAPIUrl, getAuthHeaders } from '../utils/api';
import { getAuthToken } from '../lib/supabase';
import '../polyfills';

export default function ChatScreen() {
  const [authToken, setAuthToken] = useState(null);
  const [chatId, setChatId] = useState(`chat-${Date.now()}`);
  
  useEffect(() => {
    const loadToken = async () => {
      const token = await getAuthToken();
      setAuthToken(token);
    };
    loadToken();
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    fetch: expoFetch,
    api: generateAPIUrl('/api/chat'),
    body: {
      id: chatId,
      modelId: 'gpt-4o',
    },
    headers: async () => await getAuthHeaders(authToken),
    onError: (err) => console.error('Chat error:', err),
    maxSteps: 5,
  });

  const renderMessage = ({ item }) => (
    <View style={{ 
      padding: 12, 
      marginVertical: 8, 
      borderRadius: 8,
      backgroundColor: item.role === 'user' ? '#DCF8C6' : '#ECECEC',
      alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '80%'
    }}>
      <Text>{item.content}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />
      
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
      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error.message}</Text>}
    </View>
  );
}
```

## Exemples d'Utilisation 

### 1. API de Chat

L'API de chat est la principale fonctionnalité pour les interactions IA :

```javascript
// Exemple de requête
const chatApiRequest = {
  id: "chat-123",  // Identifiant unique pour ce chat
  messages: [
    { role: "user", content: "Tell me about Koh Phangan" }
  ],
  modelId: "gpt-4o"  // Modèle IA à utiliser
};

// Envoyer la requête
const sendChatRequest = async () => {
  const authToken = await getAuthToken();
  const response = await fetch(generateAPIUrl('/api/chat'), {
    method: 'POST',
    headers: await getAuthHeaders(authToken),
    body: JSON.stringify(chatApiRequest)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};
```

### 2. API d'Historique

Pour récupérer l'historique des conversations :

```javascript
const fetchChatHistory = async () => {
  const authToken = await getAuthToken();
  const response = await fetch(generateAPIUrl('/api/history'), {
    method: 'GET',
    headers: await getAuthHeaders(authToken)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status}`);
  }
  
  return response.json();
};
```

## Dépendances Requises

Pour l'application Expo :

```json
{
  "dependencies": {
    "@ai-sdk/react": "^0.14.0",
    "@ai-sdk/openai": "^0.14.0",
    "@supabase/supabase-js": "^2.38.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@stardazed/streams-text-encoding": "^2.0.0",
    "@ungap/structured-clone": "^1.2.0",
    "expo": "~50.0.0",
    "expo-constants": "~15.4.5",
    "expo-fetch": "~0.8.0",
    "react-native-url-polyfill": "^2.0.0"
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### CORS Issues
- Vérifiez que les en-têtes CORS sont correctement définis dans le backend
- Assurez-vous que la requête est envoyée avec le bon en-tête 'Origin'
- Testez avec Postman en ajoutant l'en-tête 'User-Agent: Expo/1.0.0'

#### Authentication Problems
- Vérifiez que les jetons sont correctement stockés et envoyés avec chaque requête
- Assurez-vous que la validation de jeton fonctionne correctement côté serveur
- Utilisez les outils de débogage de Supabase pour vérifier les sessions

#### Network Connectivity
- Implémentez une gestion appropriée des erreurs réseau
- Ajoutez une logique de nouvelle tentative pour les requêtes échouées
- Testez avec différentes conditions réseau (3G, Wi-Fi, etc.)

#### React Native Specific Issues
- Assurez-vous que tous les polyfills sont chargés avant d'utiliser les APIs web
- Vérifiez que metro.config.js est correctement configuré
- Testez sur des appareils iOS et Android réels

## Testing Guide

1. **Test de connexion** : Vérifiez que l'authentification fonctionne correctement
2. **Test de chat** : Envoyez un message et recevez une réponse
3. **Test de l'historique** : Vérifiez que les chats précédents sont chargés
4. **Test de déconnexion** : Assurez-vous que la déconnexion fonctionne

## Deployment

### Next.js Backend
Le backend Next.js est déjà déployé sur https://phanganpirate.vercel.com

### Expo App
Pour déployer l'application Expo :

1. **Configuration EAS** :
```bash
eas build:configure
```

2. **Build de production** :
```bash
eas build --platform ios
eas build --platform android
```

3. **Soumission aux App Stores** :
```bash
eas submit -p ios
eas submit -p android
```

## Maintenance et Mises à Jour

- Mettez régulièrement à jour les dépendances
- Surveillez les logs du backend pour détecter les erreurs
- Collectez les commentaires des utilisateurs pour améliorer l'expérience
- Implémentez des analyses pour suivre les modèles d'utilisation

---

## Référence Rapide

### Points d'API

- Chat API: `https://phanganpirate.vercel.com/api/chat`
- History API: `https://phanganpirate.vercel.com/api/history`
- File Upload API: `https://phanganpirate.vercel.com/api/files/upload`

### Format des Messages

Les messages suivent ce format :

```typescript
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | MessageContent[];
  createdAt?: string;
};

// Pour les messages de l'assistant avec des outils
type MessageContent = 
  | { type: 'text', text: string }
  | { type: 'tool-call', toolName: string, toolCallId: string, args: any };
``` 