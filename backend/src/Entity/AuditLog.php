<?php

namespace App\Entity;

use App\Repository\AuditLogRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AuditLogRepository::class)]
#[ORM\Table(name: 'audit_logs')]
#[ORM\HasLifecycleCallbacks]
class AuditLog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    private ?string $action = null;

    #[ORM\Column(length: 100)]
    private ?string $entite = null;

    #[ORM\Column(type: Types::BIGINT, nullable: true)]
    private ?string $entiteId = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $details = null;

    #[ORM\Column(length: 45)]
    private ?string $ipAddress = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }
    public function getAction(): ?string { return $this->action; }
    public function setAction(string $action): static { $this->action = $action; return $this; }
    public function getEntite(): ?string { return $this->entite; }
    public function setEntite(string $entite): static { $this->entite = $entite; return $this; }
    public function getEntiteId(): ?string { return $this->entiteId; }
    public function setEntiteId(?string $entiteId): static { $this->entiteId = $entiteId; return $this; }
    public function getDetails(): ?array { return $this->details; }
    public function setDetails(?array $details): static { $this->details = $details; return $this; }
    public function getIpAddress(): ?string { return $this->ipAddress; }
    public function setIpAddress(string $ip): static { $this->ipAddress = $ip; return $this; }
    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'entite' => $this->entite,
            'entite_id' => $this->entiteId,
            'details' => $this->details,
            'ip_address' => $this->ipAddress,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'user' => $this->user ? ['id' => $this->user->getId(), 'nom' => $this->user->getNom(), 'prenom' => $this->user->getPrenom()] : null,
        ];
    }
}
