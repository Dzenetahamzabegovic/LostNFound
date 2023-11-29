# Projet API - LostNFound

### Explication du projet
LostNFound est une API conçue et développée dans le cadre du cours ArchiOWeb durant l'année académique 2023-2024 à la HEIG. LostNFound permet aux utilisateurs de signaler des objets perdus ou trouvés au sein de la HEIG. Après s'être connectés, les utilisateurs accèdent à un feed des objets trouvés, enrichi de photos, informations de géolocalisation, descriptions et du nom de l'utilisateur qui a trouvé l'objet. Ils peuvent ainsi rechercher des objets perdus et entrer en contact avec la personne qui les a trouvés.

Nous soulignons l'importance du bon sens et de la bonne foi des utilisateurs pour utiliser cette API, car elle fonctionne sans vérification stricte de la propriété des objets perdus.

### MongoDB
Nous avons rencontré des instabilités avec certaines fonctionnalités dans MongoDB version 7, c'est pourquoi nous avons opté pour la version 6.

### Instructions d'installation

Pour installer et exécuter l'API LostNFound sur votre machine locale, veuillez suivre les étapes ci-dessous: 

Cloner le dépôt : Clonez le code source sur votre machine locale en utilisant la commande suivante :

    bash : git clone [URL_DU_DEPOT]

Remplacez [URL_DU_DEPOT] par l'URL de votre dépôt Git.

Installer les dépendances : Naviguez dans le dossier du projet et installez les dépendances nécessaires à l'aide de npm :

    bash : cd chemin/vers/lostnfound
    bash : npm install
    

Configurer l'environnement : Créez un fichier .env à la racine du projet et configurez les variables d'environnement nécessaires (par exemple, les informations de connexion à la base de données).

Lancer le serveur : Exécutez le serveur en utilisant npm :

    bash : npm start

Le serveur devrait maintenant être en cours d'exécution et accessible à l'adresse http://localhost:PORT où PORT est le port configuré dans votre fichier .env.

### Structure
#### Users :

 id: ObjectId (Géré automatiquement par MongoDB),
 
 admin: Boolean (Indique si l'utilisateur est un administrateur),
 
 firstName: String,
 
 lastName: String,
 
 userName: String (Unique),
 
 password: String,
 
 email: String,
 
 creationDate: Date (Date de création de l'utilisateur)

#### Objets :

 name: String,
 
 picture: String (URL de l'image),
 
 description: String,
 
 creationDate: Date

#### Places :

 geolocalisation: Coordonnées [Latitude, Longitude],
 
 floor: String,
 
 description: String,
 
 creationDate: Date,

### Documentation
La documentation de l'api est disponible à https://lostnfound-api-gyqf.onrender.com/apidoc

### Real-Time Endpoint

Notre API LostNFound offre un point de terminaison WebSocket pour les mises à jour en temps réel, permettant aux utilisateurs de recevoir des notifications instantanées lorsqu'un nouvel objet est signalé comme trouvé.
Comment Utiliser le WebSocket

Connexion WebSocket :
    Établissez une connexion WebSocket à l'adresse suivante : wss://lostnfound-api-gyqf.onrender.com.

Écoute des Messages :
    Une fois connecté, vous pouvez écouter les messages qui seront envoyés au format JSON, contenant des informations sur les objets trouvés et d'autres notifications pertinentes.

Envoi de Messages :
    Pour envoyer des messages, formattez-les en tant que JSON valide. Par exemple, pour signaler un objet trouvé, structurez votre message de cette manière :

    JSON : {
      "action": "reportFound",
      "item": {
      "name": "Clé USB",
      "location": "Bâtiment principal, 2ème étage",
      "description": "Clé USB 16GB trouvée sur une table dans la salle de conférence"
      }
    }

Exemples d'Utilisation

Recevoir des Mises à Jour en Temps Réel :
    Lorsqu'un objet est signalé comme trouvé via l'API, les clients connectés au WebSocket recevront une notification contenant les détails de l'objet.

Interagir en Temps Réel :
    Votre client WebSocket peut également être utilisé pour interagir en temps réel, comme en demandant des informations supplémentaires sur un objet trouvé ou en signalant un objet perdu.



Dzeneta Hamzabegovic, Sami Musta, Thomas Bercht

M50-1
