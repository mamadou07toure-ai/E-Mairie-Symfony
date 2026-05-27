<?php

namespace App\Controller\Api\V1;

use App\Entity\Demande;
use App\Entity\Document;
use App\Entity\HistoriqueStatut;
use App\Entity\TypeDemande;
use App\Enum\RoleEnum;
use App\Enum\StatutDemandeEnum;
use App\Service\AuditLogService;
use App\Service\DemandeService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/demandes', name: 'api_demandes_')]
#[IsGranted('ROLE_CITOYEN')]
class DemandeController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private DemandeService $demandeService,
        private AuditLogService $auditLogger,
        private NotificationService $notificationService
    ) {
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $user = $this->getUser();
        $repo = $this->em->getRepository(Demande::class);

        $stats = [
            'en_cours' => $repo->count(['user' => $user, 'statut' => [StatutDemandeEnum::EN_ATTENTE, StatutDemandeEnum::EN_COURS, StatutDemandeEnum::DOCUMENT_MANQUANT]]),
            'validees' => $repo->count(['user' => $user, 'statut' => StatutDemandeEnum::VALIDEE]),
            'rejetees' => $repo->count(['user' => $user, 'statut' => StatutDemandeEnum::REJETEE]),
        ];

        return $this->json($stats);
    }

    #[Route('/types', name: 'types', methods: ['GET'])]
    public function types(): JsonResponse
    {
        $types = $this->em->getRepository(TypeDemande::class)->findBy(['isActive' => true]);
        return $this->json(array_map(fn($t) => $t->toArray(), $types));
    }

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        $qb = $this->em->getRepository(Demande::class)->createQueryBuilder('d')
            ->where('d.user = :user')
            ->setParameter('user', $user)
            ->orderBy('d.createdAt', 'DESC');

        if ($request->query->has('statut')) {
            $qb->andWhere('d.statut = :statut')
               ->setParameter('statut', $request->query->get('statut'));
        }

        // Add basic pagination
        $page = max(1, $request->query->getInt('page', 1));
        $limit = 10;
        $qb->setFirstResult(($page - 1) * $limit)->setMaxResults($limit);

        $demandes = $qb->getQuery()->getResult();
        
        return $this->json([
            'data' => array_map(fn($d) => $d->toListArray(), $demandes)
        ]);
    }

    #[Route('/{uuid}', name: 'show', methods: ['GET'])]
    public function show(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);

        if (!$demande) {
            return $this->json(['message' => 'Demande introuvable'], 404);
        }

        // Verify ownership or admin access
        $user = $this->getUser();
        if ($demande->getUser() !== $user && !in_array(RoleEnum::ADMINISTRATEUR->symfonyRole(), $user->getRoles())) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        return $this->json($demande->toArray());
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        $typeCode = $request->request->get('type_demande_id');
        $priorite = $request->request->get('priorite', 'normale');
        $description = $request->request->get('description');
        $fields = $request->request->all('fields');

        $typeDemande = $this->em->getRepository(TypeDemande::class)->findOneBy(['code' => $typeCode]);
        if (!$typeDemande) {
            return $this->json(['message' => 'Type de demande invalide'], 400);
        }

        $demande = new Demande();
        $demande->setUser($user);
        $demande->setTypeDemande($typeDemande);
        $demande->setPriorite(\App\Enum\PrioriteEnum::from($priorite));
        $demande->setDescription($description);
        $demande->setDonneesFormulaire($fields);
        $isPhysicalPickup = filter_var($request->request->get('is_physical_pickup'), FILTER_VALIDATE_BOOLEAN);
        $demande->setIsPhysicalPickup($isPhysicalPickup);
        
        // Default values for new Demande
        $demande->setStatut(\App\Enum\StatutDemandeEnum::EN_ATTENTE);
        
        $this->em->persist($demande);

        // Handle file uploads
        $files = $request->files->all('documents');
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/demandes';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        foreach ($files as $file) {
            if ($file) {
                $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $originalFilename);
                $newFilename = $safeFilename.'-'.uniqid().'.'.$file->guessExtension();

                try {
                    $file->move($uploadDir, $newFilename);
                    
                    $document = new Document();
                    $document->setNomOriginal($file->getClientOriginalName());
                    $document->setCheminStockage($uploadDir . '/' . $newFilename);
                    $document->setTypeMime($file->getClientMimeType() ?? 'application/octet-stream');
                    $document->setTailleOctets(filesize($uploadDir . '/' . $newFilename) ?: 0);
                    $document->setUploadedBy($user);
                    $document->setDemande($demande);
                    $document->setTypeDocument(\App\Enum\TypeDocumentEnum::PIECE_JUSTIFICATIVE);
                    
                    $this->em->persist($document);
                } catch (\Exception $e) {
                    // Ignore file upload errors for this prototype, or log them
                }
            }
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Demande créée avec succès',
            'uuid' => $demande->getUuid(),
            'numero_dossier' => $demande->getNumeroDossier()
        ], 201);
    }

    #[Route('/{uuid}/messages', name: 'messages_post', methods: ['POST'])]
    public function postMessage(string $uuid, Request $request): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) {
            return $this->json(['message' => 'Demande introuvable'], 404);
        }

        $user = $this->getUser();
        if ($demande->getUser() !== $user && !in_array(RoleEnum::ADMINISTRATEUR->symfonyRole(), $user->getRoles())) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (empty($data['content'])) {
            return $this->json(['message' => 'Le message ne peut pas être vide'], 400);
        }

        $message = new \App\Entity\Message();
        $message->setContent($data['content']);
        $message->setSender($user);
        $message->setDemande($demande);

        $this->em->persist($message);
        $this->em->flush();

        return $this->json(['message' => 'Message envoyé.', 'data' => $message->toArray()], 201);
    }

    #[Route('/messages/{id}', name: 'messages_edit', methods: ['PATCH'])]
    public function editMessage(int $id, Request $request): JsonResponse
    {
        $message = $this->em->getRepository(\App\Entity\Message::class)->find($id);
        if (!$message) return $this->json(['message' => 'Message introuvable'], 404);

        $user = $this->getUser();
        if ($message->getSender()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Vous ne pouvez modifier que vos propres messages'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (empty($data['content'])) {
            return $this->json(['message' => 'Le contenu ne peut pas être vide'], 400);
        }

        $message->setContent($data['content']);
        $message->setIsEdited(true);
        $message->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json(['message' => 'Message modifié.', 'data' => $message->toArray()]);
    }

    #[Route('/messages/{id}', name: 'messages_delete', methods: ['DELETE'])]
    public function deleteMessage(int $id): JsonResponse
    {
        $message = $this->em->getRepository(\App\Entity\Message::class)->find($id);
        if (!$message) return $this->json(['message' => 'Message introuvable'], 404);

        $user = $this->getUser();
        if ($message->getSender()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Vous ne pouvez supprimer que vos propres messages'], 403);
        }

        $this->em->remove($message);
        $this->em->flush();

        return $this->json(['message' => 'Message supprimé.']);
    }

    #[Route('/{uuid}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);

        if (!$demande) {
            return $this->json(['message' => 'Demande introuvable'], 404);
        }

        $user = $this->getUser();
        if ($demande->getUser() !== $user && !in_array(RoleEnum::ADMINISTRATEUR->symfonyRole(), $user->getRoles())) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Only allow deletion if pending
        if ($demande->getStatut() !== \App\Enum\StatutDemandeEnum::EN_ATTENTE && !in_array(RoleEnum::ADMINISTRATEUR->symfonyRole(), $user->getRoles())) {
            return $this->json(['message' => 'Impossible de supprimer une demande en cours de traitement'], 400);
        }

        $this->em->remove($demande);
        $this->em->flush();

        return $this->json(['message' => 'Demande supprimée avec succès']);
    }
}
