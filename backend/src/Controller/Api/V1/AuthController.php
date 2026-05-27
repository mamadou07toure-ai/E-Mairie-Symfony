<?php

namespace App\Controller\Api\V1;

use App\Entity\User;
use App\Enum\RoleEnum;
use App\Service\AuditLogService;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/v1/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private AuditLogService $auditLogger
    ) {
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, ValidatorInterface $validator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'], $data['nom'], $data['prenom'])) {
            return $this->json(['message' => 'Données incomplètes'], 422);
        }

        // Check email existence
        if ($this->em->getRepository(User::class)->findOneBy(['email' => $data['email']])) {
            return $this->json(['message' => 'Cet email est déjà utilisé'], 422);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setNom($data['nom']);
        $user->setPrenom($data['prenom']);
        $user->setTelephone($data['telephone'] ?? null);
        $user->setRole(RoleEnum::CITOYEN);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        $user->setIsActive(true);

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['message' => (string) $errors], 422);
        }

        $this->em->persist($user);
        $this->em->flush();

        $this->auditLogger->log($user, 'Inscription utilisateur', 'User', $user->getId());

        $token = $this->jwtManager->create($user);

        return $this->json([
            'message' => 'Inscription réussie',
            'token' => $token,
            'user' => $user->toArray()
        ], 201);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data || !isset($data['email'], $data['password'])) {
            return $this->json(['message' => 'Identifiants manquants'], 400);
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['message' => 'Identifiants invalides'], 401);
        }

        if (!$user->isActive()) {
            return $this->json(['message' => 'Ce compte est inactif'], 403);
        }

        $user->setLastLoginAt(new \DateTime());
        $this->em->flush();

        $token = $this->jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'user' => $user->toArray()
        ]);
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function logout(): JsonResponse
    {
        // JWT is stateless, so logout is primarily handled on the client side by removing the token.
        // We can just return success here.
        return $this->json(['message' => 'Déconnexion réussie']);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        return $this->json(['user' => $user->toArray()]);
    }

    #[Route('/profile', name: 'profile', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) $user->setNom($data['nom']);
        if (isset($data['prenom'])) $user->setPrenom($data['prenom']);
        if (isset($data['telephone'])) $user->setTelephone($data['telephone']);

        $this->em->flush();
        $this->auditLogger->log($user, 'Mise à jour profil', 'User', $user->getId());

        return $this->json(['message' => 'Profil mis à jour', 'user' => $user->toArray()]);
    }

    #[Route('/password', name: 'password', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updatePassword(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['current_password'], $data['password'], $data['password_confirmation'])) {
            return $this->json(['message' => 'Données incomplètes'], 400);
        }

        if (!$this->passwordHasher->isPasswordValid($user, $data['current_password'])) {
            return $this->json(['message' => 'Mot de passe actuel incorrect'], 400);
        }

        if ($data['password'] !== $data['password_confirmation']) {
            return $this->json(['message' => 'Les mots de passe ne correspondent pas'], 400);
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        $this->em->flush();

        $this->auditLogger->log($user, 'Modification mot de passe', 'User', $user->getId());

        return $this->json(['message' => 'Mot de passe mis à jour']);
    }

    #[Route('/avatar', name: 'avatar', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function uploadAvatar(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $file = $request->files->get('avatar');

        if (!$file) {
            return $this->json(['message' => 'Aucun fichier sélectionné'], 400);
        }

        // Simulating upload for now
        $filename = uniqid() . '.' . $file->guessExtension();
        $file->move($this->getParameter('kernel.project_dir') . '/public/uploads/avatars', $filename);

        $user->setAvatarPath('/uploads/avatars/' . $filename);
        $this->em->flush();

        return $this->json([
            'message' => 'Avatar mis à jour',
            'avatar_path' => $user->getAvatarPath()
        ]);
    }
}
