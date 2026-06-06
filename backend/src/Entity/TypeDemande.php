<?php

namespace App\Entity;

use App\Repository\TypeDemandeRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TypeDemandeRepository::class)]
#[ORM\Table(name: 'types_demandes')]
#[ORM\HasLifecycleCallbacks]
class TypeDemande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    private ?string $code = null;

    #[ORM\Column(length: 255)]
    private ?string $libelle = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $delaiJoursOuvrables = null;

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $isActive = true;

    #[ORM\OneToOne(mappedBy: 'typeDemande', targetEntity: DocumentTemplate::class, cascade: ['persist', 'remove'])]
    private ?DocumentTemplate $documentTemplate = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getCode(): ?string { return $this->code; }
    public function setCode(string $code): static { $this->code = $code; return $this; }
    public function getLibelle(): ?string { return $this->libelle; }
    public function setLibelle(string $libelle): static { $this->libelle = $libelle; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }
    public function getDelaiJoursOuvrables(): ?int { return $this->delaiJoursOuvrables; }
    public function setDelaiJoursOuvrables(int $delai): static { $this->delaiJoursOuvrables = $delai; return $this; }
    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $isActive): static { $this->isActive = $isActive; return $this; }
    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeInterface { return $this->updatedAt; }

    public function getDocumentTemplate(): ?DocumentTemplate { return $this->documentTemplate; }
    public function setDocumentTemplate(?DocumentTemplate $documentTemplate): static { $this->documentTemplate = $documentTemplate; return $this; }

    public function toArray(): array
    {
        return [
            'id'                   => $this->id,
            'code'                 => $this->code,
            'libelle'              => $this->libelle,
            'description'          => $this->description,
            'delai_jours_ouvrables'=> $this->delaiJoursOuvrables,
            'is_active'            => $this->isActive,
            'has_active_template'  => $this->documentTemplate?->isActif() ?? false,
        ];
    }
}
