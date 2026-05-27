<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260520092437 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE audit_logs (id BIGINT AUTO_INCREMENT NOT NULL, action VARCHAR(255) NOT NULL, entite VARCHAR(100) NOT NULL, entite_id BIGINT DEFAULT NULL, details JSON DEFAULT NULL, ip_address VARCHAR(45) NOT NULL, created_at DATETIME NOT NULL, user_id BIGINT DEFAULT NULL, INDEX IDX_D62F2858A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE demande_autorisations (id BIGINT AUTO_INCREMENT NOT NULL, raison_sociale VARCHAR(255) NOT NULL, prenoms VARCHAR(255) NOT NULL, nature_autorisation VARCHAR(255) NOT NULL, description_detaillee VARCHAR(500) NOT NULL, adresse_activite VARCHAR(255) NOT NULL, date_debut DATE NOT NULL, date_fin DATE DEFAULT NULL, nombre_personnes INT DEFAULT NULL, observations LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, UNIQUE INDEX UNIQ_8A34CE3F80E95E18 (demande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE demande_changement_adresses (id BIGINT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prenoms VARCHAR(255) NOT NULL, date_naissance DATE NOT NULL, ancienne_adresse VARCHAR(500) NOT NULL, nouvelle_adresse VARCHAR(500) NOT NULL, quartier_commune_nouveau VARCHAR(255) NOT NULL, date_installation DATE NOT NULL, motif_changement VARCHAR(255) NOT NULL, observations LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, UNIQUE INDEX UNIQ_571E379E80E95E18 (demande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE demande_legalisations (id BIGINT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prenoms VARCHAR(255) NOT NULL, type_document VARCHAR(255) NOT NULL, description_document VARCHAR(500) DEFAULT NULL, langue_document VARCHAR(255) NOT NULL, pays_destination VARCHAR(255) NOT NULL, usage_prevu VARCHAR(255) NOT NULL, nombre_copies INT NOT NULL, observations LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, UNIQUE INDEX UNIQ_8CDF482780E95E18 (demande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE demande_mariages (id BIGINT AUTO_INCREMENT NOT NULL, nom_epoux VARCHAR(255) NOT NULL, prenom_epoux VARCHAR(255) NOT NULL, date_naissance_epoux DATE NOT NULL, lieu_naissance_epoux VARCHAR(255) NOT NULL, nom_epouse VARCHAR(255) NOT NULL, prenom_epouse VARCHAR(255) NOT NULL, date_naissance_epouse DATE NOT NULL, lieu_naissance_epouse VARCHAR(255) NOT NULL, date_mariage DATE NOT NULL, lieu_mariage VARCHAR(255) NOT NULL, numero_acte_mariage VARCHAR(255) DEFAULT NULL, motif LONGTEXT DEFAULT NULL, nombre_copies INT NOT NULL, observations LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, UNIQUE INDEX UNIQ_88182FC180E95E18 (demande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE demande_naissances (id BIGINT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prenoms VARCHAR(255) NOT NULL, date_naissance DATE NOT NULL, lieu_naissance VARCHAR(255) NOT NULL, genre VARCHAR(1) NOT NULL, nom_pere VARCHAR(255) DEFAULT NULL, prenom_pere VARCHAR(255) DEFAULT NULL, date_naissance_pere DATE DEFAULT NULL, profession_pere VARCHAR(255) DEFAULT NULL, nom_mere VARCHAR(255) DEFAULT NULL, prenom_mere VARCHAR(255) DEFAULT NULL, date_naissance_mere DATE DEFAULT NULL, profession_mere VARCHAR(255) DEFAULT NULL, nombre_copies INT NOT NULL, motif LONGTEXT DEFAULT NULL, observations LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, UNIQUE INDEX UNIQ_EA5ED96A80E95E18 (demande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE demande_residences (id BIGINT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prenoms VARCHAR(255) NOT NULL, date_naissance DATE NOT NULL, lieu_naissance VARCHAR(255) NOT NULL, adresse_complete VARCHAR(500) NOT NULL, profession VARCHAR(255) NOT NULL, quartier_commune VARCHAR(255) NOT NULL, duree_residence VARCHAR(255) NOT NULL, motif LONGTEXT DEFAULT NULL, nombre_copies INT NOT NULL, observations LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, UNIQUE INDEX UNIQ_4FA6938080E95E18 (demande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE demandes (id BIGINT AUTO_INCREMENT NOT NULL, uuid VARCHAR(36) NOT NULL, numero_dossier VARCHAR(20) NOT NULL, statut VARCHAR(30) NOT NULL, priorite VARCHAR(20) NOT NULL, description LONGTEXT DEFAULT NULL, donnees_formulaire JSON DEFAULT NULL, motif_rejet LONGTEXT DEFAULT NULL, piece_manquante LONGTEXT DEFAULT NULL, notes_internes LONGTEXT DEFAULT NULL, date_echeance DATE DEFAULT NULL, date_cloture DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id BIGINT NOT NULL, agent_id BIGINT DEFAULT NULL, type_demande_id BIGINT NOT NULL, UNIQUE INDEX UNIQ_BD940CBBD17F50A6 (uuid), UNIQUE INDEX UNIQ_BD940CBBFB1CFE96 (numero_dossier), INDEX IDX_BD940CBB9DEA883D (type_demande_id), INDEX IDX_BD940CBBA76ED395 (user_id), INDEX IDX_BD940CBB3414710B (agent_id), INDEX IDX_BD940CBBE564F0BF8B8E8428 (statut, created_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE documents (id BIGINT AUTO_INCREMENT NOT NULL, nom_original VARCHAR(255) NOT NULL, chemin_stockage VARCHAR(500) NOT NULL, type_mime VARCHAR(100) NOT NULL, taille_octets INT NOT NULL, type_document VARCHAR(50) NOT NULL, is_validated TINYINT DEFAULT NULL, created_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, uploaded_by_id BIGINT NOT NULL, INDEX IDX_A2B0728880E95E18 (demande_id), INDEX IDX_A2B07288A2B28FE8 (uploaded_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE historique_statuts (id BIGINT AUTO_INCREMENT NOT NULL, ancien_statut VARCHAR(50) NOT NULL, nouveau_statut VARCHAR(50) NOT NULL, commentaire LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, user_id BIGINT NOT NULL, INDEX IDX_22215A9980E95E18 (demande_id), INDEX IDX_22215A99A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messages (id BIGINT AUTO_INCREMENT NOT NULL, contenu LONGTEXT NOT NULL, lu TINYINT NOT NULL, lu_at DATETIME DEFAULT NULL, edited_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, sender_id BIGINT NOT NULL, receiver_id BIGINT NOT NULL, demande_id BIGINT DEFAULT NULL, INDEX IDX_DB021E96F624B39D (sender_id), INDEX IDX_DB021E96CD53EDB6 (receiver_id), INDEX IDX_DB021E9680E95E18 (demande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE notifications (id BIGINT AUTO_INCREMENT NOT NULL, type VARCHAR(50) NOT NULL, message LONGTEXT NOT NULL, lu TINYINT NOT NULL, lu_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, user_id BIGINT NOT NULL, demande_id BIGINT DEFAULT NULL, INDEX IDX_6000B0D3A76ED395 (user_id), INDEX IDX_6000B0D380E95E18 (demande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE rendez_vous (id BIGINT AUTO_INCREMENT NOT NULL, date_rdv DATETIME NOT NULL, statut VARCHAR(50) DEFAULT \'confirme\' NOT NULL, notes LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, demande_id BIGINT NOT NULL, user_id BIGINT NOT NULL, UNIQUE INDEX UNIQ_65E8AA0A80E95E18 (demande_id), INDEX IDX_65E8AA0AA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE settings (`key` VARCHAR(191) NOT NULL, value LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY (`key`)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE types_demandes (id BIGINT AUTO_INCREMENT NOT NULL, code VARCHAR(50) NOT NULL, libelle VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, delai_jours_ouvrables INT NOT NULL, is_active TINYINT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_72F3EB9577153098 (code), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE users (id BIGINT AUTO_INCREMENT NOT NULL, uuid VARCHAR(36) NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, email VARCHAR(191) NOT NULL, email_verified_at DATETIME DEFAULT NULL, telephone VARCHAR(20) DEFAULT NULL, avatar_path VARCHAR(255) DEFAULT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL, is_active TINYINT NOT NULL, last_login_at DATETIME DEFAULT NULL, remember_token VARCHAR(100) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_1483A5E9D17F50A6 (uuid), UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE audit_logs ADD CONSTRAINT FK_D62F2858A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE demande_autorisations ADD CONSTRAINT FK_8A34CE3F80E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE demande_changement_adresses ADD CONSTRAINT FK_571E379E80E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE demande_legalisations ADD CONSTRAINT FK_8CDF482780E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE demande_mariages ADD CONSTRAINT FK_88182FC180E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE demande_naissances ADD CONSTRAINT FK_EA5ED96A80E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE demande_residences ADD CONSTRAINT FK_4FA6938080E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE demandes ADD CONSTRAINT FK_BD940CBBA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE demandes ADD CONSTRAINT FK_BD940CBB3414710B FOREIGN KEY (agent_id) REFERENCES users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE demandes ADD CONSTRAINT FK_BD940CBB9DEA883D FOREIGN KEY (type_demande_id) REFERENCES types_demandes (id)');
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A2B0728880E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A2B07288A2B28FE8 FOREIGN KEY (uploaded_by_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE historique_statuts ADD CONSTRAINT FK_22215A9980E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE historique_statuts ADD CONSTRAINT FK_22215A99A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E96F624B39D FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E96CD53EDB6 FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E9680E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE notifications ADD CONSTRAINT FK_6000B0D3A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE notifications ADD CONSTRAINT FK_6000B0D380E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0A80E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0AA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE audit_logs DROP FOREIGN KEY FK_D62F2858A76ED395');
        $this->addSql('ALTER TABLE demande_autorisations DROP FOREIGN KEY FK_8A34CE3F80E95E18');
        $this->addSql('ALTER TABLE demande_changement_adresses DROP FOREIGN KEY FK_571E379E80E95E18');
        $this->addSql('ALTER TABLE demande_legalisations DROP FOREIGN KEY FK_8CDF482780E95E18');
        $this->addSql('ALTER TABLE demande_mariages DROP FOREIGN KEY FK_88182FC180E95E18');
        $this->addSql('ALTER TABLE demande_naissances DROP FOREIGN KEY FK_EA5ED96A80E95E18');
        $this->addSql('ALTER TABLE demande_residences DROP FOREIGN KEY FK_4FA6938080E95E18');
        $this->addSql('ALTER TABLE demandes DROP FOREIGN KEY FK_BD940CBBA76ED395');
        $this->addSql('ALTER TABLE demandes DROP FOREIGN KEY FK_BD940CBB3414710B');
        $this->addSql('ALTER TABLE demandes DROP FOREIGN KEY FK_BD940CBB9DEA883D');
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A2B0728880E95E18');
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A2B07288A2B28FE8');
        $this->addSql('ALTER TABLE historique_statuts DROP FOREIGN KEY FK_22215A9980E95E18');
        $this->addSql('ALTER TABLE historique_statuts DROP FOREIGN KEY FK_22215A99A76ED395');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96F624B39D');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96CD53EDB6');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E9680E95E18');
        $this->addSql('ALTER TABLE notifications DROP FOREIGN KEY FK_6000B0D3A76ED395');
        $this->addSql('ALTER TABLE notifications DROP FOREIGN KEY FK_6000B0D380E95E18');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A80E95E18');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0AA76ED395');
        $this->addSql('DROP TABLE audit_logs');
        $this->addSql('DROP TABLE demande_autorisations');
        $this->addSql('DROP TABLE demande_changement_adresses');
        $this->addSql('DROP TABLE demande_legalisations');
        $this->addSql('DROP TABLE demande_mariages');
        $this->addSql('DROP TABLE demande_naissances');
        $this->addSql('DROP TABLE demande_residences');
        $this->addSql('DROP TABLE demandes');
        $this->addSql('DROP TABLE documents');
        $this->addSql('DROP TABLE historique_statuts');
        $this->addSql('DROP TABLE messages');
        $this->addSql('DROP TABLE notifications');
        $this->addSql('DROP TABLE rendez_vous');
        $this->addSql('DROP TABLE settings');
        $this->addSql('DROP TABLE types_demandes');
        $this->addSql('DROP TABLE users');
    }
}
