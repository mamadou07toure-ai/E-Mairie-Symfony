<?php

namespace App\Service;

use App\Entity\Demande;
use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    public function notify(User $user, string $type, string $message, ?Demande $demande = null): void
    {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setDemande($demande);
        $notification->setType($type);
        $notification->setMessage($message);
        $notification->setLu(false);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();
    }
}
