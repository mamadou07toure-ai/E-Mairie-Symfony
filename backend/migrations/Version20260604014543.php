<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260604014543 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
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
        $this->addSql('ALTER TABLE document_templates ADD CONSTRAINT FK_7D10552F9DEA883D FOREIGN KEY (type_demande_id) REFERENCES types_demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE document_templates RENAME INDEX uniq_doc_tpl_type TO UNIQ_7D10552F9DEA883D');
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A2B0728880E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A2B07288A2B28FE8 FOREIGN KEY (uploaded_by_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE historique_statuts ADD CONSTRAINT FK_22215A9980E95E18 FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE historique_statuts ADD CONSTRAINT FK_22215A99A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E96F624B39D FOREIGN KEY (sender_id) REFERENCES users (id)');
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
        $this->addSql('ALTER TABLE document_templates DROP FOREIGN KEY FK_7D10552F9DEA883D');
        $this->addSql('ALTER TABLE document_templates RENAME INDEX uniq_7d10552f9dea883d TO UNIQ_DOC_TPL_TYPE');
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A2B0728880E95E18');
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A2B07288A2B28FE8');
        $this->addSql('ALTER TABLE historique_statuts DROP FOREIGN KEY FK_22215A9980E95E18');
        $this->addSql('ALTER TABLE historique_statuts DROP FOREIGN KEY FK_22215A99A76ED395');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96F624B39D');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E9680E95E18');
        $this->addSql('ALTER TABLE notifications DROP FOREIGN KEY FK_6000B0D3A76ED395');
        $this->addSql('ALTER TABLE notifications DROP FOREIGN KEY FK_6000B0D380E95E18');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A80E95E18');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0AA76ED395');
    }
}
