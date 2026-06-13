-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 13 juin 2026 à 22:34
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `suivimsp`
--

-- --------------------------------------------------------

--
-- Structure de la table `etablissements`
--

CREATE TABLE `etablissements` (
  `Id_Etablissement` int(11) NOT NULL,
  `NomEtab` varchar(255) NOT NULL,
  `Ville` varchar(255) DEFAULT NULL,
  `Location` varchar(500) DEFAULT NULL,
  `Password` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `role` varchar(255) NOT NULL,
  `activation_token` varchar(255) DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `etablissements`
--

INSERT INTO `etablissements` (`Id_Etablissement`, `NomEtab`, `Ville`, `Location`, `Password`, `Email`, `is_active`, `role`, `activation_token`, `token_expiry`) VALUES
(8, 'abdelaziz eladarissi', 'Marrakech', 'Lycée Qualifiant Charaf\n', '$2b$10$oGuXNuzT1Qmkao.ckFUgp.xsJ9V4nd3XxbgJM6/K9kISSK.XAv7Je', 'el.adarissiabdz@gmail.com', 1, 'etablissement', NULL, NULL),
(10, 'Lyce Othman ibn aafan', 'Casablanca', 'Hay elamale', '123456', 'ai.posterx@gmail.com', 1, 'etablissement', NULL, NULL),
(11, 'abdelaziz eladarissi', 'Rabat', 'gggg', '123456', 'adarissiabdelaziz@gmail.com', 1, 'etablissement', NULL, NULL),
(13, 'etab2', 'Marrakech', 'Hay elhasany', '123456', 'etab2@gmail.com', 1, 'etablissement', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `profs`
--

CREATE TABLE `profs` (
  `Id_Prof` int(11) NOT NULL,
  `Nom` varchar(255) NOT NULL,
  `Specialite` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `rapports`
--

CREATE TABLE `rapports` (
  `Id_Rapport` int(11) NOT NULL,
  `Id_Stagiaire` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('text','pdf','doc','docx') NOT NULL DEFAULT 'text',
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `commentaire` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `rapports`
--

INSERT INTO `rapports` (`Id_Rapport`, `Id_Stagiaire`, `title`, `type`, `file_name`, `file_url`, `content`, `created_at`, `updated_at`, `commentaire`) VALUES
(1, 10, 'Rapport sans titre', 'text', NULL, NULL, 'sdkfkdksjknwxdjknjksdnjkvnqsdjknjknjkwdd', '2026-06-12 23:42:17', '2026-06-12 16:09:49', ''),
(4, 7, 'R2', 'text', NULL, NULL, 'c\'est une tetx', '2026-06-11 08:14:57', '2026-06-12 15:38:00', ''),
(5, 7, 'R6', 'docx', 'fiche_formules_excel.docx', '/uploads/rapports/rapport_1781162261551-867109.docx', '', '2026-06-11 08:17:41', '2026-06-11 08:17:41', NULL),
(6, 7, 'R10', 'text', NULL, NULL, 'Rapport 10', '2026-06-11 08:18:06', '2026-06-12 15:54:28', ''),
(7, 7, 'Rpport12', 'docx', 'fiche_paragraphes.docx', '/uploads/rapports/rapport_1781191010429-148867.docx', '', '2026-06-11 16:16:50', '2026-06-13 18:37:26', 'what\'s that'),
(8, 2, 'Rapport 15', 'pdf', 'seance2.pdf', '/uploads/rapports/rapport_1781279982554-699713.pdf', '', '2026-06-12 16:59:42', '2026-06-12 16:59:42', NULL),
(9, 1, 'R45', 'pdf', 'Eval_Tc_Fiche.pdf', '/uploads/rapports/rapport_1781282989233-354033.pdf', '', '2026-06-12 17:49:49', '2026-06-13 18:19:19', 'c\'est qoui ça ');

-- --------------------------------------------------------

--
-- Structure de la table `reclamations`
--

CREATE TABLE `reclamations` (
  `Id_Reclamation` int(11) NOT NULL,
  `Id_Stagiaire` int(11) NOT NULL,
  `type` enum('echange_etablissement','changement_etablissement') NOT NULL,
  `id_etablissement_depart` int(11) DEFAULT NULL,
  `id_etablissement_cible` int(11) DEFAULT NULL,
  `stagiaire_cible_id` int(11) DEFAULT NULL,
  `objet` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `statut` enum('en_attente','attente_confirmation','accord_binome','attente_etablissement','acceptee','refusee') NOT NULL DEFAULT 'en_attente',
  `commentaire_admin` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reclamations`
--

INSERT INTO `reclamations` (`Id_Reclamation`, `Id_Stagiaire`, `type`, `id_etablissement_depart`, `id_etablissement_cible`, `stagiaire_cible_id`, `objet`, `description`, `statut`, `commentaire_admin`, `created_at`) VALUES
(28, 5, 'changement_etablissement', NULL, 13, NULL, 'op', 'opp', 'acceptee', NULL, '2026-06-13 21:11:40'),
(29, 5, 'echange_etablissement', 13, 8, 2, 'pio', 'pio', 'acceptee', NULL, '2026-06-13 21:13:31'),
(30, 2, 'changement_etablissement', NULL, 13, NULL, 'pm', 'pm', 'acceptee', NULL, '2026-06-13 21:30:41');

-- --------------------------------------------------------

--
-- Structure de la table `responsables_crmef`
--

CREATE TABLE `responsables_crmef` (
  `Id_CRMEF` int(11) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Role` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `responsables_crmef`
--

INSERT INTO `responsables_crmef` (`Id_CRMEF`, `Password`, `Email`, `Role`) VALUES
(2, '123456', 'ddd@gmail.com', 'responsables_crmef');

-- --------------------------------------------------------

--
-- Structure de la table `stagiaires`
--

CREATE TABLE `stagiaires` (
  `Id_Stagiaire` int(11) NOT NULL,
  `NomStag` varchar(255) NOT NULL,
  `PrenomStag` varchar(255) NOT NULL,
  `Filiere` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `Id_Etablissement` int(11) DEFAULT NULL,
  `Id_Superviseur` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stagiaires`
--

INSERT INTO `stagiaires` (`Id_Stagiaire`, `NomStag`, `PrenomStag`, `Filiere`, `Email`, `Password`, `role`, `Id_Etablissement`, `Id_Superviseur`, `is_active`) VALUES
(1, 'EL-adarissi', 'Abdessamad', 'SVT', 'aziz@gmail.com', '123456', 'stagiaire', 13, 1, 1),
(2, 'mine', 'mine', 'Mathématiques', 'mine@gmail.com', '123456', 'superviseur', 13, NULL, 1),
(4, 'eladarissi', 'abdelaziz', 'Informatique', 'el.adiabdelaziz@gmail.com', '123456', '', 13, NULL, 1),
(5, 'eladarissi', 'abdelaziz', 'Mathématiques', 'el.adarissiabdelaz@gmail.com', '123456', '', 8, 1, 1),
(7, 'drg', 'abdelaziz', 'Physique-Chimie', 'el.adarissiabdeliz@gmail.com', '123456', 'stagiairestag', 13, 1, 1),
(10, 'eladarissi', 'abdelaziz', 'Histoire-Géographie', 'el.adariabdelaziz@gmail.com', '123456', 'stagiairestag', 13, 1, 1),
(11, 'hamza', 'tys', 'Français', 'amine@gmail.com', '123456', '', 13, 4, 1),
(12, 'f', 'f', 'Physique-Chimie', 'f@gmail.com', '123456', '', 13, 3, 1);

-- --------------------------------------------------------

--
-- Structure de la table `superviseurs_crmef`
--

CREATE TABLE `superviseurs_crmef` (
  `Id_Superviseur` int(11) NOT NULL,
  `NomSup` varchar(255) NOT NULL,
  `PrenomSup` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `role` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `superviseurs_crmef`
--

INSERT INTO `superviseurs_crmef` (`Id_Superviseur`, `NomSup`, `PrenomSup`, `Password`, `Email`, `is_active`, `role`) VALUES
(1, 'Reda', 'Hamza', '123456', 'eyey@gmail.com', 1, 'superviseur'),
(2, 'med', 'ggs', 'aziz20035', 'el.adarissiabdelaziz@gmail.com', 1, ''),
(3, 'eladarissi', 'abdelaziz', '123456', 'el.adariss@gmail.com', 0, ''),
(4, 'eladarissi', 'abdelaziz', '123456', 'elz@gmail.com', 1, 'superviseur'),
(5, 'Ahmed', 'Med', '123456', 'med@gmail.com', 0, 'superviseur');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `etablissements`
--
ALTER TABLE `etablissements`
  ADD PRIMARY KEY (`Id_Etablissement`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Index pour la table `profs`
--
ALTER TABLE `profs`
  ADD PRIMARY KEY (`Id_Prof`);

--
-- Index pour la table `rapports`
--
ALTER TABLE `rapports`
  ADD PRIMARY KEY (`Id_Rapport`),
  ADD KEY `fk_rapport_stag` (`Id_Stagiaire`);

--
-- Index pour la table `reclamations`
--
ALTER TABLE `reclamations`
  ADD PRIMARY KEY (`Id_Reclamation`),
  ADD KEY `fk_recl_stag` (`Id_Stagiaire`),
  ADD KEY `fk_recl_stag_cible` (`stagiaire_cible_id`);

--
-- Index pour la table `responsables_crmef`
--
ALTER TABLE `responsables_crmef`
  ADD PRIMARY KEY (`Id_CRMEF`);

--
-- Index pour la table `stagiaires`
--
ALTER TABLE `stagiaires`
  ADD PRIMARY KEY (`Id_Stagiaire`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `fk_stag_etab` (`Id_Etablissement`),
  ADD KEY `fk_stag_sup` (`Id_Superviseur`);

--
-- Index pour la table `superviseurs_crmef`
--
ALTER TABLE `superviseurs_crmef`
  ADD PRIMARY KEY (`Id_Superviseur`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `etablissements`
--
ALTER TABLE `etablissements`
  MODIFY `Id_Etablissement` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `profs`
--
ALTER TABLE `profs`
  MODIFY `Id_Prof` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `rapports`
--
ALTER TABLE `rapports`
  MODIFY `Id_Rapport` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `reclamations`
--
ALTER TABLE `reclamations`
  MODIFY `Id_Reclamation` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT pour la table `responsables_crmef`
--
ALTER TABLE `responsables_crmef`
  MODIFY `Id_CRMEF` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `stagiaires`
--
ALTER TABLE `stagiaires`
  MODIFY `Id_Stagiaire` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `superviseurs_crmef`
--
ALTER TABLE `superviseurs_crmef`
  MODIFY `Id_Superviseur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `rapports`
--
ALTER TABLE `rapports`
  ADD CONSTRAINT `fk_rapport_stag` FOREIGN KEY (`Id_Stagiaire`) REFERENCES `stagiaires` (`Id_Stagiaire`) ON DELETE CASCADE;

--
-- Contraintes pour la table `reclamations`
--
ALTER TABLE `reclamations`
  ADD CONSTRAINT `fk_recl_stag` FOREIGN KEY (`Id_Stagiaire`) REFERENCES `stagiaires` (`Id_Stagiaire`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_recl_stag_cible` FOREIGN KEY (`stagiaire_cible_id`) REFERENCES `stagiaires` (`Id_Stagiaire`) ON DELETE SET NULL;

--
-- Contraintes pour la table `stagiaires`
--
ALTER TABLE `stagiaires`
  ADD CONSTRAINT `fk_stag_etab` FOREIGN KEY (`Id_Etablissement`) REFERENCES `etablissements` (`Id_Etablissement`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_stag_sup` FOREIGN KEY (`Id_Superviseur`) REFERENCES `superviseurs_crmef` (`Id_Superviseur`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
