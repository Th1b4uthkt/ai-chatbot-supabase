# API Mobile pour l'Application Expo React Native

## Présentation

Ce document explique la nouvelle approche adoptée pour résoudre les problèmes d'authentification et de RLS (Row-Level Security) entre l'application mobile Expo et le backend Next.js. 

Plutôt que de modifier l'API existante, nous avons créé des endpoints dédiés spécifiquement à l'application mobile qui utilisent un **client Supabase admin** pour contourner les politiques RLS. Cette approche présente plusieurs avantages :

1. Elle évite de perturber les routes existantes qui fonctionnent bien pour l'application web
2. Elle offre une solution permanente au problème de RLS en utilisant un client admin
3. Elle maintient la sécurité car le client mobile reste authentifié via les tokens JWT

## Endpoints disponibles

Les nouveaux endpoints dédiés à l'application mobile sont :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/mobile-chat` | POST | Envoyer un message et recevoir une réponse de l'IA |
| `/api/mobile-history` | GET | Récupérer l'historique des conversations |
| `/api/mobile-messages` | GET | Récupérer les messages d'une conversation spécifique |

## Fonctionnement technique

### Principe de base

Ces endpoints utilisent un client Supabase avec la **clé de service** (service role key) qui a des privilèges élevés et peut contourner les politiques RLS. Voici comment cela fonctionne :

1. L'utilisateur s'authentifie normalement via Supabase Auth pour obtenir un token JWT
2. L'application mobile inclut ce token dans l'en-tête `Authorization` de ses requêtes API
3. Le backend vérifie la validité du token et extrait l'ID de l'utilisateur authentifié
4. Au lieu d'utiliser un client Supabase normal, le backend utilise un client admin pour effectuer les opérations sur la base de données
5. Les politiques RLS sont ainsi contournées, mais l'authentification reste sécurisée

### Code d'initialisation

Le client admin est initialisé dans chaque endpoint comme suit :

```javascript
// Client admin qui contourne RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: { persistSession: false }
  }
);
```

## Intégration dans l'application Expo

Pour utiliser ces nouveaux endpoints, l'application Expo doit être mise à jour comme suit :

### 1. Utilitaire d'API

```javascript
// utils/api.js
import * as SecureStore from 'expo-secure-store';

// URL de base
const API_BASE_URL = 'https://phanganpirate.vercel.app';

// Récupérer le token d'authentification
export const getAuthToken = async () => {
  return await SecureStore.getItemAsync('supabase_token');
};

// Headers avec authentification
export const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Expo/1.0.0'
  };
};

// Fonction d'envoi de message
export const sendMessage = async (chatId, messages, modelId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mobile-chat`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        id: chatId,
        messages: messages,
        modelId: modelId || 'gpt-4o'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'envoi du message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Fonction de récupération de l'historique
export const getChatHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mobile-history`, {
      method: 'GET',
      headers: await getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la récupération de l\'historique');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Fonction de récupération des messages d'un chat
export const getChatMessages = async (chatId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mobile-messages?chatId=${chatId}`, {
      method: 'GET',
      headers: await getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la récupération des messages');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};
```

### 2. Utilisation dans les composants

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button } from 'react-native';
import { sendMessage, getChatHistory, getChatMessages } from '../utils/api';
import { generateUUID } from '../utils/helpers';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(generateUUID());
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Ajouter le message de l'utilisateur localement
    const userMessage = {
      id: generateUUID(),
      role: 'user',
      content: message
    };
    
    setMessages([...messages, userMessage]);
    setMessage('');
    
    try {
      // Envoyer à l'API
      const response = await sendMessage(chatId, [...messages, userMessage], 'gpt-4o');
      
      // Ajouter les réponses du modèle
      if (response.messages && response.messages.length > 0) {
        setMessages(prev => [...prev, ...response.messages]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      // Gérer l'erreur (afficher un message, etc.)
    }
  };
  
  // Reste du composant...
}
```

## Maintenance et sécurité

### Variables d'environnement

Assurez-vous que la variable d'environnement `SUPABASE_SERVICE_ROLE_KEY` est configurée dans le projet Vercel avec la clé de service de votre projet Supabase. Cette clé ne doit jamais être exposée côté client.

### Logs et débogage

Chaque endpoint inclut des logs détaillés pour faciliter le débogage :
- Les logs commencent par des préfixes spécifiques : `MOBILE-CHAT:`, `MOBILE-HISTORY:`, etc.
- Les erreurs sont correctement capturées et loguées avec console.error
- Les réponses d'erreur incluent des détails sur le problème

## Conclusion

Cette nouvelle approche avec des endpoints dédiés et un client admin offre une solution robuste et sécurisée pour l'intégration de l'application mobile Expo avec le backend Next.js. Elle contourne les problèmes de RLS tout en maintenant la sécurité de l'authentification.

Si vous rencontrez encore des problèmes, utilisez l'endpoint de débogage `/api/debug-auth` pour vérifier que les tokens d'authentification sont correctement transmis et validés. 