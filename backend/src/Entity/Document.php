<?php

namespace App\Entity;

use App\Enum\TypeDocumentEnum;
use App\Repository\DocumentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DocumentRepository::class)]
#[ORM\Table(name: 'documents')]
#[ORM\HasLifecycleCallbacks]
class Document
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Demande::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Demande $demande = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $uploadedBy = null;

    #[ORM\Column(length: 255)]
    private ?string $nomOriginal = null;

    #[ORM\Column(length: 500)]
    private ?string $cheminStockage = null;

    #[ORM\Column(length: 100)]
    private ?string $typeMime = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $tailleOctets = null;

    #[ORM\Column(type: 'string', length: 50, enumType: TypeDocumentEnum::class)]
    private TypeDocumentEnum $typeDocument = TypeDocumentEnum::PIECE_JUSTIFICATIVE;

    #[ORM\Column(type: Types::BOOLEAN, nullable: true)]
    private ?bool $isValidated = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getDemande(): ?Demande { return $this->demande; }
    public function setDemande(?Demande $demande): static { $this->demande = $demande; return $this; }
    public function getUploadedBy(): ?User { return $this->uploadedBy; }
    public function setUploadedBy(?User $user): static { $this->uploadedBy = $user; return $this; }
    public function getNomOriginal(): ?string { return $this->nomOriginal; }
    public function setNomOriginal(string $nom): static { $this->nomOriginal = $nom; return $this; }
    public function getCheminStockage(): ?string { return $this->cheminStockage; }
    public function setCheminStockage(string $chemin): static { $this->cheminStockage = $chemin; return $this; }
    public function getTypeMime(): ?string { return $this->typeMime; }
    public function setTypeMime(string $typeMime): static { $this->typeMime = $typeMime; return $this; }
    public function getTailleOctets(): ?int { return $this->tailleOctets; }
    public function setTailleOctets(int $taille): static { $this->tailleOctets = $taille; return $this; }
    public function getTypeDocument(): TypeDocumentEnum { return $this->typeDocument; }
    public function setTypeDocument(TypeDocumentEnum $type): static { $this->typeDocument = $type; return $this; }
    public function getIsValidated(): ?bool { return $this->isValidated; }
    public function setIsValidated(?bool $isValidated): static { $this->isValidated = $isValidated; return $this; }
    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nomOriginal,
            'url' => $this->cheminStockage ? '/uploads/demandes/' . basename($this->cheminStockage) : null,
            'type_mime' => $this->typeMime,
            'taille_octets' => $this->tailleOctets,
            'type' => $this->typeDocument->value,
            'is_validated' => $this->isValidated,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'date' => $this->createdAt?->format('Y-m-d'),
            'uploaded_by' => $this->uploadedBy ? ['id' => $this->uploadedBy->getId(), 'nom' => $this->uploadedBy->getNom(), 'prenom' => $this->uploadedBy->getPrenom()] : null,
        ];
    }
}
