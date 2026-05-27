<?php

namespace App\EventListener;

use App\Entity\Demande;
use App\Service\DemandeService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;

#[AsEntityListener(event: Events::prePersist, method: 'prePersist', entity: Demande::class)]
class DemandeListener
{
    public function __construct(
        private DemandeService $demandeService
    ) {
    }

    public function prePersist(Demande $demande, LifecycleEventArgs $event): void
    {
        if (!$demande->getNumeroDossier()) {
            $demande->setNumeroDossier($this->demandeService->generateNumeroDossier($event->getObjectManager()));
        }

        if (!$demande->getDateEcheance() && $demande->getTypeDemande()) {
            $demande->setDateEcheance($this->demandeService->calculateDateEcheance($demande->getTypeDemande()));
        }
    }
}
