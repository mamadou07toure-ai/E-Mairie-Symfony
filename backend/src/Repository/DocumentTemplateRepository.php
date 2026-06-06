<?php

namespace App\Repository;

use App\Entity\DocumentTemplate;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DocumentTemplate>
 */
class DocumentTemplateRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DocumentTemplate::class);
    }

    public function findActiveForTypeDemande(int $typeDemandeId): ?DocumentTemplate
    {
        return $this->createQueryBuilder('dt')
            ->join('dt.typeDemande', 'td')
            ->where('td.id = :typeDemandeId')
            ->andWhere('dt.actif = true')
            ->setParameter('typeDemandeId', $typeDemandeId)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
