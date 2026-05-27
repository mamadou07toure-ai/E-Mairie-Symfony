<?php

namespace App\Entity;

use App\Repository\DemandeChangementAdresseRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DemandeChangementAdresseRepository::class)]
#[ORM\Table(name: 'demande_changement_adresses')]
#[ORM\HasLifecycleCallbacks]
class DemandeChangementAdresse
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'demandeChangementAdresse', targetEntity: Demande::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Demande $demande = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    private ?string $prenoms = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateNaissance = null;

    #[ORM\Column(length: 500)]
    private ?string $ancienneAdresse = null;

    #[ORM\Column(length: 500)]
    private ?string $nouvelleAdresse = null;

    #[ORM\Column(length: 255)]
    private ?string $quartierCommuneNouveau = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateInstallation = null;

    #[ORM\Column(length: 255)]
    private ?string $motifChangement = null;

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
    public function getAncienneAdresse(): ?string { return $this->ancienneAdresse; }
    public function setAncienneAdresse(string $adresse): static { $this->ancienneAdresse = $adresse; return $this; }
    public function getNouvelleAdresse(): ?string { return $this->nouvelleAdresse; }
    public function setNouvelleAdresse(string $adresse): static { $this->nouvelleAdresse = $adresse; return $this; }
    public function getQuartierCommuneNouveau(): ?string { return $this->quartierCommuneNouveau; }
    public function setQuartierCommuneNouveau(string $quartier): static { $this->quartierCommuneNouveau = $quartier; return $this; }
    public function getDateInstallation(): ?\DateTimeInterface { return $this->dateInstallation; }
    public function setDateInstallation(\DateTimeInterface $date): static { $this->dateInstallation = $date; return $this; }
    public function getMotifChangement(): ?string { return $this->motifChangement; }
    public function setMotifChangement(string $motif): static { $this->motifChangement = $motif; return $this; }
    public function getObservations(): ?string { return $this->observations; }
    public function setObservations(?string $obs): static { $this->observations = $obs; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenoms' => $this->prenoms,
            'date_naissance' => $this->dateNaissance?->format('Y-m-d'),
            'ancienne_adresse' => $this->ancienneAdresse,
            'nouvelle_adresse' => $this->nouvelleAdresse,
            'quartier_commune_nouveau' => $this->quartierCommuneNouveau,
            'date_installation' => $this->dateInstallation?->format('Y-m-d'),
            'motif_changement' => $this->motifChangement,
            'observations' => $this->observations,
        ];
    }
}
