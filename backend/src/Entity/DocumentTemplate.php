<?php

namespace App\Entity;

use App\Repository\DocumentTemplateRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DocumentTemplateRepository::class)]
#[ORM\Table(name: 'document_templates')]
#[ORM\HasLifecycleCallbacks]
class DocumentTemplate
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: TypeDemande::class, inversedBy: 'documentTemplate')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?TypeDemande $typeDemande = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 500)]
    private ?string $cheminImage = null;

    /** @var array<int, array{key: string, label: string, x: float, y: float, font_size: int, bold: bool, color: string}>|null */
    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $champs = null;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => false])]
    private bool $actif = false;

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

    public function getTypeDemande(): ?TypeDemande { return $this->typeDemande; }
    public function setTypeDemande(?TypeDemande $typeDemande): static { $this->typeDemande = $typeDemande; return $this; }

    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }

    public function getCheminImage(): ?string { return $this->cheminImage; }
    public function setCheminImage(string $cheminImage): static { $this->cheminImage = $cheminImage; return $this; }

    public function getChamps(): ?array { return $this->champs; }
    public function setChamps(?array $champs): static { $this->champs = $champs; return $this; }

    public function isActif(): bool { return $this->actif; }
    public function setActif(bool $actif): static { $this->actif = $actif; return $this; }

    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeInterface { return $this->updatedAt; }

    public function toArray(): array
    {
        return [
            'id'             => $this->id,
            'type_demande'   => $this->typeDemande?->toArray(),
            'nom'            => $this->nom,
            'chemin_image'   => $this->cheminImage,
            'image_url'      => $this->cheminImage ? '/uploads/templates/' . basename($this->cheminImage) : null,
            'champs'         => $this->champs ?? [],
            'actif'          => $this->actif,
            'created_at'     => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at'     => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
