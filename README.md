# Block News

Block News est un projet de réseau social basé sur l'idée du journalisme décentralisé. C'est une application sur laquelle chacun peut poster librement et anonymement, et où la crédibilité de chacun est déterminé par le reste des utilisateurs, en utilisant des SFT (Semi-Fungible Token) ERC1155.

# L'équipe

- Jean-François N.
- Thibault L.
- Cyril F.
- Nathanael K. (développement)

# Liens

- Application déployée sur Vercel : blocknews-seven.vercel.app

- Smart contract déployé sur Sepolia :

- Vidéo de démonstration de la Dapp :

# Backend

Deux smart contracts :
- SocialNetwork : contrat contenant toutes les interactions du réseau social avec de nombreuses fonctions et stockant les données de l'application
- TopUsersSFT : contrat d'ERC1155 permettant de de gérer les SFT donnés en récompense pour les meilleurs utilisateurs de l’application

Tests unitaires réalisés avec Hardhat, en plus d'un script de déploiement et un script d'écriture. Les smart contracts sont commentés en NatSpec.

Stack :
- Solidity
- Hardhat
- Contrats Ownable et ERC1155 d'OpenZeppelin

# Frontend

Stack :
- JavaScript
- React
- NextJS
- ChakraUI
- Wagmi
- RainbowKit

# Schéma fonctionnel de l'app
<img width="529" alt="image" src="https://github.com/FunafutiTV/Alyra-Projet-Final/assets/113341799/5b61481b-2620-43e6-be4d-90ed4a525c68">

