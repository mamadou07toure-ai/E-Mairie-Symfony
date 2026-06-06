<?php

namespace App\Entity;

use App\Enum\PrioriteEnum;
use App\Enum\StatutDemandeEnum;
use App\Repository\DemandeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: DemandeRepository::class)]
#[ORM\Table(name: 'demandes')]
#[ORM\Index(columns: ['user_id'])]
#[ORM\Index(columns: ['agent_id'])]
#[ORM\Index(columns: ['statut', 'created_at'])]
#[ORM\HasLifecycleCallbacks]
class Demande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private ?string $uuid = null;

    #[ORM\Column(length: 20, unique: true)]
    private ?string $numeroDossier = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'demandes')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'demandesAssignees')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $agent = null;

    #[ORM\ManyToOne(targetEntity: TypeDemande::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?TypeDemande $typeDemande = null;

    #[ORM\Column(type: 'string', length: 30, enumType: StatutDemandeEnum::class)]
    private StatutDemandeEnum $statut = StatutDemandeEnum::EN_ATTENTE;

    #[ORM\Column(type: 'string', length: 20, enumType: PrioriteEnum::class)]
    private PrioriteEnum $priorite = PrioriteEnum::NORMALE;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $donneesFormulaire = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $motifRejet = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $pieceManquante = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notesInternes = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateEcheance = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateCloture = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\OneToMany(mappedBy: 'demande', targetEntity: Document::class, cascade: ['persist', 'remove'])]
    private Collection $documents;

    #[ORM\OneToMany(mappedBy: 'demande', targetEntity: HistoriqueStatut::class, cascade: ['persist', 'remove'])]
    #[ORM\OrderBy(['createdAt' => 'DESC'])]
    private Collection $historiqueStatuts;

    #[ORM\OneToMany(mappedBy: 'demande', targetEntity: Message::class)]
    private Collection $messages;

    #[ORM\OneToOne(mappedBy: 'demande', targetEntity: DemandeNaissance::class, cascade: ['persist', 'remove'])]
    private ?DemandeNaissance $demandeNaissance = null;

    #[ORM\OneToOne(mappedBy: 'demande', targetEntity: DemandeResidence::class, cascade: ['persist', 'remove'])]
    private ?DemandeResidence $demandeResidence = null;

    #[ORM\OneToOne(mappedBy: 'demande', targetEntity: DemandeMariage::class, cascade: ['persist', 'remove'])]
    private ?DemandeMariage $demandeMariage = null;

    #[ORM\OneToOne(mappedBy: 'demande', targetEntity: DemandeLegalisation::class, cascade: ['persist', 'remove'])]
    private ?DemandeLegalisation $demandeLegalisation = null;

    #[ORM\OneToOne(mappedBy: 'demande', targetEntity: DemandeAutorisation::class, cascade: ['persist', 'remove'])]
    private ?DemandeAutorisation $demandeAutorisation = null;

    #[ORM\OneToOne(mappedBy: 'demande', targetEntity: DemandeChangementAdresse::class, cascade: ['persist', 'remove'])]
    private ?DemandeChangementAdresse $demandeChangementAdresse = null;

    #[ORM\OneToOne(mappedBy: 'demande', targetEntity: RendezVous::class, cascade: ['persist', 'remove'])]
    private ?RendezVous $rendezVous = null;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => false])]
    private bool $isPhysicalPickup = false;

    public function __construct()
    {
        $this->documents = new ArrayCollection();
        $this->historiqueStatuts = new ArrayCollection();
        $this->messages = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->uuid = Uuid::v4()->toRfc4122();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }

    // Getters and Setters
    public function getId(): ?int { return $this->id; }
    public function getUuid(): ?string { return $this->uuid; }
    public function setUuid(string $uuid): static { $this->uuid = $uuid; return $this; }
    public function getNumeroDossier(): ?string { return $this->numeroDossier; }
    public function setNumeroDossier(string $numeroDossier): static { $this->numeroDossier = $numeroDossier; return $this; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }
    public function getAgent(): ?User { return $this->agent; }
    public function setAgent(?User $agent): static { $this->agent = $agent; return $this; }
    public function getTypeDemande(): ?TypeDemande { return $this->typeDemande; }
    public function setTypeDemande(?TypeDemande $typeDemande): static { $this->typeDemande = $typeDemande; return $this; }
    public function getStatut(): StatutDemandeEnum { return $this->statut; }
    public function setStatut(StatutDemandeEnum $statut): static { $this->statut = $statut; return $this; }
    public function getPriorite(): PrioriteEnum { return $this->priorite; }
    public function setPriorite(PrioriteEnum $priorite): static { $this->priorite = $priorite; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }
    public function getDonneesFormulaire(): ?array { return $this->donneesFormulaire; }
    public function setDonneesFormulaire(?array $donneesFormulaire): static { $this->donneesFormulaire = $donneesFormulaire; return $this; }
    public function getMotifRejet(): ?string { return $this->motifRejet; }
    public function setMotifRejet(?string $motifRejet): static { $this->motifRejet = $motifRejet; return $this; }
    public function getPieceManquante(): ?string { return $this->pieceManquante; }
    public function setPieceManquante(?string $pieceManquante): static { $this->pieceManquante = $pieceManquante; return $this; }
    public function getNotesInternes(): ?string { return $this->notesInternes; }
    public function setNotesInternes(?string $notesInternes): static { $this->notesInternes = $notesInternes; return $this; }
    public function getDateEcheance(): ?\DateTimeInterface { return $this->dateEcheance; }
    public function setDateEcheance(?\DateTimeInterface $dateEcheance): static { $this->dateEcheance = $dateEcheance; return $this; }
    public function getDateCloture(): ?\DateTimeInterface { return $this->dateCloture; }
    public function setDateCloture(?\DateTimeInterface $dateCloture): static { $this->dateCloture = $dateCloture; return $this; }
    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeInterface { return $this->updatedAt; }
    public function getDocuments(): Collection { return $this->documents; }
    public function getHistoriqueStatuts(): Collection { return $this->historiqueStatuts; }
    public function getMessages(): Collection { return $this->messages; }
    public function getDemandeNaissance(): ?DemandeNaissance { return $this->demandeNaissance; }
    public function setDemandeNaissance(?DemandeNaissance $d): static { $this->demandeNaissance = $d; return $this; }
    public function getDemandeResidence(): ?DemandeResidence { return $this->demandeResidence; }
    public function setDemandeResidence(?DemandeResidence $d): static { $this->demandeResidence = $d; return $this; }
    public function getDemandeMariage(): ?DemandeMariage { return $this->demandeMariage; }
    public function setDemandeMariage(?DemandeMariage $d): static { $this->demandeMariage = $d; return $this; }
    public function getDemandeLegalisation(): ?DemandeLegalisation { return $this->demandeLegalisation; }
    public function setDemandeLegalisation(?DemandeLegalisation $d): static { $this->demandeLegalisation = $d; return $this; }
    public function getDemandeAutorisation(): ?DemandeAutorisation { return $this->demandeAutorisation; }
    public function setDemandeAutorisation(?DemandeAutorisation $d): static { $this->demandeAutorisation = $d; return $this; }
    public function getDemandeChangementAdresse(): ?DemandeChangementAdresse { return $this->demandeChangementAdresse; }
    public function setDemandeChangementAdresse(?DemandeChangementAdresse $d): static { $this->demandeChangementAdresse = $d; return $this; }
    public function getRendezVous(): ?RendezVous { return $this->rendezVous; }
    public function setRendezVous(?RendezVous $r): static { $this->rendezVous = $r; return $this; }

    public function isPhysicalPickup(): bool { return $this->isPhysicalPickup; }
    public function setIsPhysicalPickup(bool $isPhysicalPickup): static { $this->isPhysicalPickup = $isPhysicalPickup; return $this; }

    public function getSpecificData(): ?array
    {
        $type = $this->typeDemande?->getCode();
        return match ($type) {
            'ACTE_NAISSANCE' => $this->demandeNaissance?->toArray(),
            'CERTIFICAT_RESIDENCE' => $this->demandeResidence?->toArray(),
            'CERTIFICAT_MARIAGE' => $this->demandeMariage?->toArray(),
            'LEGALISATION_DOCUMENT' => $this->demandeLegalisation?->toArray(),
            'AUTORISATION_ADMINISTRATIVE' => $this->demandeAutorisation?->toArray(),
            'CHANGEMENT_ADRESSE' => $this->demandeChangementAdresse?->toArray(),
            default => null,
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'numero_dossier' => $this->numeroDossier,
            'user' => $this->user?->toArray(),
            'agent' => $this->agent?->toArray(),
            'type_demande' => $this->typeDemande?->toArray(),
            'statut' => $this->statut->value,
            'statut_label' => $this->statut->label(),
            'statut_color' => $this->statut->color(),
            'priorite' => $this->priorite->value,
            'priorite_label' => $this->priorite->label(),
            'description' => $this->description,
            'donnees_formulaire' => $this->donneesFormulaire,
            'motif_rejet' => $this->motifRejet,
            'piece_manquante' => $this->pieceManquante,
            'notes_internes' => $this->notesInternes,
            'date_echeance' => $this->dateEcheance?->format('Y-m-d'),
            'date_cloture' => $this->dateCloture?->format('Y-m-d H:i:s'),
            'specific_data' => $this->getSpecificData(),
            'messages' => array_map(fn(Message $m) => $m->toArray(), $this->messages->toArray()),
            'documents' => array_map(fn(Document $d) => $d->toArray(), $this->documents->toArray()),
            'historique_statuts' => array_map(fn(HistoriqueStatut $h) => $h->toArray(), $this->historiqueStatuts->toArray()),
            'is_physical_pickup'   => $this->isPhysicalPickup,
            'rendez_vous'          => $this->rendezVous?->toArray(),
            'has_active_template'  => $this->typeDemande?->getDocumentTemplate()?->isActif() ?? false,
            'created_at'           => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at'           => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }

    public function toListArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'numero_dossier' => $this->numeroDossier,
            'user' => ['id' => $this->user?->getId(), 'nom' => $this->user?->getNom(), 'prenom' => $this->user?->getPrenom(), 'email' => $this->user?->getEmail()],
            'agent' => $this->agent ? ['id' => $this->agent->getId(), 'nom' => $this->agent->getNom(), 'prenom' => $this->agent->getPrenom()] : null,
            'type_demande' => $this->typeDemande?->toArray(),
            'statut' => $this->statut->value,
            'statut_label' => $this->statut->label(),
            'statut_color' => $this->statut->color(),
            'priorite' => $this->priorite->value,
            'priorite_label' => $this->priorite->label(),
            'is_physical_pickup' => $this->isPhysicalPickup,
            'date_echeance' => $this->dateEcheance?->format('Y-m-d'),
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
        ];
    }
}
