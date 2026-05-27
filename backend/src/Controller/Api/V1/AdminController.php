<?php

namespace App\Controller\Api\V1;

use App\Entity\Demande;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin', name: 'api_admin_')]
#[IsGranted('ROLE_ADMINISTRATEUR')]
class AdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    #[Route('/dashboard', name: 'dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        $repoDemandes = $this->em->getRepository(Demande::class);
        $repoUsers    = $this->em->getRepository(User::class);

        return $this->json([
            'kpis' => [
                'total_citoyens'  => $repoUsers->count(['role' => 'citoyen']),
                'agents_actifs'   => $repoUsers->count(['role' => 'agent', 'isActive' => true]),
                'total_demandes'  => $repoDemandes->count([]),
                'validees'        => $repoDemandes->count(['statut' => 'validee']),
                'en_cours'        => $repoDemandes->count(['statut' => 'en_cours']),
                'rejetees'        => $repoDemandes->count(['statut' => 'rejetee']),
                'en_attente'      => $repoDemandes->count(['statut' => 'en_attente']),
            ],
        ]);
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $repoDemandes = $this->em->getRepository(Demande::class);
        $repoUsers    = $this->em->getRepository(User::class);
        $total        = $repoDemandes->count([]);

        return $this->json([
            'total_citoyens'  => $repoUsers->count(['role' => 'citoyen']),
            'total_agents'    => $repoUsers->count(['role' => 'agent']),
            'total_demandes'  => $total,
            'total_valides'   => $repoDemandes->count(['statut' => 'validee']),
            'total_en_cours'  => $repoDemandes->count(['statut' => 'en_cours']),
            'total_en_attente'=> $repoDemandes->count(['statut' => 'en_attente']),
            'taux_succes'     => $total > 0
                ? round(($repoDemandes->count(['statut' => 'validee']) / $total) * 100)
                : 0,
            'top_agents'      => [],
            'monthly_stats'   => [],
        ]);
    }

    // ─── DEMANDES ───────────────────────────────────────────────────────────────

    #[Route('/demandes', name: 'demandes_index', methods: ['GET'])]
    public function demandes(Request $request): JsonResponse
    {
        $qb = $this->em->getRepository(Demande::class)
            ->createQueryBuilder('d')
            ->orderBy('d.createdAt', 'DESC');

        if ($statut = $request->query->get('statut')) {
            $qb->andWhere('d.statut = :statut')->setParameter('statut', $statut);
        }

        $demandes = $qb->getQuery()->getResult();

        return $this->json(['data' => array_map(fn($d) => $d->toListArray(), $demandes)]);
    }

    #[Route('/demandes/{uuid}', name: 'demandes_show', methods: ['GET'])]
    public function showDemande(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) {
            return $this->json(['message' => 'Demande introuvable'], 404);
        }

        return $this->json($demande->toArray());
    }

    #[Route('/demandes/{uuid}', name: 'demandes_delete', methods: ['DELETE'])]
    public function deleteDemande(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) {
            return $this->json(['message' => 'Demande introuvable'], 404);
        }

        $this->em->remove($demande);
        $this->em->flush();

        return $this->json(['message' => 'Dossier supprimé avec succès.']);
    }

    #[Route('/demandes/{uuid}/assign', name: 'demandes_assign', methods: ['POST'])]
    public function assignDemande(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        if ($demande->getAgent() !== null) {
            return $this->json(['message' => 'Ce dossier est déjà pris en charge par un autre agent.'], 400);
        }

        $demande->setAgent($this->getUser());
        $demande->setStatut(\App\Enum\StatutDemandeEnum::EN_COURS);
        $this->em->flush();

        return $this->json(['message' => 'Dossier pris en charge avec succès.']);
    }

    #[Route('/demandes/{uuid}/unassign', name: 'demandes_unassign', methods: ['POST'])]
    public function unassignDemande(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        $demande->setAgent(null);
        $demande->setStatut(\App\Enum\StatutDemandeEnum::EN_ATTENTE);
        $this->em->flush();

        return $this->json(['message' => 'Dossier relâché avec succès.']);
    }

    #[Route('/demandes/{uuid}/status', name: 'demandes_status', methods: ['POST'])]
    public function updateStatus(string $uuid, Request $request): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        $data = json_decode($request->getContent(), true);
        $newStatus = $data['statut'] ?? null;
        $comment = $data['commentaire'] ?? '';

        if (!$newStatus) {
            return $this->json(['message' => 'Statut requis'], 400);
        }

        try {
            $statutEnum = \App\Enum\StatutDemandeEnum::from($newStatus);
        } catch (\ValueError $e) {
            return $this->json(['message' => 'Statut invalide'], 400);
        }

        $demande->setStatut($statutEnum);

        if ($newStatus === 'rejetee') {
            $demande->setMotifRejet($comment);
        }
        if ($newStatus === 'document_manquant') {
            $demande->setPieceManquante($comment);
        }
        if (in_array($newStatus, ['validee', 'rejetee'])) {
            $demande->setDateCloture(new \DateTime());
        }

        $this->em->flush();

        return $this->json(['message' => 'Statut mis à jour avec succès.']);
    }

    #[Route('/demandes/{uuid}/messages', name: 'demandes_messages_post', methods: ['POST'])]
    public function postMessage(string $uuid, Request $request): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        $data = json_decode($request->getContent(), true);
        if (empty($data['content'])) {
            return $this->json(['message' => 'Le message ne peut pas être vide'], 400);
        }

        $message = new \App\Entity\Message();
        $message->setContent($data['content']);
        $message->setSender($this->getUser());
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

    // ─── USERS ──────────────────────────────────────────────────────────────────

    #[Route('/users', name: 'users_index', methods: ['GET'])]
    public function users(): JsonResponse
    {
        $users = $this->em->getRepository(User::class)->findBy([], ['createdAt' => 'DESC']);

        return $this->json(['data' => array_map(fn($u) => $u->toArray(), $users)]);
    }

    #[Route('/users', name: 'users_create', methods: ['POST'])]
    public function createUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        foreach (['nom', 'prenom', 'email', 'role', 'password'] as $field) {
            if (empty($data[$field])) {
                return $this->json(['message' => "Champ requis : $field"], 400);
            }
        }

        if ($this->em->getRepository(User::class)->findOneBy(['email' => $data['email']])) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], 400);
        }

        $user = new User();
        $user->setNom(strtoupper($data['nom']));
        $user->setPrenom(ucfirst(strtolower($data['prenom'])));
        $user->setEmail($data['email']);
        $user->setRole($data['role']);
        $user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
        $user->setIsActive(true);

        $this->em->persist($user);
        $this->em->flush();

        return $this->json([
            'message' => 'Utilisateur créé avec succès.',
            'user'    => $user->toArray(),
        ], 201);
    }

    #[Route('/users/{id}/toggle', name: 'users_toggle', methods: ['POST'])]
    public function toggleUser(int $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $user->setIsActive(!$user->isActive());
        $this->em->flush();

        return $this->json([
            'message' => $user->isActive() ? 'Compte activé.' : 'Compte désactivé.',
            'actif'   => $user->isActive(),
        ]);
    }

    #[Route('/users/{id}', name: 'users_delete', methods: ['DELETE'])]
    public function deleteUser(int $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        if ($user === $this->getUser()) {
            return $this->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        $this->em->remove($user);
        $this->em->flush();

        return $this->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}
