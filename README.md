# Front

## Installation

Ce projet utilise [Expo](https://expo.dev/) pour le développement mobile.

Assurez-vous de suivre les étapes ci-dessous avant de lancer l'application.

### Prérequis

-   Node.js (à installer et à ajouter au PATH si nécessaire)
-   Expo (installé globalement ou utilisé via `npx`)
-   Android Studio

---

## Étapes d'installation

1. Installer les dépendances Node :

```bash
npm install
```

2. Installer Expo (si ce n’est pas déjà fait) :

```bash
npm install -g expo
```

3. Installer Android Studio, puis :

    - Ouvrir Android Studio
    - Cliquer sur **More Actions** > **Device Manager**
    - Créer une nouvelle machine virtuelle (AVD)
    - Lancer l’émulateur

4. Ajouter un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# To access the API from the VM
API_URL=http://10.0.2.2:8000/api
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYmFwdGxhYiIsImEiOiJjbHdvcTEzc3cxM2NjMmlyem11ZHF4MWh2In0.KmT1eerA8ZSQaREGnkaN2A
```

---

## Lancement de l'application

Une fois l’émulateur Android lancé, exécutez la commande suivante pour lancer l’application :

```bash
npx expo run:android
```

---

## Dépannage

### ❌ Erreur liée à l'absence du fichier local.properties

N’oubliez pas d’ajouter cette ligne dans le fichier `android/local.properties` :

```gradle
sdk.dir=C:\\Users\\PATH_TO_SDK
```

### ❌ Erreur liée à Mapbox lors du build

N’oubliez pas d’ajouter cette ligne dans le fichier `android/build.gradle` :

```gradle
allprojects {
    repositories {
        maven { url 'https://api.mapbox.com/downloads/v2/releases/maven' }
        // autres repositories
    }
}
```

Cela permet à Gradle d’accéder aux dépendances Mapbox nécessaires.
