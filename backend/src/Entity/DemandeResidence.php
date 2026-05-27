<?php

namespace App\Entity;

use App\Repository\DemandeResidenceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DemandeResidenceRepository::class)]
#[ORM\Table(name: 'demande_residences')]
#[ORM\HasLifecycleCallbacks]
class DemandeResidence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'demandeResidence', targetEntity: Demande::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Demande $demande = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    private ?string $prenoms = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateNaissance = null;

    #[ORM\Column(length: 255)]
    private ?string $lieuNaissance = null;

    #[ORM\Column(length: 500)]
    private ?string $adresseComplete = null;

    #[ORM\Column(length: 255)]
    private ?string $profession = null;

    #[ORM\Column(length: 255)]
    private ?string $quartierCommune = null;

    #[ORM\Column(length: 255)]
    private ?string $dureeResidence = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $motif = null;

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

    // Getters / Setters...
    public function getId(): ?int { return $this->id; }
    public function getDemande(): ?Demande { return $this->demande; }
    public function setDemande(Demande $demande): static { $this->demande = $demande; return $this; }
    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }
    public function getPrenoms(): ?string { return $this->prenoms; }
    public function setPrenoms(string $prenoms): static { $this->prenoms = $prenoms; return $this; }
    public function getDateNaissance(): ?\DateTimeInterface { return $this->dateNaissance; }
    public function setDateNaissance(\DateTimeInterface $date): static { $this->dateNaissance = $date; return $this; }
    public function getLieuNaissance(): ?string { return $this->lieuNaissance; }
    public function setLieuNaissance(string $lieu): static { $this->lieuNaissance = $lieu; return $this; }
    public function getAdresseComplete(): ?string { return $this->adresseComplete; }
    public function setAdresseComplete(string $adresse): static { $this->adresseComplete = $adresse; return $this; }
    public function getProfession(): ?string { return $this->profession; }
    public function setProfession(string $profession): static { $this->profession = $profession; return $this; }
    public function getQuartierCommune(): ?string { return $this->quartierCommune; }
    public function setQuartierCommune(string $quartier): static { $this->quartierCommune = $quartier; return $this; }
    public function getDureeResidence(): ?string { return $this->dureeResidence; }
    public function setDureeResidence(string $duree): static { $this->dureeResidence = $duree; return $this; }
    public function getMotif(): ?string { return $this->motif; }
    public function setMotif(?string $motif): static { $this->motif = $motif; return $this; }
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
            'date_naissance' => $this->dateNaissance?->format('Y-m-d'),
            'lieu_naissance' => $this->lieuNaissance,
            'adresse_complete' => $this->adresseComplete,
            'profession' => $this->profession,
            'quartier_commune' => $this->quartierCommune,
            'duree_residence' => $this->dureeResidence,
            'motif' => $this->motif,
            'nombre_copies' => $this->nombreCopies,
            'observations' => $this->observations,
        ];
    }
}
