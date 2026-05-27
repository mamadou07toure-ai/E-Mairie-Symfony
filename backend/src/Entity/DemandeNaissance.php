<?php

namespace App\Entity;

use App\Repository\DemandeNaissanceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DemandeNaissanceRepository::class)]
#[ORM\Table(name: 'demande_naissances')]
#[ORM\HasLifecycleCallbacks]
class DemandeNaissance
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'demandeNaissance', targetEntity: Demande::class)]
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

    #[ORM\Column(length: 1)]
    private ?string $genre = null; // F ou M

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $nomPere = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $prenomPere = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateNaissancePere = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $professionPere = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $nomMere = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $prenomMere = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateNaissanceMere = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $professionMere = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $nombreCopies = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $motif = null;

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

    // Getters/Setters...
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
    public function getGenre(): ?string { return $this->genre; }
    public function setGenre(string $genre): static { $this->genre = $genre; return $this; }
    public function getNomPere(): ?string { return $this->nomPere; }
    public function setNomPere(?string $nom): static { $this->nomPere = $nom; return $this; }
    public function getPrenomPere(): ?string { return $this->prenomPere; }
    public function setPrenomPere(?string $prenom): static { $this->prenomPere = $prenom; return $this; }
    public function getDateNaissancePere(): ?\DateTimeInterface { return $this->dateNaissancePere; }
    public function setDateNaissancePere(?\DateTimeInterface $date): static { $this->dateNaissancePere = $date; return $this; }
    public function getProfessionPere(): ?string { return $this->professionPere; }
    public function setProfessionPere(?string $prof): static { $this->professionPere = $prof; return $this; }
    public function getNomMere(): ?string { return $this->nomMere; }
    public function setNomMere(?string $nom): static { $this->nomMere = $nom; return $this; }
    public function getPrenomMere(): ?string { return $this->prenomMere; }
    public function setPrenomMere(?string $prenom): static { $this->prenomMere = $prenom; return $this; }
    public function getDateNaissanceMere(): ?\DateTimeInterface { return $this->dateNaissanceMere; }
    public function setDateNaissanceMere(?\DateTimeInterface $date): static { $this->dateNaissanceMere = $date; return $this; }
    public function getProfessionMere(): ?string { return $this->professionMere; }
    public function setProfessionMere(?string $prof): static { $this->professionMere = $prof; return $this; }
    public function getNombreCopies(): ?int { return $this->nombreCopies; }
    public function setNombreCopies(int $nb): static { $this->nombreCopies = $nb; return $this; }
    public function getMotif(): ?string { return $this->motif; }
    public function setMotif(?string $motif): static { $this->motif = $motif; return $this; }
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
            'genre' => $this->genre,
            'nom_pere' => $this->nomPere,
            'prenom_pere' => $this->prenomPere,
            'date_naissance_pere' => $this->dateNaissancePere?->format('Y-m-d'),
            'profession_pere' => $this->professionPere,
            'nom_mere' => $this->nomMere,
            'prenom_mere' => $this->prenomMere,
            'date_naissance_mere' => $this->dateNaissanceMere?->format('Y-m-d'),
            'profession_mere' => $this->professionMere,
            'nombre_copies' => $this->nombreCopies,
            'motif' => $this->motif,
            'observations' => $this->observations,
        ];
    }
}
