<?php

namespace App\Entity;

use App\Repository\DemandeLegalisationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DemandeLegalisationRepository::class)]
#[ORM\Table(name: 'demande_legalisations')]
#[ORM\HasLifecycleCallbacks]
class DemandeLegalisation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'demandeLegalisation', targetEntity: Demande::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Demande $demande = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    private ?string $prenoms = null;

    #[ORM\Column(length: 255)]
    private ?string $typeDocument = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $descriptionDocument = null;

    #[ORM\Column(length: 255)]
    private ?string $langueDocument = null;

    #[ORM\Column(length: 255)]
    private ?string $paysDestination = null;

    #[ORM\Column(length: 255)]
    private ?string $usagePrevu = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $nombreCopies = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $observations = null;

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

    // Getters and Setters omitted for brevity...
    public function getId(): ?int { return $this->id; }
    public function getDemande(): ?Demande { return $this->demande; }
    public function setDemande(Demande $demande): static { $this->demande = $demande; return $this; }
    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }
    public function getPrenoms(): ?string { return $this->prenoms; }
    public function setPrenoms(string $prenoms): static { $this->prenoms = $prenoms; return $this; }
    public function getTypeDocument(): ?string { return $this->typeDocument; }
    public function setTypeDocument(string $type): static { $this->typeDocument = $type; return $this; }
    public function getDescriptionDocument(): ?string { return $this->descriptionDocument; }
    public function setDescriptionDocument(?string $desc): static { $this->descriptionDocument = $desc; return $this; }
    public function getLangueDocument(): ?string { return $this->langueDocument; }
    public function setLangueDocument(string $lang): static { $this->langueDocument = $lang; return $this; }
    public function getPaysDestination(): ?string { return $this->paysDestination; }
    public function setPaysDestination(string $pays): static { $this->paysDestination = $pays; return $this; }
    public function getUsagePrevu(): ?string { return $this->usagePrevu; }
    public function setUsagePrevu(string $usage): static { $this->usagePrevu = $usage; return $this; }
    public function getNombreCopies(): ?int { return $this->nombreCopies; }
    public function setNombreCopies(int $nb): static { $this->nombreCopies = $nb; return $this; }
    public function getObservations(): ?string { return $this->observations; }
    public function setObservations(?string $obs): static { $this->observations = $obs; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenoms' => $this->prenoms,
            'type_document' => $this->typeDocument,
            'description_document' => $this->descriptionDocument,
            'langue_document' => $this->langueDocument,
            'pays_destination' => $this->paysDestination,
            'usage_prevu' => $this->usagePrevu,
            'nombre_copies' => $this->nombreCopies,
            'observations' => $this->observations,
        ];
    }
}
