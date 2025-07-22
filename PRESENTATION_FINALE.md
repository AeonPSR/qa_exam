# PARTIE 10 - Présentation Finale

## 📋 Informations du Projet

**Titre du projet :** Application de Connexion Full-Stack avec Suite de Tests Complète   
**Technologie :** Node.js + Next.js + MongoDB + Jest + Cypress

---

## 🏗️ Architecture du Projet

```
Frontend (Next.js)     ←→     Backend API (Node.js)     ←→     Base de Données
─────────────────             ──────────────────             ─────────────────
• Pages React                 • Express Server              • MongoDB Atlas
• Composants UI               • Routes /api/*                • Collection Users
• Gestion d'état              • Middleware Auth              • Schémas de données
• Validation côté client      • Services métier              • Index et requêtes
```

---

## ⚙️ Fonctionnalité Développée : Système de Connexion

### 🔧 Backend - API `/api/login`

**Endpoint :** `POST /api/login`

```javascript
// controllers/authController.js
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Recherche utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email not found'
      });
    }
    
    // Vérification mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Génération JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
```

### 🎨 Frontend - Composant de Connexion

```javascript
// components/LoginForm.js
import { useState } from 'react';
import axios from 'axios';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        email,
        password
      });
      
      if (response.data.success) {
        setMessage('✅ Connexion réussie ! Bienvenue ' + response.data.user.email);
        localStorage.setItem('token', response.data.token);
      }
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Erreur de connexion'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Connexion</h2>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
      
      {message && <div className="message">{message}</div>}
    </form>
  );
}
```

---

## 🧪 Types de Tests Mis en Place

### 1. **Tests Unitaires (Jest)**

**Objectif :** Tester les fonctions et services isolés

```javascript
// tests/unit/authService.test.js
describe('AuthService', () => {
  test('should hash password correctly', async () => {
    const password = 'testPassword123';
    const hashedPassword = await AuthService.hashPassword(password);
    
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(50);
  });

  test('should generate valid JWT token', () => {
    const userData = { userId: '123', email: 'test@example.com' };
    const token = AuthService.generateToken(userData);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT format
  });
});
```

### 2. **Tests d'Intégration (Jest + Supertest)**

**Objectif :** Tester les API endpoints avec base de données

```javascript
// tests/integration/auth.test.js
describe('POST /api/login', () => {
  test('should login with valid credentials', async () => {
    // Créer un utilisateur test
    const testUser = await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10)
    });

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });

  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email not found');
  });
});
```
---

## 🚀 Pipeline CI/CD Automatisé

### Configuration GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline
on:
  push:
    branches: [ master, develop ]
  pull_request:
    branches: [ master ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run backend tests
        run: npm test
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          JWT_SECRET: test-secret-key

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm test -- --coverage --watchAll=false

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd frontend && npm install
      
      - name: Start backend
        run: npm start &
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
      
      - name: Start frontend
        run: |
          cd frontend
          npm run dev &
      
      - name: Wait for servers
        run: sleep 30
      
      - name: Run Cypress tests
        run: |
          cd frontend
          npm run cypress:run
```

### Workflow Automatisé

1. **Déclenchement** : Push ou Pull Request
2. **Tests Backend** : Jest + Supertest avec MongoDB
3. **Tests Frontend** : Jest + React Testing Library
4. **Tests E2E** : Cypress avec serveurs démarrés
5. **Rapport** : Résultats consolidés et coverage

---

## 📋 Démarche Qualité : Bonnes Pratiques

### **1. Architecture & Code**
- ✅ **Séparation des responsabilités** : Controllers, Services, Models
- ✅ **Gestion d'erreurs centralisée** avec middleware Express
- ✅ **Validation des données** côté backend et frontend
- ✅ **Sécurité** : Hachage bcrypt, JWT, sanitisation des entrées

### **2. Tests & Qualité**
- ✅ **Pyramide de tests** : Unitaires → Intégration → E2E
- ✅ **Coverage de code** avec Jest (>90%)
- ✅ **Mocking** approprié pour isolation des tests
- ✅ **Tests en environnement isolé** avec base de données de test

### **3. DevOps & CI/CD**
- ✅ **Pipeline automatisé** GitHub Actions
- ✅ **Variables d'environnement sécurisées**
- ✅ **Déploiement conditionnel** après tests réussis

### **4. Documentation**
- ✅ **README complet** avec instructions détaillées
- ✅ **Documentation API** avec exemples JSON

---

## 🚨 Difficultés Rencontrées et Solutions

### **1. Problème Principal : Vue.js + Jest**

**🔴 Difficulté :**
- Initialement développé avec Vue.js pour le frontend
- Incompatibilité majeure entre Vue.js et Jest pour les tests unitaires

**🟢 Solution adoptée :**
- **Migration complète de Vue.js vers Next.js/React**
- Raison : Écosystème Jest + React Testing Library beaucoup plus mature
- Avantages obtenus :
  - Tests unitaires frontend fonctionnels
  - Meilleure documentation et communauté
  - Intégration native avec l'écosystème de test JavaScript

### **2. Configuration MongoDB pour Tests**

**🔴 Difficulté :**
- Isolation des données de test vs données de développement
- Nettoyage de la base entre les tests

**🟢 Solution :**
```javascript
// Configuration de test avec base séparée
beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  // Recréer données de test nécessaires
});
```
