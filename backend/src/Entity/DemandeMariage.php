<?php

namespace App\Entity;

use App\Repository\DemandeMariageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DemandeMariageRepository::class)]
#[ORM\Table(name: 'demande_mariages')]
#[ORM\HasLifecycleCallbacks]
class DemandeMariage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'demandeMariage', targetEntity: Demande::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Demande $demande = null;

    #[ORM\Column(length: 255)]
    private ?string $nomEpoux = null;

    #[ORM\Column(length: 255)]
    private ?string $prenomEpoux = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateNaissanceEpoux = null;

    #[ORM\Column(length: 255)]
    private ?string $lieuNaissanceEpoux = null;

    #[ORM\Column(length: 255)]
    private ?string $nomEpouse = null;

    #[ORM\Column(length: 255)]
    private ?string $prenomEpouse = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateNaissanceEpouse = null;

    #[ORM\Column(length: 255)]
    private ?string $lieuNaissanceEpouse = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateMariage = null;

    #[ORM\Column(length: 255)]
    private ?string $lieuMariage = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $numeroActeMariage = null;

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

    // Getters and Setters omitted for brevity...
    public function getId(): ?int { return $this->id; }
    public function getDemande(): ?Demande { return $this->demande; }
    public function setDemande(Demande $demande): static { $this->demande = $demande; return $this; }
    public function getNomEpoux(): ?string { return $this->nomEpoux; }
    public function setNomEpoux(string $nom): static { $this->nomEpoux = $nom; return $this; }
    public function getPrenomEpoux(): ?string { return $this->prenomEpoux; }
    public function setPrenomEpoux(string $prenom): static { $this->prenomEpoux = $prenom; return $this; }
    public function getDateNaissanceEpoux(): ?\DateTimeInterface { return $this->dateNaissanceEpoux; }
    public function setDateNaissanceEpoux(\DateTimeInterface $date): static { $this->dateNaissanceEpoux = $date; return $this; }
    public function getLieuNaissanceEpoux(): ?string { return $this->lieuNaissanceEpoux; }
    public function setLieuNaissanceEpoux(string $lieu): static { $this->lieuNaissanceEpoux = $lieu; return $this; }
    public function getNomEpouse(): ?string { return $this->nomEpouse; }
    public function setNomEpouse(string $nom): static { $this->nomEpouse = $nom; return $this; }
    public function getPrenomEpouse(): ?string { return $this->prenomEpouse; }
    public function setPrenomEpouse(string $prenom): static { $this->prenomEpouse = $prenom; return $this; }
    public function getDateNaissanceEpouse(): ?\DateTimeInterface { return $this->dateNaissanceEpouse; }
    public function setDateNaissanceEpouse(\DateTimeInterface $date): static { $this->dateNaissanceEpouse = $date; return $this; }
    public function getLieuNaissanceEpouse(): ?string { return $this->lieuNaissanceEpouse; }
    public function setLieuNaissanceEpouse(string $lieu): static { $this->lieuNaissanceEpouse = $lieu; return $this; }
    public function getDateMariage(): ?\DateTimeInterface { return $this->dateMariage; }
    public function setDateMariage(\DateTimeInterface $date): static { $this->dateMariage = $date; return $this; }
    public function getLieuMariage(): ?string { return $this->lieuMariage; }
    public function setLieuMariage(string $lieu): static { $this->lieuMariage = $lieu; return $this; }
    public function getNumeroActeMariage(): ?string { return $this->numeroActeMariage; }
    public function setNumeroActeMariage(?string $numero): static { $this->numeroActeMariage = $numero; return $this; }
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
            'nom_epoux' => $this->nomEpoux,
            'prenom_epoux' => $this->prenomEpoux,
            'date_naissance_epoux' => $this->dateNaissanceEpoux?->format('Y-m-d'),
            'lieu_naissance_epoux' => $this->lieuNaissanceEpoux,
            'nom_epouse' => $this->nomEpouse,
            'prenom_epouse' => $this->prenomEpouse,
            'date_naissance_epouse' => $this->dateNaissanceEpouse?->format('Y-m-d'),
            'lieu_naissance_epouse' => $this->lieuNaissanceEpouse,
            'date_mariage' => $this->dateMariage?->format('Y-m-d'),
            'lieu_mariage' => $this->lieuMariage,
            'numero_acte_mariage' => $this->numeroActeMariage,
            'motif' => $this->motif,
            'nombre_copies' => $this->nombreCopies,
            'observations' => $this->observations,
        ];
    }
}
