<?php

namespace App\Repository;

use App\Entity\Demande;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Demande>
 */
class DemandeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Demande::class);
    }

    public function countByStatutForUser($user): array
    {
        $results = $this->createQueryBuilder('d')
            ->select('d.statut, COUNT(d.id) as total')
            ->where('d.user = :user')
            ->setParameter('user', $user)
            ->groupBy('d.statut')
            ->getQuery()
            ->getResult();

        $counts = [];
        foreach ($results as $row) {
            $counts[$row['statut']->value] = (int) $row['total'];
        }
        return $counts;
    }
}
