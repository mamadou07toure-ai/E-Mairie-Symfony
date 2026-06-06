<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260604000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add document_templates table for official document generation';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE document_templates (
            id BIGINT AUTO_INCREMENT NOT NULL,
            type_demande_id BIGINT NOT NULL,
            nom VARCHAR(255) NOT NULL,
            chemin_image VARCHAR(500) NOT NULL,
            champs JSON DEFAULT NULL,
            actif TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            UNIQUE INDEX UNIQ_DOC_TPL_TYPE (type_demande_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4');

        $this->addSql('ALTER TABLE document_templates ADD CONSTRAINT FK_DOC_TPL_TYPE_DEMANDE
            FOREIGN KEY (type_demande_id) REFERENCES types_demandes (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE document_templates DROP FOREIGN KEY FK_DOC_TPL_TYPE_DEMANDE');
        $this->addSql('DROP TABLE document_templates');
    }
}
