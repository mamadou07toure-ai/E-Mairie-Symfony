<?php

namespace App\Entity;

use App\Repository\DemandeAutorisationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DemandeAutorisationRepository::class)]
#[ORM\Table(name: 'demande_autorisations')]
#[ORM\HasLifecycleCallbacks]
class DemandeAutorisation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'demandeAutorisation', targetEntity: Demande::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Demande $demande = null;

    #[ORM\Column(length: 255)]
    private ?string $raisonSociale = null;

    #[ORM\Column(length: 255)]
    private ?string $prenoms = null;

    #[ORM\Column(length: 255)]
    private ?string $natureAutorisation = null;

    #[ORM\Column(length: 500)]
    private ?string $descriptionDetaillee = null;

    #[ORM\Column(length: 255)]
    private ?string $adresseActivite = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateDebut = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateFin = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $nombrePersonnes = null;

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

    // Getters and setters...
    public function getId(): ?int { return $this->id; }
    public function getDemande(): ?Demande { return $this->demande; }
    public function setDemande(Demande $demande): static { $this->demande = $demande; return $this; }
    public function getRaisonSociale(): ?string { return $this->raisonSociale; }
    public function setRaisonSociale(string $raison): static { $this->raisonSociale = $raison; return $this; }
    public function getPrenoms(): ?string { return $this->prenoms; }
    public function setPrenoms(string $prenoms): static { $this->prenoms = $prenoms; return $this; }
    public function getNatureAutorisation(): ?string { return $this->natureAutorisation; }
    public function setNatureAutorisation(string $nature): static { $this->natureAutorisation = $nature; return $this; }
    public function getDescriptionDetaillee(): ?string { return $this->descriptionDetaillee; }
    public function setDescriptionDetaillee(string $desc): static { $this->descriptionDetaillee = $desc; return $this; }
    public function getAdresseActivite(): ?string { return $this->adresseActivite; }
    public function setAdresseActivite(string $adresse): static { $this->adresseActivite = $adresse; return $this; }
    public function getDateDebut(): ?\DateTimeInterface { return $this->dateDebut; }
    public function setDateDebut(\DateTimeInterface $date): static { $this->dateDebut = $date; return $this; }
    public function getDateFin(): ?\DateTimeInterface { return $this->dateFin; }
    public function setDateFin(?\DateTimeInterface $date): static { $this->dateFin = $date; return $this; }
    public function getNombrePersonnes(): ?int { return $this->nombrePersonnes; }
    public function setNombrePersonnes(?int $nb): static { $this->nombrePersonnes = $nb; return $this; }
    public function getObservations(): ?string { return $this->observations; }
    public function setObservations(?string $obs): static { $this->observations = $obs; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'raison_sociale' => $this->raisonSociale,
            'prenoms' => $this->prenoms,
            'nature_autorisation' => $this->natureAutorisation,
            'description_detaillee' => $this->descriptionDetaillee,
            'adresse_activite' => $this->adresseActivite,
            'date_debut' => $this->dateDebut?->format('Y-m-d'),
            'date_fin' => $this->dateFin?->format('Y-m-d'),
            'nombre_personnes' => $this->nombrePersonnes,
            'observations' => $this->observations,
        ];
    }
}
