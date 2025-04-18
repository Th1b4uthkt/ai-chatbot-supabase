# Authentication Fix for Mobile App

## Overview

Ce document explique les modifications nécessaires à apporter au backend Next.js pour résoudre les problèmes d'authentification rencontrés dans l'application mobile Expo React Native. Ces problèmes sont liés à la validation des jetons JWT envoyés depuis l'application mobile et provoquent l'erreur suivante :

```
Database error: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "chats"'
}
```

## Problème identifié

Bien que l'erreur mentionne une violation de la politique RLS (Row-Level Security), le problème sous-jacent est que le backend ne valide pas correctement les jetons d'authentification envoyés par l'application mobile, ce qui fait que l'utilisateur n'est pas correctement identifié pour les opérations sur la base de données.

## Solution

### 1. Créer un point d'API de débogage d'authentification

Créez un nouvel endpoint dans votre application Next.js pour diagnostiquer les problèmes d'authentification :

```typescript
// app/api/debug-auth/route.ts
import { corsHeaders } from '../cors-middleware';
import { createServerClient } from '@/lib/supabase/server';
import { validateToken } from '@/lib/supabase/server';

export async function OPTIONS() {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(request: Request) {
  try {
    // Extraire le jeton Bearer
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    // Log de débogage
    console.log('DEBUG-AUTH: Request headers:', Object.fromEntries([...request.headers.entries()]));
    console.log('DEBUG-AUTH: Auth header:', authHeader);
    console.log('DEBUG-AUTH: Token (masked):', token ? `${token.substring(0, 10)}...` : null);
    
    // Vérifier le User-Agent
    const userAgent = request.headers.get('user-agent') || '';
    const isNativeMobile = userAgent.includes('Expo') || userAgent.includes('React Native');
    console.log('DEBUG-AUTH: User agent:', userAgent);
    console.log('DEBUG-AUTH: Is mobile:', isNativeMobile);
    
    // Valider le jeton et obtenir l'utilisateur
    let userData = null;
    let error = null;
    
    if (token) {
      try {
        const result = await validateToken(token);
        userData = result.data;
        error = result.error;
        console.log('DEBUG-AUTH: Token validation result:', error ? 'ERROR' : 'SUCCESS');
        
        if (error) {
          console.error('DEBUG-AUTH: Token validation error:', error);
        } else if (userData.user) {
          console.log('DEBUG-AUTH: Authenticated user ID:', userData.user.id);
        }
      } catch (e) {
        console.error('DEBUG-AUTH: Token validation exception:', e);
        error = { message: e instanceof Error ? e.message : String(e) };
      }
    }
    
    // Renvoyer les résultats
    return new Response(JSON.stringify({
      token: token ? `${token.substring(0, 10)}...` : null, // Seulement les premiers caractères par sécurité
      user: userData?.user || null,
      error: error,
      isMobile: isNativeMobile,
      headers: {
        userAgent: userAgent,
        authorization: authHeader ? 'Bearer [REDACTED]' : null
      }
    }), {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      }
    });
  } catch (e) {
    console.error('DEBUG-AUTH: Unexpected error:', e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : String(e) 
    }), {
      status: 500,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      }
    });
  }
}
```

### 2. Améliorer la validation des jetons dans l'API Chat

Mettez à jour votre fichier de validation des jetons pour améliorer la gestion des jetons d'authentification :

```typescript
// lib/supabase/server.ts

/**
 * Fonction améliorée de validation des jetons
 * Cette fonction détecte et traite les cas particuliers des jetons de l'application mobile
 */
export async function validateToken(token: string) {
  if (!token) {
    return { data: { user: null }, error: { message: 'No token provided' } };
  }
  
  // Vérifier que le jeton est correctement formaté
  const formattedToken = token.trim();
  console.log('TOKEN-VALIDATE: Token length:', formattedToken.length);
  
  try {
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
    
    // Utiliser getUser pour valider le jeton
    const result = await supabase.auth.getUser(formattedToken);
    
    // Logs détaillés pour le débogage
    if (result.error) {
      console.error('TOKEN-VALIDATE: Validation error:', result.error.message);
    } else if (result.data.user) {
      console.log('TOKEN-VALIDATE: User validated:', result.data.user.id);
    } else {
      console.warn('TOKEN-VALIDATE: No user found with token');
    }
    
    return result;
  } catch (e) {
    console.error('TOKEN-VALIDATE: Exception during validation:', e);
    return { 
      data: { user: null }, 
      error: { message: e instanceof Error ? e.message : String(e) } 
    };
  }
}
```

