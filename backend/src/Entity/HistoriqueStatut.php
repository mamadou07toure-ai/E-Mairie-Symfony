<?php

namespace App\Entity;

use App\Repository\HistoriqueStatutRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: HistoriqueStatutRepository::class)]
#[ORM\Table(name: 'historique_statuts')]
#[ORM\HasLifecycleCallbacks]
class HistoriqueStatut
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Demande::class, inversedBy: 'historiqueStatuts')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Demande $demande = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 50)]
    private ?string $ancienStatut = null;

    #[ORM\Column(length: 50)]
    private ?string $nouveauStatut = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $commentaire = null;

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
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }
    public function getAncienStatut(): ?string { return $this->ancienStatut; }
    public function setAncienStatut(string $statut): static { $this->ancienStatut = $statut; return $this; }
    public function getNouveauStatut(): ?string { return $this->nouveauStatut; }
    public function setNouveauStatut(string $statut): static { $this->nouveauStatut = $statut; return $this; }
    public function getCommentaire(): ?string { return $this->commentaire; }
    public function setCommentaire(?string $commentaire): static { $this->commentaire = $commentaire; return $this; }
    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'ancien_statut' => $this->ancienStatut,
            'nouveau_statut' => $this->nouveauStatut,
            'commentaire' => $this->commentaire,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'user' => $this->user ? ['id' => $this->user->getId(), 'nom' => $this->user->getNom(), 'prenom' => $this->user->getPrenom(), 'role' => $this->user->getRole()->value] : null,
        ];
    }
}
