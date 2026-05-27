<?php

namespace App\Service;

use App\Entity\AuditLog;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class AuditLogService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private RequestStack $requestStack
    ) {
    }

    public function log(?User $user, string $action, string $entite, ?string $entiteId = null, ?array $details = null): void
    {
        $request = $this->requestStack->getCurrentRequest();
        $ip = $request ? $request->getClientIp() : '127.0.0.1';

        $log = new AuditLog();
        $log->setUser($user);
        $log->setAction($action);
        $log->setEntite($entite);
        $log->setEntiteId($entiteId);
        $log->setDetails($details);
        $log->setIpAddress($ip);

        $this->entityManager->persist($log);
        $this->entityManager->flush();
    }
}