### 3. Modifier la récupération de l'utilisateur dans la route API Chat

Mettez à jour votre route d'API Chat pour gérer correctement les jetons mobiles :

```typescript
// app/api/chat/route.ts
// Fonction de récupération de l'utilisateur modifiée
async function getUser(request: Request) {
  // Extraire l'en-tête d'autorisation 
  const authHeader = request.headers.get('Authorization');
  
  // Log détaillé pour le débogage
  console.log('CHAT-API: Auth header:', authHeader ? 'Bearer [REDACTED]' : 'null');
  console.log('CHAT-API: Headers:', Object.fromEntries([...request.headers.entries()]));
  
  // Vérifier d'abord le jeton Bearer (mobile)
  if (authHeader?.startsWith('Bearer ')) {
    console.log('CHAT-API: Bearer token detected, using mobile auth flow');
    const token = authHeader.substring(7).trim();
    console.log('CHAT-API: Token length:', token.length);
    
    // Utiliser validateToken au lieu de getUser directement
    const { data, error } = await validateToken(token);
    
    if (error) {
      console.error('CHAT-API: Token validation error:', error);
      throw new Error(`Unauthorized: ${error.message}`);
    }
    
    if (!data.user) {
      console.error('CHAT-API: No user found for token');
      throw new Error('Unauthorized: Invalid token');
    }
    
    console.log('CHAT-API: Mobile auth successful for user ID:', data.user.id);
    return data.user;
  }
  
  // Sinon, utiliser l'authentification basée sur les cookies (web)
  console.log('CHAT-API: No Bearer token, using web auth flow');
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('CHAT-API: Web auth error:', error?.message || 'No user found');
    throw new Error('Unauthorized');
  }

  console.log('CHAT-API: Web auth successful for user ID:', user.id);
  return user;
}
```

### 4. Ajouter des logs lors de l'insertion dans la base de données

Ajoutez des logs détaillés lors de l'insertion dans la table `chats` pour mieux diagnostiquer les problèmes :

```typescript
// Dans votre code d'insertion de chat
try {
  // Récupérer l'utilisateur
  const user = await getUser(request);
  console.log('DB-INSERT: Attempting to insert chat with user ID:', user.id);
  
  // Préparer les données
  const insertData = {
    id: chatId,
    user_id: user.id, // S'assurer que le user_id est bien défini
    // Autres champs...
  };
  
  console.log('DB-INSERT: Insert data prepared:', {
    id: insertData.id,
    user_id: insertData.user_id,
    // Log les autres champs importants
  });
  
  // Exécuter l'insertion
  const { data, error } = await supabase
    .from('chats')
    .insert(insertData);
  
  if (error) {
    console.error('DB-INSERT: Database error:', error);
    throw error;
  }
  
  console.log('DB-INSERT: Chat inserted successfully:', chatId);
  
} catch (e) {
  console.error('DB-INSERT: Exception during insertion:', e);
  throw e;
}
```

### 5. Vérifier les politiques RLS dans Supabase

Assurez-vous que la politique RLS pour la table `chats` est correctement configurée :

