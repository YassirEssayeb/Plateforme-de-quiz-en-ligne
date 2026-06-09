# Plateforme de Quiz en Ligne

Application de quiz interactive avec timer, score, classement local et création de quiz personnalisé.

## Structure du projet

```
├── index.html          # Application principale
├── style.css           # Styles de l'application
├── app.js              # Logique du quiz
├── questions.json      # Exemple de questions
└── README.md           # Documentation
```

## Fonctionnalités

- Chargement des questions depuis un fichier JSON
- Affichage des questions avec 4 choix
- Timer par question (30 secondes)
- Calcul et affichage du score final
- Classement local (localStorage)
- Mode création de quiz personnalisé

## Structure du fichier JSON

```json
[
  {
    "question": "Texte de la question",
    "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
    "correct": 0
  }
]
```

### Champs

| Champ | Type | Description |
|-------|------|-------------|
| `question` | string | Le texte de la question |
| `choices` | string[] | Tableau de 4 réponses possibles |
| `correct` | number | Index de la bonne réponse (0 à 3) |

## Utilisation

1. Ouvrir `index.html` dans un navigateur
2. Cliquer sur **Démarrer le Quiz** pour commencer
3. Répondre aux questions avant la fin du timer
4. Voir le score final et l'enregistrer dans le classement
5. Utiliser l'onglet **Créer** pour importer ou écrire un quiz personnalisé

## Contraintes techniques

- Aucun backend requis
- Fonctionne hors connexion
- Score non modifiable par l'utilisateur
- Données stockées dans le localStorage du navigateur
