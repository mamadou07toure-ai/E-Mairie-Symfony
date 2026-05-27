<?php

namespace App\Service;

use App\Entity\Demande;
use App\Entity\TypeDemande;
use Doctrine\ORM\EntityManagerInterface;

class DemandeService
{
    public function generateNumeroDossier(EntityManagerInterface $em): string
    {
        $year = date('Y');
        $query = $em->createQuery(
            'SELECT COUNT(d.id) FROM App\Entity\Demande d WHERE d.numeroDossier LIKE :pattern'
        )->setParameter('pattern', 'MAI-' . $year . '-%');

        $count = $query->getSingleScalarResult();
        $next = $count + 1;

        return 'MAI-' . $year . '-' . sprintf('%05d', $next);
    }

    public function calculateDateEcheance(TypeDemande $typeDemande): \DateTime
    {
        $daysToAdd = $typeDemande->getDelaiJoursOuvrables();
        $date = new \DateTime();

        while ($daysToAdd > 0) {
            $date->modify('+1 day');
            // Skip weekends
            if ($date->format('N') < 6) {
                $daysToAdd--;
            }
        }

        return $date;
    }
}