```sql
-- Dans le tableau de bord SQL de Supabase
CREATE POLICY "Users can create their own chats"
ON chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ajouter une politique de lecture également
CREATE POLICY "Users can read their own chats"
ON chats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

## Test et Vérification

Après avoir implémenté ces modifications, testez l'authentification à l'aide du nouvel outil de débogage intégré à l'application mobile :

1. Utilisez le composant `AuthDebugger` dans l'application mobile
2. Exécutez le test d'authentification et vérifiez les résultats
3. Vérifiez les logs du backend pour voir les détails de l'authentification
4. Essayez d'envoyer un message dans le chat après confirmation que l'authentification fonctionne

## Logs à surveiller

Dans les journaux de votre backend, recherchez les entrées suivantes qui vous aideront à diagnostiquer les problèmes :

- `DEBUG-AUTH:` - Logs du point d'API de débogage d'authentification
- `TOKEN-VALIDATE:` - Logs de la fonction de validation des jetons
- `CHAT-API:` - Logs de la route API Chat
- `DB-INSERT:` - Logs des opérations d'insertion dans la base de données

## Conclusion

Ces modifications améliorent la façon dont l'application backend gère les jetons d'authentification provenant de l'application mobile. En ajoutant des logs détaillés et en améliorant la gestion des jetons, nous devrions résoudre le problème d'authentification qui cause l'erreur de violation de la politique RLS. 

## Travail effectué

### Améliorations implémentées

Nous avons mis en place les modifications recommandées pour résoudre les problèmes d'authentification entre l'application mobile Expo et le backend Next.js :

1. **Amélioration de la fonction validateToken**
   - Ajout de la vérification de l'existence du token
   - Formatage du token avant validation
   - Ajout de logs détaillés sur le processus de validation
   - Gestion améliorée des erreurs

2. **Création du point d'API de débogage d'authentification**
   - Nouvel endpoint `/api/debug-auth` pour diagnostiquer les problèmes d'authentification
   - Affichage détaillé des informations de token et des headers
   - Détection automatique des clients mobiles via User-Agent
   - Journal complet du processus de validation

3. **Amélioration de la fonction getUser dans les routes API**
   - Logs détaillés sur le processus d'authentification
   - Meilleure séparation entre l'authentification mobile et web
   - Messages d'erreur plus précis pour faciliter le débogage
   - Traitement spécifique pour les tokens provenant des applications mobiles

4. **Logs détaillés pour les opérations d'insertion dans la base de données**
   - Traçage complet des opérations d'insertion dans la table `chats`
   - Journalisation des données d'insertion pour identifier les problèmes de RLS
   - Capture et affichage détaillé des erreurs de base de données

### Comment tester les modifications

Pour vérifier que les modifications fonctionnent correctement :

1. **Test de l'endpoint de débogage**
   ```bash
   # Avec CURL
   curl -H "Authorization: Bearer VOTRE_TOKEN" \
        -H "User-Agent: Expo/1.0.0" \
        https://votre-app.vercel.app/api/debug-auth
   ```

   Ou directement depuis l'application Expo :
   ```javascript
   const response = await fetch('https://votre-app.vercel.app/api/debug-auth', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'User-Agent': 'Expo/1.0.0'
     }
   });
   const data = await response.json();
   console.log(data);
   ```

2. **Vérifier les logs du serveur**
   - Rechercher les entrées avec les préfixes suivants :
     - `DEBUG-AUTH:` - Logs du point d'API de débogage d'authentification
     - `TOKEN-VALIDATE:` - Logs de la fonction de validation des jetons
     - `CHAT-API:` - Logs de la route API Chat
     - `DB-INSERT:` - Logs des opérations d'insertion dans la base de données

3. **Tester une insertion dans le chat**
   - Envoyer un message depuis l'application mobile
   - Vérifier si l'insertion réussit maintenant
   - Analyser les logs en cas d'échec persistant

### Conseils pour l'application mobile Expo

Pour que ces modifications fonctionnent correctement avec l'application mobile, assurez-vous que :

1. Le token d'authentification est correctement stocké après la connexion
   ```javascript
   import * as SecureStore from 'expo-secure-store';
   
   // Après une connexion réussie
   await SecureStore.setItemAsync('supabase_token', token);
   ```

2. Le token est inclus dans toutes les requêtes API
   ```javascript
   const getAuthHeaders = async () => {
     const token = await SecureStore.getItemAsync('supabase_token');
     return {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json',
       'User-Agent': 'Expo/1.0.0'
     };
   };
   
   // Utilisation
   const response = await fetch('https://votre-app.vercel.app/api/chat', {
     method: 'POST',
     headers: await getAuthHeaders(),
     body: JSON.stringify(data)
   });
   ```

Ces modifications devraient résoudre le problème de violation de la politique RLS en assurant que l'utilisateur est correctement authentifié lors des opérations sur la base de données. 